import { onAuthStateChanged, type User } from 'firebase/auth';
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react';
import { AuthContext, type AuthContextValue } from '@/features/auth/authContext';
import { signInWithGoogle, signOutUser } from '@/features/auth/googleSignIn';
import { resolveAuthError } from '@/features/auth/resolveAuthError';
import type { AuthErrorKey, AuthStatus, UserDocument } from '@/features/auth/types';
import { ensureUserDocument, getUserDocument } from '@/features/auth/userProfile';
import { getFirebaseAuth, hasFirebaseClientConfig } from '@/shared/firebase/client';
import { i18n } from '@/shared/i18n/i18n';
import { supportedLanguages, type SupportedLanguage } from '@/shared/i18n/translations';

interface AuthProviderProps {
  readonly children: ReactNode;
}

function syncAppLanguage(language: string | undefined): void {
  if (language && supportedLanguages.includes(language as SupportedLanguage)) {
    void i18n.changeLanguage(language);
  }
}

async function loadUserDocument(user: User): Promise<UserDocument> {
  const document = await ensureUserDocument(user);
  syncAppLanguage(document.preferences?.language);
  return document;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [userDocument, setUserDocument] = useState<UserDocument | null>(null);
  const [authError, setAuthError] = useState<AuthErrorKey | null>(null);

  useEffect(() => {
    if (!hasFirebaseClientConfig()) {
      setStatus('unauthenticated');
      setAuthError('auth.errors.config');
      return;
    }

    const auth = getFirebaseAuth();

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      void (async () => {
        setAuthError(null);

        if (!user) {
          setFirebaseUser(null);
          setUserDocument(null);
          setStatus('unauthenticated');
          return;
        }

        setStatus('loading');
        setFirebaseUser(user);

        try {
          const document = await loadUserDocument(user);
          setUserDocument(document);
          setStatus('authenticated');
        } catch (error: unknown) {
          try {
            await signOutUser();
          } catch {
            // Ignore sign-out errors while recovering from a failed profile bootstrap.
          }

          setFirebaseUser(null);
          setUserDocument(null);
          setStatus('unauthenticated');
          setAuthError(resolveAuthError(error));
        }
      })();
    });

    return unsubscribe;
  }, []);

  const signIn = useCallback(async () => {
    setAuthError(null);
    setIsAuthenticating(true);

    try {
      await signInWithGoogle();
    } catch (error: unknown) {
      setAuthError(resolveAuthError(error));
    } finally {
      setIsAuthenticating(false);
    }
  }, []);

  const refreshUserDocument = useCallback(async () => {
    if (!firebaseUser) {
      return;
    }

    const document = await getUserDocument(firebaseUser.uid);

    if (!document) {
      throw new Error('User document could not be refreshed.');
    }

    syncAppLanguage(document.preferences?.language);
    setUserDocument(document);
  }, [firebaseUser]);

  const setUserDocumentState = useCallback((document: UserDocument) => {
    syncAppLanguage(document.preferences?.language);
    setUserDocument(document);
  }, []);

  const signOut = useCallback(async () => {
    setAuthError(null);
    setStatus('loading');

    try {
      await signOutUser();
    } catch (error: unknown) {
      setStatus('unauthenticated');
      setAuthError(resolveAuthError(error));
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      isAuthenticating,
      firebaseUser,
      userDocument,
      authError,
      signIn,
      signOut,
      refreshUserDocument,
      setUserDocument: setUserDocumentState,
    }),
    [
      authError,
      firebaseUser,
      isAuthenticating,
      refreshUserDocument,
      setUserDocumentState,
      signIn,
      signOut,
      status,
      userDocument,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
