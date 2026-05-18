# AI Boundaries

OpenAI is backend-only.

- Never call OpenAI from React code.
- Never expose OpenAI keys to the client.
- Use OpenAI only for summarization, prioritization, implications, digest generation, and term explanations.
- Do not use OpenAI for auth, scheduling, Firestore permissions, source fetching, identity, or cadence logic.
- Do not create a giant AI framework before concrete backend use cases exist.
- Digest items need real sources; no fake citations.
