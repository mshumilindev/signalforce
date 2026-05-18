import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from '@/app/App';
import { AuthProvider } from '@/features/auth/AuthProvider';
import { i18nReady } from '@/shared/i18n/i18n';
import '@/styles/global.css';

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element is missing.');
}

const root = rootElement;

async function bootstrap(): Promise<void> {
  await i18nReady;

  createRoot(root).render(
    <StrictMode>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </StrictMode>,
  );
}

void bootstrap();
