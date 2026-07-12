import { FileCheck, Send, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { cn } from '../../utils/cn';

/**
 * Reusable chronologically ordered Timeline component.
 * Displays step states based on active trip status.
 *
 * @param {{ status: 'DRAFT' | 'DISPATCHED' | 'COMPLETED' | 'CANCELLED', actualStartTime?: string, actualEndTime?: string, plannedDate: string }} props
 */
export default function Timeline({ status, actualStartTime, actualEndTime, plannedDate }) {
  const steps = [
    {
      id: 'DRAFT',
      title: 'Trip Created',
      desc: 'Trip registered as draft. Pending assignment check.',
      time: null, // Just show creation or plan time if desired
      icon: FileCheck,
      color: 'text-brand-400 bg-brand-500/10 border-brand-500/30',
      active: true,
      done: true,
    },
    {
      id: 'DISPATCHED',
      title: 'Dispatched & Active',
      desc: 'Vehicle and driver dispatched. En route to destination.',
      time: actualStartTime ? new Date(actualStartTime).toLocaleString() : `Planned: ${new Date(plannedDate).toLocaleDateString()}`,
      icon: Send,
      color: status !== 'DRAFT' ? 'text-info-400 bg-info-500/10 border-info-500/30' : 'text-slate-600 bg-slate-800/30 border-slate-700/50',
      active: status === 'DISPATCHED',
      done: status !== 'DRAFT',
    },
    ...(status === 'CANCELLED'
      ? [
          {
            id: 'CANCELLED',
            title: 'Trip Cancelled',
            desc: 'Trip was cancelled. Vehicle and driver released.',
            time: actualEndTime ? new Date(actualEndTime).toLocaleString() : null,
            icon: XCircle,
            color: 'text-danger-400 bg-danger-500/10 border-danger-500/30',
            active: true,
            done: true,
          },
        ]
      : [
          {
            id: 'COMPLETED',
            title: 'Trip Completed',
            desc: 'Delivered successfully. Vehicle returned to fleet.',
            time: actualEndTime ? new Date(actualEndTime).toLocaleString() : null,
            icon: CheckCircle2,
            color: status === 'COMPLETED' ? 'text-success-400 bg-success-500/10 border-success-500/30' : 'text-slate-600 bg-slate-800/30 border-slate-700/50',
            active: status === 'COMPLETED',
            done: status === 'COMPLETED',
          },
        ]),
  ];

  return (
    <div className="relative border-l-2 border-slate-800 ml-4 pl-8 space-y-8 py-2">
      {steps.map((step, idx) => {
        const StepIcon = step.icon;
        return (
          <div key={step.id} className="relative animate-in">
            {/* Step dot */}
            <span className={cn(
              "absolute -left-[45px] top-0 rounded-full w-8 h-8 flex items-center justify-center border transition-all duration-300",
              step.done ? step.color : 'text-slate-600 bg-surface-950 border-slate-800',
              step.active && 'ring-4 ring-brand-500/20'
            )}>
              <StepIcon className="w-4 h-4" />
            </span>

            {/* Step Content */}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className={cn(
                  "font-semibold text-sm",
                  step.done ? 'text-slate-100' : 'text-slate-500'
                )}>
                  {step.title}
                </h3>
                {step.time && (
                  <span className="text-[10px] text-slate-500 font-mono bg-white/[0.02] border border-white/[0.04] px-2 py-0.5 rounded-md">
                    {step.time}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-xs mt-1 max-w-md leading-relaxed">{step.desc}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}
