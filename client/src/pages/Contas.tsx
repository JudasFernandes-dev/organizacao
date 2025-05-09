
import React, { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useFinances } from "@/hooks/useFinances";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DataTable } from "@/components/ui/data-table";
import { formatCurrency } from "@/lib/utils";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Transaction } from "@shared/schema";

export default function Contas() {
  const { toast } = useToast();
  const { accounts, transactions, error } = useFinances();

  useEffect(() => {
    if (error) {
      toast({
        title: "Error",
        description: "Failed to fetch accounts data",
        variant: "destructive",
      });
    }
  }, [error, toast]);

  // Filter income transactions (salaries)
  const salaryTransactions = transactions?.filter(
    (t) => t.type === "INCOME" && t.groupType === "INCOME"
  ) || [];

  const columns = [
    {
      header: "Nome",
      accessorKey: "description",
      cell: (info) => (
        <div className="text-sm font-medium text-gray-900">
          {info.getValue() as string}
        </div>
      ),
    },
    {
      header: "Dados",
      accessorKey: "dueDate",
      cell: (info) => (
        <div className="text-sm text-gray-500">
          Até dia {new Date(info.getValue() as string).getDate()}
        </div>
      ),
    },
    {
      header: "Valentia",
      accessorKey: "amount",
      cell: (info) => (
        <div className="text-sm font-medium">
          {formatCurrency(Number(info.getValue()))}
        </div>
      ),
    },
    {
      header: "Status",
      accessorKey: "status",
      cell: (info) => {
        const status = info.getValue() as string;
        return (
          <div className="text-sm">
            <span className={`status-badge ${status === "PENDING" ? "bg-yellow-100 text-yellow-800" : "bg-green-100 text-green-800"} px-2 py-1 rounded-full`}>
              {status === "PENDING" ? "Pendente" : "Recebido"}
            </span>
          </div>
        );
      },
    },
    {
      header: "Ações",
      id: "actions",
      cell: (info) => (
        <div className="flex space-x-2">
          <Button variant="ghost" size="sm">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
    },
  ];

  // Calculate total
  const totalSalary = salaryTransactions.reduce(
    (sum, t) => sum + Number(t.amount),
    0
  );

  return (
    <main className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Contas</h2>
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
                  <div className="text-sm font-medium">SOMA DOS DOIS</div>
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

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {accounts?.map((account) => (
          <div key={account.id} className="space-y-2">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{account.name}</h3>
              <p className="text-sm text-gray-500">{account.type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {formatCurrency(Number(account.balance))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
