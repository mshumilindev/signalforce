import { HttpsError } from 'firebase-functions/v2/https';
import { DigestContentValidationError, DigestGenerationError } from './openai/errors.js';

export function toHttpsError(error: unknown): HttpsError {
  if (error instanceof HttpsError) {
    return error;
  }

  if (error instanceof DigestContentValidationError) {
    return new HttpsError(
      'internal',
      'Generated digest content was malformed and could not be stored.',
    );
  }

  if (error instanceof DigestGenerationError) {
    return new HttpsError('failed-precondition', error.message);
  }

  if (error instanceof Error) {
    if (error.message.includes('OPENAI_API_KEY')) {
      return new HttpsError('failed-precondition', error.message);
    }
    if (error.message.includes('Expired digests cannot be refreshed')) {
      return new HttpsError('failed-precondition', error.message);
    }

    if (error.message.includes('Only active digests')) {
      return new HttpsError('failed-precondition', error.message);
    }

    if (error.message.includes('preferences')) {
      return new HttpsError('failed-precondition', error.message);
    }

    if (error.message.includes('Active digest already exists')) {
      return new HttpsError('failed-precondition', error.message);
    }
  }

  return new HttpsError('internal', 'Digest operation failed.');
}
