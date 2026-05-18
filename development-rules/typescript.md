# TypeScript

- `strict` must stay enabled.
- No `any`.
- Avoid unsafe casts and broad `Record<string, unknown>` when a domain type is known.
- Model finite states as unions or enums.
- Keep API and Firestore document shapes explicit.
- Use path aliases for cross-boundary imports.
- Do not suppress compiler errors.
- Treat `null`, `undefined`, and empty strings as distinct states.
