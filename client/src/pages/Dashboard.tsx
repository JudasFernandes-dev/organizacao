import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import SummaryCard from '@/components/SummaryCard';
import ExpenseGroup from '@/components/ExpenseGroup';
import IncomeSection from '@/components/IncomeSection';
import FinancialSummary from '@/components/FinancialSummary';
import { 
  Wallet, 
  ArrowUpCircle, 
  ArrowDownCircle, 
  Scale 
} from 'lucide-react';

export default function Dashboard() {
  const { toast } = useToast();
  
  // Fetch dashboard summary
  const { data: summary, isLoading: summaryLoading, error: summaryError } = useQuery({
    queryKey: ['/api/dashboard/summary'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Fetch all transactions
  const { data: transactions, isLoading: transactionsLoading, error: transactionsError } = useQuery({
    queryKey: ['/api/transactions'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Handle errors
  useEffect(() => {
    if (summaryError) {
      toast({
        title: 'Erro ao carregar resumo',
        description: 'Não foi possível carregar os dados do dashboard',
        variant: 'destructive',
      });
    }
    
    if (transactionsError) {
      toast({
        title: 'Erro ao carregar transações',
        description: 'Não foi possível carregar as transações',
        variant: 'destructive',
      });
    }
  }, [summaryError, transactionsError, toast]);
  
  // Filter transactions by group
  const group1Transactions = transactions?.filter(
    (t) => t.groupType === 'GROUP1'
  ) || [];
  
  const group2Transactions = transactions?.filter(
    (t) => t.groupType === 'GROUP2'
  ) || [];
  
  const incomeTransactions = transactions?.filter(
    (t) => t.type === 'INCOME'
  ) || [];
  
  // Get Nubank card total
  const nubankTotal = transactions?.filter(
    (t) => t.paymentMethod === 'NUBANK' && t.type === 'EXPENSE'
  ).reduce((sum, t) => sum + Number(t.amount), 0) || 0;
  
  // Calculate payment summaries for Group 2
  const nubankGroup2Total = group2Transactions
    .filter(t => t.paymentMethod === 'NUBANK')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const interGroup2Total = group2Transactions
    .filter(t => t.paymentMethod === 'INTER')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <SummaryCard 
          title="Saldo atual"
          value={summary?.currentBalance || 0}
          icon={<Wallet className="h-5 w-5 text-blue-500" />}
          iconBg="bg-blue-100"
          isLoading={summaryLoading}
        />
        
        <SummaryCard 
          title="Receitas"
          value={summary?.income || 0}
          icon={<ArrowUpCircle className="h-5 w-5 text-green-500" />}
          iconBg="bg-green-100"
          isPositive
          isLoading={summaryLoading}
        />
        
        <SummaryCard 
          title="Despesas"
          value={summary?.expenses || 0}
          icon={<ArrowDownCircle className="h-5 w-5 text-red-500" />}
          iconBg="bg-red-100"
          isNegative
          isLoading={summaryLoading}
        />
        
        <SummaryCard 
          title="Saldo restante"
          value={summary?.remainingBalance || 0}
          icon={<Scale className="h-5 w-5 text-purple-500" />}
          iconBg="bg-purple-100"
          isLoading={summaryLoading}
        />
      </div>
      
      {/* Expense Groups */}
      <div className="grid grid-cols-1 gap-6 mb-6">
        <ExpenseGroup 
          title="Grupo 1 - Contas a Pagar"
          transactions={group1Transactions}
          totalLabel="Total Grupo 1"
          isLoading={transactionsLoading}
          cardInfo={{
            label: "Nubank Cartão",
            value: nubankTotal
          }}
          showAddButton={false}
        />
        
        <ExpenseGroup 
          title="Grupo 2 - Despesas Adicionais"
          transactions={group2Transactions}
          totalLabel="Total Grupo 2"
          isLoading={transactionsLoading}
          paymentSummary={[
            { id: 1, label: "PAGAR COM NUBANK", value: nubankGroup2Total },
            { id: 2, label: "PAGAR COM INTER", value: interGroup2Total },
          ]}
          showAddButton={false}
        />
      </div>
      
      {/* Income Section */}
      <IncomeSection 
        transactions={incomeTransactions}
        isLoading={transactionsLoading}
        showAddButton={false}
      />
      
      {/* Financial Summary */}
      <FinancialSummary 
        expenses={{
          nubankTotal: nubankTotal,
          interTotal: interGroup2Total,
          total: summary?.expenses || 0
        }}
        income={{
          salaryTotal: summary?.income || 0,
          rentExpense: 800.00,
          predictedBalance: (summary?.income || 0) - 800.00
        }}
        credits={{
          inter: 500 - interGroup2Total,
          nubank: 1900 - nubankTotal
        }}
        finalBalance={{
          difference: (summary?.income || 0) - (summary?.expenses || 0),
          remainingBalance: summary?.remainingBalance || 0
        }}
      />
    </>
  );
}
