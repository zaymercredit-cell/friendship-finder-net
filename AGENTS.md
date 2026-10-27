# Architecture rules
- Preserve the existing persistent AppLayout and lazy-route prefetch registration; navigation must not recreate the application shell.
- Message pages are newest-page-first with chronological entries; use message-history helpers for ID-based reconciliation so realtime and mutation responses cannot duplicate or misplace messages.
- Message history and hover prefetch share message-query's timestamp/ID cursor loader; stable boundaries prevent live inserts shifting older pages.
- Payment entitlements are server-owned; never grant subscriptions or VIP from a browser action because payment confirmation must be verified.
- The retired admin bootstrap endpoint always refuses operations; role maintenance belongs to authenticated, server-authorized workflows rather than fixed credentials.
- Community pages read real community rows and user-scoped memberships; never substitute mock participants or generate activity indicators because actions and claims must match persisted data.