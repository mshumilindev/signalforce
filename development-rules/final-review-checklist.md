# Final Review Checklist

Before finishing an iteration, verify:

- Scope matches the requested iteration.
- `npm run lint` passes.
- `npm run typecheck` passes.
- `npm run test` passes.
- `npm run build` passes.
- No `any`.
- No frontend OpenAI calls.
- No frontend Admin SDK.
- No hardcoded visible JSX copy.
- No fake sources or uncited digest items.
- Digest lifecycle invariants remain intact.
- Firebase security assumptions are documented or enforced.
- Routes and locale resources are complete.
- No dead code, unused files, TODO placeholders, or speculative abstractions.
