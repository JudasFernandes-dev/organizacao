import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import IncomeSection from '@/components/IncomeSection';
import AddTransactionDialog from '@/components/AddTransactionDialog';
import { Plus } from 'lucide-react';
import { Transaction } from '@shared/schema';

export default function Contas() {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
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
  
  // Filter income transactions
  const incomeTransactions = transactions.filter(
    (t) => t.type === 'INCOME'
  );
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Contas</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Nova Receita
        </Button>
      </div>
      
      {/* Card de formas de recebimento removido conforme solicitado */}
      
      <IncomeSection 
        transactions={incomeTransactions}
        isLoading={transactionsLoading}
        showAddButton={true}
      />
      
      <AddTransactionDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        defaultValues={{
          type: "INCOME",
          groupType: "INCOME"
        }}
      />
    </div>
  );
}