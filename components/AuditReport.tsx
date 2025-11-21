
import React, { useRef } from 'react';
import html2canvas from 'html2canvas';
import { AnalysisResult, AuditInputData, ChecklistItem, AuditPhase } from '../types';
import { PHASE_CONFIG, VISUAL_CHECKLIST, STRATEGY_CHECKLIST, SERVICES_LIST } from '../constants';
import GaugeChart from './GaugeChart';
import { Download, Printer, Check, X, AlertTriangle, Palette, Brain, Globe, Rocket, Info } from 'lucide-react';

// Helper components
const renderStatusIcon = (status?: string) => {
  if (status === 'YES') return <Check size={14} className="text-emerald-600" />;
  if (status === 'PARTIAL') return <AlertTriangle size={14} className="text-amber-500" />;
  return <X size={14} className="text-red-500" />;
};

const AuditItemDetail: React.FC<{ item: ChecklistItem, status: string, observation: string }> = ({ item, status, observation }) => (
  <div className="mb-3 pb-3 border-b border-zinc-100 last:border-0 break-inside-avoid">
    <div className="flex items-center justify-between mb-1">
      <span className="text-zinc-900 font-semibold text-xs uppercase tracking-wide">{item.label}</span>
      {renderStatusIcon(status)}
    </div>
    <p className="text-[11px] text-zinc-600 leading-snug">
      {observation}
    </p>
  </div>
);

const getPhaseIcon = (phase: AuditPhase, size: number = 24, className: string = "") => {
  switch (phase) {
    case AuditPhase.BRANDING_FIRST: return <Palette size={size} className={className} />;
    case AuditPhase.STRATEGY_FIRST: return <Brain size={size} className={className} />;
    case AuditPhase.READY_FOR_WEB: return <Globe size={size} className={className} />;
    case AuditPhase.READY_TO_SCALE: return <Rocket size={size} className={className} />;
    default: return <Info size={size} className={className} />;
  }
};

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
        scale: 2,
        useCORS: true,
        backgroundColor: '#ffffff', // Force white background
        windowWidth: 1200 // Ensure consistency
      });
      const link = document.createElement('a');
      link.download = `Reporte_${data.projectName.replace(/\s+/g, '_')}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    }
  };

  const phaseInfo = PHASE_CONFIG[result.phase];

  return (
    <div className="space-y-6 animate-fade-in flex flex-col items-center">
      {/* Control Bar */}
      <div className="w-full max-w-4xl flex justify-between items-center bg-zinc-900 p-4 rounded-xl border border-zinc-800 no-print sticky top-20 z-40 shadow-xl">
        <button onClick={onReset} className="text-zinc-400 hover:text-white text-sm font-medium">
          ← Nuevo Diagnóstico
        </button>
        <div className="flex gap-3">
          <button onClick={() => window.print()} className="p-2 hover:bg-zinc-800 rounded text-zinc-400 hover:text-white transition">
            <Printer size={20} />
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 bg-white hover:bg-zinc-200 text-black px-4 py-2 rounded-lg text-sm font-bold transition">
            <Download size={16} /> Descargar Informe
          </button>
        </div>
      </div>

      {/* Printable Document Container */}
      <div className="w-full max-w-[210mm] bg-zinc-800/50 p-4 md:p-0 flex justify-center">
        {/* Actual Paper Sheet */}
        <div 
          ref={reportRef} 
          className="bg-white text-black w-full max-w-[210mm] min-h-[297mm] p-10 shadow-2xl relative overflow-hidden"
          style={{ fontFamily: 'Inter, sans-serif' }}
        >
          
          {/* Formal Header */}
          <div className="flex justify-between items-end border-b-2 border-zinc-900 pb-6 mb-8">
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-zinc-900 uppercase mb-1">{data.projectName}</h1>
              <div className="text-xs font-medium text-zinc-500 uppercase tracking-widest">Reporte de Auditoría de Marca</div>
            </div>
            <div className="text-right">
               <div className="text-2xl font-bold text-zinc-900">eyeroniq</div>
               <div className="text-xs text-zinc-500">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            </div>
          </div>

          {/* Executive Summary Box */}
          <div className="bg-zinc-50 border border-zinc-200 rounded-lg p-6 mb-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 text-zinc-900">
              {getPhaseIcon(result.phase, 100)}
            </div>
            
            <div className="grid grid-cols-4 gap-6 relative z-10">
               {/* Score */}
               <div className="col-span-1 flex flex-col items-center justify-center border-r border-zinc-200 pr-6">
                 <div className="relative w-full h-32">
                    <GaugeChart score={result.score} />
                 </div>
                 {/* Override Chart colors via CSS filters or assume standard looks OK. 
                     Ideally we should pass a theme, but for now, let's just show the value clearly below if needed */}
               </div>

               {/* Text Summary */}
               <div className="col-span-3 pl-2">
                 <h3 className={`text-sm font-bold uppercase mb-2 ${phaseInfo.color}`}>
                   Veredicto: {phaseInfo.label}
                 </h3>
                 <p className="text-zinc-700 text-sm leading-relaxed font-medium mb-4">
                   {result.summary}
                 </p>
                 <div className="mb-2 text-xs font-bold uppercase text-zinc-500">Servicios Recomendados:</div>
                 <div className="flex flex-wrap gap-2">
                   {result.recommendedServices.map(svcId => {
                     const svc = SERVICES_LIST.find(s => s.id === svcId);
                     return svc ? (
                       <span key={svcId} className="px-3 py-1 rounded-md bg-zinc-900 text-white text-xs font-medium">
                         {svc.label}
                       </span>
                     ) : null;
                   })}
                 </div>
               </div>
            </div>
          </div>

          {/* Detailed Grid */}
          <div className="grid grid-cols-2 gap-10">
            
            {/* Visual Column */}
            <div>
               <div className="flex items-center gap-2 mb-4 border-b border-zinc-200 pb-2">
                 <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">V</div>
                 <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Diagnóstico Visual</h3>
               </div>
               <div>
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

            {/* Strategy Column */}
            <div>
               <div className="flex items-center gap-2 mb-4 border-b border-zinc-200 pb-2">
                 <div className="w-6 h-6 bg-black text-white rounded-full flex items-center justify-center text-xs font-bold">E</div>
                 <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-900">Diagnóstico Estratégico</h3>
               </div>
               <div>
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
          <div className="absolute bottom-0 left-0 w-full p-8 border-t border-zinc-100">
             <div className="flex justify-between items-center text-[10px] text-zinc-400 uppercase tracking-widest">
                <span>Generado por eyeroniq Logic Engine v3.0</span>
                <span>Confidencial • {data.projectName}</span>
             </div>
          </div>

        </div>
      </div>
    </div>
  );
};
