
import React from 'react';
import { AnalysisResult, AuditInputData, ChecklistItem, AuditPhase } from '../types';
import { PHASE_CONFIG, VISUAL_CHECKLIST, STRATEGY_CHECKLIST, SERVICES_LIST } from '../constants';
import GaugeChart from './GaugeChart';
import { Check, X, AlertTriangle, Palette, Brain, Globe, Rocket, ArrowRight } from 'lucide-react';

const renderStatusIcon = (status?: string) => {
  if (status === 'YES') return <Check size={16} className="text-emerald-500" />;
  if (status === 'PARTIAL') return <AlertTriangle size={16} className="text-amber-500" />;
  return <X size={16} className="text-red-500" />;
};

const AuditItemDetail: React.FC<{ item: ChecklistItem, status: string, observation: string }> = ({ item, status, observation }) => (
  <div className="bg-zinc-900/50 p-4 rounded-lg border border-zinc-800 hover:border-zinc-700 transition-colors">
    <div className="flex items-center justify-between mb-2">
      <span className="text-zinc-300 font-medium text-sm">{item.label}</span>
      {renderStatusIcon(status)}
    </div>
    <p className="text-xs text-zinc-500 leading-relaxed">
      {observation || "No specific observation available."}
    </p>
  </div>
);

interface AuditReportProps {
  data: AuditInputData;
  result: AnalysisResult;
  onReset: () => void;
}

export const AuditReport: React.FC<AuditReportProps> = ({ data, result, onReset }) => {
  const phaseInfo = PHASE_CONFIG[result.phase];

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row gap-6 justify-between items-start border-b border-zinc-800 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl md:text-4xl font-bold text-white">{data.projectName}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${phaseInfo.border} ${phaseInfo.bg} ${phaseInfo.color}`}>
              {phaseInfo.label}
            </span>
          </div>
          <p className="text-zinc-400 max-w-2xl">{result.headline}</p>
        </div>
        <div className="text-right">
            <button onClick={onReset} className="text-sm text-zinc-500 hover:text-white transition-colors underline underline-offset-4">
                Start New Audit
            </button>
        </div>
      </div>

      {/* Score & Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 bg-black/40 border border-zinc-800 rounded-2xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-zinc-900/0 to-zinc-900/50 pointer-events-none" />
          <div className="h-48 w-full relative z-10">
             <GaugeChart score={result.score} />
          </div>
          <div className="mt-4 text-center">
            <h3 className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">Brand Health Score</h3>
          </div>
        </div>

        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8">
            <h3 className="text-lg font-light text-white mb-4 flex items-center gap-2">
                <Brain className="text-fuchsia-500" size={20} />
                Executive Summary
            </h3>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-line mb-6">
                {result.summary}
            </p>
            
            <div>
                <h4 className="text-xs font-bold uppercase text-zinc-500 mb-3 tracking-wider">Recommended Roadmap</h4>
                <div className="flex flex-wrap gap-2">
                    {result.recommendedServices.map(svcId => {
                        const svc = SERVICES_LIST.find(s => s.id === svcId);
                        return svc ? (
                            <span key={svcId} className="px-3 py-1.5 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs rounded-md font-medium flex items-center gap-1">
                                {svc.label}
                            </span>
                        ) : null;
                    })}
                </div>
            </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="text-cyan-400" size={20} />
            <h3 className="text-xl font-light text-white">Visual Analysis</h3>
          </div>
          <div className="grid gap-3">
            {VISUAL_CHECKLIST.map(item => (
              <AuditItemDetail 
                key={item.id}
                item={item}
                status={data.visualAudit[item.id] || 'NO'}
                observation={result.observations?.[item.id] || ''}
              />
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Globe className="text-violet-400" size={20} />
            <h3 className="text-xl font-light text-white">Strategy Analysis</h3>
          </div>
          <div className="grid gap-3">
            {STRATEGY_CHECKLIST.map(item => (
              <AuditItemDetail 
                key={item.id}
                item={item}
                status={data.strategyAudit[item.id] || 'NO'}
                observation={result.observations?.[item.id] || ''}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
