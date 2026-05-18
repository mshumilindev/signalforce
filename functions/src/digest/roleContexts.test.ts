import { describe, expect, it } from 'vitest';
import { digestRoleContexts, formatRoleContextsForPrompt } from './roleContexts.js';

describe('roleContexts', () => {
  it('includes all product role lenses in prompts', () => {
    expect(digestRoleContexts).toEqual([
      'React Lead',
      'Staff Engineer',
      'Architect',
      'CTO',
      'AI Orchestrator',
      'Lead AI Engineer',
    ]);
    expect(formatRoleContextsForPrompt()).toContain('AI Orchestrator');
    expect(formatRoleContextsForPrompt()).toContain('Lead AI Engineer');
  });
});
