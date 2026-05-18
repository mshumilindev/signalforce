import { getFunctions, httpsCallable, type Functions } from 'firebase/functions';
import { getFirebaseApp } from '@/shared/firebase/client';

export interface DigestCallableResponse {
  readonly runId: string;
  readonly digestId: string;
  readonly outcome: 'created' | 'refreshed';
  readonly supersededDigestId: string | null;
  readonly nextDigestDueAt: string;
}

let functionsInstance: Functions | undefined;

function getFirebaseFunctions(): Functions {
  functionsInstance ??= getFunctions(getFirebaseApp(), 'europe-west1');
  return functionsInstance;
}

const generateDigestCallable = () =>
  httpsCallable<Record<string, never>, DigestCallableResponse>(
    getFirebaseFunctions(),
    'generateDigest',
  );

const refreshDigestCallable = () =>
  httpsCallable<Record<string, never>, DigestCallableResponse>(
    getFirebaseFunctions(),
    'refreshDigest',
  );

const forceUpdateDigestCallable = () =>
  httpsCallable<Record<string, never>, DigestCallableResponse>(
    getFirebaseFunctions(),
    'forceUpdateDigest',
  );

export async function callGenerateDigest(): Promise<DigestCallableResponse> {
  const response = await generateDigestCallable()({});
  return response.data;
}

export async function callRefreshDigest(): Promise<DigestCallableResponse> {
  const response = await refreshDigestCallable()({});
  return response.data;
}

export async function callForceUpdateDigest(): Promise<DigestCallableResponse> {
  const response = await forceUpdateDigestCallable()({});
  return response.data;
}
