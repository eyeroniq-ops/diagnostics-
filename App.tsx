
import React, { useState } from 'react';
import { AuditForm } from './components/AuditForm';
import { AuditReport } from './components/AuditReport';
import { analyzeBrandProject } from './services/geminiService';
import { AuditInputData, AnalysisResult, AuditPhase } from './types';
import { PHASE_CONFIG } from './constants';
import { Loader2, Info, Palette, Brain, Globe, Rocket } from 'lucide-react';

function App() {
  const [view, setView] = useState<'form' | 'loading' | 'report'>('form');
  const [inputData, setInputData] = useState<AuditInputData | null>(null);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAuditSubmit = async (data: AuditInputData) => {
    setInputData(data);
    setView('loading');
    setError(null);

    try {
      const analysis = await analyzeBrandProject(data);
      setResult(analysis);
      setView('report');
    } catch (err) {
      console.error(err);
      setError("Error al analizar el proyecto. Por favor verifica tu conexión.");
      setView('form');
    }
  };

  const handleReset = () => {
    setView('form');
    setInputData(null);
    setResult(null);
  };

  const getPhaseIcon = (phase: AuditPhase) => {
    switch (phase) {
      case AuditPhase.BRANDING_FIRST: return <Palette size={24} />;
      case AuditPhase.STRATEGY_FIRST: return <Brain size={24} />;
      case AuditPhase.READY_FOR_WEB: return <Globe size={24} />;
      case AuditPhase.READY_TO_SCALE: return <Rocket size={24} />;
      default: return <Info size={24} />;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-zinc-900 to-black text-zinc-200 font-sans selection:bg-fuchsia-500/30 relative overflow-x-hidden">
      
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-md no-print">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tight text-white">eyeroniq</span>
          </div>
          <div className="text-xs font-medium text-zinc-500 border border-zinc-800 px-3 py-1 rounded-full bg-zinc-900">
            v2.5 Flash Engine
          </div>
        </div>
      </header>

      <main className="relative z-10 p-6 md:p-12 max-w-5xl mx-auto">
        {view === 'form' && (
          <div className="space-y-12 animate-fade-in">
            <div className="text-center max-w-2xl mx-auto">
              <h1 className="text-4xl md:text-5xl font-light text-white mb-4">
                Diagnóstico de <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-400 to-violet-500 font-medium">Marca</span>
              </h1>
              <p className="text-zinc-400 text-lg">
                Ingresa los detalles del proyecto para generar una hoja de ruta estratégica y puntaje de viabilidad con IA.
              </p>
            </div>

            {error && (
               <div className="bg-red-900/20 border border-red-500/50 text-red-400 p-4 rounded-lg text-center text-sm">
                 {error}
               </div>
            )}

            <AuditForm onSubmit={handleAuditSubmit} />

            {/* Phase Legend / Semaphore Info - Moved below form */}
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 backdrop-blur-sm mt-12">
              <div className="flex items-center gap-2 mb-6 text-sm uppercase tracking-wider font-bold text-zinc-500 border-b border-zinc-800 pb-2">
                <Info size={16} />
                Semáforo de Madurez
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {(Object.entries(PHASE_CONFIG) as [AuditPhase, typeof PHASE_CONFIG[AuditPhase]][]).map(([key, config]) => (
                  <div key={key} className={`p-5 rounded-lg border ${config.border} bg-black/40 flex flex-col gap-3 transition-all hover:bg-zinc-900/60`}>
                    <div className={`${config.color}`}>
                      {getPhaseIcon(key as AuditPhase)}
                    </div>
                    <div>
                      <h3 className={`text-xs font-bold uppercase mb-1 ${config.color}`}>{config.label}</h3>
                      <p className="text-xs text-zinc-400 leading-tight">{config.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {view === 'loading' && (
          <div className="flex flex-col items-center justify-center h-[60vh] space-y-6">
            <div className="relative">
              <div className="absolute inset-0 bg-fuchsia-500 blur-xl opacity-20 animate-pulse"></div>
              <Loader2 size={64} className="text-fuchsia-500 animate-spin relative z-10" />
            </div>
            <div className="text-center space-y-2">
              <h3 className="text-2xl font-light text-white">Analizando Activos...</h3>
              <p className="text-zinc-500 text-sm">Gemini está evaluando consistencia, estrategia y riesgos.</p>
            </div>
          </div>
        )}

        {view === 'report' && inputData && result && (
          <AuditReport 
            data={inputData} 
            result={result} 
            onReset={handleReset} 
          />
        )}
      </main>
    </div>
  );
}

export default App;
