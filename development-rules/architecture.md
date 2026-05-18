# Architecture

SignalForge is a React, TypeScript, Vite, Firebase, and Firebase Functions v2 app.

- Pages compose feature surfaces and stay thin.
- Firebase client SDK code stays in frontend infrastructure modules only.
- Firebase Admin SDK code is backend-only.
- Firestore data is server state. Use TanStack Query or SWR when server reads are introduced.
- Local component state is for local UI only.
- Do not add global state for server entities.
- Add abstractions only after real reuse or a real invariant exists.
- OpenAI calls must live only in backend functions.
