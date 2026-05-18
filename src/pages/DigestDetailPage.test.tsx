import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import { DigestDetailPage } from '@/pages/DigestDetailPage';
import '@/shared/i18n/i18n';
import { MockAuthProvider } from '@/test/MockAuthProvider';
import type { UseDigestDetailResult } from '@/features/digests/useDigestDetail';
import type { UseSavedItemsResult } from '@/features/saved/useSavedItems';

const mockUseDigestDetail = vi.fn<() => UseDigestDetailResult>();
const mockUseSavedItems = vi.fn<() => UseSavedItemsResult>();

vi.mock('@/features/digests/useDigestDetail', () => ({
  useDigestDetail: () => mockUseDigestDetail(),
}));

vi.mock('@/features/saved/useSavedItems', () => ({
  useSavedItems: () => mockUseSavedItems(),
}));

vi.mock('@/shared/firebase/sourcePreview', () => ({
  checkSourcePreview: () => Promise.resolve({ available: true, reason: 'available' }),
}));

const sampleDigest = {
  id: 'digest-1',
  status: 'active' as const,
  generatedAt: '2026-05-18T10:00:00.000Z',
  lastRefreshedAt: '2026-05-18T10:00:00.000Z',
  periodStart: '2026-05-11T09:00:00.000Z',
  periodEnd: '2026-05-18T09:00:00.000Z',
  expiresAt: '2026-05-25T09:00:00.000Z',
  summary: 'Digest summary',
  sections: {
    executiveSummary: 'Executive',
    topSignals: ['Signal A'],
    signalVsNoise: [],
    leadershipImplications: [],
    aiOrchestrationImplications: [],
    frontendArchitectureImplications: [],
    recommendedAction: 'Ship the slice',
  },
  items: [
    {
      id: 'item-1',
      title: 'Fixture article',
      sourceId: 'react-blog',
      sourceLabel: 'React Blog',
      citationUrl: 'https://example.com/article',
      addedAt: '2026-05-18T10:00:00.000Z',
      synopsis: 'A short reason to decide whether this React source is worth opening.',
    },
  ],
  termOfDay: null,
  reflectionPrompt: 'Reflect on cadence',
  refreshHistory: [{ at: '2026-05-18T10:00:00.000Z', type: 'created' as const }],
};

const olderDigest = {
  ...sampleDigest,
  id: 'digest-0',
  generatedAt: '2026-05-11T10:00:00.000Z',
  lastRefreshedAt: '2026-05-11T10:00:00.000Z',
  periodStart: '2026-05-04T09:00:00.000Z',
  periodEnd: '2026-05-11T09:00:00.000Z',
  expiresAt: '2026-05-18T09:00:00.000Z',
};

function renderDigestDetailPage() {
  return render(
    <MockAuthProvider>
      <MemoryRouter initialEntries={['/digests/digest-1']}>
        <Routes>
          <Route path="/digests/:id" element={<DigestDetailPage />} />
        </Routes>
      </MemoryRouter>
    </MockAuthProvider>,
  );
}

describe('DigestDetailPage', () => {
  it('renders digest content and toggles save state', async () => {
    const toggleSave = vi.fn().mockResolvedValue(undefined);

    mockUseDigestDetail.mockReturnValue({
      digest: sampleDigest,
      newerDigest: null,
      olderDigest,
      viewState: 'ready',
      errorKey: null,
      reload: vi.fn().mockResolvedValue(undefined),
    });

    mockUseSavedItems.mockReturnValue({
      items: [],
      savedIds: new Set(),
      viewState: 'empty',
      errorKey: null,
      isMutating: false,
      reload: vi.fn().mockResolvedValue(undefined),
      isSaved: () => false,
      toggleSave,
    });

    const user = userEvent.setup();
    renderDigestDetailPage();

    expect(screen.getByText('Digest summary')).toBeVisible();
    expect(screen.getByText('Fixture article')).toBeVisible();
    expect(
      screen.getByText('A short reason to decide whether this React source is worth opening.'),
    ).toBeVisible();
    expect(screen.getByRole('link', { name: 'Previous digest' })).toHaveAttribute(
      'href',
      '/digests/digest-0',
    );

    expect(screen.getByRole('link', { name: 'Open original' })).toHaveAttribute(
      'href',
      'https://example.com/article',
    );

    await user.click(await screen.findByRole('button', { name: 'Read in app' }));

    expect(screen.getByLabelText('In-app reader')).toBeVisible();
    expect(screen.getByTitle('In-app reader: Fixture article')).toHaveAttribute(
      'src',
      'https://example.com/article',
    );

    await user.click(screen.getByRole('button', { name: 'Save item' }));

    expect(toggleSave).toHaveBeenCalledWith('digest-1', sampleDigest.items[0]);
  });
});
