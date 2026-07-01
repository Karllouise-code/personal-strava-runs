# Design Spec — Strava Activity Visualizer

## Color Palette

| Token | Hex | Usage |
|---|---|---|
| `page` | `#141416` | Page background (charcoal) |
| `card` | `#1c1c1e` | Card surface (one tone lighter) |
| `card-hover` | `#27272a` | Card hover / active darken |
| `accent` | `#2dd4bf` | Primary accent (muted teal) |
| `warning` | `#fc4c02` | Warning / negative states (Strava orange) |
| `--` | `#f5f5f7` | Primary text |
| `zinc-400` | `#a1a1aa` | Secondary text |
| `zinc-500` | `#71717a` | Muted text / placeholder |
| `zinc-600` | `#52525b` | De-emphasized meta |
| `zinc-800` | `#27272a` | Borders / dividers |
| `zinc-900` | `#18181b` | — |
| `zinc-950` | `#09090b` | — |

## Type Scale

| Element | Size | Weight | Tracking |
|---|---|---|---|
| Page title | `14px` / `text-sm` | `font-medium` | `tracking-tight` |
| Section title | `18px` / `text-lg` | `font-semibold` | `tracking-tight` |
| KPI value | `24px` / `text-2xl` | `font-bold` | — |
| KPI label / body | `14px` / `text-sm` | `font-normal` | — |
| Small meta | `12px` / `text-xs` | `font-normal` | — |
| Tab label | `14px` / `text-sm` | `font-medium` | — |

## Spacing Tokens (4px base)

| Token | Value | Usage |
|---|---|---|
| `space-y-14` | `56px` | Vertical gap between major sections |
| `p-6` | `24px` | Card inner padding |
| `p-4` | `16px` | Dense card inner padding |
| `gap-2` | `8px` | KPI grid gap |
| `gap-3` | `12px` | Filter bar gap |
| `mb-4` | `16px` | Section title → card gap |
| Touch target min | `44px` | Buttons, clickable rows |

## Card Design (Before → After)

### Before (decorative chrome)
```
bg-white/[0.03] backdrop-blur-2xl rounded-2xl border border-white/[0.06] shadow-2xl
```

### After (flat minimal)
```
bg-card border border-zinc-800 rounded-xl
```

## Weekly Distance Chart (Before → After)

**Before:** `h-[200px]`, cyan accent `#00e5ff`, double dataset (line + glow), small card

**After:** `h-[260px]`, muted teal accent `#2dd4bf`, single dataset with subtle gradient fill, larger card `p-6`, subtle tooltip styling. Weekly distance card is the primary visual focal point of the dashboard.

## Progress Bars (Before → After)

**Before:** `h-2`, Strava orange `#fc4c02`
**After:** `h-1.5`, accent teal `#2dd4bf`

## Inputs & Filters (Before → After)

**Before:** Rounded filled inputs with `bg-white/[0.04] border border-white/[0.07] rounded-xl`, orange focus glow

**After:** Underline inputs with `bg-transparent border-b border-zinc-700`, teal focus underline `border-accent`, no border-radius, no shadow

## Activity Rows

- Uniform rows with `divide-y divide-zinc-800/50`
- No per-row background colors (removed PR highlight)
- Hover state: `hover:bg-zinc-800/30`
- Touch-friendly min-height: `min-h-[52px]`
