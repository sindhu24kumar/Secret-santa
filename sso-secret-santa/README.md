# Holly & Hush — Secret Santa Organizer

A polished Next.js UI starter and production-oriented implementation scaffold for a private Secret Santa exchange.

## What works now

- Responsive landing/dashboard UI with festive styling.
- Client-side preview navigation: Overview, Participants, Wishlists, Settings.
- Preview-only participant addition with basic duplicate-email validation.
- Preview-only budget/date edits, wishlist edit modal, draw-preparation modal and toast feedback.
- Pure Secret Santa assignment function in `lib/draw.ts`, including exclusions, randomized candidate ordering, and a terminating backtracking search.
- Supabase browser/server client helpers, OAuth callback route, starter schema and conservative RLS baseline.

## What is preview-only / not yet connected

- Google sign-in UI is intentionally a clearly labeled preview action, not a completed login flow.
- Dashboard data is seeded in the browser. Changes disappear on refresh.
- Invite buttons do not send email, invitation tokens are not generated, and no real group is persisted.
- The draw button does NOT create or persist assignments.
- Wishlist and settings edits are session-only.
- Anonymous messaging, exclusion editor, audit history, organizer transfer, email delivery and real participant views need server routes/RPCs and narrowly scoped authorization policies before launch.
- Do not deploy this starter as a production exchange until the checklist below is completed.

## Recommended stack and hosting

- Next.js 14 App Router + TypeScript.
- Supabase Auth (Google OAuth) + PostgreSQL.
- Vercel for frontend hosting; Supabase managed database/auth.
- Optional email provider such as Resend for invitations. Keep credentials server-side.
- Supabase CLI migrations for schema changes.

## Run locally

1. Install Node.js 20 LTS or newer.
2. `cp .env.example .env.local`
3. Create a Supabase project and fill `.env.local`.
4. Configure Google OAuth in Google Cloud Console and Supabase Auth.
5. Set the Google OAuth redirect URL to `https://YOUR_PROJECT.supabase.co/auth/v1/callback`.
6. In Supabase Auth URL configuration, add `http://localhost:3000/auth/callback` and the deployed callback URL.
7. Apply `supabase/migrations/001_initial_schema.sql` using the Supabase SQL editor or CLI.
8. `npm install`
9. `npm run dev`

The UI preview runs without credentials, but Supabase helpers and auth routes require valid environment variables.

## Google OAuth setup

- Create an OAuth consent screen and OAuth client in Google Cloud Console.
- Add the Supabase Auth callback URL as an authorized redirect URI.
- Enable Google in Supabase Authentication > Providers.
- Set allowed site URLs and redirect URLs in Supabase.
- Use exact production domains, HTTPS, and separate OAuth clients for local/staging/production where appropriate.
- Never put `SUPABASE_SERVICE_ROLE_KEY` in a `NEXT_PUBLIC_` variable or in client code.

## Data model

- `profiles`: application profile linked to `auth.users`.
- `exchanges`: group owner, currency, budget, date, lifecycle state and draw version.
- `participants`: exchange membership and invite status.
- `pairing_exclusions`: unordered pair restrictions.
- `assignments`: private giver-to-recipient records per draw version.
- `wishlists` / `wishlist_items`: personal notes and gift ideas.
- `anonymous_messages`: message sender/recipient and body.
- `audit_events`: administrative actions without assignment contents.

Money is stored in minor units (paise for INR), not floating point.

## Assignment algorithm

`createSecretSantaDraw`:
1. Rejects duplicate IDs and groups smaller than two.
2. Converts exclusions to symmetric forbidden pairs.
3. Randomizes giver order and each giver's eligible recipients.
4. Uses backtracking to find a perfect matching with no self-draw and no duplicate recipient.
5. Throws a finite, explicit error if the constraints make the draw impossible.

For production, invoke it only on the server after verifying organizer authorization. Persist assignments in one database transaction or one hardened RPC, lock the exchange row, re-check `status = 'open'`, increment `draw_version`, and transition to `drawn` atomically. Use a cryptographically secure random source if fairness/audit requirements justify it. Do not expose assignment rows to the organizer by default.

## Security model to finish before production

- Keep assignments in their own table.
- Default deny direct client access to assignments, exclusions, messages and audit logs.
- Add membership-aware server routes/RPCs; verify `auth.uid()` and exchange membership on every request.
- Only a participant may read the recipient assigned to their own participant record.
- Organizer APIs can manage settings and participants but must not return assignment contents.
- For draw generation, use a transaction or security-reviewed RPC with a row lock; enforce uniqueness in the database.
- Use opaque invitation tokens generated from cryptographically secure randomness; store only a hash, expire/revoke them, and rate-limit redemption.
- Do not put tokens, recipient IDs or assignment contents in URLs, analytics, error logs or client-visible metadata.
- Add CSRF/origin checks for mutations, rate limits, payload validation, email normalization, output escaping and safe URL validation.
- Avoid exposing emails to other participants. Treat anonymous messaging as anonymous to the recipient, not necessarily to the platform operator.
- Keep service-role keys server-only; enable HTTPS and secure, HttpOnly, SameSite cookies.
- Use audit events for admin actions and redraws, but never log secret assignment mappings.
- The included RLS is intentionally conservative. Build and test precise policies/RPCs before enabling real participant reads. Do not “fix” access errors by allowing all authenticated users to read all rows.

## Edge cases and expected behavior

| Case | Expected behavior |
|---|---|
| 0 or 1 eligible participant | Block draw with clear validation |
| Duplicate participant / email | Reject before saving |
| Self-exclusion | Reject invalid exclusion |
| Impossible exclusion graph | Return `No valid draw exists`; do not persist partial assignments |
| All participants excluded from all possible recipients | Draw is impossible; ask organizer to revise exclusions |
| Concurrent draw requests | One transaction wins; the other sees already drawn state |
| Participant added after draw | Require controlled cancellation/redraw policy; never silently modify assignments |
| Participant withdraws after draw | Pause exchange and require organizer resolution; don't auto-reassign |
| Duplicate invite redemption | Idempotent or reject safely; never create duplicate membership |
| Expired/revoked invite | Reject without disclosing group details |
| Unauthorized assignment lookup | Return 404/403 without assignment data |
| Organizer attempts to inspect all assignments | Deny by design unless an explicit audited reveal policy exists |
| Deleted user | Preserve exchange integrity; organizer resolves membership before redraw |
| Email provider outage | Keep invitation pending; retry safely, never duplicate participants |
| Budget/date/time-zone differences | Store currency + minor units and date-only exchange date; display local date intentionally |
| XSS in wishlist/message | Escape output; validate URLs to HTTP(S) only |
| Large group / adversarial exclusions | Bound participant count and request size; use solver/time limit for large cases |
| Browser refresh | Production state must reload from DB, not local state |
| Lost organizer access | Recovery/ownership-transfer flow with audit trail |
| Redraw | Increment draw version and explicitly invalidate old assignment rows under transaction |

## Test plan

### Unit tests
- For every generated draw, each giver appears exactly once and each recipient exactly once.
- No one receives themselves.
- No excluded pair is assigned in either direction.
- Repeated runs produce valid results.
- Duplicate IDs, fewer than two participants and self-exclusions throw.
- Impossible constraints terminate with an error.
- Test randomized properties across many generated participant sets.

### Integration tests
- Google OAuth sign-in, callback, session refresh and sign-out.
- Participant can read only their own assignment.
- Another participant cannot query the assignment table or guess another participant ID.
- Organizer cannot retrieve assignment mappings from admin endpoints.
- Draw transaction is atomic under simultaneous requests.
- Invite token expiry, revocation, replay and duplicate redemption.
- Email failure/retry and safe idempotency.
- RLS tests using multiple real test users, not only service-role credentials.

### End-to-end tests
- Create exchange, invite friends, accept invitations, set exclusions, save wishlist, run draw, view own reveal, send anonymous message.
- Mobile layout at narrow widths, keyboard navigation, focus management, reduced motion.
- Refresh/deep-link behavior and unauthorized routes.
- No secrets in browser network responses, HTML, console logs or analytics.

## Deployment checklist

1. Create Supabase project and configure Google OAuth.
2. Apply reviewed migrations to staging.
3. Implement and test membership-aware policies and server routes.
4. Add email provider and invitation templates.
5. Configure Vercel project and environment variables.
6. Add production URL to Google OAuth and Supabase redirect allowlists.
7. Enforce HTTPS, secure headers, rate limiting and request validation.
8. Run unit, integration, RLS and end-to-end tests against staging.
9. Test database backup/restore and owner recovery.
10. Deploy production, monitor errors, and rotate secrets if exposed.

## Suggested API contract

- `POST /api/exchanges`: create exchange.
- `POST /api/exchanges/:id/invitations`: create/re-send invite (organizer only).
- `POST /api/invitations/:token/accept`: accept invite after authentication and email verification.
- `GET /api/exchanges/:id`: return group metadata only, never assignment mappings.
- `POST /api/exchanges/:id/exclusions`: update exclusions before draw.
- `POST /api/exchanges/:id/draw`: organizer-only, atomic draw; returns status only.
- `GET /api/exchanges/:id/my-assignment`: authenticated participant's own recipient only.
- `GET/PUT /api/me/wishlist`: own wishlist.
- `POST /api/exchanges/:id/messages`: message only to the sender's assigned recipient.
- `GET /api/me/messages`: messages addressed to the authenticated participant, without sender identity if anonymous.
- `GET /api/exchanges/:id/audit`: organizer-only admin events, with assignment contents excluded.

## Before real launch

The current deliverable is a **working UI preview plus backend scaffold**, not a fully production-ready service. The most important unfinished work is the membership-aware API/RPC layer, secure invite lifecycle, transactional draw persistence, and real Google OAuth UI wiring. Those are intentionally called out rather than hidden behind festive gradients.
