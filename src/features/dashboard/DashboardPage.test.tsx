import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DashboardPage } from '@/pages/DashboardPage';
import '@/shared/i18n/i18n';
import { MockAuthProvider } from '@/test/MockAuthProvider';
import type { UseDashboardDigestResult } from '@/features/dashboard/useDashboardDigest';

const mockUseDashboardDigest = vi.fn<() => UseDashboardDigestResult>();

vi.mock('@/features/dashboard/useDashboardDigest', () => ({
  useDashboardDigest: () => mockUseDashboardDigest(),
}));

function buildHookResult(overrides: Partial<UseDashboardDigestResult> = {}): UseDashboardDigestResult {
  return {
    viewState: 'empty',
    digest: null,
    freshness: null,
    nextDigestDueAt: null,
    feedbackKey: null,
    errorKey: null,
    isRefreshing: false,
    isForcing: false,
    isActionPending: false,
    reload: vi.fn().mockResolvedValue(undefined),
    refreshDigest: vi.fn().mockResolvedValue(undefined),
    forceUpdateDigest: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function renderDashboard() {
  return render(
    <MockAuthProvider>
      <MemoryRouter initialEntries={['/dashboard']}>
        <DashboardPage />
      </MemoryRouter>
    </MockAuthProvider>,
  );
}

describe('DashboardPage', () => {
  it('renders loading state', () => {
    mockUseDashboardDigest.mockReturnValue(buildHookResult({ viewState: 'loading' }));

    renderDashboard();

    expect(screen.getByRole('status', { name: 'Loading your latest digest…' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Refresh digest' })).toBeDisabled();
  });

  it('renders empty state with actions enabled', () => {
    mockUseDashboardDigest.mockReturnValue(buildHookResult({ viewState: 'empty' }));

    renderDashboard();

    expect(screen.getByRole('heading', { name: 'No digest yet' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Refresh digest' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Generate new digest now' })).toBeEnabled();
  });

  it('renders digest card with status badge', () => {
    mockUseDashboardDigest.mockReturnValue(
      buildHookResult({
        viewState: 'ready',
        freshness: 'active',
        digest: {
          id: 'digest-1',
          status: 'active',
          generatedAt: '2026-05-18T10:00:00.000Z',
          lastRefreshedAt: '2026-05-18T10:00:00.000Z',
          periodStart: '2026-05-11T09:00:00.000Z',
          periodEnd: '2026-05-18T09:00:00.000Z',
          expiresAt: '2026-05-25T09:00:00.000Z',
          summary: '',
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
        nextDigestDueAt: '2026-05-25T09:00:00.000Z',
      }),
    );

    renderDashboard();

    expect(screen.getByRole('heading', { name: 'Latest digest' })).toBeVisible();
    expect(screen.getByText('Active period')).toBeVisible();
    expect(screen.getByRole('link', { name: 'Open digest' })).toHaveAttribute('href', '/digests/digest-1');
  });

  it('wires refresh immediately and force update after confirmation', async () => {
    const refreshDigest = vi.fn().mockResolvedValue(undefined);
    const forceUpdateDigest = vi.fn().mockResolvedValue(undefined);

    mockUseDashboardDigest.mockReturnValue(
      buildHookResult({ viewState: 'empty', refreshDigest, forceUpdateDigest }),
    );

    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole('button', { name: 'Refresh digest' }));
    await user.click(screen.getByRole('button', { name: 'Generate new digest now' }));

    expect(refreshDigest).toHaveBeenCalledTimes(1);
    expect(forceUpdateDigest).not.toHaveBeenCalled();
    expect(screen.getByRole('dialog')).toBeVisible();

    await user.click(screen.getByRole('button', { name: 'Generate new digest' }));

    expect(forceUpdateDigest).toHaveBeenCalledTimes(1);
  });

  it('does not force update when the confirmation modal is cancelled', async () => {
    const forceUpdateDigest = vi.fn().mockResolvedValue(undefined);

    mockUseDashboardDigest.mockReturnValue(
      buildHookResult({ viewState: 'empty', forceUpdateDigest }),
    );

    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole('button', { name: 'Generate new digest now' }));
    await user.click(screen.getByRole('button', { name: 'Keep current digest' }));

    expect(forceUpdateDigest).not.toHaveBeenCalled();
  });

  it('renders error state with retry', async () => {
    const reload = vi.fn().mockResolvedValue(undefined);
    mockUseDashboardDigest.mockReturnValue(
      buildHookResult({
        viewState: 'error',
        errorKey: 'dashboard.errors.loadFailed',
        reload,
      }),
    );

    const user = userEvent.setup();
    renderDashboard();

    expect(screen.getByRole('alert')).toBeVisible();
    await user.click(screen.getByRole('button', { name: 'Try again' }));
    expect(reload).toHaveBeenCalledTimes(1);
  });
});
