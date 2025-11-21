
import { AnalysisResult, AuditInputData, AuditPhase, AssetStatus } from "../types";
import { VISUAL_CHECKLIST, STRATEGY_CHECKLIST } from "../constants";

// Local logic implementation to replace Gemini API
export const analyzeBrandProject = async (data: AuditInputData): Promise<AnalysisResult> => {
  // Simulate processing delay for better UX
  await new Promise(resolve => setTimeout(resolve, 1500));

  // 1. Calculate Score
  let totalItems = 0;
  let earnedPoints = 0;

  const calculateSectionPoints = (checklist: typeof VISUAL_CHECKLIST, audit: Record<string, AssetStatus>) => {
    checklist.forEach(item => {
      totalItems++;
      const status = audit[item.id];
      if (status === 'YES') earnedPoints += 1;
      if (status === 'PARTIAL') earnedPoints += 0.5;
    });
  };

  calculateSectionPoints(VISUAL_CHECKLIST, data.visualAudit);
  calculateSectionPoints(STRATEGY_CHECKLIST, data.strategyAudit);

  // Normalize to 0-100
  let score = totalItems > 0 ? Math.round((earnedPoints / totalItems) * 100) : 0;

  // Apply Penalties for Critical Missing Items
  const criticalItems = ['v_logo_primary', 'v_logo_vector', 's_audience', 's_value_prop'];
  let penalty = 0;
  criticalItems.forEach(id => {
    const inVisual = data.visualAudit[id];
    const inStrategy = data.strategyAudit[id];
    if (inVisual === 'NO' || inStrategy === 'NO') {
      penalty += 10;
    }
  });

  score = Math.max(0, score - penalty);

  // 2. Determine Phase
  let phase = AuditPhase.BRANDING_FIRST;
  if (score >= 85) {
    phase = AuditPhase.READY_TO_SCALE;
  } else if (score >= 65) {
    phase = AuditPhase.READY_FOR_WEB;
  } else if (score >= 40) {
    phase = AuditPhase.STRATEGY_FIRST;
  }

  // Override phase if critical visual assets are missing
  if (data.visualAudit['v_logo_primary'] !== 'YES' || data.visualAudit['v_palette'] !== 'YES') {
    phase = AuditPhase.BRANDING_FIRST;
  }

  // 3. Generate Headline
  const headlines: Record<AuditPhase, string> = {
    [AuditPhase.BRANDING_FIRST]: "Identidad Visual Requiere Atención Inmediata",
    [AuditPhase.STRATEGY_FIRST]: "Fundamentos Visuales Sólidos, Estrategia Pendiente",
    [AuditPhase.READY_FOR_WEB]: "Base Sólida para Implementación Digital",
    [AuditPhase.READY_TO_SCALE]: "Marca Madura Lista para Escalar y Crecer"
  };

  // 4. Generate Observations
  const observations: Record<string, string> = {};
  [...VISUAL_CHECKLIST, ...STRATEGY_CHECKLIST].forEach(item => {
    const status = data.visualAudit[item.id] || data.strategyAudit[item.id] || 'NO';
    let text = "";
    if (status === 'YES') text = "Activo correctamente definido y alineado con los estándares.";
    else if (status === 'PARTIAL') text = "Existe una base, pero requiere refinamiento profesional para ser efectivo.";
    else text = "Elemento crítico faltante. Su ausencia puede limitar el crecimiento de la marca.";
    
    observations[item.id] = text;
  });

  // 5. Recommend Services
  const recommendedSet = new Set<string>();
  
  // Base recommendations on Phase
  if (phase === AuditPhase.BRANDING_FIRST) {
    recommendedSet.add('srv_identity');
    recommendedSet.add('srv_consulting');
  } else if (phase === AuditPhase.STRATEGY_FIRST) {
    recommendedSet.add('srv_strategy');
    recommendedSet.add('srv_consulting');
  } else if (phase === AuditPhase.READY_FOR_WEB) {
    recommendedSet.add('srv_web');
    recommendedSet.add('srv_content');
  } else {
    recommendedSet.add('srv_ads');
    recommendedSet.add('srv_social');
    recommendedSet.add('srv_ai');
  }

  // Base recommendations on Specific Gaps
  if (data.visualAudit['v_logo_vector'] !== 'YES') recommendedSet.add('srv_identity');
  if (data.strategyAudit['s_audience'] !== 'YES') recommendedSet.add('srv_strategy');
  
  // Base recommendations on Objectives
  if (data.objectives.includes('o_sales')) recommendedSet.add('srv_ads');
  if (data.objectives.includes('o_leads')) recommendedSet.add('srv_web');
  if (data.objectives.includes('o_rebrand')) recommendedSet.add('srv_identity');

  const recommendedServices = Array.from(recommendedSet);

  // 6. Generate Summary
  const summary = `El diagnóstico para ${data.projectName} revela un puntaje de salud de marca del ${score}%. 
  
  El proyecto se encuentra actualmente en la etapa "${phase.replace(/_/g, ' ')}". Se han identificado ${data.risks.length} riesgos principales y ${data.objectives.length} objetivos estratégicos. Para avanzar, es fundamental abordar los elementos marcados en rojo en la auditoría y proceder con los servicios recomendados.`;

  return {
    score,
    phase,
    headline: headlines[phase],
    summary,
    observations,
    recommendedServices
  };
};
