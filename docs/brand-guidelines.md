# TradeForge Brand Guidelines

**Official Design Bible · Version 0.2.0 · 21 July 2026**

TradeForge exists to make proprietary trading feel clear, professional, and fair. Our brand expression must earn trust before it asks for action. It is not loud finance; it is disciplined financial infrastructure.

This document governs every TradeForge touchpoint: marketing, product, authentication, admin, affiliate, challenge, payout, editorial, and support experiences. The existing code tokens in `src/app/globals.css` are the implementation source of truth. These guidelines explain the decisions behind them.

## 1. Brand foundation

### Mission

Build the world's most trusted prop firm through transparency, professionalism, and fair evaluations.

### Philosophy: Trust Through Transparency

Clarity is a brand feature. Show rules before claims, explain states before errors, and use precise language before persuasive language. A person should understand what TradeForge offers, what is required, and what happens next without needing to decode marketing.

### Character

Professional, trusted, clean, fast, premium, and modern. The product should feel calm under pressure: a trading environment that reduces cognitive load rather than adding spectacle.

## 2. Logo system

The TradeForge wordmark is the primary brand signature. The `T` app mark is a compact identifier, not a substitute for the wordmark where space permits.

| Rule | Standard | Reason |
| --- | --- | --- |
| Clear space | Keep clear space equal to the cap-height of the `T` on all sides. | Protects recognition in dense financial interfaces. |
| Minimum size | Wordmark: 96px wide digitally. App mark: 24px square digitally. | Preserves legibility and the mark's geometry. |
| Preferred dark use | White wordmark on `Background`; purple mark may be used for primary moments. | Maintains the dark system's premium contrast. |
| Light use | Near-black wordmark on white or near-white only. | Light surfaces require a deliberately authored inverse, never a faded dark logo. |
| Monochrome | Pure white on dark; near-black on light. | Use when color would compromise contrast or reproduction. |
| App icon | Purple field with a centered white `T`; 20% internal padding, 20% corner radius. | Reads cleanly at small sizes and aligns with the UI radius language. |
| Favicon | Simplified white `T` on purple, exported at 16, 32, 48, and 180px. | The symbol must remain recognizable in browser chrome. |

Never stretch, rotate, outline, shadow, recolor outside the approved palette, place on low-contrast imagery, add gradients to the wordmark, or place the logo inside a pill. Do not use the app mark as decoration or repeat it as a pattern.

## 3. Typography

Use **Manrope** for display typography and **DM Sans** for interface and body copy. Both are Google Fonts and are already configured in the application. Manrope gives TradeForge controlled, engineered character; DM Sans remains highly readable in dense data and form contexts.

| Style | Font / weight | Desktop size | Line height | Tracking | Use |
| --- | --- | ---: | ---: | ---: | --- |
| Display | Manrope 600 | 48px | 1.10 | -0.03em | Hero statements only |
| H1 | Manrope 600 | 40px | 1.15 | -0.025em | Page title |
| H2 | Manrope 600 | 30px | 1.20 | -0.02em | Major section |
| H3 | Manrope 600 | 20px | 1.30 | -0.01em | Card or subsection |
| Body | DM Sans 400 | 16px | 1.60 | 0 | Default reading copy |
| Small | DM Sans 400/500 | 14px | 1.45 | 0 | Supporting UI copy |
| Caption | DM Sans 500 | 12px | 1.35 | 0.01em | Metadata, timestamps, labels |
| Button | DM Sans 600 | 14px | 1 | 0 | Action labels |

On mobile, Display is 36px and H1 is 32px. Do not set paragraphs below 14px; 12px is reserved for nonessential metadata. Use sentence case, not all caps, except compact category labels where 0.12–0.18em tracking is intentional. Avoid more than two type weights in a single component.

## 4. Color system

Use semantic tokens, never arbitrary raw colours in components. The token names communicate intent and make a future visual refresh safe.

| Token | HSL value | Purpose |
| --- | --- | --- |
| Background | `240 14% 5%` | Main canvas |
| Surface | `240 13% 8%` | Inputs, layered controls |
| Card | `240 12% 10%` | Card and modal foundation |
| Border | `240 10% 19%` | Quiet separation, never decoration |
| Foreground | `240 10% 96%` | Primary reading text |
| Muted foreground | `240 5% 64%` | Supporting text and icons |
| Primary | `267 89% 72%` | Selected state, focus, readable accent text, and progress |
| Primary solid | `267 78% 44%` | Filled primary controls with white AA-contrast text |
| Success | `153 64% 46%` | Confirmed, complete, positive performance |
| Warning | `38 92% 56%` | Attention or pending review |
| Danger | `0 75% 61%` | Destructive action, failure, critical issue |
| Danger solid | `0 72% 42%` | Filled destructive controls with white AA-contrast text |

### Usage rules

- Purple means **action, selection, and progress**. It is not a general decorative colour.
- Filled controls use the darker `Primary solid` or `Danger solid` tokens so white labels meet WCAG AA. Primary hover is 90% opacity; active uses a subtle 98% scale with no abrupt colour jump.
- Disabled controls use 45% opacity and must never look actionable.
- Borders are normally 100% `Border`; subdued separators may use 70% opacity. Do not use borders below 50% opacity around interactive controls.
- Glass is reserved for intentional layered moments. Use white at 3.5% opacity, a 8% white border, and blur; never use it for every card.
- The purple glow is `0 0 32px hsl(var(--primary) / .24)`. Use it only on the primary call to action or selected hero element, never on data tables or routine inputs.
- Semantic colours must be paired with text or iconography. Colour alone never communicates status.

## 5. Button rules

The existing `Button` component is the only default button implementation. Variants express hierarchy: Primary initiates the key action, Secondary supports it, Outline is neutral, Ghost is low-emphasis, and Danger is irreversible.

- Radius: 12px (`rounded-tf-md`); do not introduce rounded pills for standard actions.
- Heights: 36px small, 40px default, 48px large. Horizontal padding follows the component size.
- Icon spacing: 8px. Icons are 16px unless an icon-only button uses a 40px target.
- Hover: 200ms ease-out; raise contrast, never translate the button.
- Active: `scale(.98)` for immediate tactile feedback.
- Loading: preserve the label and width; show a 16px spinner before the label; disable repeat activation.
- Shadows: only primary buttons may use the soft purple glow. Other button variants remain flat.
- Write labels as precise verbs: “Start evaluation”, “Save changes”, “Review payout”. Never use “Click here”.

## 6. Card rules

Cards organise related content, not every isolated sentence. Use the existing card primitives before creating a new visual container.

- Default radius: 16px. Large feature cards and modal shells: 20px.
- Default padding: 20px; mobile may reduce to 16px. Large feature cards can use 24px.
- Internal rhythm: 8px for tightly related elements, 12px standard, 20px between groups.
- Elevation: base cards use `shadow-card` only where layering is needed; borders do most of the separation work.
- Hover: border increases subtly to white at 14% opacity. No card lift is required; motion should not make financial data feel unstable.
- Glass: use only for active challenge, promotional, or foreground overlay cards. It must retain sufficient text contrast and a real border.

## 7. Spacing and layout

TradeForge uses a 4px base unit. Use the Tailwind scale in multiples of four: 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80, and 96px. Do not introduce one-off spacing values without a documented need.

| Context | Standard |
| --- | --- |
| Main container | 1280px maximum width |
| Page gutters | 16px mobile, 24px tablet, 32px laptop and desktop |
| Page header to content | 48px mobile, 64px desktop |
| Major sections | 48px mobile, 80px desktop |
| Grid gap | 16px compact, 24px default, 32px editorial |
| Dashboard grid | 1 column mobile; 2 tablet; 3–4 laptop/desktop when content permits |

Whitespace is an information hierarchy tool. When density is needed, reduce decorative content before reducing tap targets, text line height, or card padding.

## 8. Shadow system

Shadows communicate elevation sparingly in a dark interface.

| Name | Value / use |
| --- | --- |
| Small | `0 4px 12px rgb(0 0 0 / .16)` — menus or compact floating controls |
| Card | `0 12px 32px rgb(0 0 0 / .22)` — card separation where needed |
| Large | `0 24px 64px rgb(0 0 0 / .38)` — dialogs and critical overlays |
| Purple glow | `0 0 32px hsl(var(--primary) / .24)` — a single primary focal point |
| Purple depth | `0 16px 40px hsl(var(--primary) / .14)` — optional large hero emphasis |

Do not stack multiple shadows, use hard black drop shadows, or put a shadow on every card. Border, surface contrast, and spacing should carry most hierarchy.

## 9. Motion principles

Motion confirms cause and effect. It should be fast, quiet, and never compete with price data or risk information.

| Interaction | Duration | Easing | Rule |
| --- | ---: | --- | --- |
| Button / icon hover | 160–200ms | ease-out | Colour, opacity, or tiny scale only |
| Fade in | 180–240ms | ease-out | 0 → 1 opacity; use for content entering view |
| Slide / fade | 220–280ms | ease-out | 8px vertical distance maximum |
| Modal | 200ms | ease-out | Backdrop fade plus 96% → 100% scale |
| Dropdown | 160ms | ease-out | Fade plus 4px rise, no bounce |
| Loading | 800–1000ms loop | linear | Spinner only; preserve layout |
| Page transition | 180–240ms | ease-out | Optional subtle fade; never block navigation |

Avoid parallax, large spring bounces, looping decorative animation, flashing numbers, and auto-playing chart movement. Honor `prefers-reduced-motion`: remove transforms and nonessential loops while preserving state feedback.

## 10. Icon rules

Use **Lucide Icons** exclusively. Icons use the default stroke style; do not mix filled, emoji, custom, or third-party icon styles in product UI.

- 16px: inline metadata, button icons, dense tables.
- 20px: standard navigation, form affordances, feature controls.
- 24px: prominent card actions and empty states.
- 32px: hero callouts only.
- Maintain an 8px gap between an icon and its label. Icon-only controls need an accessible label and a minimum 40 × 40px touch target.
- Use an icon to clarify an action, not replace a clear label in high-risk contexts. Avoid icons for metaphorical decoration.

## 11. Illustration and photography

### Illustration

Illustrations should be abstract, minimal, and structural: grids, market pathways, measured geometric forms, signal lines, or restrained financial data motifs. Use dark surfaces, sparse purple illumination, and clean depth. Never use cartoon characters, rockets, money bags, neon trading floors, or visual clichés that imply easy wealth.

### Photography

Use real professionals, clean desk setups, multiple-monitor workspaces, chart review, financial environments, and measured collaboration. Images should feel documentary, well lit, and globally credible. Avoid luxury cars, watches, cash, private jets, staged “millionaire” poses, green-profit imagery, and screenshots that imply guaranteed outcomes. Photography supports a story; it does not prove performance.

## 12. Brand voice and writing

The TradeForge voice is professional, confident, honest, motivating, and transparent. We tell users what is true, what is needed, and what happens next. We do not manufacture urgency or promise results.

### Voice rules

- Say “You can begin an evaluation” rather than “Unlock life-changing profits.”
- State conditions before benefits: “80% profit split after meeting payout requirements.”
- Use “may”, “can”, and “based on” where outcomes depend on user behaviour or market conditions.
- Never say guaranteed, risk-free, effortless, instant wealth, or “turn your life around.”
- Prefer short, active, direct sentences. Use domain terms only when they are explained or expected by the audience.

### Interface writing

| Context | Guidance | Example |
| --- | --- | --- |
| Buttons | Start with a specific verb. | “Review rules”, “Save payout method” |
| Headlines | State value without hype. | “A clearer path to funded trading.” |
| Subtitles | Explain scope or next step. | “Review your risk limits before placing a trade.” |
| Errors | Explain the problem and recovery. | “We couldn’t save your changes. Check your connection and try again.” |
| Success | Confirm what completed. | “Payout method saved.” |
| Empty states | Explain absence and next action. | “No payouts yet. Your approved payouts will appear here.” |
| Notifications | Be factual and time-aware. | “Your identity review is in progress. We’ll notify you when it is complete.” |

Use sentence case, contractions sparingly, and plain language. Avoid exclamation marks except in rare positive confirmation moments; never use them for risk, errors, or pressure.

## 13. Accessibility baseline

Accessibility is part of trust. Every page must meet WCAG 2.2 AA as a minimum.

- Text contrast: 4.5:1 for normal text; 3:1 for large text and meaningful graphical elements. Verify purple text on dark surfaces rather than assuming it passes.
- Type: minimum 14px for UI text and 16px for reading copy; line length generally 45–75 characters.
- Keyboard: all interactive controls must be reachable, usable, and dismissible with a keyboard. Never remove focus without providing an equivalent visible focus state.
- Focus: retain the global two-pixel purple ring with a background-coloured offset. Focus order follows the visual and task order.
- Forms: every control has a persistent label, clear required state, programmatic error association, and helpful recovery language.
- Responsive: retain 40px minimum targets, allow text reflow at 320px wide, and do not hide critical context on smaller screens.
- Motion: honor reduced-motion preferences and never use flashing or rapidly repeating animation.
- Data: pair status colours with words and/or icons; provide accessible labels for charts and icon-only controls.

## 14. Ten design principles

1. **Clarity before conversion.** Explain rules, costs, and requirements before asking a user to act.
2. **Calm is premium.** Use measured space, restrained colour, and quiet motion; confidence does not need noise.
3. **One primary action.** Each view should make the next meaningful action obvious.
4. **Data earns its space.** Surface metrics only when they help a decision; otherwise remove or defer them.
5. **States are part of the product.** Empty, loading, pending, error, and success states deserve the same care as the happy path.
6. **Trust is specific.** Use exact terms, dates, values, and conditions instead of vague reassurance.
7. **Consistency compounds.** Reuse the design system before introducing a new pattern or visual exception.
8. **Progress must be legible.** Show what has happened, what remains, and what changes next in every critical flow.
9. **Accessibility is non-negotiable.** A polished interface that excludes users is not premium.
10. **Earn attention; do not demand it.** Every visual emphasis must map to importance, risk, or action—not marketing pressure.

## Governance

Before adding a component, page, illustration, or piece of copy, review it against this document and the existing UI primitives. New visual tokens, interaction patterns, or component variants require a documented reason and should be added to the design system—not recreated locally in a feature. This preserves a coherent TradeForge experience as the product grows.
