---
name: Design subagent quota
description: Free-tier design subagent jobs can be rejected by monthly quota; keep a direct-build fallback for presentation-first apps.
---

Design subagent jobs may be denied in Free mode when the monthly helper quota is exhausted, even though the main agent can continue editing and verifying the app directly.

**Why:** A first-build landing page can otherwise remain on the scaffold while waiting for a helper that cannot start.

**How to apply:** Launch the design helper early as required, but if authorization is denied, take over the frontend implementation directly instead of retrying the same job repeatedly.