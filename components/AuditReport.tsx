
import React from 'react';
import { AnalysisResult, AuditInputData, ChecklistItem, AuditPhase } from '../types';
import { PHASE_CONFIG, VISUAL_CHECKLIST, STRATEGY_CHECKLIST, SERVICES_LIST } from '../constants';
import GaugeChart from './GaugeChart';
import { Check, X, AlertTriangle, Palette, Brain, Globe, Rocket, Download } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
      {observation || "No hay observaciones disponibles."}
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

  const generatePDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    let yPos = 20;

    // Colors
    const primaryColor = [217, 70, 239]; // Fuchsia-500
    const darkColor = [24, 24, 27]; // Zinc-900

    // --- HEADER ---
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("eyeroniq", margin, yPos);
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(150);
    doc.text("REPORTE DE DIAGNÓSTICO", pageWidth - margin, yPos, { align: "right" });
    
    yPos += 15;
    
    // --- PROJECT TITLE & SCORE ---
    doc.setDrawColor(230);
    doc.line(margin, yPos, pageWidth - margin, yPos);
    yPos += 15;

    doc.setFontSize(18);
    doc.setTextColor(0);
    doc.text(data.projectName, margin, yPos);

    doc.setFontSize(12);
    doc.setTextColor(100);
    doc.text(`${PHASE_CONFIG[result.phase].label}`, margin, yPos + 7);

    // Score Badge
    doc.setFillColor(250, 250, 250);
    doc.setDrawColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.roundedRect(pageWidth - 45, yPos - 10, 30, 20, 3, 3, "FD");
    
    doc.setFontSize(22);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.setFont("helvetica", "bold");
    doc.text(`${result.score}`, pageWidth - 30, yPos + 2, { align: "center" });
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text("PUNTAJE", pageWidth - 30, yPos + 7, { align: "center" });

    yPos += 25;

    // --- SUMMARY ---
    doc.setFontSize(14);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Resumen Ejecutivo", margin, yPos);
    yPos += 8;

    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60);
    const summaryLines = doc.splitTextToSize(result.summary, pageWidth - (margin * 2));
    doc.text(summaryLines, margin, yPos);
    yPos += (summaryLines.length * 5) + 10;

    // --- RECOMMENDATIONS ---
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("Hoja de Ruta Recomendada", margin, yPos);
    yPos += 8;

    // Using the roadmap labels directly
    const recServices = result.recommendedServices;
    
    doc.setFontSize(10);
    doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.text(recServices.join("  •  "), margin, yPos);
    yPos += 15;

    // --- TABLES ---
    
    const createTableData = (checklist: ChecklistItem[], sourceData: Record<string, string>) => {
        return checklist.map(item => [
            item.label,
            sourceData[item.id] === 'YES' ? 'ÓPTIMO' : (sourceData[item.id] === 'PARTIAL' ? 'PARCIAL' : 'FALTANTE'),
            result.observations[item.id] || '-'
        ]);
    };

    // Visual Table
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Auditoría Visual", margin, yPos);
    yPos += 2;

    autoTable(doc, {
        startY: yPos,
        head: [['Activo', 'Estado', 'Observación']],
        body: createTableData(VISUAL_CHECKLIST, data.visualAudit),
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40], textColor: 255 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 30 },
            2: { cellWidth: 'auto' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 1) {
                const text = data.cell.raw as string;
                if (text === 'FALTANTE') data.cell.styles.textColor = [220, 38, 38];
                if (text === 'PARCIAL') data.cell.styles.textColor = [217, 119, 6];
                if (text === 'ÓPTIMO') data.cell.styles.textColor = [16, 185, 129];
            }
        }
    });

    // Strategy Table
    // @ts-ignore
    let finalY = doc.lastAutoTable.finalY + 15;
    
    if (finalY > 250) {
        doc.addPage();
        finalY = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text("Auditoría Estratégica", margin, finalY);
    finalY += 2;

    autoTable(doc, {
        startY: finalY,
        head: [['Componente', 'Estado', 'Observación']],
        body: createTableData(STRATEGY_CHECKLIST, data.strategyAudit),
        theme: 'grid',
        headStyles: { fillColor: [40, 40, 40], textColor: 255 },
        columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 50 },
            1: { cellWidth: 30 },
            2: { cellWidth: 'auto' }
        },
        didParseCell: (data) => {
            if (data.section === 'body' && data.column.index === 1) {
                const text = data.cell.raw as string;
                if (text === 'FALTANTE') data.cell.styles.textColor = [220, 38, 38];
                if (text === 'PARCIAL') data.cell.styles.textColor = [217, 119, 6];
                if (text === 'ÓPTIMO') data.cell.styles.textColor = [16, 185, 129];
            }
        }
    });

    // --- SEMÁFORO DE MADUREZ (MATURITY SEMAPHORE) ---
    // @ts-ignore
    finalY = doc.lastAutoTable.finalY + 20;

    // Check if we need a new page for the legend
    if (finalY > 240) {
        doc.addPage();
        finalY = 20;
    }

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("SEMÁFORO DE MADUREZ (ETAPAS)", margin, finalY);
    finalY += 10;

    const phases = [
        { color: [217, 70, 239], label: 'Prioridad Branding', desc: 'Faltan activos fundamentales. Construir identidad.' }, // Fuchsia
        { color: [139, 92, 246], label: 'Prioridad Estrategia', desc: 'Visuales existen pero falta dirección.' }, // Violet
        { color: [34, 211, 238], label: 'Listo para Web', desc: 'Base sólida. Listo para digital.' }, // Cyan
        { color: [52, 211, 153], label: 'Listo para Escalar', desc: 'Sistemas listos. Enfoque en crecimiento.' }, // Emerald
    ];

    phases.forEach((phase, index) => {
        const rowY = finalY + (index * 12);
        
        // Draw colored box
        doc.setFillColor(phase.color[0], phase.color[1], phase.color[2]);
        doc.rect(margin, rowY, 4, 4, 'F');

        // Label
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(60);
        doc.text(phase.label, margin + 8, rowY + 3);

        // Desc
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100);
        doc.text(phase.desc, margin + 50, rowY + 3);
    });

    // Footer
    const pageCount = doc.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(150);
        doc.text(`Generado por eyeroniq - Página ${i} de ${pageCount}`, pageWidth / 2, doc.internal.pageSize.getHeight() - 10, { align: 'center' });
    }

    doc.save(`${data.projectName.replace(/\s+/g, '_')}_Reporte_Auditoria.pdf`);
  };

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
        <div className="flex flex-col gap-2 items-end">
            <button 
                onClick={generatePDF}
                className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-black px-4 py-2 rounded-lg text-sm font-bold transition-colors shadow-lg shadow-zinc-900/20"
            >
                <Download size={16} />
                Exportar PDF
            </button>
            <button onClick={onReset} className="text-sm text-zinc-500 hover:text-white transition-colors underline underline-offset-4">
                Nueva Auditoría
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
            <h3 className="text-zinc-500 text-xs uppercase tracking-widest font-semibold">Puntuación de Marca</h3>
          </div>
        </div>

        <div className="lg:col-span-2 bg-zinc-900/30 border border-zinc-800 rounded-2xl p-8">
            <h3 className="text-lg font-light text-white mb-4 flex items-center gap-2">
                <Brain className="text-fuchsia-500" size={20} />
                Resumen Ejecutivo
            </h3>
            <p className="text-zinc-300 leading-relaxed whitespace-pre-line mb-6">
                {result.summary}
            </p>
            
            <div>
                <h4 className="text-xs font-bold uppercase text-zinc-500 mb-3 tracking-wider">Hoja de Ruta Recomendada</h4>
                <div className="flex flex-wrap gap-2">
                    {result.recommendedServices.map((service, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-300 text-xs rounded-md font-medium flex items-center gap-1">
                            {service}
                        </span>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Detailed Analysis */}
      <div className="grid md:grid-cols-2 gap-8">
        <div className="space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <Palette className="text-cyan-400" size={20} />
            <h3 className="text-xl font-light text-white">Auditoría Visual</h3>
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
            <h3 className="text-xl font-light text-white">Auditoría Estratégica</h3>
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
