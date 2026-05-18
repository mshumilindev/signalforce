import { GoogleAuthProvider, signInWithPopup, signOut, type UserCredential } from 'firebase/auth';
import { getFirebaseAuth } from '@/shared/firebase/client';

const googleProvider = new GoogleAuthProvider();

export async function signInWithGoogle(): Promise<UserCredential> {
  return signInWithPopup(getFirebaseAuth(), googleProvider);
}

export async function signOutUser(): Promise<void> {
  await signOut(getFirebaseAuth());
}
