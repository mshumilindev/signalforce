import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import {
  assertFails,
  assertSucceeds,
  initializeTestEnvironment,
  type RulesTestEnvironment,
} from '@firebase/rules-unit-testing';
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { afterAll, beforeAll, beforeEach, describe, it } from 'vitest';

const PROJECT_ID = 'signalforge-rules-test';
const USER_A = 'user-a';
const USER_B = 'user-b';

const validProfile = {
  email: 'user@example.com',
  displayName: 'User A',
  photoURL: null,
};

const validPreferences = {
  language: 'en',
  interests: ['react', 'ai'],
  digestTone: 'balanced',
  digestFrequency: 'weekly',
  preferredWeekday: 'monday',
  preferredTime: '09:00',
  timezone: 'UTC',
};

const validSavedItem = {
  itemId: 'item-1',
  digestId: 'digest-1',
  title: 'Signal title',
  sourceId: 'react-blog',
  sourceLabel: 'React Blog',
  citationUrl: 'https://example.com/post',
  savedAt: '2026-05-18T12:00:00.000Z',
};

let testEnvironment: RulesTestEnvironment;

function getFirestoreEmulatorConfig(): { host: string; port: number } | undefined {
  const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;

  if (!emulatorHost) {
    return undefined;
  }

  const [host, port] = emulatorHost.split(':');

  if (!host || !port) {
    return undefined;
  }

  return { host, port: Number(port) };
}

function userDocRef(uid: string) {
  return doc(testEnvironment.authenticatedContext(uid).firestore(), 'users', uid);
}

function digestDocRef(uid: string, digestId: string) {
  return doc(
    testEnvironment.authenticatedContext(uid).firestore(),
    'users',
    uid,
    'digests',
    digestId,
  );
}

function savedItemDocRef(uid: string, itemId: string) {
  return doc(
    testEnvironment.authenticatedContext(uid).firestore(),
    'users',
    uid,
    'savedItems',
    itemId,
  );
}

describe('firestore.rules', () => {
  beforeAll(async () => {
    const emulator = getFirestoreEmulatorConfig();

    if (!emulator) {
      throw new Error(
        'Firestore emulator is required. Run tests with npm run test:rules.',
      );
    }

    testEnvironment = await initializeTestEnvironment({
      projectId: PROJECT_ID,
      firestore: {
        rules: readFileSync(resolve(process.cwd(), 'firestore.rules'), 'utf8'),
        host: emulator.host,
        port: emulator.port,
      },
    });
  });

  afterAll(async () => {
    await testEnvironment.cleanup();
  });

  beforeEach(async () => {
    await testEnvironment.clearFirestore();
  });

  it('blocks unauthenticated reads', async () => {
    const reference = doc(testEnvironment.unauthenticatedContext().firestore(), 'users', USER_A);

    await assertFails(getDoc(reference));
  });

  it('blocks cross-user reads', async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users', USER_B), {
        profile: validProfile,
        createdAt: '2026-05-18T12:00:00.000Z',
        updatedAt: '2026-05-18T12:00:00.000Z',
        latestDigestId: null,
        nextDigestDueAt: null,
      });
    });

    await assertFails(
      getDoc(doc(testEnvironment.authenticatedContext(USER_A).firestore(), 'users', USER_B)),
    );
  });

  it('blocks cross-user writes', async () => {
    await assertFails(
      setDoc(doc(testEnvironment.authenticatedContext(USER_A).firestore(), 'users', USER_B), {
        profile: validProfile,
        createdAt: '2026-05-18T12:00:00.000Z',
        updatedAt: '2026-05-18T12:00:00.000Z',
        latestDigestId: null,
        nextDigestDueAt: null,
      }),
    );
  });

  it('allows owners to create and update their profile', async () => {
    await assertSucceeds(
      setDoc(userDocRef(USER_A), {
        profile: validProfile,
        createdAt: '2026-05-18T12:00:00.000Z',
        updatedAt: '2026-05-18T12:00:00.000Z',
        latestDigestId: null,
        nextDigestDueAt: null,
      }),
    );

    await assertSucceeds(
      setDoc(
        userDocRef(USER_A),
        {
          profile: { ...validProfile, displayName: 'Updated User' },
          updatedAt: '2026-05-18T13:00:00.000Z',
        },
        { merge: true },
      ),
    );
  });

  it('blocks protected digest pointer writes', async () => {
    await assertSucceeds(
      setDoc(userDocRef(USER_A), {
        profile: validProfile,
        createdAt: '2026-05-18T12:00:00.000Z',
        updatedAt: '2026-05-18T12:00:00.000Z',
        latestDigestId: null,
        nextDigestDueAt: null,
      }),
    );

    await assertFails(
      setDoc(
        userDocRef(USER_A),
        {
          latestDigestId: 'digest-1',
          updatedAt: '2026-05-18T13:00:00.000Z',
        },
        { merge: true },
      ),
    );
  });

  it('allows valid preference writes and rejects invalid preferences', async () => {
    await assertSucceeds(
      setDoc(userDocRef(USER_A), {
        profile: validProfile,
        createdAt: '2026-05-18T12:00:00.000Z',
        updatedAt: '2026-05-18T12:00:00.000Z',
        latestDigestId: null,
        nextDigestDueAt: null,
      }),
    );

    await assertSucceeds(
      setDoc(
        userDocRef(USER_A),
        {
          preferences: validPreferences,
          updatedAt: '2026-05-18T13:00:00.000Z',
        },
        { merge: true },
      ),
    );

    await assertFails(
      setDoc(
        userDocRef(USER_A),
        {
          preferences: {
            ...validPreferences,
            interests: [],
          },
          updatedAt: '2026-05-18T14:00:00.000Z',
        },
        { merge: true },
      ),
    );
  });

  it('blocks client digest writes while allowing reads', async () => {
    await testEnvironment.withSecurityRulesDisabled(async (context) => {
      await setDoc(doc(context.firestore(), 'users', USER_A, 'digests', 'digest-1'), {
        status: 'active',
        generatedAt: '2026-05-18T12:00:00.000Z',
      });
    });

    await assertSucceeds(getDoc(digestDocRef(USER_A, 'digest-1')));
    await assertFails(
      setDoc(digestDocRef(USER_A, 'digest-1'), {
        status: 'active',
        generatedAt: '2026-05-18T12:00:00.000Z',
      }),
    );
  });

  it('allows valid saved item writes for the owner only', async () => {
    await assertSucceeds(setDoc(savedItemDocRef(USER_A, 'item-1'), validSavedItem));
    await assertFails(
      setDoc(
        doc(
          testEnvironment.authenticatedContext(USER_A).firestore(),
          'users',
          USER_B,
          'savedItems',
          'item-1',
        ),
        validSavedItem,
      ),
    );
    await assertFails(
      setDoc(savedItemDocRef(USER_A, 'item-2'), {
        ...validSavedItem,
        admin: true,
      }),
    );
    await assertSucceeds(deleteDoc(savedItemDocRef(USER_A, 'item-1')));
  });
});
