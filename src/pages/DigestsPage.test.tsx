import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DigestsPage } from '@/pages/DigestsPage';
import '@/shared/i18n/i18n';
import { MockAuthProvider } from '@/test/MockAuthProvider';
import type { UseDigestHistoryResult } from '@/features/digests/useDigestHistory';

const mockUseDigestHistory = vi.fn<() => UseDigestHistoryResult>();

vi.mock('@/features/digests/useDigestHistory', () => ({
  useDigestHistory: () => mockUseDigestHistory(),
}));

function renderDigestsPage() {
  return render(
    <MockAuthProvider>
      <MemoryRouter>
        <DigestsPage />
      </MemoryRouter>
    </MockAuthProvider>,
  );
}

describe('DigestsPage', () => {
  it('renders digest history with status badges', () => {
    mockUseDigestHistory.mockReturnValue({
      digests: [
        {
          id: 'digest-1',
          status: 'active',
          generatedAt: '2026-05-18T10:00:00.000Z',
          lastRefreshedAt: '2026-05-18T10:00:00.000Z',
          periodStart: '2026-05-11T09:00:00.000Z',
          periodEnd: '2026-05-18T09:00:00.000Z',
          expiresAt: '2026-05-25T09:00:00.000Z',
          summary: 'Summary one',
          sections: {
            executiveSummary: '',
            topSignals: [],
            signalVsNoise: [],
            leadershipImplications: [],
            aiOrchestrationImplications: [],
            frontendArchitectureImplications: [],
            recommendedAction: '',
          },
          items: [],
          termOfDay: null,
          reflectionPrompt: '',
          refreshHistory: [{ at: '2026-05-18T10:00:00.000Z', type: 'created' }],
        },
        {
          id: 'digest-0',
          status: 'superseded',
          generatedAt: '2026-05-01T10:00:00.000Z',
          lastRefreshedAt: '2026-05-01T10:00:00.000Z',
          periodStart: '2026-04-24T09:00:00.000Z',
          periodEnd: '2026-05-01T09:00:00.000Z',
          expiresAt: '2026-05-08T09:00:00.000Z',
          summary: 'Summary two',
          sections: {
            executiveSummary: '',
            topSignals: [],
            signalVsNoise: [],
            leadershipImplications: [],
            aiOrchestrationImplications: [],
            frontendArchitectureImplications: [],
            recommendedAction: '',
          },
          items: [],
          termOfDay: null,
          reflectionPrompt: '',
          refreshHistory: [{ at: '2026-05-01T10:00:00.000Z', type: 'created' }],
        },
      ],
      viewState: 'ready',
      errorKey: null,
      latestDigestId: 'digest-1',
      reload: vi.fn().mockResolvedValue(undefined),
    });

    renderDigestsPage();

    expect(screen.getByText('Active period')).toBeVisible();
    expect(screen.getByText('Superseded')).toBeVisible();
    expect(screen.getByText('Latest')).toBeVisible();
    expect(screen.getAllByRole('link', { name: 'Open digest' })).toHaveLength(2);
  });
});
