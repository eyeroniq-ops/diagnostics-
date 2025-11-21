import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { AnalysisResult, AuditInputData, ChecklistItem } from '../types';
import { PHASE_CONFIG, VISUAL_CHECKLIST, STRATEGY_CHECKLIST, SERVICES_LIST } from '../constants';
import GaugeChart from './GaugeChart';
import { Download, Printer, Check, X, AlertTriangle } from 'lucide-react';

// Helper components moved to module scope
const renderStatusIcon = (status?: string) => {
  if (status === 'YES') return <Check size={16} className="text-fuchsia-400" />;
  if (status === 'PARTIAL') return <AlertTriangle size={16} className="text-yellow-400" />;
  return <X size={16} className="text-zinc-600" />;
};

const AuditItemDetail: React.FC<{ item: ChecklistItem, status: string, observation: string }> = ({ item, status, observation }) => (
  <div className="mb-4 p-3 bg-zinc-900/50 rounded border border-zinc-800">
    <div className="flex items-center justify-between mb-2">
      <span className="text-zinc-200 font-medium text-sm">{item.label}</span>
      {renderStatusIcon(status)}
    </div>
    <p className="text-xs text-zinc-400 leading-relaxed border-l-2 border-zinc-700 pl-2">
      {observation || "Sin observación específica."}
    </p>
  </div>
);

interface AuditReportProps {
  data: AuditInputData;
  result: AnalysisResult;
  onReset: () => void;
}

export const AuditReport: React.FC<AuditReportProps> = ({ data, result, onReset }) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const handleDownload = async () => {
    if (reportRef.current) {
      const canvas = await html2canvas(reportRef.current, {
        backgroundColor: '#000000', // Solid black for export
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = `${data.projectName.replace(/\s+/g, '_')}_Reporte.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const phaseInfo = PHASE_CONFIG[result.phase];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Control Bar */}
      <div className="flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800 no-print">
        <button onClick={onReset} className="text-zinc-400 hover:text-white text-sm font-medium">
          ← Nuevo Diagnóstico
        </button>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition">
            <Printer size={20} />
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 bg-fuchsia-700 hover:bg-fuchsia-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-lg shadow-fuchsia-900/20">
            <Download size={16} /> Exportar PNG
          </button>
        </div>
      </div>

      {/* Printable Area */}
      <div ref={reportRef} className="bg-black p-8 md:p-12 print-bg-fix text-zinc-200 min-h-screen">
        
        {/* Header */}
        <div className="flex justify-between items-start mb-12 border-b border-zinc-800 pb-8">
          <div>
            <h4 className="text-fuchsia-500 text-sm font-bold tracking-widest uppercase mb-2">eyeroniq Auditoría</h4>
            <h1 className="text-4xl md:text-5xl font-light text-white mb-2">{data.projectName}</h1>
            <p className="text-zinc-400 max-w-xl">{result.headline}</p>
          </div>
          <div className="text-right">
            <div className="text-xs text-zinc-500 uppercase tracking-wider mb-1">Fecha</div>
            <div className="text-white font-mono">{new Date().toLocaleDateString('es-ES')}</div>
          </div>
        </div>

        {/* Hero Section: Score & Verdict */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          <div className="md:col-span-1 bg-zinc-900/30 rounded-2xl border border-zinc-800 p-6 flex flex-col items-center justify-center">
            <GaugeChart score={result.score} />
          </div>
          
          <div className={`md:col-span-2 rounded-2xl border p-8 flex flex-col justify-center relative overflow-hidden ${phaseInfo.bg} ${phaseInfo.border}`}>
             {/* Background Icon Watermark */}
             <div className="absolute -right-4 -bottom-4 text-9xl opacity-10 select-none pointer-events-none">
               {phaseInfo.icon}
             </div>
             
             <div className="relative z-10">
                <h3 className={`text-sm font-bold uppercase tracking-widest mb-2 ${phaseInfo.color}`}>
                  Veredicto Estratégico
                </h3>
                <h2 className="text-3xl font-bold text-white mb-4">{phaseInfo.label}</h2>
                <p className="text-zinc-300 leading-relaxed mb-6">{result.summary}</p>
                
                <div className="flex flex-wrap gap-2">
                  {result.recommendedServices.map(svcId => {
                    const svc = SERVICES_LIST.find(s => s.id === svcId);
                    return svc ? (
                      <span key={svcId} className="px-3 py-1 rounded-full bg-black/50 border border-zinc-700 text-xs text-zinc-300">
                        + {svc.label}
                      </span>
                    ) : null;
                  })}
                </div>
             </div>
          </div>
        </div>

        {/* Detailed Breakdown */}
        <div className="grid md:grid-cols-2 gap-12">
          
          {/* Visual Audit Column */}
          <div>
            <h3 className="text-xl font-light text-white mb-6 flex items-center gap-2">
              <span className="text-fuchsia-500">///</span> Fundación Visual
            </h3>
            <div className="space-y-2">
              {VISUAL_CHECKLIST.map(item => (
                <AuditItemDetail 
                  key={item.id}
                  item={item}
                  status={data.visualAudit[item.id] || 'NO'}
                  observation={result.observations[item.id]}
                />
              ))}
            </div>
          </div>

          {/* Strategy Audit Column */}
          <div>
            <h3 className="text-xl font-light text-white mb-6 flex items-center gap-2">
              <span className="text-violet-500">///</span> Claridad Estratégica
            </h3>
            <div className="space-y-2">
              {STRATEGY_CHECKLIST.map(item => (
                <AuditItemDetail 
                  key={item.id}
                  item={item}
                  status={data.strategyAudit[item.id] || 'NO'}
                  observation={result.observations[item.id]}
                />
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="mt-16 pt-8 border-t border-zinc-800 flex justify-between items-center text-xs text-zinc-500">
          <p>Generado por eyeroniq AI</p>
          <p>Diagnóstico Confidencial</p>
        </div>
      </div>
    </div>
  );
};