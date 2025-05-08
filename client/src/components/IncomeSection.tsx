import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DataTable } from '@/components/ui/data-table';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '@/lib/utils';
import { apiRequest } from '@/lib/queryClient';
import AddTransactionDialog from '@/components/AddTransactionDialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Transaction } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

type IncomeSectionProps = {
  transactions: Transaction[];
  isLoading?: boolean;
  showAddButton?: boolean;
};

export default function IncomeSection({ 
  transactions,
  isLoading = false,
  showAddButton = true
}: IncomeSectionProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };
  
  // Mutation para excluir transação
  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      // Revalidar a consulta para atualizar a lista de transações
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/summary'] });
      
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso",
        variant: "default",
      });
    },
    onError: () => {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a transação",
        variant: "destructive",
      });
    },
  });
  
  const handleDeleteTransaction = (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta transação?")) {
      deleteTransactionMutation.mutate(id);
    }
  };
  
  const columns = [
    {
      header: "Nome",
      accessorKey: "description",
      width: "40%", // Nome recebe mais espaço
      cell: (info) => (
        <div className="text-sm font-medium text-gray-900">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      header: "Data",
      accessorKey: "dueDate",
      width: "15%", // Data com tamanho fixo
      cell: (info) => (
        <div className="text-sm text-gray-500">
          {formatDate(info.getValue() as string)}
        </div>
      ),
    },
    {
      header: "Valor",
      accessorKey: "amount",
      width: "15%", // Valor com tamanho fixo
      cell: (info) => (
        <div className="text-sm text-positive font-medium text-right">
          {formatCurrency(Number(info.getValue()))}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      width: "15%", // Status com tamanho fixo
      cell: (info) => {
        const status = info.getValue() as string;
        const statusClass = status === "PENDING" ? "status-pending" : "status-received";
        const statusText = status === "PENDING" ? "Pendente" : "Recebido";
        
        return (
          <span className={`status-badge ${statusClass}`}>
            {statusText}
          </span>
        );
      },
    },
    {
      header: "Ações",
      accessorKey: "id",
      width: "15%", // Ações com tamanho fixo
      cell: (info) => {
        const id = info.getValue() as number;
        const transaction = transactions.find(t => t.id === id);
        if (!transaction) return null;
        
        return (
          <div className="flex space-x-1">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleEditTransaction(transaction)}
              className="p-0 h-8 w-8"
            >
              <Pencil className="h-4 w-4 text-gray-500 hover:text-primary" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => handleDeleteTransaction(id)}
              className="p-0 h-8 w-8"
            >
              <Trash2 className="h-4 w-4 text-gray-500 hover:text-destructive" />
            </Button>
          </div>
        );
      },
    },
  ];
  
  // Calculate total income
  const totalIncome = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0
  );
  
  // Get individual incomes
  const incomeEntries = transactions.filter(t => t.description !== "SOMA DOS DOIS");
  
  // Add a summary row for the total
  const dataWithTotal = [...incomeEntries];
  
  return (
    <Card className="mb-6">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">
          Valor a Receber - Salários
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <div className="table-container">
            <DataTable 
              columns={columns} 
              data={dataWithTotal}
              compactMode={true}
              footerRow={
                <tr className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">SOMA DOS DOIS</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap">
                    <div className="text-sm text-gray-500">-</div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-right">
                    <div className="text-sm text-positive font-medium">
                      {formatCurrency(totalIncome)}
                    </div>
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap" colSpan={2}>
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                      Total
                    </span>
                  </td>
                </tr>
              }
            />
          </div>
        )}
      </CardContent>
      
      {/* Dialog para adicionar nova transação */}
      <AddTransactionDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        defaultValues={{
          type: "INCOME",
          groupType: "INCOME"
        }}
      />
      
      {/* Dialog para editar transação existente */}
      {selectedTransaction && (
        <AddTransactionDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
          defaultValues={{
            ...selectedTransaction,
            amount: selectedTransaction.amount.toString(),
            type: "INCOME",
            groupType: "INCOME"
          }}
          transactionId={selectedTransaction.id}
          isEditing={true}
        />
      )}
    </Card>
  );
}
