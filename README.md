# TradeForge

TradeForge is a premium, responsive evaluation-account workspace built with Next.js 15, React 19, TypeScript, Tailwind CSS, and Recharts.

## Workspace routes

- `/` — performance dashboard, risk overview, evaluation progress, activity, and quick actions
- `/challenges` — active evaluation, rules, timeline, and challenge models
- `/accounts` — searchable and sortable account workspace
- `/payouts` — payout eligibility, statistics, history, and demo request flow
- `/leaderboard` — weekly and monthly mock rankings
- `/notifications` — filterable account, rule, payout, challenge, and system updates
- `/search` — workspace-wide mock search
- `/profile` — trader profile, security, devices, and account history
- `/settings` — accessible general, notification, trading, security, privacy, and session controls

Trading and payout surfaces remain demo data. Crypto checkout is server-authoritative and requires a configured payment provider webhook; the application never simulates a payment or activates a purchase from the browser.

## Commands

```bash
npm install
npm run dev
npm run typecheck
npm run lint
npm run build
```

## Architecture

- `src/app` — App Router route composition and global states
- `src/components/ui` — reusable design-system primitives
- `src/components/workspace` — authenticated shell, navigation, headers, cards, status, and progress patterns
- `src/features` — feature-based route workspaces, tables, charts, and forms
- `src/features/workspace/mock-data.ts` — shared typed demo-data layer
- `docs/brand-guidelines.md` — TradeForge visual and product guidance
- `docs/verification` — desktop, tablet, and mobile browser captures
- `supabase/migrations/20260908000100_crypto_payments_and_purchases.sql` — payment fields, purchases, RLS, and atomic activation RPC

## Crypto payment configuration

Copy `.env.example` to the deployment environment and provide the Supabase service-role key, four public destination addresses, USD-per-asset rates, and a webhook secret. Rates are locked on payment request creation and crypto amounts are calculated with integer arithmetic. A real provider's signed `payment.confirmed` event, including `asset`, `payment_method`, `payment_network`, `payment_address`, `amount_atomic`, `transaction_hash`, and `payment_reference`, must be posted to `/api/payments/webhook` with the `x-tradeforge-signature` HMAC-SHA256 header. No provider or blockchain RPC credentials are included in the repository; without a real signed provider event, orders remain unpaid.

When `NOWPAYMENTS_API_KEY`, `NOWPAYMENTS_IPN_SECRET`, `NEXT_PUBLIC_APP_URL`, and all four `NOWPAYMENTS_*_CURRENCY` values are configured, checkout creates a real NOWPayments payment through `POST https://api.nowpayments.io/v1/payment`. NOWPayments IPNs must target `/api/payments/nowpayments/webhook` and use the provider's `x-nowpayments-sig` signature. The handler accepts only matching order/reference/currency/address/amount events with a real `transaction_id`; it then uses the existing atomic order-to-purchase RPC. Configure the supported currency codes in the NOWPayments account, rather than assuming a code is available for the account or region.

## MVP readiness

- **READY:** Supabase challenge catalogue, authenticated order creation, crypto payment state machine, signed webhook boundary, idempotent purchase activation, account entitlement creation, RLS, audit logging, server-authorized payout requests, profile/preferences persistence, and role-protected admin review pages.
- **CONFIGURATION REQUIRED:** A NOWPayments account with the four supported currencies enabled, API key, IPN secret, public application URL, and webhook registration. The trading provider adapter remains unavailable until a real server-side broker adapter and credentials are supplied.
- **NOT IMPLEMENTED:** Live broker/MT5 execution, automatic trade ingestion, live rule metrics, automated payout settlement, and 2FA. The UI reports unavailable integration states instead of fabricating results.

Use semantic Tailwind tokens such as `bg-card`, `text-muted-foreground`, and `border-border`; keep product behavior in feature modules and preserve Lucide as the sole interface icon library.
