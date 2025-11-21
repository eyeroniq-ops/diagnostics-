export type AssetStatus = 'YES' | 'NO' | 'PARTIAL';

export enum AuditPhase {
  BRANDING_FIRST = 'BRANDING_FIRST',
  STRATEGY_FIRST = 'STRATEGY_FIRST',
  READY_FOR_WEB = 'READY_FOR_WEB',
  READY_TO_SCALE = 'READY_TO_SCALE',
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'visual' | 'strategy' | 'risk' | 'objective' | 'service';
}

export interface AuditInputData {
  projectName: string;
  projectContext: string;
  visualAudit: Record<string, AssetStatus>;
  strategyAudit: Record<string, AssetStatus>;
  risks: string[];
  objectives: string[];
  proposedServices: string[];
}

export interface AnalysisResult {
  score: number;
  phase: AuditPhase;
  headline: string;
  summary: string;
  observations: Record<string, string>; // Keyed by item ID (e.g., 'visual_logo': 'Missing vector format...')
  recommendedServices: string[];
}

export interface StepProps {
  onNext: () => void;
  onBack?: () => void;
}