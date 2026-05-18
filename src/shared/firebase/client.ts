import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

interface FirebaseClientConfig {
  readonly apiKey: string;
  readonly authDomain: string;
  readonly projectId: string;
  readonly storageBucket: string;
  readonly messagingSenderId: string;
  readonly appId: string;
  readonly measurementId?: string;
}

const firebaseClientConfig: FirebaseClientConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY ?? '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID ?? '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID ?? '',
  ...(import.meta.env.VITE_FIREBASE_MEASUREMENT_ID
    ? { measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID }
    : {}),
};

let firebaseApp: FirebaseApp | undefined;
let firebaseAuth: Auth | undefined;
let firestoreDb: Firestore | undefined;

export function hasFirebaseClientConfig(): boolean {
  const requiredConfigValues: readonly string[] = [
    firebaseClientConfig.apiKey,
    firebaseClientConfig.authDomain,
    firebaseClientConfig.projectId,
    firebaseClientConfig.storageBucket,
    firebaseClientConfig.messagingSenderId,
    firebaseClientConfig.appId,
  ];

  return requiredConfigValues.every((value) => value.length > 0);
}

export function getFirebaseApp(): FirebaseApp {
  if (!hasFirebaseClientConfig()) {
    throw new Error('Firebase client configuration is incomplete.');
  }

  firebaseApp ??= initializeApp(firebaseClientConfig);
  return firebaseApp;
}

export function getFirebaseAuth(): Auth {
  firebaseAuth ??= getAuth(getFirebaseApp());
  return firebaseAuth;
}

export function getFirestoreDb(): Firestore {
  firestoreDb ??= getFirestore(getFirebaseApp());
  return firestoreDb;
}
