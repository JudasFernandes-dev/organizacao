import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import ExpenseGroup from '@/components/ExpenseGroup';
import AddTransactionDialog from '@/components/AddTransactionDialog';
import { Plus } from 'lucide-react';
import { Transaction } from '@shared/schema';

export default function Transacoes() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedGroupType, setSelectedGroupType] = useState<string>('GROUP1');
  
  // Fetch all transactions
  const { data: transactions = [], isLoading: transactionsLoading, error: transactionsError } = useQuery<Transaction[]>({
    queryKey: ['/api/transactions'],
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
  
  // Handle errors
  if (transactionsError) {
    toast({
      title: 'Erro ao carregar transações',
      description: 'Não foi possível carregar as transações',
      variant: 'destructive',
    });
  }
  
  // Filter transactions by group
  const group1Transactions = transactions.filter(
    (t) => t.groupType === 'GROUP1'
  );
  
  const group2Transactions = transactions.filter(
    (t) => t.groupType === 'GROUP2'
  );
  
  // Get Nubank card total
  const nubankTotal = transactions.filter(
    (t) => t.paymentMethod === 'NUBANK' && t.type === 'EXPENSE'
  ).reduce((sum, t) => sum + Number(t.amount), 0);
  
  // Get Inter card total
  const interTotal = transactions.filter(
    (t) => t.paymentMethod === 'INTER' && t.type === 'EXPENSE'
  ).reduce((sum, t) => sum + Number(t.amount), 0);
  
  // Calculate payment summaries for Group 2
  const nubankGroup2Total = group2Transactions
    .filter(t => t.paymentMethod === 'NUBANK')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const interGroup2Total = group2Transactions
    .filter(t => t.paymentMethod === 'INTER')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const handleAddTransaction = () => {
    setIsAddDialogOpen(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Transações</h2>
        <div>
          <Button onClick={() => setIsAddDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" /> Nova Transação
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        <ExpenseGroup 
          title="Grupo 1 - Contas a Pagar"
          transactions={group1Transactions}
          totalLabel="Total Grupo 1"
          isLoading={transactionsLoading}
          cardInfo={{
            label: "Nubank Cartão",
            value: nubankTotal
          }}
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
        />
      </div>
      
      <AddTransactionDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        groupType={selectedGroupType}
      />
    </div>
  );
}