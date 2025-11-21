import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, AuditInputData } from "../types";
import { VISUAL_CHECKLIST, STRATEGY_CHECKLIST } from "../constants";

// Pre-calculate properties for the observations object to ensure strict schema compliance.
// The API requires Type.OBJECT to have non-empty properties.
const observationProperties: Record<string, Schema> = {};
const allChecklistIds = [...VISUAL_CHECKLIST, ...STRATEGY_CHECKLIST].map(item => item.id);

// We define a property for each checklist item ID to satisfy the non-empty properties requirement for Type.OBJECT
allChecklistIds.forEach(id => {
  observationProperties[id] = {
    type: Type.STRING,
    description: `Observación específica para el ítem ${id}`,
  };
});

// Define the strict schema for the JSON output
const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    score: {
      type: Type.NUMBER,
      description: "Una puntuación de salud de marca de 0 a 100 basada en la auditoría.",
    },
    phase: {
      type: Type.STRING,
      enum: [
        "BRANDING_FIRST",
        "STRATEGY_FIRST",
        "READY_FOR_WEB",
        "READY_TO_SCALE"
      ],
      description: "La fase recomendada basada en la lógica de auditoría.",
    },
    headline: {
      type: Type.STRING,
      description: "Un título corto e impactante para el diagnóstico (máx 6 palabras).",
    },
    summary: {
      type: Type.STRING,
      description: "Un resumen ejecutivo profesional de los hallazgos (máx 2 párrafos).",
    },
    observations: {
      type: Type.OBJECT,
      description: "Objeto donde las claves son los IDs del checklist y los valores son las observaciones de la IA.",
      properties: observationProperties,
      required: allChecklistIds, // Mark all as required to ensure comprehensive feedback
    },
    recommendedServices: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "Lista de IDs de servicios que son más críticos ahora mismo.",
    },
  },
  required: ["score", "phase", "headline", "summary", "observations", "recommendedServices"],
};

export const analyzeBrandProject = async (data: AuditInputData): Promise<AnalysisResult> => {
  const genAI = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const visualContext = VISUAL_CHECKLIST.map(i => `${i.id} (${i.label}): ${data.visualAudit[i.id] || 'NO'}`).join('\n');
  const strategyContext = STRATEGY_CHECKLIST.map(i => `${i.id} (${i.label}): ${data.strategyAudit[i.id] || 'NO'}`).join('\n');
  
  const prompt = `
    Eres "eyeroniq", un Estratega de Marca y Auditor de clase mundial. 
    Realiza un diagnóstico profundo sobre el siguiente proyecto. Responde SIEMPRE EN ESPAÑOL.

    DETALLES DEL PROYECTO:
    Nombre: ${data.projectName}
    Contexto: ${data.projectContext}

    DATOS DE AUDITORÍA (YES=Validado, NO=Faltante, PARTIAL=Necesita Trabajo):
    
    [Auditoría Visual]
    ${visualContext}

    [Auditoría de Estrategia]
    ${strategyContext}

    [Riesgos Identificados]
    ${data.risks.join(', ')}

    [Objetivos del Cliente]
    ${data.objectives.join(', ')}

    [Servicios Propuestos]
    ${data.proposedServices.join(', ')}

    INSTRUCCIONES:
    1. Calcula un Health Score (0-100). 
       - Penaliza fuertemente (-15 puntos c/u) si el estado es NO o PARTIAL en: "Logo Principal", "Logo Vector", "Tipografía".
       - Penaliza (-10 puntos) si falta "Público Objetivo".
    
    2. Determina la Fase (Phase). SIGUE ESTA LÓGICA ESTRICTA:
       - Si el Score < 45 => DEBE SER "BRANDING_FIRST".
       - Si falta 'Logo Principal' (v_logo_primary) O 'Nombre' (s_naming_check) O 'Manual de Marca' (v_brandbook) => DEBE SER "BRANDING_FIRST".
       - Si falta 'Tipografía' (v_typography) => DEBE SER "BRANDING_FIRST".
       - Solo si todos los activos críticos existen y el score es > 45, puedes considerar fases superiores (STRATEGY_FIRST, etc).

    3. Genera el contenido:
       - Headline: Impactante (máx 6 palabras).
       - Summary: Resumen ejecutivo. Si es BRANDING_FIRST, menciona explícitamente que "Faltan activos visuales críticos y se debe construir la base antes de escalar".
       - Observations: Específicas para CADA ítem del checklist. Explica el impacto en la puntuación.
       - Recommended Services: Prioriza lo urgente según la fase detectada.

    4. Tono: Directo, profesional, experto.

    Devuelve SOLO JSON válido que coincida con el esquema.
  `;

  try {
    const result = await genAI.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: analysisSchema,
        temperature: 0.4, 
      }
    });

    if (result.text) {
      const parsed = JSON.parse(result.text);
      return parsed as AnalysisResult;
    } else {
      throw new Error("Respuesta vacía de la IA");
    }
  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};