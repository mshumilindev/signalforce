import { getFunctions, httpsCallable, type Functions } from 'firebase/functions';
import { getFirebaseApp } from '@/shared/firebase/client';

export type SourcePreviewReason =
  | 'available'
  | 'invalidUrl'
  | 'fetchFailed'
  | 'blockedByHeaders';

export interface SourcePreviewAvailability {
  readonly available: boolean;
  readonly reason: SourcePreviewReason;
}

let functionsInstance: Functions | undefined;

function getFirebaseFunctions(): Functions {
  functionsInstance ??= getFunctions(getFirebaseApp(), 'europe-west1');
  return functionsInstance;
}

const checkSourcePreviewCallable = () =>
  httpsCallable<{ readonly url: string }, SourcePreviewAvailability>(
    getFirebaseFunctions(),
    'checkSourcePreview',
  );

export async function checkSourcePreview(url: string): Promise<SourcePreviewAvailability> {
  const response = await checkSourcePreviewCallable()({ url });
  return response.data;
}
