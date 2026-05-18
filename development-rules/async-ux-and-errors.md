# Async UX And Errors

- Async actions must expose loading, success, and failure states when user-visible.
- Disable duplicate submissions for the same mutation.
- Background refresh should be clear but not noisy.
- Force update must be visually distinct from refresh.
- Errors should be actionable and localized.
- Do not use raw provider errors as visible copy.
- Skeletons should reserve final layout dimensions.
