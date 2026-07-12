import { cn } from '../../utils/cn';

/**
 * FilterBar — horizontal row of select dropdowns with an optional search bar slot.
 * @param {{ filters: Array<{id, label, value, onChange, options: Array<{value, label}>}>, children?: React.ReactNode }} props
 */
export default function FilterBar({ filters = [], children }) {
  return (
    <div className="flex flex-wrap items-center gap-3 mb-4">
      {children}
      {filters.map((filter) => (
        <div key={filter.id} className="flex items-center gap-2">
          <select
            id={filter.id}
            value={filter.value}
            onChange={(e) => filter.onChange(e.target.value)}
            className={cn(
              'bg-surface-900 border border-slate-700 rounded-xl px-3 h-9 text-sm text-slate-300',
              'focus:outline-none focus:border-brand-500 transition-colors cursor-pointer',
              'appearance-none pr-8',
              'bg-[url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3E%3Cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3E%3C/svg%3E")] bg-no-repeat bg-right-2 bg-[length:16px]'
            )}
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}
