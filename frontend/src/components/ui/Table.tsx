import React from 'react';

interface Column {
  header: string;
  accessor: string;
  cell?: (item: any) => React.ReactNode;
}

interface TableProps {
  columns: Column[];
  data: any[];
  keyExtractor: (item: any) => string | number;
  emptyMessage?: string;
}

export const Table: React.FC<TableProps> = ({ columns, data, keyExtractor, emptyMessage = 'No data available' }) => {
  return (
    <div className="overflow-x-auto w-full">
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50 border-y border-slate-200">
            {columns.map((col, i) => (
              <th key={i} className="px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-slate-100">
          {data.length > 0 ? (
            data.map((row) => (
              <tr key={keyExtractor(row)} className="hover:bg-slate-50/50 transition-colors">
                {columns.map((col, i) => (
                  <td key={i} className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    {col.cell ? col.cell(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-8 text-center text-sm text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};
