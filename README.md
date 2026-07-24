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

All product records and financial activity are realistic frontend demo data. The application does not execute trades, process real payments, or claim real payouts.

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

Use semantic Tailwind tokens such as `bg-card`, `text-muted-foreground`, and `border-border`; keep product behavior in feature modules and preserve Lucide as the sole interface icon library.
