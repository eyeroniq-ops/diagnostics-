
import { ChecklistItem, AuditPhase } from './types';

export const VISUAL_CHECKLIST: ChecklistItem[] = [
  { 
    id: 'v_brandbook', 
    label: 'Manual de Marca (Brandbook)', 
    description: 'Documento maestro que define las reglas de uso del logo, tipografías, colores y tono de voz.',
    category: 'visual' 
  },
  { 
    id: 'v_logo_primary', 
    label: 'Logo Principal', 
    description: 'La versión principal de la identidad visual, utilizada en la mayoría de aplicaciones.',
    category: 'visual' 
  },
  { 
    id: 'v_logo_vector', 
    label: 'Logo en Vector (AI/SVG)', 
    description: 'Archivos originales (AI, SVG, EPS) que permiten escalar el logo infinitamente sin pixelarse.',
    category: 'visual' 
  },
  { 
    id: 'v_scalability', 
    label: 'Adaptabilidad (Escalas)', 
    description: 'Versiones simplificadas del logo para espacios pequeños como favicons o avatares.',
    category: 'visual' 
  },
  { 
    id: 'v_typography', 
    label: 'Tipografía Jerarquizada', 
    description: 'Selección de fuentes primarias y secundarias con jerarquías claras para títulos y textos.',
    category: 'visual' 
  }, 
  { 
    id: 'v_palette', 
    label: 'Paleta de Colores Definida', 
    description: 'Definición exacta de colores (HEX, RGB, CMYK) para mantener consistencia en todos los medios.',
    category: 'visual' 
  },
  { 
    id: 'v_logo_unique', 
    label: 'Logo Único (No es copia)', 
    description: 'Garantía de que el símbolo es original y no proviene de bancos de imágenes o plantillas.',
    category: 'visual' 
  }, 
  { 
    id: 'v_flat', 
    label: 'Estilo Moderno (Sin efectos obsoletos)', 
    description: 'Diseño limpio y plano, sin sombras ni efectos 3D antiguos, optimizado para pantallas.',
    category: 'visual' 
  },
];

export const STRATEGY_CHECKLIST: ChecklistItem[] = [
  { 
    id: 's_mission', 
    label: 'Misión / Visión', 
    description: 'La razón de ser de la empresa y su aspiración a largo plazo.',
    category: 'strategy' 
  },
  { 
    id: 's_values', 
    label: 'Valores de Marca', 
    description: 'Principios innegociables que guían la cultura y decisiones de la marca.',
    category: 'strategy' 
  }, 
  { 
    id: 's_audience', 
    label: 'Público Objetivo (Buyer Persona)', 
    description: 'Definición clara de quién es el cliente ideal, sus dolores y deseos.',
    category: 'strategy' 
  },
  { 
    id: 's_value_prop', 
    label: 'Propuesta de Valor Única', 
    description: 'Lo que hace a la marca única y la razón por la que los clientes la eligen sobre otras.',
    category: 'strategy' 
  }, 
  { 
    id: 's_tone', 
    label: 'Tono de Voz y Personalidad', 
    description: 'La personalidad con la que la marca se comunica (ej. cercana, autoritaria, divertida).',
    category: 'strategy' 
  },
  { 
    id: 's_archetype', 
    label: 'Arquetipo de Marca', 
    description: 'El personaje universal que encarna la marca para conectar emocionalmente.',
    category: 'strategy' 
  }, 
  { 
    id: 's_naming_check', 
    label: 'Nombre sin conflicto de registro', 
    description: 'Verificación de que el nombre está disponible legalmente y en dominios web.',
    category: 'strategy' 
  }, 
  { 
    id: 's_competitors', 
    label: 'Análisis de Competencia', 
    description: 'Análisis de qué están haciendo otras marcas en el mismo espacio.',
    category: 'strategy' 
  }, 
  { 
    id: 's_refs', 
    label: 'Referencias Visuales Claras', 
    description: 'Moodboards o ejemplos visuales que definen el norte estético del proyecto.',
    category: 'strategy' 
  },
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
    label: 'Fase 1: Branding desde Cero',
    color: 'text-fuchsia-600',
    bg: 'bg-fuchsia-50',
    border: 'border-fuchsia-200',
    desc: 'Faltan activos visuales críticos. Se debe construir la base antes de escalar.',
  },
  [AuditPhase.STRATEGY_FIRST]: {
    label: 'Fase 2: Rebranding',
    color: 'text-violet-600',
    bg: 'bg-violet-50',
    border: 'border-violet-200',
    desc: 'Existen visuales, pero el mensaje central no está definido. Requiere alineación estratégica.',
  },
  [AuditPhase.READY_FOR_WEB]: {
    label: 'Fase 3: Web y Digital',
    color: 'text-pink-600',
    bg: 'bg-pink-50',
    border: 'border-pink-200',
    desc: 'Los cimientos son sólidos. La marca está lista para la implementación digital y el desarrollo.',
  },
  [AuditPhase.READY_TO_SCALE]: {
    label: 'Fase 4: Redes y Contenido',
    color: 'text-emerald-600', 
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    desc: 'Sistemas listos. El enfoque debe cambiar al crecimiento, publicidad y automatización.',
  },
};
