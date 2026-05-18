import '@testing-library/jest-dom/vitest';
import { beforeAll } from 'vitest';
import { i18nReady } from '@/shared/i18n/i18n';

beforeAll(async () => {
  await i18nReady;
});
