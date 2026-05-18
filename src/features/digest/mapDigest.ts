import {
  digestRefreshEventTypes,
  digestStatuses,
  type DigestDocument,
  type DigestItem,
  type DigestRefreshEvent,
  type DigestSections,
  type DigestTermOfDay,
} from '@/features/digest/types';

function toIsoString(value: unknown): string {
  if (value && typeof value === 'object' && 'toDate' in value) {
    const timestamp = value as { toDate: () => Date };
    return timestamp.toDate().toISOString();
  }

  if (typeof value === 'string') {
    return value;
  }

  return new Date(0).toISOString();
}

function mapSections(data: unknown): DigestSections {
  const record = (data ?? {}) as Record<string, unknown>;

  return {
    executiveSummary: typeof record.executiveSummary === 'string' ? record.executiveSummary : '',
    topSignals: Array.isArray(record.topSignals)
      ? record.topSignals.filter((item): item is string => typeof item === 'string')
      : [],
    signalVsNoise: Array.isArray(record.signalVsNoise)
      ? record.signalVsNoise.filter((item): item is string => typeof item === 'string')
      : [],
    leadershipImplications: Array.isArray(record.leadershipImplications)
      ? record.leadershipImplications.filter((item): item is string => typeof item === 'string')
      : [],
    aiOrchestrationImplications: Array.isArray(record.aiOrchestrationImplications)
      ? record.aiOrchestrationImplications.filter((item): item is string => typeof item === 'string')
      : [],
    frontendArchitectureImplications: Array.isArray(record.frontendArchitectureImplications)
      ? record.frontendArchitectureImplications.filter(
          (item): item is string => typeof item === 'string',
        )
      : [],
    recommendedAction: typeof record.recommendedAction === 'string' ? record.recommendedAction : '',
  };
}

function mapItems(data: unknown): DigestItem[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const record = entry as Record<string, unknown>;
    const id = record.id;
    const title = record.title;
    const sourceId = record.sourceId;
    const sourceLabel = record.sourceLabel;
    const citationUrl = record.citationUrl;
    const addedAt = record.addedAt;

    if (
      typeof id !== 'string' ||
      typeof title !== 'string' ||
      typeof sourceId !== 'string' ||
      typeof sourceLabel !== 'string' ||
      typeof citationUrl !== 'string' ||
      typeof addedAt !== 'string'
    ) {
      return [];
    }

    return [
      {
        id,
        title,
        sourceId,
        sourceLabel,
        citationUrl,
        addedAt,
      },
    ];
  });
}

function mapRefreshHistory(data: unknown): DigestRefreshEvent[] {
  if (!Array.isArray(data)) {
    return [];
  }

  return data.flatMap((entry) => {
    if (!entry || typeof entry !== 'object') {
      return [];
    }

    const record = entry as Record<string, unknown>;
    const at = record.at;
    const type = record.type;

    if (
      typeof at !== 'string' ||
      typeof type !== 'string' ||
      !digestRefreshEventTypes.includes(type as DigestRefreshEvent['type'])
    ) {
      return [];
    }

    return [{ at, type: type as DigestRefreshEvent['type'] }];
  });
}

function mapTermOfDay(data: unknown): DigestTermOfDay | null {
  if (!data || typeof data !== 'object') {
    return null;
  }

  const record = data as Record<string, unknown>;
  const term = record.term;
  const explanation = record.explanation;

  if (typeof term !== 'string' || typeof explanation !== 'string') {
    return null;
  }

  return { term, explanation };
}

export function mapDigestDocument(id: string, data: Record<string, unknown>): DigestDocument | null {
  const status = data.status;

  if (typeof status !== 'string' || !digestStatuses.includes(status as DigestDocument['status'])) {
    return null;
  }

  return {
    id,
    status: status as DigestDocument['status'],
    generatedAt: toIsoString(data.generatedAt),
    lastRefreshedAt: toIsoString(data.lastRefreshedAt),
    periodStart: toIsoString(data.periodStart),
    periodEnd: toIsoString(data.periodEnd),
    expiresAt: toIsoString(data.expiresAt),
    summary: typeof data.summary === 'string' ? data.summary : '',
    sections: mapSections(data.sections),
    items: mapItems(data.items),
    termOfDay: mapTermOfDay(data.termOfDay),
    reflectionPrompt: typeof data.reflectionPrompt === 'string' ? data.reflectionPrompt : '',
    refreshHistory: mapRefreshHistory(data.refreshHistory),
  };
}

export function digestDocumentToFirestore(digest: DigestDocument): Record<string, unknown> {
  return {
    status: digest.status,
    generatedAt: digest.generatedAt,
    lastRefreshedAt: digest.lastRefreshedAt,
    periodStart: digest.periodStart,
    periodEnd: digest.periodEnd,
    expiresAt: digest.expiresAt,
    summary: digest.summary,
    sections: digest.sections,
    items: digest.items,
    termOfDay: digest.termOfDay,
    reflectionPrompt: digest.reflectionPrompt,
    refreshHistory: digest.refreshHistory,
  };
}
