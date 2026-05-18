import type { DigestSections } from './types.js';

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
