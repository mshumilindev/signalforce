# Digest Lifecycle

The app must never create a new digest merely because the user opened the app.

- Active digest refresh updates the existing digest in place.
- Refresh preserves `generatedAt`, `periodStart`, `periodEnd`, and `expiresAt`.
- Refresh updates `lastRefreshedAt` and appends genuinely new relevant items only.
- Refresh must not reset cadence.
- Expired digest creates a new digest with new period and expiry fields.
- Force update is explicit and creates a new digest immediately.
- Force update supersedes the previous digest, resets cadence, and recalculates `nextDigestDueAt`.
- Refresh and force update are different product actions and must not share ambiguous names.
- Frequency calculations must be timezone-aware for daily, twicePerWeek, weekly, biweekly, and monthly.
