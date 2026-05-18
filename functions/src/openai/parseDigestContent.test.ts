import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { DigestContentValidationError } from './errors.js';
import { parseDigestContentJson } from './parseDigestContent.js';

const validFixture = readFileSync(
  new URL('./fixtures/validDigestContent.json', import.meta.url),
  'utf8',
);

describe('parseDigestContentJson', () => {
  it('accepts valid structured output', () => {
    const parsed = parseDigestContentJson(validFixture);

    expect(parsed.summary).toContain('React');
    expect(parsed.sections.topSignals).toHaveLength(2);
    expect(parsed.itemSynopses[0]?.synopsis).toContain('React platform');
    expect(parsed.itemVisuals[0]?.imageSearchQuery).toContain('React server components');
    expect(parsed.termOfDay.term).toBe('Server Components');
  });

  it('rejects malformed JSON', () => {
    expect(() => parseDigestContentJson('{not json')).toThrow(DigestContentValidationError);
  });

  it('coerces string section lists into arrays before validation', () => {
    const parsed = parseDigestContentJson(
      JSON.stringify({
        summary: 'Valid summary for the digest period.',
        sections: {
          executiveSummary: 'Executive summary with enough detail.',
          topSignals: ['React adoption is stabilizing across teams'],
          signalVsNoise: 'Vendor hype without shipping artifacts is noise',
          leadershipImplications: 'Sponsor thin-slice pilots with rollback criteria',
          aiOrchestrationImplications: 'Ground agent workflows in cited inputs',
          frontendArchitectureImplications: 'Colocate data boundaries with routes',
          recommendedAction: 'Migrate one production route this sprint.',
        },
        itemSynopses: [
          {
            itemId: 'item-1',
            synopsis: 'A short source-level reason to inspect this item.',
          },
        ],
        itemVisuals: [
          {
            itemId: 'item-1',
            imageAlt: 'Source visual',
            imageSearchQuery: 'React architecture source visual',
          },
        ],
        termOfDay: {
          term: 'Source grounding',
          explanation: 'Keeping generated analysis tied to cited input items.',
        },
        reflectionPrompt: 'What would make your next bet reversible within a week?',
      }),
    );

    expect(parsed.sections.signalVsNoise).toEqual([
      'Vendor hype without shipping artifacts is noise',
    ]);
  });

  it('rejects schema violations', () => {
    expect(() =>
      parseDigestContentJson(
        JSON.stringify({
          summary: '',
          sections: {
            executiveSummary: 'x',
            topSignals: [],
            signalVsNoise: [],
            leadershipImplications: [],
            aiOrchestrationImplications: [],
            frontendArchitectureImplications: [],
            recommendedAction: 'x',
          },
          itemSynopses: [],
          itemVisuals: [],
          termOfDay: null,
          reflectionPrompt: 'x',
        }),
      ),
    ).toThrow(DigestContentValidationError);
  });
});
