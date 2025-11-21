
import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, AuditInputData, AuditPhase } from "../types";
import { VISUAL_CHECKLIST, STRATEGY_CHECKLIST, SERVICES_LIST } from "../constants";

export const analyzeBrandProject = async (data: AuditInputData): Promise<AnalysisResult> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const checklistIds = [...VISUAL_CHECKLIST, ...STRATEGY_CHECKLIST].map(i => i.id).join(", ");
  const serviceIds = SERVICES_LIST.map(s => s.id).join(", ");

  const prompt = `
    Act as an expert Brand Strategist and Creative Director. Analyze the following brand audit data and generate a diagnostic report.

    **Project Data:**
    Name: ${data.projectName}
    Context: ${data.projectContext}
    Visual Audit: ${JSON.stringify(data.visualAudit)}
    Strategy Audit: ${JSON.stringify(data.strategyAudit)}
    Risks: ${JSON.stringify(data.risks)}
    Objectives: ${JSON.stringify(data.objectives)}
    Proposed Services: ${JSON.stringify(data.proposedServices)}

    **Instructions:**
    1. **Score (0-100):** Calculate a global health score based on the completion and quality of assets. Critical missing items (Logo, Audience) should penalize heavily.
    2. **Phase Determination:** Assign one of the following phases:
       - 'BRANDING_FIRST': If critical visual assets (logo, basics) are missing or poor.
       - 'STRATEGY_FIRST': If visuals exist but strategy (audience, values) is missing or weak.
       - 'READY_FOR_WEB': If foundations are solid and the brand is ready for digital implementation.
       - 'READY_TO_SCALE': If the brand is mature, consistent, and ready for growth/marketing.
    3. **Headline:** A punchy, 5-7 word title summarizing the status (e.g., "Identity Crisis Detected", "Ready for Liftoff").
    4. **Summary:** A 2-paragraph executive summary. Be direct, professional, and slightly critical if necessary.
    5. **Observations:** For each checklist item provided in the input (IDs: ${checklistIds}), provide a specific, 1-sentence observation based on its status (YES/NO/PARTIAL).
    6. **Recommended Services:** Select the most relevant services from this list IDs: [${serviceIds}]. prioritize based on the determined phase and risks.

    **Output Format:**
    Return strictly JSON.
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.INTEGER },
          phase: { type: Type.STRING, enum: Object.values(AuditPhase) },
          headline: { type: Type.STRING },
          summary: { type: Type.STRING },
          observations: {
            type: Type.OBJECT,
            description: "Map of checklist ID to observation string",
          },
          recommendedServices: {
            type: Type.ARRAY,
            items: { type: Type.STRING }
          }
        },
        required: ["score", "phase", "headline", "summary", "observations", "recommendedServices"]
      }
    }
  });

  const text = response.text;
  if (!text) throw new Error("No response from AI");

  return JSON.parse(text) as AnalysisResult;
};
