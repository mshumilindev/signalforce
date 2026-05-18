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
    expect(parsed.termOfDay?.term).toBe('Server Components');
  });

  it('rejects malformed JSON', () => {
    expect(() => parseDigestContentJson('{not json')).toThrow(DigestContentValidationError);
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
          termOfDay: null,
          reflectionPrompt: 'x',
        }),
      ),
    ).toThrow(DigestContentValidationError);
  });
});
