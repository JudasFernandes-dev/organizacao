
import React from "react";
import { useToast } from "@/hooks/use-toast";
import { useFinances } from "@/hooks/useFinances";

export default function Contas() {
  const { toast } = useToast();
  const { accounts, error } = useFinances();

  React.useEffect(() => {
    if (error) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar contas",
      });
    }
  }, [error, toast]);

  return (
    <main className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Contas</h2>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {accounts?.map((account) => (
          <div key={account.id} className="space-y-2">
            <div className="space-y-1">
              <h3 className="text-xl font-semibold">{account.name}</h3>
              <p className="text-sm text-gray-500">{account.type}</p>
            </div>
            <div className="space-y-1">
              <p className="text-2xl font-bold">
                {new Intl.NumberFormat("pt-BR", {
                  style: "currency",
                  currency: "BRL",
                }).format(Number(account.balance))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
