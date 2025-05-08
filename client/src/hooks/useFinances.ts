import { useQuery } from '@tanstack/react-query';
import { GroupType, TransactionType } from '@shared/schema';

export function useFinances() {
  // Fetch all transactions
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ['/api/transactions'],
  });
  
  // Get transactions by group
  const getTransactionsByGroup = (groupType: GroupType) => {
    return transactions.filter((t: any) => t.groupType === groupType);
  };
  
  // Get transactions by type
  const getTransactionsByType = (type: TransactionType) => {
    return transactions.filter((t: any) => t.type === type);
  };
  
  // Calculate total expenses
  const totalExpenses = transactions
    .filter((t: any) => t.type === 'EXPENSE')
    .reduce((acc: number, t: any) => acc + Number(t.amount), 0);
  
  // Calculate total income
  const totalIncome = transactions
    .filter((t: any) => t.type === 'INCOME')
    .reduce((acc: number, t: any) => acc + Number(t.amount), 0);
  
  // Calculate balance
  const balance = totalIncome - totalExpenses;
  
  // Nubank expenses
  const nubankExpenses = transactions
    .filter((t: any) => t.paymentMethod === 'NUBANK' && t.type === 'EXPENSE')
    .reduce((acc: number, t: any) => acc + Number(t.amount), 0);
  
  // Inter expenses
  const interExpenses = transactions
    .filter((t: any) => t.paymentMethod === 'INTER' && t.type === 'EXPENSE')
    .reduce((acc: number, t: any) => acc + Number(t.amount), 0);
  
  return {
    transactions,
    isLoading,
    error,
    getTransactionsByGroup,
    getTransactionsByType,
    totalExpenses,
    totalIncome,
    balance,
    nubankExpenses,
    interExpenses
  };
}
