import { ReactNode } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';

type SummaryCardProps = {
  title: string;
  value: number;
  icon: ReactNode;
  iconBg: string;
  isPositive?: boolean;
  isNegative?: boolean;
  isLoading?: boolean;
};

export default function SummaryCard({ 
  title, 
  value, 
  icon, 
  iconBg, 
  isPositive, 
  isNegative,
  isLoading = false
}: SummaryCardProps) {
  const valueClasses = isPositive 
    ? 'text-green-500' 
    : isNegative 
      ? 'text-destructive' 
      : 'text-gray-800';
  
  return (
    <Card className="summary-card">
      <CardContent className="p-0">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className={`rounded-full p-2 ${iconBg}`}>
            {icon}
          </div>
        </div>
        
        {isLoading ? (
          <Skeleton className="h-8 w-32" />
        ) : (
          <p className={`text-2xl font-semibold ${valueClasses}`}>
            {formatCurrency(value)}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
