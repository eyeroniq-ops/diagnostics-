import { AnalysisResult, AuditInputData, AuditPhase, AssetStatus } from "../types";
import { VISUAL_CHECKLIST, STRATEGY_CHECKLIST, SERVICES_LIST } from "../constants";

// --- LOGIC CONFIGURATION ---

const OBSERVATION_LIBRARY: Record<string, { no: string; partial: string; yes: string }> = {
  // VISUAL
  v_brandbook: {
    no: "Sin un Manual de Marca, pierdes consistencia cada vez que un tercero diseña para ti.",
    partial: "Un manual incompleto genera dudas en la implementación. Necesita normalización.",
    yes: "Excelente. Tener reglas claras facilita la escalabilidad y el trabajo de proveedores."
  },
  v_logo_primary: {
    no: "CRÍTICO. No existe la cara de la empresa. Prioridad absoluta.",
    partial: "El logo actual presenta fallos técnicos o estéticos graves.",
    yes: "Cuentas con el activo principal identificado."
  },
  v_logo_vector: {
    no: "Error técnico grave. Sin vectores (AI/SVG) no puedes imprimir en gran formato ni rotular profesionalmente.",
    partial: "Archivos dudosos. Se requiere trazado profesional para asegurar calidad.",
    yes: "Archivos correctos para producción profesional."
  },
  v_scalability: {
    no: "Tu marca será ilegible en móviles, favicons o perfiles de redes sociales.",
    partial: "La reducción del logo pierde detalles importantes.",
    yes: "Tu marca es legible en cualquier tamaño."
  },
  v_typography: {
    no: "El uso de fuentes genéricas (Arial, Calibri) diluye la personalidad de la marca.",
    partial: "Hay fuentes definidas pero no se usan consistentemente o faltan licencias.",
    yes: "El sistema tipográfico aporta carácter y jerarquía."
  },
  v_palette: {
    no: "La falta de códigos de color exactos provoca que tu marca se vea diferente en cada soporte.",
    partial: "Colores definidos pero sin equivalencias para impresión (CMYK) vs Pantallas (RGB).",
    yes: "Consistencia cromática asegurada en todos los canales."
  },
  v_logo_unique: {
    no: "RIESGO LEGAL. Usar plantillas o copias impide el registro de marca y la diferenciación.",
    partial: "Elementos genéricos que se confunden con la competencia.",
    yes: "Identidad distintiva y protegible."
  },
  v_flat: {
    no: "Estética obsoleta. Sombras y biseles antiguos transmiten una imagen desactualizada.",
    partial: "Intento de modernización que aún conserva vicios de diseño antiguo.",
    yes: "Estética actual, limpia y optimizada para digital."
  },

  // STRATEGY
  s_mission: {
    no: "Sin un propósito claro, es difícil alinear al equipo y atraer talento.",
    partial: "Misión genérica que podría aplicar a cualquier empresa del sector.",
    yes: "Norte estratégico claro."
  },
  s_values: {
    no: "Una marca sin valores es una mercancía (commodity) que solo compite por precio.",
    partial: "Valores listados pero no se reflejan en la comunicación ni acciones.",
    yes: "Cultura de marca sólida que guía la toma de decisiones."
  },
  s_audience: {
    no: "Intentar venderle a 'todos' es la forma más rápida de gastar presupuesto sin retorno.",
    partial: "Segmentación demográfica básica sin entender los dolores psicográficos.",
    yes: "Claridad total sobre a quién servimos y qué necesitan."
  },
  s_value_prop: {
    no: "El cliente no entiende por qué elegirte a ti sobre la competencia.",
    partial: "Propuesta confusa o centrada en características técnicas, no en beneficios.",
    yes: "Diferenciador competitivo claro y comunicado."
  },
  s_tone: {
    no: "Comunicación esquizofrénica: a veces formal, a veces casual. Genera desconfianza.",
    partial: "Tono definido pero inconsistente entre canales (web vs redes).",
    yes: "Voz de marca reconocible y coherente."
  },
  s_archetype: {
    no: "Falta de conexión emocional. La marca se siente fría y corporativa.",
    partial: "Arquetipo mezclado o mal ejecutado.",
    yes: "Personalidad humana que conecta emocionalmente."
  },
  s_naming_check: {
    no: "PELIGRO. Podrías estar invirtiendo en una marca que tendrás que cambiar por demanda legal.",
    partial: "Dominio web disponible pero sin verificación en registro de marcas.",
    yes: "Activo nominal seguro."
  },
  s_competitors: {
    no: "Operar a ciegas sin saber qué hace el mercado te deja en desventaja.",
    partial: "Conocimiento superficial de competidores directos.",
    yes: "Estrategia informada por el contexto del mercado."
  },
  s_refs: {
    no: "Falta de dirección visual. El diseño será subjetivo y difícil de aprobar.",
    partial: "Referencias dispersas sin un hilo conductor estético.",
    yes: "Dirección de arte clara."
  }
};

const PHRASES = {
  [AuditPhase.BRANDING_FIRST]: {
    headlines: [
      "Detén la inversión publicitaria: Faltan cimientos.",
      "Prioridad Urgente: Construcción de Identidad.",
      "Tu marca no está lista para el mercado."
    ],
    summaryTemplate: (name: string) => `El diagnóstico de ${name} revela carencias estructurales en la identidad visual. Antes de pensar en estrategias de crecimiento o web, es imperativo resolver los activos básicos (Logo, Vectores, Manual) para evitar proyectar una imagen amateur.`
  },
  [AuditPhase.STRATEGY_FIRST]: {
    headlines: [
      "Buena imagen, mensaje vacío.",
      "El diseño no salvará una mala estrategia.",
      "Necesitas definir a quién le hablas."
    ],
    summaryTemplate: (name: string) => `Visualmente ${name} tiene potencial, pero la auditoría detecta un vacío en la definición estratégica. Sin definir claramente la Propuesta de Valor y el Público Objetivo, cualquier inversión en marketing tendrá un retorno (ROI) bajo.`
  },
  [AuditPhase.READY_FOR_WEB]: {
    headlines: [
      "Cimientos sólidos, hora de digitalizar.",
      "Marca lista para el ecosistema digital.",
      "El siguiente paso es la presencia web."
    ],
    summaryTemplate: (name: string) => `¡Buenas noticias! ${name} cuenta con una base de identidad y estrategia saludable. El foco ahora debe cambiar de la definición a la implementación: presencia web, redes sociales y puntos de contacto digitales.`
  },
  [AuditPhase.READY_TO_SCALE]: {
    headlines: [
      "Sistema optimizado para liderar.",
      "Marca madura lista para la expansión.",
      "Todo en orden para acelerar."
    ],
    summaryTemplate: (name: string) => `El estado de ${name} es excelente. Los activos visuales son profesionales y la estrategia está clara. La marca está en una posición privilegiada para escalar, invertir en publicidad agresiva y automatizar procesos.`
  }
};

// --- LOGIC FUNCTIONS ---

const calculateScore = (data: AuditInputData): number => {
  let score = 100;

  // Weighted Deductions
  const CRITICAL_PENALTY = 12;
  const HIGH_PENALTY = 8;
  const MED_PENALTY = 5;
  const LOW_PENALTY = 3;

  // Visual Penalties
  if (data.visualAudit['v_logo_primary'] !== 'YES') score -= CRITICAL_PENALTY;
  if (data.visualAudit['v_logo_vector'] !== 'YES') score -= CRITICAL_PENALTY;
  if (data.visualAudit['v_typography'] !== 'YES') score -= HIGH_PENALTY;
  if (data.visualAudit['v_brandbook'] !== 'YES') score -= HIGH_PENALTY;
  
  // Other visuals
  Object.entries(data.visualAudit).forEach(([key, val]) => {
    if (['v_logo_primary', 'v_logo_vector', 'v_typography', 'v_brandbook'].includes(key)) return;
    if (val === 'NO') score -= MED_PENALTY;
    if (val === 'PARTIAL') score -= LOW_PENALTY;
  });

  // Strategy Penalties
  if (data.strategyAudit['s_audience'] !== 'YES') score -= CRITICAL_PENALTY;
  if (data.strategyAudit['s_value_prop'] !== 'YES') score -= CRITICAL_PENALTY;
  if (data.strategyAudit['s_naming_check'] !== 'YES') score -= HIGH_PENALTY;

  // Other Strategy
  Object.entries(data.strategyAudit).forEach(([key, val]) => {
    if (['s_audience', 's_value_prop', 's_naming_check'].includes(key)) return;
    if (val === 'NO') score -= MED_PENALTY;
    if (val === 'PARTIAL') score -= LOW_PENALTY;
  });

  // Risk Penalties
  score -= (data.risks.length * 2);

  return Math.max(0, Math.round(score));
};

const determinePhase = (data: AuditInputData, score: number): AuditPhase => {
  const v = data.visualAudit;
  const s = data.strategyAudit;

  // Phase 1: Branding Critical
  // If no primary logo, no vectors, or score is very low due to visuals
  if (v['v_logo_primary'] === 'NO' || v['v_logo_vector'] === 'NO' || v['v_typography'] === 'NO') {
    return AuditPhase.BRANDING_FIRST;
  }
  if (score < 40) {
    return AuditPhase.BRANDING_FIRST;
  }

  // Phase 2: Strategy Critical
  // Visuals are okay (passed checks above), but critical strategy missing
  if (s['s_audience'] === 'NO' || s['s_value_prop'] === 'NO' || s['s_mission'] === 'NO') {
    return AuditPhase.STRATEGY_FIRST;
  }
  if (s['s_audience'] === 'PARTIAL' && s['s_value_prop'] === 'PARTIAL') {
    return AuditPhase.STRATEGY_FIRST;
  }

  // Phase 3 vs 4
  // If everything is mostly YES and score is high
  if (score > 85 && data.risks.length < 3) {
    return AuditPhase.READY_TO_SCALE;
  }

  // Default mid-state
  return AuditPhase.READY_FOR_WEB;
};

const generateServices = (data: AuditInputData, phase: AuditPhase): string[] => {
  const recommended = new Set<string>();
  const v = data.visualAudit;
  const s = data.strategyAudit;

  // Hard rules
  if (v['v_logo_primary'] !== 'YES' || v['v_brandbook'] !== 'YES') recommended.add('srv_identity');
  if (s['s_audience'] !== 'YES' || s['s_value_prop'] !== 'YES') recommended.add('srv_strategy');
  if (s['s_tone'] !== 'YES' || data.objectives.includes('o_awareness')) recommended.add('srv_content');
  
  // Phase based rules
  if (phase === AuditPhase.BRANDING_FIRST) recommended.add('srv_identity');
  if (phase === AuditPhase.STRATEGY_FIRST) {
    recommended.add('srv_strategy');
    recommended.add('srv_consulting');
  }
  if (phase === AuditPhase.READY_FOR_WEB) {
    recommended.add('srv_web');
    recommended.add('srv_social');
  }
  if (phase === AuditPhase.READY_TO_SCALE) {
    recommended.add('srv_ads');
    recommended.add('srv_ai');
  }

  // Objectives Mapping
  if (data.objectives.includes('o_sales')) recommended.add('srv_ads');
  if (data.objectives.includes('o_leads')) recommended.add('srv_web');

  return Array.from(recommended).slice(0, 5); // Top 5
};

const getObservationText = (id: string, status: AssetStatus): string => {
  const lib = OBSERVATION_LIBRARY[id];
  if (!lib) return "Sin observación específica.";
  if (status === 'YES') return lib.yes;
  if (status === 'PARTIAL') return lib.partial;
  return lib.no;
};

// --- MAIN EXPORT ---

export const analyzeBrandProject = async (data: AuditInputData): Promise<AnalysisResult> => {
  // Simulate delay for UX feel
  await new Promise(resolve => setTimeout(resolve, 1500));

  const score = calculateScore(data);
  const phase = determinePhase(data, score);
  
  const observations: Record<string, string> = {};
  [...VISUAL_CHECKLIST, ...STRATEGY_CHECKLIST].forEach(item => {
    const status = item.category === 'visual' 
      ? data.visualAudit[item.id] 
      : data.strategyAudit[item.id];
    
    if (status) {
      observations[item.id] = getObservationText(item.id, status);
    }
  });

  const headlineOptions = PHRASES[phase].headlines;
  const headline = headlineOptions[Math.floor(Math.random() * headlineOptions.length)];
  
  const summary = PHRASES[phase].summaryTemplate(data.projectName || "El Proyecto");

  return {
    score,
    phase,
    headline,
    summary,
    observations,
    recommendedServices: generateServices(data, phase)
  };
};
