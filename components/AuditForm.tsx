
import React, { useState, useMemo } from 'react';
import { AuditInputData, AssetStatus, ChecklistItem } from '../types';
import { 
  VISUAL_CHECKLIST, 
  STRATEGY_CHECKLIST, 
  RISKS_LIST, 
  OBJECTIVES_LIST, 
  SERVICES_LIST 
} from '../constants';
import { CheckCircle2, ChevronRight, ChevronLeft, AlertCircle } from 'lucide-react';

interface AuditFormProps {
  onSubmit: (data: AuditInputData) => void;
}

export const AuditForm: React.FC<AuditFormProps> = ({ onSubmit }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<AuditInputData>({
    projectName: '',
    projectContext: '',
    visualAudit: {},
    strategyAudit: {},
    risks: [],
    objectives: [],
    proposedServices: [],
  });

  const updateStatus = (category: 'visualAudit' | 'strategyAudit', id: string, status: AssetStatus) => {
    setFormData(prev => ({
      ...prev,
      [category]: { ...prev[category], [id]: status }
    }));
  };

  const toggleList = (category: 'risks' | 'objectives' | 'proposedServices', value: string) => {
    setFormData(prev => {
      const list = prev[category];

      if (category === 'risks') {
        if (value === 'r_none') {
            // If clicking 'Ninguno', clear others and select 'Ninguno' (or deselect if already selected)
            return { ...prev, risks: list.includes('r_none') ? [] : ['r_none'] };
        } else {
            // If clicking a normal risk, remove 'Ninguno' if present
            const listWithoutNone = list.filter(item => item !== 'r_none');
            
            if (listWithoutNone.includes(value)) {
                return { ...prev, risks: listWithoutNone.filter(item => item !== value) };
            } else {
                return { ...prev, risks: [...listWithoutNone, value] };
            }
        }
      }

      // Default behavior for other categories
      if (list.includes(value)) {
        return { ...prev, [category]: list.filter(item => item !== value) };
      }
      return { ...prev, [category]: [...list, value] };
    });
  };

  // Validation Logic
  const isStep1Valid = formData.projectName.trim().length > 0;

  const isStep2Valid = useMemo(() => {
    const visualComplete = VISUAL_CHECKLIST.every(item => formData.visualAudit[item.id]);
    const strategyComplete = STRATEGY_CHECKLIST.every(item => formData.strategyAudit[item.id]);
    return visualComplete && strategyComplete;
  }, [formData.visualAudit, formData.strategyAudit]);

  const isStep3Valid = formData.risks.length > 0 && formData.objectives.length > 0;
  
  const isStep4Valid = formData.proposedServices.length > 0;

  const isNextDisabled = () => {
    if (step === 1) return !isStep1Valid;
    if (step === 2) return !isStep2Valid;
    if (step === 3) return !isStep3Valid;
    if (step === 4) return !isStep4Valid;
    return false;
  };

  const StatusButton = ({ 
    status, 
    current, 
    onClick 
  }: { 
    status: AssetStatus; 
    current?: AssetStatus; 
    onClick: () => void 
  }) => {
    let baseClasses = "px-3 py-1.5 text-xs font-medium rounded border transition-all ";
    const isSelected = status === current;

    if (status === 'YES') {
      baseClasses += isSelected 
        ? "bg-fuchsia-500/20 border-fuchsia-500 text-fuchsia-300" 
        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-fuchsia-900 hover:text-zinc-300";
    } else if (status === 'NO') {
      baseClasses += isSelected 
        ? "bg-red-900/20 border-red-800 text-red-400" 
        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-red-900 hover:text-zinc-300";
    } else {
      baseClasses += isSelected 
        ? "bg-violet-500/20 border-violet-500 text-violet-300" 
        : "bg-zinc-900 border-zinc-800 text-zinc-500 hover:border-violet-900 hover:text-zinc-300";
    }

    return (
      <button onClick={onClick} className={baseClasses} type="button">
        {status === 'YES' ? 'SÍ' : status}
      </button>
    );
  };

  const RenderAuditRow: React.FC<{ item: ChecklistItem, cat: 'visualAudit' | 'strategyAudit' }> = ({ item, cat }) => {
    const isAnswered = !!formData[cat][item.id];
    return (
      <div className={`flex items-center justify-between py-3 border-b last:border-0 transition-colors ${isAnswered ? 'border-zinc-800' : 'border-red-900/30 bg-red-900/5 px-2 rounded'}`}>
        
        {/* Tooltip wrapper */}
        <div className="relative group flex items-center cursor-help">
            <span className={`text-sm border-b border-dotted border-zinc-700 pb-0.5 ${isAnswered ? 'text-zinc-300' : 'text-red-300/80'}`}>
                {item.label}
            </span>
            {item.description && (
                <div className="absolute bottom-full left-0 mb-2 w-64 p-3 bg-zinc-950 border border-zinc-700 rounded-lg shadow-2xl text-xs text-zinc-400 z-50 hidden group-hover:block pointer-events-none animate-in fade-in zoom-in-95 duration-200">
                    {item.description}
                    <div className="absolute top-full left-4 -mt-px border-4 border-transparent border-t-zinc-700"></div>
                </div>
            )}
        </div>

        <div className="flex gap-2">
          <StatusButton status="YES" current={formData[cat][item.id]} onClick={() => updateStatus(cat, item.id, 'YES')} />
          <StatusButton status="PARTIAL" current={formData[cat][item.id]} onClick={() => updateStatus(cat, item.id, 'PARTIAL')} />
          <StatusButton status="NO" current={formData[cat][item.id]} onClick={() => updateStatus(cat, item.id, 'NO')} />
        </div>
      </div>
    );
  };

  const RenderMultiSelect: React.FC<{ item: ChecklistItem, listName: 'risks' | 'objectives' | 'proposedServices' }> = ({ item, listName }) => {
    const isSelected = formData[listName].includes(item.id);
    return (
      <button
        type="button"
        onClick={() => toggleList(listName, item.id)}
        className={`flex items-center p-3 rounded-lg border text-left transition-all ${
          isSelected 
            ? 'bg-fuchsia-500/10 border-fuchsia-500 text-fuchsia-200' 
            : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:bg-zinc-800'
        }`}
      >
        <div className={`w-4 h-4 mr-3 rounded border flex items-center justify-center ${isSelected ? 'bg-fuchsia-500 border-fuchsia-500' : 'border-zinc-600'}`}>
          {isSelected && <CheckCircle2 size={12} className="text-black" />}
        </div>
        <span className="text-sm">{item.label}</span>
      </button>
    );
  };

  return (
    <div className="max-w-3xl mx-auto bg-zinc-950/80 backdrop-blur border border-zinc-800 rounded-2xl overflow-visible shadow-2xl shadow-purple-900/10">
      <div className="h-1 bg-zinc-800 rounded-t-2xl overflow-hidden">
        <div 
          className="h-full bg-gradient-to-r from-fuchsia-500 to-violet-500 transition-all duration-500" 
          style={{ width: `${(step / 4) * 100}%` }}
        />
      </div>

      <div className="p-8">
        {step === 1 && (
          <div className="space-y-6 animate-fade-in">
            <h2 className="text-2xl font-light text-white">Resumen del Proyecto</h2>
            <p className="text-zinc-400 text-sm">Comienza definiendo los detalles clave de la marca a auditar.</p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">Nombre de la Marca</label>
                <input 
                  type="text" 
                  value={formData.projectName}
                  onChange={(e) => setFormData({...formData, projectName: e.target.value})}
                  className="w-full bg-black border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none"
                  placeholder="Ej: Acme Corp"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">Contexto & Antecedentes</label>
                <textarea 
                  value={formData.projectContext}
                  onChange={(e) => setFormData({...formData, projectContext: e.target.value})}
                  className="w-full h-32 bg-black border border-zinc-800 rounded-lg p-3 text-white focus:ring-2 focus:ring-fuchsia-500 outline-none resize-none"
                  placeholder="Describe el modelo de negocio, situación actual y principales desafíos..."
                />
              </div>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-light text-white">Activos & Estrategia</h2>
                <p className="text-zinc-400 text-sm">Audita la existencia y calidad de los activos actuales.</p>
              </div>
              {!isStep2Valid && (
                <div className="flex items-center gap-2 text-amber-500 text-xs font-medium bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <AlertCircle size={12} />
                  Completa todos los campos
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="bg-black/50 p-4 rounded-xl border border-zinc-800/50">
                <h3 className="text-fuchsia-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="text-lg">🎨</span> Auditoría Visual
                </h3>
                <div className="space-y-1">
                  {VISUAL_CHECKLIST.map(item => <RenderAuditRow key={item.id} item={item} cat="visualAudit" />)}
                </div>
              </div>

              <div className="bg-black/50 p-4 rounded-xl border border-zinc-800/50">
                <h3 className="text-violet-400 text-xs font-bold uppercase tracking-wider mb-4 flex items-center gap-2">
                  <span className="text-lg">🧠</span> Auditoría Estratégica
                </h3>
                <div className="space-y-1">
                  {STRATEGY_CHECKLIST.map(item => <RenderAuditRow key={item.id} item={item} cat="strategyAudit" />)}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-light text-white">Riesgos & Objetivos</h2>
                <p className="text-zinc-400 text-sm">Identifica cuellos de botella y metas del cliente.</p>
              </div>
              {!isStep3Valid && (
                <div className="flex items-center gap-2 text-amber-500 text-xs font-medium bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <AlertCircle size={12} />
                  Selecciona al menos 1 de cada uno
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div>
                <h3 className="text-xs uppercase text-zinc-500 mb-3">Riesgos Detectados</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {RISKS_LIST.map(item => <RenderMultiSelect key={item.id} item={item} listName="risks" />)}
                </div>
              </div>

              <div>
                <h3 className="text-xs uppercase text-zinc-500 mb-3">Objetivos del Cliente</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {OBJECTIVES_LIST.map(item => <RenderMultiSelect key={item.id} item={item} listName="objectives" />)}
                </div>
              </div>
            </div>
          </div>
        )}

        {step === 4 && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-end">
              <div>
                <h2 className="text-2xl font-light text-white">Alcance Propuesto</h2>
                <p className="text-zinc-400 text-sm">¿Qué servicios se están considerando inicialmente?</p>
              </div>
              {!isStep4Valid && (
                <div className="flex items-center gap-2 text-amber-500 text-xs font-medium bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                  <AlertCircle size={12} />
                  Selecciona al menos 1 servicio
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {SERVICES_LIST.map(item => <RenderMultiSelect key={item.id} item={item} listName="proposedServices" />)}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-zinc-800 flex justify-between">
          {step > 1 ? (
            <button 
              onClick={() => setStep(s => s - 1)}
              className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
            >
              <ChevronLeft size={18} /> Atrás
            </button>
          ) : (
            <div></div>
          )}

          {step < 4 ? (
            <button 
              onClick={() => setStep(s => s + 1)}
              disabled={isNextDisabled()}
              className="bg-zinc-100 text-black px-6 py-2 rounded-lg font-medium hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              Siguiente <ChevronRight size={18} />
            </button>
          ) : (
            <button 
              onClick={() => onSubmit(formData)}
              disabled={isNextDisabled()}
              className="bg-gradient-to-r from-fuchsia-600 to-violet-600 text-white px-8 py-2 rounded-lg font-bold shadow-lg shadow-fuchsia-500/20 hover:shadow-fuchsia-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Generar Diagnóstico
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
