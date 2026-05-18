# SignalForge

Personal engineering digest workspace: curated RSS signals, OpenAI-generated leadership briefings, and a React dashboard backed by Firebase.

**Firebase project:** `signalforge-msdev`  
**Functions region:** `europe-west1`

## Stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, TypeScript, React Router, i18next (en / pl / uk) |
| Backend | Firebase Functions v2 (Node 20), Firestore, Cloud Scheduler |
| AI | OpenAI (digest content generation and in-place refresh) |
| Auth | Firebase Auth (Google sign-in) |

## Architecture

```text
┌─────────────────┐     callable HTTPS      ┌──────────────────────────┐
│  React SPA      │ ───────────────────────▶│  Cloud Functions         │
│  (Firebase SDK) │                           │  europe-west1            │
└────────┬────────┘                           │  • generateDigest        │
         │ read / write                       │  • refreshDigest         │
         │ (rules-enforced)                   │  • forceUpdateDigest     │
         ▼                                    │  • scheduledDigest…      │
┌─────────────────┐                           └────────────┬─────────────┘
│  Firestore      │◀──────────────────────────────────────────┘
│  users/{uid}    │         Admin SDK writes digests, runs,
│    ├ digests    │         pointers, generationRuns
│    ├ savedItems │
│    └ generationRuns (read-only for client)
└─────────────────┘
```

**Client responsibilities**

- Sign in, manage profile fields, save **preferences** and **saved items**
- Read digests and digest history; trigger digest operations via callables (never write digest documents directly)

**Server responsibilities**

- Fetch and rank source items (RSS registry)
- Run digest lifecycle (create, in-place refresh, supersede, force update)
- Call OpenAI for structured digest JSON
- Update `latestDigestId` and `nextDigestDueAt` on the user document
- Hourly scheduler for due users

**Fixed product lenses** (always applied in prompts, not user-selectable): React Lead, Staff Engineer, Architect, CTO, AI Orchestrator, Lead AI Engineer.

## Digest lifecycle

| Trigger | Callable / job | Behavior |
| --- | --- | --- |
| First digest / expired active | `generateDigest` | New digest; may supersede expired active; OpenAI full generation |
| New sources on active digest | `refreshDigest` | In-place refresh if active and not expired; OpenAI refresh prompt |
| User confirms force update | `forceUpdateDigest` | Supersedes active digest, creates new one, resets cadence |
| Cadence due | `scheduledDigestGeneration` (hourly) | Same rules as generate when due; skips if active digest still valid |

**Digest states:** `active` → `superseded` (replaced) or effectively **expired** when past `expiresAt` (window derived from preferences cadence).

**User pointers:** `latestDigestId`, `nextDigestDueAt` are server-only (Firestore rules block client writes).

## Repository layout

```text
src/                    React app (features, pages, shared Firebase client)
functions/src/          Cloud Functions (digest, openai, sources, scheduler)
firestore.rules         Security rules (tested with emulator)
firebase.json           Firestore, Functions, Hosting, emulators
.env.example            Environment variable template (no secrets)
```

## Prerequisites

- Node.js 20+
- npm
- Firebase CLI (`npx firebase` works via devDependency)
- Firebase project with Auth (Google), Firestore, Functions, Hosting enabled
- OpenAI API key for Functions

## Local setup

1. **Clone and install**

   ```bash
   npm install
   npm --prefix functions install
   ```

2. **Environment**

   Copy `.env.example` to `.env` in the project root and fill in Firebase web config (`VITE_*` only):

   ```bash
   cp .env.example .env
   ```

   Do not put `OPENAI_API_KEY` in `.env` for the frontend. It is configured as a Functions secret (see deployment).

3. **Run the app**

   ```bash
   npm run dev
   ```

4. **Sign in** with Google, open **Settings**, and save preferences (language, interests, tone, cadence). Digest callables require valid preferences.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Vite dev server |
| `npm run build` | Production frontend build → `dist/` |
| `npm run typecheck` | TypeScript (app + node configs) |
| `npm run lint` | ESLint |
| `npm test` | Unit tests + Firestore rules (emulator) + Functions tests |
| `npm run functions:build` | Compile Functions to `functions/lib/` |
| `npm run firebase:deploy:rules` | Deploy Firestore rules |
| `npm run firebase:deploy:functions` | Build and deploy Functions |
| `npm run firebase:deploy:hosting` | Build frontend and deploy Hosting |

## Deployment

Target project is set in `.firebaserc` (`signalforge-msdev`). Adjust if you use another project.

1. **Firestore rules**

   ```bash
   npm run firebase:deploy:rules
   ```

2. **OpenAI secret** (once per project)

   ```bash
   firebase functions:secrets:set OPENAI_API_KEY --project signalforge-msdev
   ```

3. **Functions**

   ```bash
   npm run firebase:deploy:functions
   ```

4. **Hosting** (after `npm run build`)

   ```bash
   npm run firebase:deploy:hosting
   ```

   Ensure production `VITE_*` values are set in your CI or hosting build environment (Firebase Hosting rewrites need a built `dist/` with correct config).

5. **Scheduler** — `scheduledDigestGeneration` deploys with Functions; verify Cloud Scheduler job in GCP console.

## Security

- No secrets in the repository; use `.env` locally (gitignored) and Functions secrets in production.
- Firestore rules: per-user isolation, validated preferences schema, client cannot write digests or `generationRuns`, cannot tamper with digest pointers.
- OpenAI runs only in Cloud Functions.

## Testing

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run functions:build
```

Rules tests start the Firestore emulator automatically via `firebase emulators:exec`.

## License

Private / personal use.
