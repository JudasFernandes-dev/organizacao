
import React, { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFinances } from "@/hooks/useFinances";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Transaction } from "@shared/schema";
import AddTransactionDialog from "@/components/AddTransactionDialog";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function Contas() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { transactions } = useFinances();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const deleteTransactionMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/transactions/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      toast({
        title: "Sucesso",
        description: "Transação excluída com sucesso",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao excluir transação",
        variant: "destructive",
      });
    },
  });

  const handleEditTransaction = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsEditDialogOpen(true);
  };

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
      header: "Data",
      accessorKey: "dueDate",
      cell: (info: any) => (
        <div className="text-sm font-medium text-gray-900">
          {info.getValue()}
        </div>
      ),
    },
    {
      header: "Valor",
      accessorKey: "amount",
      cell: (info: any) => (
        <div className="text-sm font-medium">
          {info.getValue() ? formatCurrency(Number(info.getValue())) : "R$ 0,00"}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (info: any) => (
        <div className="text-sm">
          <span
            className={`status-badge ${
              info.getValue() === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"
            } px-2 py-1 rounded-full`}
          >
            {info.getValue() === "PENDING" ? "Pendente" : "Recebido"}
          </span>
        </div>
      ),
    },
    {
      header: "Ações",
      accessorKey: "id",
      cell: (info: any) => {
        const row = info.row.original;
        if (!row) return null;
        
        return (
          <div className="flex space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleEditTransaction(row)}
            >
              <Pencil className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteTransaction(row.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        );
      },
    },
  ];

  return (
    <main className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">Contas</h2>
        <Button onClick={() => setIsAddDialogOpen(true)}>Nova Receita</Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-gray-800">
            Valores a Receber
          </CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable
            columns={columns}
            data={salaryTransactions}
            footerRow={
              <tr key="footer-row">
                <td key="footer-desc" className="px-4 py-2">
                  <div className="text-sm font-medium">SOMA DOS VALORES</div>
                </td>
                <td key="footer-date"></td>
                <td key="footer-amount" className="px-4 py-2">
                  <div className="text-sm font-medium">
                    {formatCurrency(
                      salaryTransactions.reduce(
                        (sum, t) => sum + (t?.amount ? Number(t.amount) : 0),
                        0
                      )
                    )}
                  </div>
                </td>
                <td key="footer-status"></td>
                <td key="footer-actions"></td>
              </tr>
            }
          />
        </CardContent>
      </Card>

      {isAddDialogOpen && (
        <AddTransactionDialog
          open={isAddDialogOpen}
          onOpenChange={setIsAddDialogOpen}
          defaultValues={{
            type: "INCOME",
            groupType: "INCOME",
          }}
        />
      )}

      {selectedTransaction && isEditDialogOpen && (
        <AddTransactionDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          defaultValues={selectedTransaction}
          transactionId={selectedTransaction.id}
          isEditing={true}
        />
      )}
    </main>
  );
}
