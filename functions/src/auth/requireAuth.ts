import { HttpsError, type CallableRequest } from 'firebase-functions/v2/https';

export function requireAuthUid(request: CallableRequest<unknown>): string {
  const uid = request.auth?.uid;

  if (!uid) {
    throw new HttpsError('unauthenticated', 'Authentication is required.');
  }

  return uid;
}
