# Firebase Boundaries

- Frontend may use Firebase client SDK for Auth and Firestore reads/writes allowed by rules.
- Frontend must never import Firebase Admin SDK.
- Backend functions may use Admin SDK.
- Security rules must enforce user ownership under `users/{uid}`.
- Client config may contain Firebase public project identifiers only.
- Secrets belong in backend environment or Firebase Secret Manager.
- Firestore paths must follow the agreed structure before code relies on them.
