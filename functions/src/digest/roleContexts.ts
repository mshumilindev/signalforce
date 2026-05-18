export const digestRoleContexts = [
  'React Lead',
  'Staff Engineer',
  'Architect',
  'CTO',
  'AI Orchestrator',
  'Lead AI Engineer',
] as const;

export function formatRoleContextsForPrompt(): string {
  return digestRoleContexts.join(', ');
}
