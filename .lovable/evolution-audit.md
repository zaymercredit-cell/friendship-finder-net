# Initial audit — 19 October 2026

## Browser evidence
Authenticated local preview: `/feed`, `/discover`, `/profile/me`, `/messages`, `/communities`, `/events`, `/settings`, `/admin` opened without page exceptions or the shared error screen. Messenger list visibly contains existing conversations. Conversation rows are buttons, not links; an empty link query is not evidence of missing conversations.
Not yet verified: sending, refresh persistence, pagination, incoming delivery, mobile keyboard, administrative mutations, hosted auth configuration, payment entitlements.

## Source findings requiring correction/verification
1. `useConversations.ts`: new realtime messages appended to oldest page when history is paginated; read marker advances before history successfully loads; unread query globally capped at 500 rows.
2. `MessagesPage.tsx`: any list growth while scrolled up can be interpreted as prepending history.
3. `useTypingIndicator.ts`: conversation cleanup retains throttle state and does not explicitly stop peer indication.
4. `PremiumPage.tsx`: client inserts active subscription and updates VIP without verified payment. Live policies need inspection before confirming exploitability.
5. `create-dev-admin`: source has fixed credential bootstrap with no visible request authorization. Deployment/exposure not yet verified; do not invoke it.
6. Communities/events include local-only membership/attendance and mock content. Discover includes mock candidates and simulated mutual likes; profile contains toast-only actions.
7. AI source needs input limits/auth/privacy review. Admin RPC failures are converted to denial.

## Test and performance status
Only example test coverage discovered. No production build, Web Vitals, load benchmark or before/after performance measurement performed. No code, RLS, auth or backend data changed in this audit.