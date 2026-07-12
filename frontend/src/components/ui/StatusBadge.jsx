import { cn } from '../../utils/cn';

const STATUS_CONFIG = {
  // Vehicle statuses
  AVAILABLE:  { label: 'Available',  className: 'badge-success' },
  ON_TRIP:    { label: 'On Trip',    className: 'badge-info' },
  IN_SHOP:    { label: 'In Shop',    className: 'badge-warning' },
  RETIRED:    { label: 'Retired',    className: 'badge-danger' },
  // Driver statuses
  OFF_DUTY:   { label: 'Off Duty',   className: 'badge-neutral' },
  SUSPENDED:  { label: 'Suspended',  className: 'badge-danger' },
};

/**
 * Generic status badge. Renders with the correct color for any entity status.
 * @param {{ status: string, className?: string }} props
 */
export default function StatusBadge({ status, className }) {
  const config = STATUS_CONFIG[status] ?? { label: status, className: 'badge-neutral' };
  return (
    <span className={cn(config.className, className)}>
      {config.label}
    </span>
  );
}

/**
 * Safety score badge — color coded: ≥80 green, ≥60 yellow, <60 red.
 * @param {{ score: number }} props
 */
export function SafetyScoreBadge({ score }) {
  const config =
    score >= 80 ? { label: `${score}`, className: 'badge-success' } :
    score >= 60 ? { label: `${score}`, className: 'badge-warning' } :
                  { label: `${score}`, className: 'badge-danger'  };

  return <span className={config.className}>{config.label}</span>;
}
