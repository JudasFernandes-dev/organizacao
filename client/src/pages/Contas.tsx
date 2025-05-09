
import React, { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFinances } from "@/hooks/useFinances";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Transaction } from "@shared/schema";
import AddTransactionDialog from "@/components/AddTransactionDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Contas() {
  const { toast } = useToast();
  const { transactions } = useFinances();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const queryClient = useQueryClient();

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/transactions'] });
      toast({
        title: "Transação excluída",
        description: "A transação foi excluída com sucesso",
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

  const salaryTransactions = transactions?.filter(
    (t) => t.type === "INCOME" && t.groupType === "INCOME"
  ) || [];

  const columns = [
    {
      header: "Nome",
      accessorKey: "description",
      cell: (info: any) => (
        <div className="text-sm font-medium text-gray-900">
          {info.getValue()}
        </div>
      ),
    },
    {
      header: "Dados",
      accessorKey: "dueDate",
      cell: (info: any) => (
        <div className="text-sm text-gray-500">
          Até dia {new Date(info.getValue()).getDate()}
        </div>
      ),
    },
    {
      header: "Valores",
      accessorKey: "amount",
      cell: (info: any) => (
        <div className="text-sm font-medium">
          {formatCurrency(Number(info.getValue()))}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (info: any) => (
        <div className="text-sm">
          <span className={`status-badge ${info.getValue() === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"} px-2 py-1 rounded-full`}>
            {info.getValue() === "PENDING" ? "Pendente" : "Recebido"}
          </span>
        </div>
      ),
    },
    {
      header: "Ações",
      id: "actions",
      cell: (info: any) => (
        <div className="flex space-x-2">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleEditTransaction(info.row.original)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => handleDeleteTransaction(info.row.original.id)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  const totalSalary = salaryTransactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  return (
    <main className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Contas</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo Valor
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Valor a Receber - Salários
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable 
            columns={columns} 
            data={salaryTransactions}
            footerRow={
              <tr className="hover:bg-gray-50">
                <td className="px-4 py-2">
                  <div className="text-sm font-medium">SOMA DOS VALORES</div>
                </td>
                <td className="px-4 py-2">
                  <div className="text-sm">-</div>
                </td>
                <td className="px-4 py-2">
                  <div className="text-sm font-medium">
                    {formatCurrency(totalSalary)}
                  </div>
                </td>
                <td className="px-4 py-2">
                  <span className="text-sm font-medium">Total</span>
                </td>
                <td></td>
              </tr>
            }
          />
        </CardContent>
      </Card>

      <AddTransactionDialog 
        open={isAddDialogOpen} 
        onOpenChange={setIsAddDialogOpen}
        defaultValues={{
          type: "INCOME",
          groupType: "INCOME"
        }}
      />

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
    </main>
  );
}
