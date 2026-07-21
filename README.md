# TradeForge Design System

The foundational React + Next.js interface system for TradeForge. It intentionally includes no business pages or domain workflows.

## Structure

- `src/app/globals.css` — semantic design tokens, typography, global states, elevation and layout utilities.
- `src/components/ui` — composable, accessible primitives and domain-neutral patterns.
- `src/app/page.tsx` — living component reference, not a production marketing page.

## Conventions

Use semantic Tailwind tokens (`bg-card`, `text-muted-foreground`, `border-border`) instead of raw palette values. Compose components in features; do not add product domain behavior to `components/ui`. Lucide is the sole icon library, using 16px / 20px stroke icons by default.

## Responsive foundation

The default content container is 1280px max width with 16px / 24px / 32px responsive gutters. Components use the 4px spacing scale and collapse fluid grids at Tailwind's `sm` and `lg` breakpoints. This supports mobile (base), tablet (`sm`), laptop (`lg`), and desktop (`xl`) layouts without special-page code.
