
import { AnalysisResult, AuditInputData, AuditPhase, AssetStatus } from "../types";
import { VISUAL_CHECKLIST, STRATEGY_CHECKLIST } from "../constants";

// Local logic implementation to replace Gemini API
export const analyzeBrandProject = async (data: AuditInputData): Promise<AnalysisResult> => {
  // Simulate processing delay for better UX
  await new Promise(resolve => setTimeout(resolve, 1500));

  // --- 1. Calculate Score (Weighted) ---
  let totalItems = 0;
  let earnedPoints = 0;

  const calculateSectionPoints = (checklist: typeof VISUAL_CHECKLIST, audit: Record<string, AssetStatus>) => {
    checklist.forEach(item => {
      totalItems++;
      const status = audit[item.id];
      // Partial gets 0.4 instead of 0.5 to penalize half-measures slightly more
      if (status === 'YES') earnedPoints += 1;
      if (status === 'PARTIAL') earnedPoints += 0.4; 
    });
  };

  calculateSectionPoints(VISUAL_CHECKLIST, data.visualAudit);
  calculateSectionPoints(STRATEGY_CHECKLIST, data.strategyAudit);

  // Normalize to 0-100
  let score = totalItems > 0 ? Math.round((earnedPoints / totalItems) * 100) : 0;

  // Critical Penalty: If Brandbook or Mission are missing, heavy penalty
  if (data.visualAudit['v_brandbook'] === 'NO') score -= 5;
  if (data.strategyAudit['s_mission'] === 'NO') score -= 5;

  score = Math.max(0, Math.min(100, score));

  // --- 2. Determine Phase (Refined Logic) ---
  let phase = AuditPhase.BRANDING_FIRST;

  const hasLogo = data.visualAudit['v_logo_primary'] === 'YES';
  const hasPalette = data.visualAudit['v_palette'] === 'YES';
  const hasAudience = data.strategyAudit['s_audience'] === 'YES';
  
  const needsRebrand = data.objectives.includes('o_rebrand');
  const wantsScale = data.objectives.includes('o_sales') || data.objectives.includes('o_market');

  if (needsRebrand) {
    phase = AuditPhase.STRATEGY_FIRST; 
    if (!hasLogo) phase = AuditPhase.BRANDING_FIRST; 
  } else if (!hasLogo || !hasPalette) {
    phase = AuditPhase.BRANDING_FIRST;
  } else if (!hasAudience) {
    phase = AuditPhase.STRATEGY_FIRST;
  } else {
    if (score >= 80) {
      phase = AuditPhase.READY_TO_SCALE;
    } else if (score >= 60) {
      if (wantsScale && data.risks.includes('r_inconsistent')) {
        phase = AuditPhase.STRATEGY_FIRST; // Pull back to fix inconsistency
      } else {
        phase = AuditPhase.READY_FOR_WEB;
      }
    } else {
      phase = AuditPhase.STRATEGY_FIRST;
    }
  }

  // --- 3. Risk Calculation (Updated for Accuracy) ---
  // Count explicitly checked risks PLUS missing critical assets (NO)
  const missingAssetsCount = 
    Object.values(data.visualAudit).filter(v => v === 'NO').length +
    Object.values(data.strategyAudit).filter(v => v === 'NO').length;

  const totalRiskCount = data.risks.length + missingAssetsCount;

  let riskLevel = "bajo";
  if (totalRiskCount > 7) riskLevel = "crítico";
  else if (totalRiskCount > 4) riskLevel = "alto";
  else if (totalRiskCount > 1) riskLevel = "moderado";

  // --- 4. Generate Roadmap (Restricted Categories) ---
  // Categories: "Branding", "Rebranding", "Web", "Social Media", "IA y Automatización", "Creación de Contenido", "Diseños"
  
  const roadmap: string[] = [];

  // Logic for Branding / Rebranding / Diseños
  if (needsRebrand) {
    roadmap.push("Rebranding");
  } else if (phase === AuditPhase.BRANDING_FIRST || phase === AuditPhase.STRATEGY_FIRST) {
    roadmap.push("Branding");
  } else {
    // If we are in a good phase but missing specific visual assets
    const needsVisuals = Object.values(data.visualAudit).some(v => v !== 'YES');
    if (needsVisuals) {
        roadmap.push("Diseños");
    }
  }

  // Logic for Web
  const needsWeb = phase === AuditPhase.READY_FOR_WEB || data.objectives.includes('o_launch') || data.proposedServices.includes('srv_web');
  if (needsWeb && phase !== AuditPhase.BRANDING_FIRST) {
    roadmap.push("Web");
  }

  // Logic for Content & Social
  const needsGrowth = phase === AuditPhase.READY_TO_SCALE || phase === AuditPhase.READY_FOR_WEB || data.objectives.includes('o_awareness') || data.objectives.includes('o_leads');
  if (needsGrowth && score > 50) {
      roadmap.push("Social Media");
      roadmap.push("Creación de Contenido");
  }

  // Logic for AI & Automation
  const needsScale = phase === AuditPhase.READY_TO_SCALE || data.objectives.includes('o_sales') || data.objectives.includes('o_market');
  if (needsScale && score > 60) {
      roadmap.push("IA y Automatización");
  }

  // Fallback
  if (roadmap.length === 0) {
      roadmap.push("Branding");
  }

  const uniqueRoadmap = Array.from(new Set(roadmap));

  // --- 5. Generate Headlines & Observations ---
  const headlines: Record<AuditPhase, string> = {
    [AuditPhase.BRANDING_FIRST]: "Cimientos Visuales Críticos Requeridos",
    [AuditPhase.STRATEGY_FIRST]: "Alineación Estratégica Necesaria Antes de Ejecutar",
    [AuditPhase.READY_FOR_WEB]: "Ecosistema Listo para Digitalización",
    [AuditPhase.READY_TO_SCALE]: "Marca Optimizada para Crecimiento Acelerado"
  };

  const observations: Record<string, string> = {};
  
  const getObservationText = (itemCategory: string, status: string, itemId: string) => {
    if (status === 'YES') return "Cumple con los estándares de calidad requeridos.";
    
    if (itemId === 'v_logo_vector' && status !== 'YES') return "CRÍTICO: Sin archivos vectoriales, la marca no puede imprimirse ni escalarse profesionalmente.";
    if (itemId === 's_audience' && status !== 'YES') return "CRÍTICO: Sin definir el público objetivo, cualquier inversión en publicidad será ineficiente.";
    if (itemId === 'v_brandbook' && status !== 'YES') return "Riesgo de inconsistencia visual por falta de manual de uso.";

    if (status === 'PARTIAL') return "Existe una base, pero requiere refinamiento para proyectar autoridad.";
    return "Elemento faltante que debilita la estructura general de la marca.";
  };

  [...VISUAL_CHECKLIST, ...STRATEGY_CHECKLIST].forEach(item => {
    const status = data.visualAudit[item.id] || data.strategyAudit[item.id] || 'NO';
    observations[item.id] = getObservationText(item.category, status, item.id);
  });

  // --- 6. Generate Summary ---
  const summary = `El diagnóstico de ${data.projectName} indica una madurez de marca del ${score}%.
  
  Actualmente se sitúa en la etapa "${phase.replace(/_/g, ' ')}". Detectamos ${totalRiskCount} puntos de atención (riesgos declarados y elementos faltantes) generando un nivel de riesgo ${riskLevel}.
  
  La hoja de ruta recomendada se centra en: ${uniqueRoadmap.join(', ')}.
  ${needsRebrand ? "El Rebranding es la prioridad absoluta para corregir la deuda técnica de la marca." : ""}
  `;

  return {
    score,
    phase,
    headline: headlines[phase],
    summary,
    observations,
    recommendedServices: uniqueRoadmap
  };
};
