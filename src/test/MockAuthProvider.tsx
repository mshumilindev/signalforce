import type { ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '@/features/auth/authContext';
import type { UserDocument } from '@/features/auth/types';

const defaultUserDocument: UserDocument = {
  profile: {
    email: 'test@example.com',
    displayName: 'Test User',
    photoURL: null,
  },
  preferences: {
    language: 'en',
    interests: ['react', 'ai'],
    digestTone: 'balanced',
    digestFrequency: 'weekly',
    preferredWeekday: 'monday',
    preferredTime: '09:00',
    timezone: 'UTC',
  },
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
  latestDigestId: null,
  nextDigestDueAt: null,
};

const defaultAuthValue: AuthContextValue = {
  status: 'authenticated',
  isAuthenticating: false,
  firebaseUser: null,
  userDocument: defaultUserDocument,
  authError: null,
  signIn: () => Promise.resolve(),
  signOut: () => Promise.resolve(),
  refreshUserDocument: () => Promise.resolve(),
  setUserDocument: () => undefined,
};

export function createMockAuthValue(overrides: Partial<AuthContextValue> = {}): AuthContextValue {
  return {
    ...defaultAuthValue,
    ...overrides,
    userDocument:
      overrides.userDocument === undefined ? defaultUserDocument : overrides.userDocument,
  };
}

interface MockAuthProviderProps {
  readonly children: ReactNode;
  readonly value?: AuthContextValue;
}

export function MockAuthProvider({ children, value = defaultAuthValue }: MockAuthProviderProps) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
