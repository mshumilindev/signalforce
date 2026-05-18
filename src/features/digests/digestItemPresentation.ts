import type { DigestItem } from '@/features/digest/types';

export type DigestItemSeverity = 'critical' | 'high' | 'medium';

export interface DigestItemPresentation {
  readonly severity: DigestItemSeverity;
  readonly severityRank: number;
  readonly technologies: readonly string[];
  readonly logoUrl: string;
  readonly logoAlt: string;
  readonly visualImageUrl: string | null;
  readonly visualAlt: string;
  readonly severityLabel: DigestItemSeverity;
  readonly imageClassName: string;
}

const SIMPLE_ICONS_BASE_URL = 'https://cdn.jsdelivr.net/npm/simple-icons@v15/icons';

const sourceLogoMatchers = [
  { logoUrl: `${SIMPLE_ICONS_BASE_URL}/typescript.svg`, label: 'TypeScript', tokens: ['typescript'] },
  { logoUrl: `${SIMPLE_ICONS_BASE_URL}/react.svg`, label: 'React', tokens: ['react'] },
  { logoUrl: `${SIMPLE_ICONS_BASE_URL}/firebase.svg`, label: 'Firebase', tokens: ['firebase'] },
  { logoUrl: `${SIMPLE_ICONS_BASE_URL}/openai.svg`, label: 'OpenAI', tokens: ['openai'] },
  { logoUrl: `${SIMPLE_ICONS_BASE_URL}/anthropic.svg`, label: 'Anthropic', tokens: ['anthropic'] },
  { logoUrl: `${SIMPLE_ICONS_BASE_URL}/google.svg`, label: 'Google', tokens: ['google'] },
  { logoUrl: `${SIMPLE_ICONS_BASE_URL}/vercel.svg`, label: 'Vercel', tokens: ['vercel'] },
  { logoUrl: `${SIMPLE_ICONS_BASE_URL}/github.svg`, label: 'GitHub', tokens: ['github'] },
  { logoUrl: `${SIMPLE_ICONS_BASE_URL}/microsoft.svg`, label: 'Microsoft', tokens: ['microsoft'] },
  { logoUrl: `${SIMPLE_ICONS_BASE_URL}/amazonaws.svg`, label: 'AWS', tokens: ['aws', 'amazon'] },
  { logoUrl: `${SIMPLE_ICONS_BASE_URL}/stripe.svg`, label: 'Stripe', tokens: ['stripe'] },
  { logoUrl: `${SIMPLE_ICONS_BASE_URL}/shopify.svg`, label: 'Shopify', tokens: ['shopify'] },
  { logoUrl: `${SIMPLE_ICONS_BASE_URL}/netflix.svg`, label: 'Netflix', tokens: ['netflix'] },
] as const;

const technologyMatchers = [
  { label: 'React', tokens: ['react', 'server components', 'rsc'] },
  { label: 'TypeScript', tokens: ['typescript', 'type'] },
  { label: 'AI', tokens: ['ai', 'openai', 'anthropic', 'model', 'agent'] },
  { label: 'Firebase', tokens: ['firebase', 'firestore', 'functions'] },
  { label: 'Security', tokens: ['security', 'vulnerability', 'denial of service', 'exposure'] },
  { label: 'Architecture', tokens: ['architecture', 'platform', 'foundation'] },
] as const;

const severityRanks: Record<DigestItemSeverity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
};

const fallbackVisuals = {
  react:
    'https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&w=1200&q=80',
  typescript:
    'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80',
  security:
    'https://images.unsplash.com/photo-1563986768609-322da13575f3?auto=format&fit=crop&w=1200&q=80',
  architecture:
    'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=80',
  ai:
    'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80',
  default:
    'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
} as const;

function severityForItem(text: string): DigestItemSeverity {
  if (
    text.includes('critical') ||
    text.includes('vulnerability') ||
    text.includes('denial of service') ||
    text.includes('exposure')
  ) {
    return 'critical';
  }

  if (
    text.includes('beta') ||
    text.includes('rc') ||
    text.includes('release') ||
    text.includes('foundation')
  ) {
    return 'high';
  }

  return 'medium';
}

function technologiesForItem(text: string, item: DigestItem): readonly string[] {
  const matches = technologyMatchers
    .filter((matcher) => matcher.tokens.some((token) => text.includes(token)))
    .map((matcher) => matcher.label);

  if (matches.length > 0) {
    return matches.slice(0, 3);
  }

  return [item.sourceLabel];
}

function logoForItem(text: string): Pick<DigestItemPresentation, 'logoUrl' | 'logoAlt'> {
  const matchedLogo = sourceLogoMatchers.find((matcher) =>
    matcher.tokens.some((token) => text.includes(token)),
  );

  return {
    logoUrl: matchedLogo?.logoUrl ?? `${SIMPLE_ICONS_BASE_URL}/rss.svg`,
    logoAlt: matchedLogo?.label ?? 'Source',
  };
}

function fallbackVisualForItem(text: string): string {
  if (text.includes('security') || text.includes('vulnerability') || text.includes('exposure')) {
    return fallbackVisuals.security;
  }

  if (text.includes('react')) {
    return fallbackVisuals.react;
  }

  if (text.includes('typescript')) {
    return fallbackVisuals.typescript;
  }

  if (text.includes('architecture') || text.includes('platform') || text.includes('foundation')) {
    return fallbackVisuals.architecture;
  }

  if (text.includes('ai') || text.includes('model') || text.includes('agent')) {
    return fallbackVisuals.ai;
  }

  return fallbackVisuals.default;
}

export function getDigestItemPresentation(item: DigestItem): DigestItemPresentation {
  const text = `${item.title} ${item.sourceLabel} ${item.citationUrl}`.toLowerCase();
  const severity = severityForItem(text);
  const technologies = technologiesForItem(text, item);
  const logo = logoForItem(text);
  const sourceClass = item.sourceId.replace(/[^a-z0-9-]/gi, '').toLowerCase();

  return {
    severity,
    severityRank: severityRanks[severity],
    technologies,
    ...logo,
    visualImageUrl: item.imageUrl ?? fallbackVisualForItem(text),
    visualAlt: item.imageAlt ?? item.title,
    severityLabel: severity,
    imageClassName: `digest-source-visual digest-source-visual-${sourceClass || 'default'}`,
  };
}

export function sortDigestItemsBySeverity(items: readonly DigestItem[]): DigestItem[] {
  return [...items].sort((left, right) => {
    const leftPresentation = getDigestItemPresentation(left);
    const rightPresentation = getDigestItemPresentation(right);
    return leftPresentation.severityRank - rightPresentation.severityRank;
  });
}
