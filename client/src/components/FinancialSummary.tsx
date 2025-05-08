import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';

type FinancialSummaryProps = {
  expenses: {
    nubankTotal: number;
    interTotal: number;
    total: number;
  };
  income: {
    salaryTotal: number;
    rentExpense: number;
    predictedBalance: number;
  };
  credits: {
    inter: number;
    nubank: number;
  };
  finalBalance: {
    difference: number;
    remainingBalance: number;
  };
};

export default function FinancialSummary({ 
  expenses, 
  income, 
  credits, 
  finalBalance 
}: FinancialSummaryProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-gray-800">
          Resumo Financeiro
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total a Pagar</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">CARTÃO NUBANK</div>
                  <div className="text-sm font-medium text-negative">
                    {formatCurrency(expenses.nubankTotal)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">CARTÃO INTER</div>
                  <div className="text-sm font-medium text-negative">
                    {formatCurrency(expenses.interTotal)}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">Total Despesas</div>
                  <div className="text-sm font-medium text-negative">
                    {formatCurrency(expenses.total)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Créditos Disponíveis</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">CRÉDITO INTER</div>
                  <div className="text-sm font-medium text-positive">
                    {formatCurrency(credits.inter)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">CRÉDITO NUBANK</div>
                  <div className="text-sm font-medium text-negative">
                    {formatCurrency(credits.nubank)}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <div>
            <div className="bg-gray-50 p-4 rounded-md mb-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Total a Receber</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-500 mb-1">SALÁRIOS</div>
                  <div className="text-sm font-medium text-positive">
                    {formatCurrency(income.salaryTotal)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 mb-1">ALUGUEL</div>
                  <div className="text-sm font-medium text-negative">
                    {formatCurrency(-income.rentExpense)}
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">Saldo Previsto</div>
                  <div className="text-sm font-medium text-positive">
                    {formatCurrency(income.predictedBalance)}
                  </div>
                </div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-4 rounded-md">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Balanço Final</h3>
              <div className="mt-2 mb-3">
                <div className="text-xs text-gray-500 mb-1">Total Receitas - Total Despesas</div>
                <div className={`text-lg font-semibold ${finalBalance.difference < 0 ? 'text-negative' : 'text-positive'}`}>
                  {formatCurrency(finalBalance.difference)}
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm font-medium text-gray-700">Saldo Restante</div>
                  <div className={`text-lg font-medium ${finalBalance.remainingBalance < 0 ? 'text-negative' : 'text-gray-800'}`}>
                    {formatCurrency(finalBalance.remainingBalance)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
