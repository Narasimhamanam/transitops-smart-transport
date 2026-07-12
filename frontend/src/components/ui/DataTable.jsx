import { cn } from '../../utils/cn';

function SkeletonRow({ cols }) {
  return (
    <tr className="border-b border-slate-800/50">
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-3.5">
          <div className="h-4 bg-slate-800 rounded animate-pulse" style={{ width: `${60 + Math.random() * 30}%` }} />
        </td>
      ))}
    </tr>
  );
}

/**
 * Generic DataTable component.
 *
 * @param {{
 *   columns: Array<{ key: string, label: string, render?: (row) => React.ReactNode, className?: string }>,
 *   data: Array<object>,
 *   isLoading?: boolean,
 *   emptyMessage?: string,
 *   keyField?: string,
 * }} props
 */
export default function DataTable({ columns, data, isLoading, emptyMessage = 'No records found.', keyField = 'id' }) {
  const colCount = columns.length;

  return (
    <div className="table-container">
      <table className="data-table">
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} className={cn('whitespace-nowrap', col.className)}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} cols={colCount} />)
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={colCount} className="px-4 py-12 text-center text-slate-500">
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row) => (
              <tr key={row[keyField]}>
                {columns.map((col) => (
                  <td key={col.key} className={col.className}>
                    {col.render ? col.render(row) : (row[col.key] ?? '—')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
