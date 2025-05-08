import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import {
  insertTransactionSchema,
  transactionTypes,
  transactionStatuses,
  groupTypes,
  paymentMethods,
} from "@shared/schema";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

type AddTransactionDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  groupType?: string;
  defaultValues?: Partial<z.infer<typeof formSchema>>;
  transactionId?: number;
  isEditing?: boolean;
};

const formSchema = insertTransactionSchema.extend({
  amount: z.string().min(1, "Valor é obrigatório"),
  id: z.number().optional(),
});

export default function AddTransactionDialog({
  open,
  onOpenChange,
  groupType,
  defaultValues,
  transactionId,
  isEditing = false,
}: AddTransactionDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(new Date().toISOString().split("T")[0]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      description: "",
      amount: "",
      date: new Date().toISOString().split("T")[0],
      dueDate: new Date().toISOString().split("T")[0],
      type: groupType === "INCOME" ? "INCOME" : "EXPENSE",
      status: "PENDING",
      groupType: groupType || "GROUP1",
      paymentMethod: "NUBANK",
      ...defaultValues,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      const formattedValues = {
        ...defaultValues,
        amount:
          typeof defaultValues.amount === "number"
            ? defaultValues.amount.toString()
            : defaultValues.amount,
      };
      form.reset(formattedValues);
    }
  }, [defaultValues, form]);

  const addMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const numericAmount = values.amount.toString().replace(",", ".");
      const formattedValues = {
        ...values,
        amount: numericAmount,
      };
      return apiRequest("POST", "/api/transactions", formattedValues);
    },
    onSuccess: () => {
      toast({
        title: "Transação adicionada",
        description: "A transação foi adicionada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro ao adicionar transação",
        description: "Ocorreu um erro ao adicionar a transação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (values: z.infer<typeof formSchema>) => {
      const numericAmount = values.amount.toString().replace(",", ".");
      const formattedValues = {
        ...values,
        amount: numericAmount,
      };
      return apiRequest("PUT", `/api/transactions/${transactionId}`, formattedValues);
    },
    onSuccess: () => {
      toast({
        title: "Transação atualizada",
        description: "A transação foi atualizada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
      queryClient.invalidateQueries({ queryKey: ["/api/dashboard/summary"] });
      form.reset();
      onOpenChange(false);
    },
    onError: () => {
      toast({
        title: "Erro ao atualizar transação",
        description: "Ocorreu um erro ao atualizar a transação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isEditing && transactionId) {
      updateMutation.mutate(values);
    } else {
      addMutation.mutate(values);
    }
  }

  const isPending = addMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? form.getValues("type") === "INCOME"
                ? "Editar Receita"
                : "Editar Despesa"
              : form.getValues("type") === "INCOME"
              ? "Adicionar Receita"
              : "Adicionar Despesa"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Input placeholder="Nome da transação" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="amount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Valor</FormLabel>
                  <FormControl>
                    <Input placeholder="0,00" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setDate(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dueDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vencimento</FormLabel>
                    <FormControl>
                      <Input
                        type="date"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setDueDate(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="INCOME">Receita</SelectItem>
                        <SelectItem value="EXPENSE">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="PENDING">Pendente</SelectItem>
                        <SelectItem value="PAID">Pago</SelectItem>
                        <SelectItem value="RECEIVED">Recebido</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="groupType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o grupo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="GROUP1">Grupo 1</SelectItem>
                        <SelectItem value="GROUP2">Grupo 2</SelectItem>
                        <SelectItem value="INCOME">Receitas</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forma de Pagamento</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value || undefined}
                      defaultValue={field.value || undefined}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="NUBANK">NUBANK</SelectItem>
                        <SelectItem value="INTER">INTER</SelectItem>
                        <SelectItem value="CASH">CASH</SelectItem>
                        <SelectItem value="OTHER">OTHER</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button type="submit" disabled={isPending} className="w-full">
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEditing ? "Atualizar" : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
