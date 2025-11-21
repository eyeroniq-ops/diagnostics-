import { ChecklistItem, AuditPhase } from './types';

export const VISUAL_CHECKLIST: ChecklistItem[] = [
  { id: 'v_brandbook', label: 'Manual de Marca (Brandbook)', category: 'visual' },
  { id: 'v_logo_primary', label: 'Logo Principal', category: 'visual' },
  { id: 'v_logo_vector', label: 'Logo en Vector (AI/SVG)', category: 'visual' },
  { id: 'v_scalability', label: 'Adaptabilidad (Escalas)', category: 'visual' },
  { id: 'v_typography', label: 'Tipografía Jerarquizada', category: 'visual' }, // New
  { id: 'v_palette', label: 'Paleta de Colores Definida', category: 'visual' },
  { id: 'v_photography', label: 'Estilo Fotográfico / Dirección de Arte', category: 'visual' }, // New
  { id: 'v_social_assets', label: 'Kit para Redes Sociales', category: 'visual' }, // New
  { id: 'v_iconography', label: 'Set de Iconografía', category: 'visual' }, // New
  { id: 'v_flat', label: 'Estilo Moderno (Sin efectos obsoletos)', category: 'visual' },
];

export const STRATEGY_CHECKLIST: ChecklistItem[] = [
  { id: 's_mission', label: 'Misión / Visión', category: 'strategy' },
  { id: 's_values', label: 'Valores de Marca', category: 'strategy' }, // New
  { id: 's_audience', label: 'Público Objetivo (Buyer Persona)', category: 'strategy' },
  { id: 's_value_prop', label: 'Propuesta de Valor Única', category: 'strategy' }, // New
  { id: 's_tone', label: 'Tono de Voz y Personalidad', category: 'strategy' },
  { id: 's_archetype', label: 'Arquetipo de Marca', category: 'strategy' }, // New
  { id: 's_storytelling', label: 'Storytelling / Narrativa', category: 'strategy' }, // New
  { id: 's_competitors', label: 'Análisis de Competencia', category: 'strategy' }, // New
  { id: 's_refs', label: 'Referencias Visuales Claras', category: 'strategy' },
];

export const RISKS_LIST: ChecklistItem[] = [
  { id: 'r_budget', label: 'Presupuesto Limitado', category: 'risk' },
  { id: 'r_expectations', label: 'Expectativas Irrealistas', category: 'risk' },
  { id: 'r_indecision', label: 'Falta de Decisión', category: 'risk' },
  { id: 'r_no_history', label: 'Sin Historial de Marca', category: 'risk' },
  { id: 'r_competition', label: 'Competencia Agresiva', category: 'risk' },
  { id: 'r_deadline', label: 'Plazos Muy Cortos', category: 'risk' },
  { id: 'r_inconsistent', label: 'Marca Inconsistente', category: 'risk' },
];

export const OBJECTIVES_LIST: ChecklistItem[] = [
  { id: 'o_sales', label: 'Aumentar Ventas', category: 'objective' },
  { id: 'o_leads', label: 'Generar Leads', category: 'objective' },
  { id: 'o_awareness', label: 'Reconocimiento de Marca', category: 'objective' },
  { id: 'o_launch', label: 'Lanzamiento de Producto', category: 'objective' },
  { id: 'o_rebrand', label: 'Rebranding Completo', category: 'objective' },
  { id: 'o_reputation', label: 'Mejorar Reputación', category: 'objective' },
  { id: 'o_market', label: 'Expansión de Mercado', category: 'objective' },
];

export const SERVICES_LIST: ChecklistItem[] = [
  { id: 'srv_identity', label: 'Diseño de Identidad Visual', category: 'service' },
  { id: 'srv_strategy', label: 'Estrategia de Marca', category: 'service' },
  { id: 'srv_web', label: 'Desarrollo Web', category: 'service' },
  { id: 'srv_social', label: 'Gestión de Redes Sociales', category: 'service' },
  { id: 'srv_ads', label: 'Publicidad Digital (Ads)', category: 'service' },
  { id: 'srv_consulting', label: 'Consultoría Estratégica', category: 'service' },
  { id: 'srv_content', label: 'Creación de Contenido', category: 'service' },
  { id: 'srv_ai', label: 'Apps / Automatizaciones IA', category: 'service' },
];

export const PHASE_CONFIG = {
  [AuditPhase.BRANDING_FIRST]: {
    label: 'Fase 1: Branding Esencial',
    color: 'text-fuchsia-500',
    bg: 'bg-fuchsia-500/10',
    border: 'border-fuchsia-500',
    icon: '🎨',
    desc: 'Faltan activos visuales críticos. Se debe construir la base antes de escalar.',
  },
  [AuditPhase.STRATEGY_FIRST]: {
    label: 'Fase 2: Estrategia Primero',
    color: 'text-violet-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500',
    icon: '🧠',
    desc: 'Existen visuales, pero el mensaje central no está definido. Alto riesgo de marketing desconectado.',
  },
  [AuditPhase.READY_FOR_WEB]: {
    label: 'Fase 3: Listo para Web/Digital',
    color: 'text-pink-400',
    bg: 'bg-pink-400/10',
    border: 'border-pink-400',
    icon: '🌐',
    desc: 'Los cimientos son sólidos. La marca está lista para la implementación digital y el desarrollo.',
  },
  [AuditPhase.READY_TO_SCALE]: {
    label: 'Fase 4: Listo para Escalar',
    color: 'text-emerald-400', // Keep green for success/scale
    bg: 'bg-emerald-400/10',
    border: 'border-emerald-400',
    icon: '🚀',
    desc: 'Sistemas listos. El enfoque debe cambiar al crecimiento, publicidad y automatización.',
  },
};