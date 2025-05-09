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

type ExpenseGroupProps = {
  title: string;
  transactions: Transaction[];
  totalLabel: string;
  isLoading?: boolean;
  cardInfo?: {
    label: string;
    value: number;
  };
  paymentSummary?: Array<{
    id: number;
    label: string;
    value: number;
  }>;
  showAddButton?: boolean;
};

export default function ExpenseGroup({ 
  title, 
  transactions, 
  totalLabel,
  isLoading = false,
  cardInfo,
  paymentSummary,
  showAddButton = true
}: ExpenseGroupProps) {
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
      header: "Conta",
      accessorKey: "description",
      width: "40%", // Conta recebe mais espaço
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
        <div className="text-sm text-negative font-medium text-right">
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
        const statusClass = status === "PENDING" ? "status-pending" : "status-paid";
        const statusText = status === "PENDING" ? "Pendente" : "Pago";
        
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
  
  const totalAmount = transactions.reduce(
    (sum, transaction) => sum + Number(transaction.amount),
    0
  );

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-semibold text-gray-800">{title}</CardTitle>
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <>
            <div className="table-container">
              <DataTable 
                columns={columns} 
                data={transactions}
                compactMode={true}
                footerRow={
                  <tr className="bg-gray-50">
                    <td colSpan={2} className="px-4 py-3 text-left text-sm font-semibold text-gray-900">
                      {totalLabel}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-semibold text-negative">
                      {formatCurrency(totalAmount)}
                    </td>
                    <td className="px-4 py-3" colSpan={2}></td>
                  </tr>
                }
              />
            </div>
            
            {cardInfo && (
              <div className="mt-4 bg-gray-50 p-3 rounded-md">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-600">{cardInfo.label}</div>
                  <div className="text-sm font-medium text-negative">
                    {formatCurrency(cardInfo.value)}
                  </div>
                </div>
              </div>
            )}
            
            {transactions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                {Object.entries(transactions.reduce((acc, t) => {
                  if (t.type === 'EXPENSE') {
                    acc[t.paymentMethod] = (acc[t.paymentMethod] || 0) + Number(t.amount);
                  }
                  return acc;
                }, {} as Record<string, number>)).map(([method, total], idx) => (
                  <div key={method} className="bg-gray-50 p-3 rounded-md">
                    <div className="text-xs text-gray-500 mb-1">PAGAMENTO</div>
                    <div className="flex justify-between items-center">
                      <div className="text-sm text-gray-600">{method}</div>
                      <div className="text-sm font-medium text-negative">
                        {formatCurrency(total)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </CardContent>
      
      {/* Dialog para adicionar nova transação */}
      <AddTransactionDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        groupType={title.includes("Grupo 1") ? "GROUP1" : "GROUP2"}
      />
      
      {/* Dialog para editar transação existente */}
      {selectedTransaction && (
        <AddTransactionDialog 
          open={isEditDialogOpen} 
          onOpenChange={setIsEditDialogOpen}
          defaultValues={{
            ...selectedTransaction,
            amount: selectedTransaction.amount.toString()
          }}
          transactionId={selectedTransaction.id}
          isEditing={true}
        />
      )}
    </Card>
  );
}
