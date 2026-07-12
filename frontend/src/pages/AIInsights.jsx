import { useQuery } from '@tanstack/react-query';
import { Brain, ShieldAlert, Sparkles, CheckCircle2, ChevronRight, Activity } from 'lucide-react';
import PageHeader from '../components/ui/PageHeader';
import { getAIInsights } from '../services/ai.service';

export default function AIInsights() {
  const { data: response, isLoading, isError, refetch, isRefetching } = useQuery({
    queryKey: ['ai-insights'],
    queryFn: getAIInsights,
    refetchOnWindowFocus: false,
  });

  const insights = response?.data ?? {
    source: 'Loading...',
    observations: [],
    recommendations: [],
  };

  return (
    <div className="space-y-6 animate-in">
      <PageHeader
        title="Operational AI Insights"
        subtitle="Intelligent fleet analytics and preventive maintenance recommendations"
        action={
          <button
            onClick={() => refetch()}
            disabled={isLoading || isRefetching}
            className="btn-secondary flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4 text-brand-400" />
            {isRefetching ? 'Analyzing...' : 'Re-Analyze Fleet'}
          </button>
        }
      />

      {isLoading ? (
        <div className="card p-8 flex flex-col items-center justify-center py-20 text-center gap-4">
          <Brain className="w-12 h-12 text-brand-500 animate-pulse" />
          <div>
            <p className="text-slate-200 font-semibold text-lg">Analyzing Fleet Metrics...</p>
            <p className="text-slate-400 text-sm mt-1">Gemini is processing active logs, odometer limits, and license rosters.</p>
          </div>
          <div className="w-48 bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-brand-500 h-full w-2/3 rounded-full animate-pulse-slow" />
          </div>
        </div>
      ) : isError ? (
        <div className="card p-8 text-center flex flex-col items-center py-16 gap-3">
          <ShieldAlert className="w-10 h-10 text-danger-400" />
          <p className="text-slate-200 font-semibold">Failed to Generate Insights</p>
          <p className="text-slate-500 text-sm max-w-sm">
            Could not contact the analysis engine. Make sure the backend server is active and accessible.
          </p>
          <button onClick={() => refetch()} className="btn-primary mt-2">Retry Analysis</button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Engines source banner */}
          <div className="flex items-center justify-between px-4 py-3 bg-white/[0.02] border border-slate-800 rounded-xl">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-brand-400 animate-pulse" />
              <span className="text-slate-400 text-xs font-semibold">Engine Source:</span>
              <span className="text-brand-300 font-mono text-xs">{insights.source}</span>
            </div>
            <span className="text-slate-500 text-[10px] hidden sm:inline-block">Compliance Verified</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Strategic Observations */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <Brain className="w-5 h-5 text-brand-400" />
                <h2 className="text-slate-200 font-semibold">Operational Observations</h2>
              </div>
              <div className="space-y-3">
                {insights.observations.map((obs, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-850 rounded-xl hover:bg-slate-850/50 transition-colors">
                    <ChevronRight className="w-4 h-4 text-brand-500 mt-0.5 flex-shrink-0" />
                    <p className="text-slate-300 text-sm leading-relaxed">{obs}</p>
                  </div>
                ))}
                {insights.observations.length === 0 && (
                  <p className="text-slate-500 text-sm">No critical operational observations at this time.</p>
                )}
              </div>
            </div>

            {/* Action Recommendations */}
            <div className="card p-5 space-y-4">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
                <CheckCircle2 className="w-5 h-5 text-success-400" />
                <h2 className="text-slate-200 font-semibold">Action Recommendations</h2>
              </div>
              <div className="space-y-3">
                {insights.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex items-start gap-3 p-3 bg-slate-900 border border-slate-850 rounded-xl hover:bg-slate-850/50 transition-colors">
                    <span className="w-1.5 h-1.5 rounded-full bg-success-500 mt-2 flex-shrink-0" />
                    <p className="text-slate-300 text-sm leading-relaxed">{rec}</p>
                  </div>
                ))}
                {insights.recommendations.length === 0 && (
                  <p className="text-slate-500 text-sm">No action items recommended at this time.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
