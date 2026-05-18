import { createContext } from 'react';
import type { AuthState, UserDocument } from '@/features/auth/types';

export interface AuthContextValue extends AuthState {
  readonly signIn: () => Promise<void>;
  readonly signOut: () => Promise<void>;
  readonly refreshUserDocument: () => Promise<void>;
  readonly setUserDocument: (document: UserDocument) => void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
