import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import FinancialSummary from '@/components/FinancialSummary';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { FileDown, FileText, FileSpreadsheet, Filter } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { jsPDF } from 'jspdf';
import * as XLSX from 'xlsx';
import { Transaction, GroupType, PaymentMethod } from '@shared/schema';

// Import de componentes para os filtros
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from '@/components/ui/label';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from "@/components/ui/calendar";

const COLORS = ['#6b21a8', '#22c55e', '#ef4444', '#f97316', '#eab308'];

// Tipos de filtro para período
type PeriodoFiltro = 'semana' | 'mes' | 'ano' | 'todos';

export default function Relatorios() {
  const { toast } = useToast();
  
  // Estados para filtros
  const [periodoFiltro, setPeriodoFiltro] = useState<PeriodoFiltro>('mes');
  const [grupoFiltro, setGrupoFiltro] = useState<string>('todos');
  const [pagamentoFiltro, setPagamentoFiltro] = useState<string>('todos');
  const [dataInicio, setDataInicio] = useState<Date | undefined>(undefined);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  
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
  
  // Aplicar filtros quando qualquer filtro ou dados mudarem
  useEffect(() => {
    if (!transactions || transactions.length === 0) {
      setFilteredTransactions([]);
      return;
    }
    
    let filtered = [...transactions];
    
    // Filtrar por período
    if (periodoFiltro !== 'todos') {
      const hoje = new Date();
      let dataLimite = new Date();
      
      if (periodoFiltro === 'semana') {
        dataLimite.setDate(hoje.getDate() - 7);
      } else if (periodoFiltro === 'mes') {
        dataLimite.setMonth(hoje.getMonth() - 1);
      } else if (periodoFiltro === 'ano') {
        dataLimite.setFullYear(hoje.getFullYear() - 1);
      }
      
      filtered = filtered.filter(t => {
        const dataTransacao = new Date(t.date);
        return dataTransacao >= dataLimite;
      });
    }
    
    // Filtrar por grupo
    if (grupoFiltro !== 'todos') {
      filtered = filtered.filter(t => t.groupType === grupoFiltro);
    }
    
    // Filtrar por método de pagamento
    if (pagamentoFiltro !== 'todos') {
      filtered = filtered.filter(t => t.paymentMethod === pagamentoFiltro);
    }
    
    setFilteredTransactions(filtered);
  }, [transactions, periodoFiltro, grupoFiltro, pagamentoFiltro, dataInicio]);
  
  // Prepare data for charts
  const incomeTotal = filteredTransactions
    .filter(t => t.type === 'INCOME')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const expensesTotal = filteredTransactions
    .filter(t => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const group1Total = filteredTransactions
    .filter(t => t.groupType === 'GROUP1')
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const group2Total = filteredTransactions
    .filter(t => t.groupType === 'GROUP2')
    .reduce((sum, t) => sum + Number(t.amount), 0);
  
  const barData = [
    { name: 'Receitas', valor: incomeTotal },
    { name: 'Despesas', valor: expensesTotal },
    { name: 'Grupo 1', valor: group1Total },
    { name: 'Grupo 2', valor: group2Total },
  ];
  
  const pieData = [
    { name: 'Receitas', value: incomeTotal },
    { name: 'Despesas', value: expensesTotal },
  ];
  
  // Função para exportar dados para PDF
  const exportToPDF = () => {
    const doc = new jsPDF();
    
    // Título
    doc.setFontSize(18);
    doc.text('Relatório Financeiro', 105, 15, { align: 'center' });
    doc.setFontSize(12);
    doc.text(`Período: ${periodoFiltro}`, 105, 25, { align: 'center' });
    
    // Tabela de dados
    doc.setFontSize(14);
    doc.text('Resumo Financeiro', 20, 40);
    
    let y = 50;
    
    // Resumo
    doc.setFontSize(12);
    doc.text(`Receitas: ${formatCurrency(incomeTotal)}`, 20, y); y += 8;
    doc.text(`Despesas: ${formatCurrency(expensesTotal)}`, 20, y); y += 8;
    doc.text(`Grupo 1: ${formatCurrency(group1Total)}`, 20, y); y += 8;
    doc.text(`Grupo 2: ${formatCurrency(group2Total)}`, 20, y); y += 8;
    doc.text(`Resultado: ${formatCurrency(incomeTotal - expensesTotal)}`, 20, y); y += 15;
    
    // Lista de transações
    doc.setFontSize(14);
    doc.text('Detalhes das Transações', 20, y); y += 10;
    
    // Cabeçalho
    doc.setFontSize(10);
    doc.text('Descrição', 20, y);
    doc.text('Data', 90, y);
    doc.text('Valor', 130, y);
    doc.text('Grupo', 160, y);
    y += 8;
    
    // Linha horizontal
    doc.line(20, y - 4, 190, y - 4);
    
    // Limitar a 20 transações para não sobrecarregar o PDF
    const transacoesParaMostrar = filteredTransactions.slice(0, 20);
    
    // Dados
    transacoesParaMostrar.forEach(t => {
      const data = new Date(t.date).toLocaleDateString();
      const valor = formatCurrency(Number(t.amount));
      const grupo = t.groupType || '-';
      
      doc.text(t.description.substring(0, 30), 20, y);
      doc.text(data, 90, y);
      doc.text(valor, 130, y);
      doc.text(String(grupo), 160, y);
      y += 7;
      
      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });
    
    // Download
    doc.save('relatorio-financeiro.pdf');
    
    toast({
      title: 'Exportação para PDF',
      description: 'O relatório foi exportado para PDF com sucesso.',
    });
  };
  
  // Função para exportar dados para Excel
  const exportToExcel = () => {
    // Preparar dados em formato adequado para Excel
    const dadosExcel = filteredTransactions.map(t => ({
      Descrição: t.description,
      Data: new Date(t.date).toLocaleDateString(),
      Valor: Number(t.amount),
      Tipo: t.type === 'INCOME' ? 'Receita' : 'Despesa',
      Grupo: t.groupType || '-',
      'Método de Pagamento': t.paymentMethod || '-',
      Status: t.status === 'PAID' ? 'Pago' : (t.status === 'RECEIVED' ? 'Recebido' : 'Pendente')
    }));
    
    // Adicionar resumo
    dadosExcel.push({
      Descrição: '--- RESUMO ---',
      Data: '',
      Valor: 0,
      Tipo: '',
      Grupo: '',
      'Método de Pagamento': '',
      Status: ''
    });
    
    dadosExcel.push({
      Descrição: 'TOTAL RECEITAS',
      Data: '',
      Valor: incomeTotal,
      Tipo: '',
      Grupo: '',
      'Método de Pagamento': '',
      Status: ''
    });
    
    dadosExcel.push({
      Descrição: 'TOTAL DESPESAS',
      Data: '',
      Valor: expensesTotal,
      Tipo: '',
      Grupo: '',
      'Método de Pagamento': '',
      Status: ''
    });
    
    // Criar planilha
    const ws = XLSX.utils.json_to_sheet(dadosExcel);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Relatório');
    
    // Exportar
    XLSX.writeFile(wb, 'relatorio-financeiro.xlsx');
    
    toast({
      title: 'Exportação para Excel',
      description: 'O relatório foi exportado para Excel com sucesso.',
    });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-3xl font-bold tracking-tight">Relatórios</h2>
        
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Filtros */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Filter className="mr-2 h-4 w-4" /> Filtros
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <h4 className="font-medium leading-none">Filtros de Relatório</h4>
                  <p className="text-sm text-muted-foreground">
                    Personalize para exportação
                  </p>
                </div>
                
                <div className="grid gap-2">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="periodo" className="text-right">
                      Período
                    </Label>
                    <Select 
                      value={periodoFiltro} 
                      onValueChange={(value) => setPeriodoFiltro(value as PeriodoFiltro)}
                    >
                      <SelectTrigger id="periodo" className="col-span-3">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="semana">Última semana</SelectItem>
                        <SelectItem value="mes">Último mês</SelectItem>
                        <SelectItem value="ano">Último ano</SelectItem>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="grupo" className="text-right">
                      Grupo
                    </Label>
                    <Select 
                      value={grupoFiltro} 
                      onValueChange={setGrupoFiltro}
                    >
                      <SelectTrigger id="grupo" className="col-span-3">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="GROUP1">Grupo 1</SelectItem>
                        <SelectItem value="GROUP2">Grupo 2</SelectItem>
                        <SelectItem value="INCOME">Receitas</SelectItem>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="pagamento" className="text-right">
                      Pagamento
                    </Label>
                    <Select 
                      value={pagamentoFiltro} 
                      onValueChange={setPagamentoFiltro}
                    >
                      <SelectTrigger id="pagamento" className="col-span-3">
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="NUBANK">Nubank</SelectItem>
                        <SelectItem value="INTER">Inter</SelectItem>
                        <SelectItem value="CASH">Dinheiro</SelectItem>
                        <SelectItem value="todos">Todos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
          
          {/* Botões de exportação */}
          <div className="flex flex-row gap-2">
            <Button variant="outline" onClick={exportToPDF}>
              <FileText className="mr-2 h-4 w-4" /> PDF
            </Button>
            <Button variant="outline" onClick={exportToExcel}>
              <FileSpreadsheet className="mr-2 h-4 w-4" /> Excel
            </Button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Resumo de Receitas e Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={barData}
                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis 
                  tickFormatter={(value) => {
                    return value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value;
                  }}
                />
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend />
                <Bar dataKey="valor" fill="#6b21a8" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-gray-800">
              Distribuição de Receitas e Despesas
            </CardTitle>
          </CardHeader>
          <CardContent className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-4">Resumo dos Dados Filtrados</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-green-50 p-3 rounded-lg">
            <div className="text-sm text-green-700">Total Receitas</div>
            <div className="text-xl font-bold text-green-800">{formatCurrency(incomeTotal)}</div>
          </div>
          
          <div className="bg-red-50 p-3 rounded-lg">
            <div className="text-sm text-red-700">Total Despesas</div>
            <div className="text-xl font-bold text-red-800">{formatCurrency(expensesTotal)}</div>
          </div>
          
          <div className="bg-purple-50 p-3 rounded-lg">
            <div className="text-sm text-purple-700">Contas Grupo 1</div>
            <div className="text-xl font-bold text-purple-800">{formatCurrency(group1Total)}</div>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-lg">
            <div className="text-sm text-blue-700">Contas Grupo 2</div>
            <div className="text-xl font-bold text-blue-800">{formatCurrency(group2Total)}</div>
          </div>
        </div>
      </Card>
      
      <FinancialSummary 
        expenses={{
          nubankTotal: filteredTransactions
            .filter(t => t.paymentMethod === 'NUBANK' && t.type === 'EXPENSE')
            .reduce((sum, t) => sum + Number(t.amount), 0),
          interTotal: filteredTransactions
            .filter(t => t.paymentMethod === 'INTER' && t.type === 'EXPENSE')
            .reduce((sum, t) => sum + Number(t.amount), 0),
          total: expensesTotal
        }}
        income={{
          salaryTotal: incomeTotal,
          rentExpense: 800.00,
          predictedBalance: incomeTotal - 800.00
        }}
        credits={{
          inter: 500 - filteredTransactions
            .filter(t => t.paymentMethod === 'INTER' && t.type === 'EXPENSE')
            .reduce((sum, t) => sum + Number(t.amount), 0),
          nubank: 1900 - filteredTransactions
            .filter(t => t.paymentMethod === 'NUBANK' && t.type === 'EXPENSE')
            .reduce((sum, t) => sum + Number(t.amount), 0)
        }}
        finalBalance={{
          difference: incomeTotal - expensesTotal,
          remainingBalance: incomeTotal - expensesTotal
        }}
      />
    </div>
  );
}