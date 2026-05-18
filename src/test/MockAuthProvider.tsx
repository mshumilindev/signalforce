import type { ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '@/features/auth/authContext';
import { defaultAuthValue } from '@/test/mockAuthValue';

interface MockAuthProviderProps {
  readonly children: ReactNode;
  readonly value?: AuthContextValue;
}

export function MockAuthProvider({ children, value = defaultAuthValue }: MockAuthProviderProps) {
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
