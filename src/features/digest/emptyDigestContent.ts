import type { DigestSections } from '@/features/digest/types';

export function createEmptyDigestSections(): DigestSections {
  return {
    executiveSummary: '',
    topSignals: [],
    signalVsNoise: [],
    leadershipImplications: [],
    aiOrchestrationImplications: [],
    frontendArchitectureImplications: [],
    recommendedAction: '',
  };
}
