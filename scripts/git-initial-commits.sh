#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

git init -b main

git_commit() {
  local message="$1"
  shift
  git add "$@"
  git commit -m "$message"
}

# 1 — Tooling and Firebase project wiring
git_commit "chore: initialize SignalForge monorepo and Firebase config" \
  .gitignore \
  .env.example \
  .firebaserc \
  .prettierrc \
  README.md \
  eslint.config.js \
  firebase.json \
  firestore.rules \
  index.html \
  package.json \
  package-lock.json \
  tsconfig.json \
  tsconfig.app.json \
  tsconfig.node.json \
  vite.config.ts \
  vitest.rules.config.ts

# 2 — Frontend foundation
git_commit "feat(frontend): app shell, auth, and i18n" \
  src/main.tsx \
  src/vite-env.d.ts \
  src/app \
  src/features/auth \
  src/shared \
  src/test \
  src/styles

# 3 — Preferences and dashboard
git_commit "feat(frontend): preferences, dashboard, and digest client" \
  src/features/preferences \
  src/features/digest \
  src/features/dashboard \
  src/pages/DashboardPage.tsx \
  src/pages/LoginLayout.tsx \
  src/pages/LoginPage.tsx \
  src/pages/PageFrame.tsx \
  src/pages/SettingsPage.tsx \
  src/pages/TermsPage.tsx

# 4 — History and saved items
git_commit "feat(frontend): digest history and saved items" \
  src/features/digests \
  src/features/saved \
  src/pages/DigestsPage.tsx \
  src/pages/DigestsPage.test.tsx \
  src/pages/DigestDetailPage.tsx \
  src/pages/DigestDetailPage.test.tsx

# 5 — Cloud Functions core and digest pipeline
git_commit "feat(functions): digest lifecycle, OpenAI, and callable API" \
  functions/.gitignore \
  functions/package.json \
  functions/package-lock.json \
  functions/tsconfig.json \
  functions/src/index.ts \
  functions/src/firebaseAdmin.ts \
  functions/src/errors.ts \
  functions/src/auth \
  functions/src/users/repository.ts \
  functions/src/generationRuns \
  functions/src/digest \
  functions/src/openai \
  functions/src/preferences \
  functions/src/test

# 6 — Sources and scheduler
git_commit "feat(functions): source registry and scheduled digest generation" \
  functions/src/sources \
  functions/src/scheduler \
  functions/src/users/listDueUsers.ts

# 7 — Security tests and rules coverage
git_commit "feat(security): Firestore rules tests and client validation hardening" \
  firestore.rules.test.ts \
  src/features/saved/validateSavedItemInput.ts \
  src/features/saved/validateSavedItemInput.test.ts

# 8 — Cursor / development rules (optional project docs)
if [ -d development-rules ]; then
  git_commit "docs: add development rules and agent guidance" development-rules .cursor
fi

echo "Done. $(git log --oneline | wc -l | tr -d ' ') commits on main."
