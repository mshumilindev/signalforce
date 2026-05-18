# Security And Privacy

- No secrets in frontend code, tests, docs, or commits.
- Do not log tokens, prompts containing private user data, or raw model responses in production paths.
- User data must be scoped by UID.
- Firestore rules and backend checks must both protect ownership-sensitive operations.
- Saved items and digest history are private by default.
- Source URLs may be public; personal preferences are not.
