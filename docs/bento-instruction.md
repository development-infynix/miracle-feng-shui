# Bento illustrations: handoff

Brief for the next agent continuing the homepage bento ("Your corner") in the Miracle feng shui storefront (Next.js App Router, Tailwind v4, TypeScript). Read `DESIGN.md` first; it is the source of truth for the Stone & Gold visual system. This file covers only the bento and its illustrations.

## Goal

Give the bento more hand-drawn illustrations about the shop's world (feng shui: luck, wealth, calm, protection, home). Wanted next, in this order:

1. **Lucky cat** (maneki-neko, one paw raised, a coin held to its chest)
2. **Money tree** (jade or money tree in a pot, round leaves, coins hanging from branches)
3. **Lantern** (Chinese paper lantern with a tassel)
4. **Dragon** (a friendly, simple coiled dragon, not aggressive)

Style reference the owner liked: `public/images/img2.webp` (its bottom five cards). Hand-drawn ink line art, flat fills, mixed tiles. Ignore its green and red colours and its rounded corners; we use our own palette and sharp corners.

## Current state (what's already built)

- `home/components/HomeBento.tsx`: the layout.
  - Signed in: Best sellers is a full-width shelf on top (from 640px), then Account, Cart, Favorites and Socials in a row of 4 (2 by 2 on tablets, 1 column on phones).
  - Guests and while the session loads: only Best sellers (3 columns) plus Socials (1 column) from 1024px; stacked below that.
- `home/components/bento/BentoTile.tsx`: the tile shell. `tone` is `'outline' | 'purple' | 'charcoal'` and `art` is an optional illustration node the tile places itself. Title and content sit above the art (`z-10`).
- `home/components/bento/SocialsTile.tsx`: `tone="purple"`, three Open Peeps neighbours along the bottom edge (`Neighbours`).
- `home/components/bento/CartTile.tsx`: `tone="charcoal"`, the hand-drawn shopping bag (`/illustrations/cart-bag.svg`) centred between the message ("Your cart is empty." or the item summary) and the action.
- `home/components/bento/ProfileTile.tsx`, `FavoritesTile.tsx`, `BestSellersTile.tsx`: outlined, no illustration yet.
- `home/components/homeUi.tsx`:
  - `PillLink` / `PillButton` have variants `primary` (charcoal), `outline` and `light` (stone block for filled tiles).
  - `TextLink` takes `light`.
- Art lives in `public/illustrations/`, with credits in `public/illustrations/CREDITS.md`. Every new file gets a credit line there.

## Illustration rules (keep exactly)

- **Line:** stone `#EEEBE3` on filled tiles, ink `#141210` on outlined tiles. Stroke about 5 at a ~240px viewBox, round caps and joins, `fill="none"` by default. Thin details use stroke 2.5–3.
- **Fills:** only the tile's own colour (so shapes read as solid against the tile), gold `#E7A93B` for coins, charms, flames and lucky accents, and at most one small logo-purple `#431769` mark on an outlined tile. No gradients, no shadows, no textures, no other hues.
- **Feel:** loose and hand-drawn, slightly uneven lines, a friendly tone. Match the Open Peeps figures in `SocialsTile` and the cart bag.
- **Accessibility:** decorative only. Use `alt=""` plus `aria-hidden="true"`, and never put meaning or text in the drawing.
- **Format:** static SVG files in `public/illustrations/`, loaded with `<img loading="lazy">`. Don't add an illustration npm package to the app; render to static files outside the app if needed. (Open Peeps were rendered with `react-peeps` in a scratch folder.)
- **Subject:** people only where the tile is about people (Socials). A tile about a thing shows the thing.
- **Tiles:** sharp corners everywhere, no `rounded-*` on tiles, buttons or photos. The only round things are avatars, coins and badges.

## Brand tokens (from `app/globals.css`)

| Token | Value | Use |
|---|---|---|
| `stone` / page ground | `#EEEBE3` | page, light lines |
| `ink` | `#141210` | text, dark lines |
| `ink-muted` | `#5E5A52` | secondary text |
| `ink-fill` | `#3A3632` | charcoal filled tiles and buttons |
| `logo-purple` | `#431769` | Socials tile fill, small marks, hover text |
| `gold` | `#E7A93B` | hover glow, coins and charms in drawings |
| veil bottom | `#E2DDD1` | photo wells |

Fonts: display is Charis SIL (Charter, `font-display`, bold for headings); UI is Geist (`font-geist`). Text styles go on an inner `<span>`, because `globals.css` sets colour and font on links, buttons and headings outside Tailwind's layers.

## Suggested placement

| Drawing | Tile | Treatment |
|---|---|---|
| Lucky cat | Your account (`ProfileTile`) | Could become a filled tile (purple or charcoal), or stay outlined with ink line. Cat bottom right, content left. |
| Money tree | Favorites (`FavoritesTile`) | Outlined, ink line, gold coins on the branches. Bottom right, small enough that the favorites thumbnails stay readable. |
| Lantern | Empty and guest states (empty cart, no favorites) | Small, beside the message. |
| Dragon | Best sellers shelf, or a future "New arrivals" accent | A coiled dragon along one edge of the shelf. Keep it light so the product photos stay the hero. |

Keep at most two or three filled tiles in the bento at once. The rest stay outlined so the grid has rhythm, not noise.

## How to add one

1. Make the SVG (hand-coded, or commissioned or AI-generated line art cleaned up to the rules above) and save it to `public/illustrations/<name>.svg`.
2. Add its credit line to `public/illustrations/CREDITS.md`.
3. In the tile, pass `art={...}` to `BentoTile`. Position it absolutely (bottom right, slightly bleeding off the edge with negative offsets), like the cart bag, or in the flow at the bottom like the Socials neighbours. Add `pointer-events-none`.
4. If the tile becomes filled, switch text to stone (`text-stone`, `text-stone/80`), buttons to `variant="light"`, links to `light`, and skeletons to `<SkeletonLine light />`. Limit content width (for example `max-w-[62%]`) when the art sits beside it.
5. Update the Bento Tile and Illustrations sections in `DESIGN.md`.

## Verify

- `npx tsc --noEmit -p .` and `npx eslint <changed files>`: no errors.
- `npx vitest run`: all tests pass (198 at handoff).
- Look at the homepage at 1440px and at 390px, signed out and signed in. Headless Chrome on Windows can't make a window narrower than ~500px, so for phone captures load the page in a 390px-wide `<iframe>`.
- Check that the drawing never covers text or buttons, that lines are crisp at 1x, and that the tile still reads clearly with the drawing hidden.

## Don't

- Don't touch the admin (`app/admin`, `components/admin`).
- Don't round corners or add gold as text or a fill outside drawings and hover glows.
- Don't use people for object tiles.
- Don't edit `DESIGN.md` tokens without the owner's approval.
- The database in `.env` is shared with the public test app: don't write data while testing.
