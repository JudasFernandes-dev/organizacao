import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
  }).format(value);
}

export function formatDate(dateString: string): string {
  if (!dateString) return '-';
  
  const date = new Date(dateString);
  const day = date.getDate();
  
  // Convert to a descriptive format like "Até dia 15"
  if (day <= 10) {
    return "Até dia 10";
  } else if (day <= 15) {
    return "Até dia 15";
  } else if (day <= 20) {
    return "Até dia 20";
  } else {
    return "Até dia 30";
  }
}

export function calculateTotal(values: number[]): number {
  return values.reduce((sum, value) => sum + value, 0);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'PENDING':
      return 'bg-yellow-100 text-yellow-800';
    case 'PAID':
    case 'RECEIVED':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
}
