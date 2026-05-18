import type { User } from 'firebase/auth';
import type { UserPreferences } from '@/features/preferences/types';
import type { TranslationKey } from '@/shared/i18n/translations';

export type AuthErrorKey = Extract<
  TranslationKey,
  | 'auth.errors.config'
  | 'auth.errors.popupClosed'
  | 'auth.errors.profilePermission'
  | 'auth.errors.profileUnavailable'
  | 'auth.errors.unknown'
>;

export interface UserProfileFields {
  readonly email: string | null;
  readonly displayName: string | null;
  readonly photoURL: string | null;
}

export interface UserDocument {
  readonly profile: UserProfileFields;
  readonly preferences: UserPreferences | null;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly latestDigestId: string | null;
  readonly nextDigestDueAt: string | null;
}

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface AuthState {
  readonly status: AuthStatus;
  readonly isAuthenticating: boolean;
  readonly firebaseUser: User | null;
  readonly userDocument: UserDocument | null;
  readonly authError: AuthErrorKey | null;
}
