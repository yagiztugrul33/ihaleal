import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type Column<T> = { key: string; header: string; cell: (row: T) => ReactNode; className?: string };

type DataTableProps<T> = {
  columns: Column<T>[];
  rows: T[];
  emptyMessage?: string;
  getRowKey: (row: T) => string;
};

export function DataTable<T>({ columns, rows, emptyMessage = "Kayit yok.", getRowKey }: DataTableProps<T>) {
  return (
    <div className="card-luxury overflow-hidden !p-0">
      <div className="overflow-x-auto">
        <table className="enterprise-table w-full text-sm">
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={cn("px-4 py-3 text-start", c.className)}>{c.header}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-12 text-center text-slate-500">{emptyMessage}</td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr key={getRowKey(row)} className="border-t border-white/5 text-slate-200 transition-colors hover:bg-white/[0.03]">
                  {columns.map((c) => (
                    <td key={c.key} className={cn("px-4 py-3", c.className)}>{c.cell(row)}</td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}