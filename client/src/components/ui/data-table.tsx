import * as React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface DataTableProps<TData, TValue> {
  columns: {
    header: string;
    accessorKey: string;
    cell: (info: { getValue: () => TValue }) => React.ReactNode;
    width?: string; // Adicionada propriedade de largura para as colunas
  }[];
  data: TData[];
  footerRow?: React.ReactNode;
  compactMode?: boolean; // Adicionada opção para modo compacto
}

export function DataTable<TData, TValue>({
  columns,
  data,
  footerRow,
  compactMode = false, // Por padrão, não está em modo compacto
}: DataTableProps<TData, TValue>) {
  return (
    <div className={`rounded-md border ${compactMode ? 'table-compact' : ''}`}>
      <div className="overflow-x-auto w-full">
        <Table className={compactMode ? 'table-compact-style' : ''}>
          <TableHeader>
            <TableRow className="bg-gray-50">
              {columns.map((column) => (
                <TableHead
                  key={column.accessorKey}
                  className="text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  style={{ 
                    width: column.width || 'auto', 
                    minWidth: compactMode ? '60px' : '80px',
                    maxWidth: compactMode ? '200px' : 'none'
                  }}
                >
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="py-4 text-center text-sm text-gray-500"
                >
                  Nenhum registro encontrado
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, rowIdx) => (
                <TableRow
                  key={rowIdx}
                  className="hover:bg-gray-50"
                >
                  {columns.map((column) => (
                    <TableCell 
                      key={column.accessorKey} 
                      className={`truncate ${compactMode ? 'text-sm' : ''}`}
                      style={{ 
                        width: column.width || 'auto',
                        maxWidth: compactMode ? '200px' : 'none'
                      }}
                    >
                      {column.cell({
                        getValue: () => (row as any)[column.accessorKey],
                      })}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
          {footerRow && (
            <tfoot>
              {footerRow}
            </tfoot>
          )}
        </Table>
      </div>
    </div>
  );
}
