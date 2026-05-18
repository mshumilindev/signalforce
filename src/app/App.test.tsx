import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { App } from '@/app/App';
import { createMockAuthValue, MockAuthProvider } from '@/test/MockAuthProvider';

function renderApp(initialPath: string, authValue = createMockAuthValue()) {
  return render(
    <MockAuthProvider value={authValue}>
      <MemoryRouter initialEntries={[initialPath]}>
        <App />
      </MemoryRouter>
    </MockAuthProvider>,
  );
}

describe('App', () => {
  it('renders the dashboard for authenticated users', () => {
    renderApp('/dashboard');

    expect(screen.getByRole('heading', { name: 'Your strategic engineering digest' })).toBeVisible();
  });

  it('redirects unauthenticated users to login without app shell', () => {
    renderApp(
      '/dashboard',
      createMockAuthValue({ status: 'unauthenticated', userDocument: null }),
    );

    expect(screen.getByRole('heading', { name: 'Sign in to SignalForge' })).toBeVisible();
    expect(screen.getByRole('button', { name: 'Continue with Google' })).toBeVisible();
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })).not.toBeInTheDocument();
  });

  it('renders the dashboard even when preferences are not configured yet', () => {
    renderApp(
      '/dashboard',
      createMockAuthValue({
        userDocument: {
          profile: { email: 'test@example.com', displayName: 'Test', photoURL: null },
          preferences: null,
          createdAt: '2026-01-01T00:00:00.000Z',
          updatedAt: '2026-01-01T00:00:00.000Z',
          latestDigestId: null,
          nextDigestDueAt: null,
        },
      }),
    );

    expect(screen.getByRole('heading', { name: 'Your strategic engineering digest' })).toBeVisible();
  });

  it('hides the app shell while auth is loading', () => {
    renderApp('/dashboard', createMockAuthValue({ status: 'loading', userDocument: null }));

    expect(screen.getByRole('status', { name: 'Checking your session…' })).toBeVisible();
    expect(screen.queryByRole('navigation', { name: 'Primary navigation' })).not.toBeInTheDocument();
  });

  it('switches locale without leaving the current route', async () => {
    const user = userEvent.setup();

    renderApp('/settings');

    await user.selectOptions(screen.getByLabelText('App language'), 'uk');

    expect(screen.getByRole('heading', { name: 'Налаштування' })).toBeVisible();
  });
});
