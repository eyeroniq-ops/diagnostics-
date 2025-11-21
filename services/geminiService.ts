
import { AnalysisResult, AuditInputData, AuditPhase, AssetStatus } from "../types";
import { VISUAL_CHECKLIST, STRATEGY_CHECKLIST, RISKS_LIST, OBJECTIVES_LIST } from "../constants";

// --- SCORING WEIGHTS ---
const SCORES = {
  CRITICAL: 15, // Missing logo, audience, etc.
  HIGH: 10,     // Missing manual, values
  MEDIUM: 5,    // Missing secondary assets
  LOW: 2        // Partial states
};

// --- OBSERVATION LIBRARY ---
const OBSERVATION_LIBRARY: Record<string, { no: string; partial: string; yes: string }> = {
  // VISUAL
  v_brandbook: {
    no: "La falta de un Manual de Marca es crítica. Sin reglas claras, cada proveedor improvisará, diluyendo tu identidad.",
    partial: "El manual actual es insuficiente. Necesitas normalizar usos para garantizar consistencia.",
    yes: "El Brandbook es sólido, permitiendo escalar la identidad sin perder coherencia."
  },
  v_logo_primary: {
    no: "NO EXISTE MARCA. Sin un logo principal definido, no tienes una cara ante el mercado. Esto es prioridad #1.",
    partial: "El logo actual tiene problemas de legibilidad o construcción que limitan su uso profesional.",
    yes: "El identificador principal está definido correctamente."
  },
  v_logo_vector: {
    no: "Sin archivos vectoriales (AI/SVG), tu marca se verá pixelada en impresiones grandes. Bloqueante para rotulación.",
    partial: "Archivos de baja calidad. Se requiere un retrazado técnico urgente.",
    yes: "Archivos listos para producción de alta calidad."
  },
  v_scalability: {
    no: "Tu marca desaparecerá en entornos móviles o favicons por falta de versiones reducidas.",
    partial: "La reducción pierde detalles. Se necesita optimizar la síntesis gráfica.",
    yes: "La marca responde bien en tamaños reducidos."
  },
  v_typography: {
    no: "Usar fuentes genéricas quita personalidad. Necesitas una familia tipográfica que comunique tu tono.",
    partial: "Hay inconsistencia en el uso de tipografías entre diferentes canales.",
    yes: "Sistema tipográfico jerarquizado y con carácter."
  },
  v_palette: {
    no: "Sin códigos de color definidos, tu marca cambia de tono en cada pantalla o impresión.",
    partial: "Faltan equivalencias CMYK/RGB, lo que genera colores apagados en impresión.",
    yes: "Paleta de colores normalizada para todos los soportes."
  },
  v_logo_unique: {
    no: "ALERTA LEGAL: Usar plantillas o copias hace imposible registrar tu marca. Riesgo alto de demanda.",
    partial: "Elementos genéricos que dificultan la diferenciación en el mercado.",
    yes: "Identidad distintiva y apta para registro."
  },
  v_flat: {
    no: "Estilo gráfico obsoleto (sombras, 3D antiguo) que transmite falta de actualización.",
    partial: "En proceso de modernización, pero aún conserva vicios estéticos antiguos.",
    yes: "Lenguaje visual moderno y plano (Flat Design), ideal para digital."
  },

  // STRATEGY
  s_mission: {
    no: "Una empresa sin misión clara es difícil de diferenciar. Falta el 'por qué'.",
    partial: "Misión genérica. Suena igual a la competencia.",
    yes: "Propósito claro que guía las decisiones internas."
  },
  s_values: {
    no: "Sin valores definidos, compites solo por precio al no conectar culturalmente.",
    partial: "Valores definidos en papel pero no visibles en la comunicación.",
    yes: "Cultura de marca sólida y comunicable."
  },
  s_audience: {
    no: "ERROR CRÍTICO: Intentar vender a 'todos' es ineficiente. Necesitas definir tu Buyer Persona ya.",
    partial: "Segmentación demográfica básica. Falta profundizar en dolores y deseos psicográficos.",
    yes: "Claridad absoluta sobre a quién sirves."
  },
  s_value_prop: {
    no: "¿Por qué tú? Si no puedes responder eso claramente, tu cliente tampoco podrá elegirte.",
    partial: "Propuesta confusa o centrada en características técnicas en lugar de beneficios.",
    yes: "Diferenciador competitivo potente y claro."
  },
  s_tone: {
    no: "La marca habla diferente en cada canal, generando desconfianza y confusión.",
    partial: "Tono definido pero ejecución inconsistente por falta de guías.",
    yes: "Voz de marca coherente y reconocible."
  },
  s_archetype: {
    no: "Marca fría. Sin un arquetipo, cuesta crear conexión emocional.",
    partial: "Personalidad diluida o contradictoria.",
    yes: "Personalidad humana bien definida que conecta."
  },
  s_naming_check: {
    no: "RIESGO ALTO: Invertir en una marca cuyo nombre no puedes registrar es tirar dinero.",
    partial: "Dominio disponible pero registro de marca incierto.",
    yes: "Nombre seguro y protegible."
  },
  s_competitors: {
    no: "Operar sin mirar a la competencia es peligroso. Necesitas benchmark.",
    partial: "Análisis superficial. Se requiere profundizar en sus debilidades.",
    yes: "Conocimiento estratégico del entorno competitivo."
  },
  s_refs: {
    no: "Sin referencias visuales, el diseño será subjetivo y difícil de aprobar.",
    partial: "Moodboard disperso sin dirección clara.",
    yes: "Norte estético definido."
  }
};

// --- HEADLINES REPOSITORY ---
const HEADLINES = {
  [AuditPhase.BRANDING_FIRST]: [
    "Detén la inversión: Faltan cimientos.",
    "Prioridad Urgente: Creación de Identidad.",
    "Tu marca aún no existe visualmente.",
    "Riesgo de invisibilidad en el mercado."
  ],
  [AuditPhase.STRATEGY_FIRST]: [
    "Imagen vacía: Falta sustancia estratégica.",
    "Rebranding necesario: Desconexión detectada.",
    "No inviertas en ads sin definir tu mensaje.",
    "El diseño es bueno, pero la estrategia falla."
  ],
  [AuditPhase.READY_FOR_WEB]: [
    "Cimientos listos: Hora de digitalizar.",
    "Luz verde para presencia Web.",
    "Marca sólida, lista para el mundo digital.",
    "El siguiente paso es tu ecosistema online."
  ],
  [AuditPhase.READY_TO_SCALE]: [
    "Sistema óptimo: Listo para escalar.",
    "Marca madura preparada para crecimiento.",
    "Foco total en Contenido y Expansión.",
    "Motor encendido para dominar el nicho."
  ]
};

// --- LOGIC ENGINE ---

/**
 * Calculates a score split by category to help phase determination
 */
const calculateSubScores = (data: AuditInputData) => {
  let vScore = 100;
  let sScore = 100;

  // Calculate Visual Score
  Object.entries(data.visualAudit).forEach(([key, val]) => {
    const item = VISUAL_CHECKLIST.find(i => i.id === key);
    if (!item) return;
    
    const isCritical = ['v_logo_primary', 'v_logo_vector', 'v_brandbook'].includes(key);
    if (val === 'NO') vScore -= isCritical ? SCORES.CRITICAL : SCORES.HIGH;
    if (val === 'PARTIAL') vScore -= isCritical ? SCORES.HIGH : SCORES.MEDIUM;
  });

  // Calculate Strategy Score
  Object.entries(data.strategyAudit).forEach(([key, val]) => {
    const isCritical = ['s_audience', 's_value_prop', 's_naming_check'].includes(key);
    if (val === 'NO') sScore -= isCritical ? SCORES.CRITICAL : SCORES.HIGH;
    if (val === 'PARTIAL') sScore -= isCritical ? SCORES.HIGH : SCORES.MEDIUM;
  });

  // Risk penalty affects both globally, but we track it separately
  const riskPenalty = data.risks.length * 4;
  
  return {
    visual: Math.max(0, vScore),
    strategy: Math.max(0, sScore),
    global: Math.max(0, Math.round(((vScore + sScore) / 2) - riskPenalty))
  };
};

const determinePhase = (vScore: number, sScore: number, data: AuditInputData): AuditPhase => {
  const { visualAudit, strategyAudit, objectives } = data;

  // FASE 1: BRANDING DESDE CERO
  // If critical visual assets are missing or visual score is abysmal
  if (
    visualAudit['v_logo_primary'] === 'NO' || 
    visualAudit['v_logo_vector'] === 'NO' || 
    vScore < 50
  ) {
    return AuditPhase.BRANDING_FIRST;
  }

  // FASE 2: REBRANDING
  // If requested explicitly OR strategy is missing criticals OR visuals exist but strategy is weak
  if (
    objectives.includes('o_rebrand') ||
    strategyAudit['s_audience'] === 'NO' || 
    strategyAudit['s_value_prop'] === 'NO' || 
    sScore < 65
  ) {
    return AuditPhase.STRATEGY_FIRST;
  }

  // FASE 3: WEB Y DIGITAL
  // Foundation is decent (Scores > 65-70). Not yet excellent.
  // Or if risks are high enough to prevent scaling.
  if (vScore < 85 || sScore < 85 || data.risks.length > 2) {
    return AuditPhase.READY_FOR_WEB;
  }

  // FASE 4: REDES Y CONTENIDO
  // Everything is solid (>85)
  return AuditPhase.READY_TO_SCALE;
};

const generateDynamicSummary = (data: AuditInputData, phase: AuditPhase, scores: { visual: number, strategy: number, global: number }): string => {
  const parts: string[] = [];

  // 1. Intro
  parts.push(`El diagnóstico de **${data.projectName}** arroja un índice de salud global del **${scores.global}%**.`);

  // 2. Phase Explanation
  switch (phase) {
    case AuditPhase.BRANDING_FIRST:
      parts.push("Detectamos carencias fundamentales en los activos visuales. Antes de cualquier implementación web o campaña, es imperativo **crear la marca desde cero** para asegurar profesionalismo.");
      if (data.visualAudit['v_logo_vector'] === 'NO') parts.push("La ausencia de archivos vectoriales es un bloqueo técnico inmediato.");
      break;
    case AuditPhase.STRATEGY_FIRST:
      parts.push("Aunque existen elementos visuales, la base estratégica es débil. El proyecto requiere un proceso de **Rebranding Estratégico** para alinear la identidad con una audiencia y propuesta de valor claras.");
      if (data.strategyAudit['s_audience'] === 'NO') parts.push("No se ha definido claramente a quién se le está vendiendo.");
      break;
    case AuditPhase.READY_FOR_WEB:
      parts.push("La marca cuenta con cimientos sólidos. Está lista para su etapa de **Digitalización y Desarrollo Web**. El foco debe pasar de la definición a la construcción del ecosistema digital.");
      break;
    case AuditPhase.READY_TO_SCALE:
      parts.push("¡Excelente estado! La marca está madura, coherente y lista para **Escalar**. El esfuerzo debe centrarse totalmente en la generación de tráfico, contenido recurrente y presencia en redes sociales.");
      break;
  }

  // 3. Risk & Objectives Context
  if (data.risks.includes('r_budget')) {
    parts.push("Dado el presupuesto limitado, recomendamos un enfoque 'lean', priorizando solo los servicios esenciales.");
  }
  if (data.objectives.includes('o_sales') && phase !== AuditPhase.BRANDING_FIRST) {
    parts.push("La estrategia se optimizará agresivamente para la conversión de ventas.");
  }

  return parts.join(" ");
};

const generateServices = (data: AuditInputData, phase: AuditPhase): string[] => {
  const recommended = new Set<string>();
  const { risks, objectives, visualAudit } = data;

  // --- CORE PHASE SERVICES ---
  switch (phase) {
    case AuditPhase.BRANDING_FIRST:
      recommended.add('srv_identity'); // Branding Cero
      recommended.add('srv_strategy');
      if (risks.includes('r_no_history')) recommended.add('srv_consulting');
      break;

    case AuditPhase.STRATEGY_FIRST:
      recommended.add('srv_strategy'); // Rebranding Core
      recommended.add('srv_identity'); // Rebranding Visual
      if (!risks.includes('r_budget')) recommended.add('srv_consulting');
      break;

    case AuditPhase.READY_FOR_WEB:
      recommended.add('srv_web');
      if (visualAudit['v_brandbook'] !== 'YES') recommended.add('srv_identity'); // Tweaks
      if (objectives.includes('o_leads')) recommended.add('srv_ads');
      break;

    case AuditPhase.READY_TO_SCALE:
      recommended.add('srv_social');
      recommended.add('srv_content');
      if (!risks.includes('r_budget')) recommended.add('srv_ads');
      recommended.add('srv_ai');
      break;
  }

  // --- CONDITIONAL MODIFIERS ---

  // If Risk: Budget
  if (risks.includes('r_budget')) {
    recommended.delete('srv_consulting');
    recommended.delete('srv_ai');
    // Prefer Content over Ads if budget is low
    if (recommended.has('srv_ads')) {
        recommended.delete('srv_ads');
        recommended.add('srv_content');
    }
  }

  // If Objective: Launch (Overrides phase if foundations exist)
  if (objectives.includes('o_launch') && phase !== AuditPhase.BRANDING_FIRST) {
    recommended.add('srv_web');
    recommended.add('srv_ads');
  }

  // If Objective: Rebrand (Forces identity work)
  if (objectives.includes('o_rebrand')) {
    recommended.add('srv_identity');
    recommended.add('srv_strategy');
  }
  
  // If Objective: Sales (Force Ads/Web if appropriate)
  if (objectives.includes('o_sales') && phase !== AuditPhase.BRANDING_FIRST) {
      if (phase === AuditPhase.READY_FOR_WEB) recommended.add('srv_ads');
  }

  return Array.from(recommended).slice(0, 5);
};

// --- MAIN EXPORT ---

export const analyzeBrandProject = async (data: AuditInputData): Promise<AnalysisResult> => {
  await new Promise(resolve => setTimeout(resolve, 1000));

  const scores = calculateSubScores(data);
  const phase = determinePhase(scores.visual, scores.strategy, data);
  
  const possibleHeadlines = HEADLINES[phase];
  const headline = possibleHeadlines[Math.floor(Math.random() * possibleHeadlines.length)];

  const summary = generateDynamicSummary(data, phase, scores);
  const services = generateServices(data, phase);

  // Map Observations
  const observations: Record<string, string> = {};
  [...VISUAL_CHECKLIST, ...STRATEGY_CHECKLIST].forEach(item => {
    const status = item.category === 'visual' 
      ? data.visualAudit[item.id] 
      : data.strategyAudit[item.id];
    
    if (status) {
      observations[item.id] = OBSERVATION_LIBRARY[item.id] 
        ? (status === 'YES' ? OBSERVATION_LIBRARY[item.id].yes : status === 'PARTIAL' ? OBSERVATION_LIBRARY[item.id].partial : OBSERVATION_LIBRARY[item.id].no)
        : "Estado registrado.";
    }
  });

  return {
    score: scores.global,
    phase,
    headline,
    summary,
    observations,
    recommendedServices: services
  };
};
