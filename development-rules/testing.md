# Testing

- Every iteration must pass lint, typecheck, tests, and build.
- Tests protect product rules and user-facing behavior.
- Do not weaken tests to make them pass.
- Add focused tests for extracted domain logic, route behavior, i18n, auth guards, Firestore boundaries, and digest lifecycle calculations.
- Mock external services at the boundary being tested.
- Mocks must match explicit response types.
- Do not use fake sources in digest tests unless the test clearly marks them as fixtures.
- Prefer small tests over full-app renders when a pure function or small component is enough.
