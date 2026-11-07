---
name: Miracle Feng Shui
description: A storefront for feng shui decor, jewelry, candles, crystals and books, set in black ink on warm stone.
colors:
  stone: "#EEEBE3"
  ink: "#141210"
  ink-muted: "#5E5A52"
  ink-fill: "#3A3632"
  logo-purple: "#431769"
  gold: "#E7A93B"
  veil-top: "#FBFAF6"
  veil-bottom: "#E2DDD1"
  tile-white: "#FFFFFF"
  selection-wash: "#F3DDA8"
  scrollbar-thumb: "#C9C3B5"
typography:
  display:
    fontFamily: "Charis SIL, Charter, Cambria, Georgia, serif"
    fontSize: "96px"
    fontWeight: 700
    lineHeight: 0.96
    letterSpacing: "-0.03em"
  headline:
    fontFamily: "Charis SIL, Charter, Cambria, Georgia, serif"
    fontSize: "36px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.02em"
  title:
    fontFamily: "Charis SIL, Charter, Cambria, Georgia, serif"
    fontSize: "24px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-0.01em"
  wordmark:
    fontFamily: "Charis SIL, Charter, Cambria, Georgia, serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  body:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.625
  nav-label:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 500
  button-label:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1
  card-name:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "15px"
    fontWeight: 600
    lineHeight: 1.375
  card-price:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "17px"
    fontWeight: 700
    fontFeature: "\"tnum\""
  caption:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 400
  column-head:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "13px"
    fontWeight: 600
  photo-label:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "\"tnum\""
  badge:
    fontFamily: "Geist, Helvetica Neue, Arial, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1
    fontFeature: "\"tnum\""
rounded:
  sharp: "0px"
  label: "2px"
  thumb: "6px"
  inset: "8px"
  tile: "10px"
  panel: "14px"
  pill: "9999px"
spacing:
  gutter-phone: "16px"
  gutter: "24px"
  container: "1280px"
  grid-gap-phone: "12px"
  grid-gap: "20px"
  section-gap-phone: "64px"
  section-gap: "96px"
  tile-pad: "24px"
  card-pad: "16px"
components:
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.stone}"
    typography: "{typography.button-label}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 24px"
  button-outline:
    textColor: "{colors.ink}"
    typography: "{typography.button-label}"
    rounded: "{rounded.pill}"
    height: "48px"
    padding: "0 24px"
  button-outline-hover:
    backgroundColor: "{colors.tile-white}"
  text-link:
    textColor: "{colors.ink}"
    typography: "{typography.button-label}"
  product-card:
    textColor: "{colors.ink}"
    rounded: "{rounded.sharp}"
    padding: "14px 16px 16px"
  product-card-name-hover:
    textColor: "{colors.logo-purple}"
  photo-label:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.tile-white}"
    typography: "{typography.photo-label}"
    rounded: "{rounded.label}"
    padding: "4px 8px"
  category-tile:
    textColor: "{colors.ink}"
    typography: "{typography.title}"
    rounded: "{rounded.sharp}"
    padding: "14px 16px 16px"
  bento-tile:
    backgroundColor: "transparent"
    textColor: "{colors.ink}"
    rounded: "{rounded.sharp}"
    padding: "{spacing.tile-pad}"
  header:
    backgroundColor: "{colors.stone}"
    textColor: "{colors.ink}"
    height: "72px"
  nav-item:
    textColor: "{colors.ink}"
    typography: "{typography.nav-label}"
    rounded: "{rounded.pill}"
    height: "40px"
    padding: "0 12px"
  nav-item-hover:
    textColor: "{colors.logo-purple}"
  nav-panel:
    backgroundColor: "{colors.tile-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "12px"
  panel-row:
    textColor: "{colors.ink}"
    typography: "{typography.nav-label}"
    rounded: "{rounded.tile}"
    height: "44px"
    padding: "0 12px"
  panel-row-hover:
    backgroundColor: "{colors.stone}"
  count-badge:
    backgroundColor: "{colors.logo-purple}"
    textColor: "{colors.tile-white}"
    typography: "{typography.badge}"
    rounded: "{rounded.pill}"
    height: "18px"
    padding: "0 4px"
  avatar:
    backgroundColor: "{colors.logo-purple}"
    textColor: "{colors.tile-white}"
    rounded: "{rounded.pill}"
    size: "36px"
  thumbnail:
    backgroundColor: "{colors.stone}"
    rounded: "{rounded.thumb}"
    size: "48px"
---

# Design System: Miracle Feng Shui

## Overview

**Creative North Star: "Stone & Gold"**

A quiet stone page where full-colour product photography carries the colour, set off by black ink, black pills and a bold brand serif. The ground is warm stone, text and controls are near-black ink, and the photographs are the only saturated thing on screen. The world comes from the user's reference image (`public/images/image.png`: stone ground, black ink, black pills), with the reference's lime replaced by the logo purple.

Colour outside the photographs is rationed to two marks. Logo purple is a small identity mark: the logo, the avatar, count badges, hover text and a saved heart. Gold never sits on the page at rest; it appears only as a soft warm shadow that rises under a black pill or a card when the pointer is on it. There is no ambient motion, no pointer glow and no decorative illustration. Image zoom and the gold hover shadow are the only movement.

Scope. This system is shipped on the homepage, the navbar (with its dropdown panels and phone menu), the footer, the shop product card, the category tile, the profile page (identity card, tabs, orders, settings cards and forms), the shop page's search and Filters button, every storefront drawer (product details, filters, checkout, address details), and the sign in and search pop-ups. The shop page's applied-filter pills, the cart page and the order confirmation page still carry lilac-era component styling and are **pending migration to Stone & Gold** (see Components). The admin panel has its own black-and-white working style and is outside this system.

**Key Characteristics:**
- Warm stone ground, black ink, photographs as the only colour.
- A bold brand serif (Charis SIL, Charter's open edition) for display and the wordmark; Geist for everything else.
- Black full pills and outline pills as the only buttons.
- Sharp, lightly outlined product cards and category tiles that let the stone show through.
- Logo purple for small marks only; gold only as a hover shadow.
- No ambient motion.

## Colors

Warm neutral stone and black ink, with one small purple mark and one warm gold that only exists on hover.

### Primary
- **Ink** (#141210): all text, icons, the primary pill fill, the outline pill stroke, hairline rules (at 15%), card outlines (at 25%), photo labels and the focus ring. It is warm black, never pure #000.

### Secondary
- **Logo Purple** (#431769): taken from the logo. Used only for small marks: the logo, the account avatar, count badges, footer column heads, hover text on nav items and card names, the active nav label and the filled saved heart.

### Tertiary
- **Gold** (#E7A93B): never painted on the page. It exists only as the soft hover shadow under black pills (45% alpha) and under product cards and category tiles (35% alpha).

### Neutral
- **Stone** (#EEEBE3): the storefront page ground (also exposed as `page-ground`), the scrolled navbar backing, the phone menu sheet, the text on black pills, thumbnail wells and panel-row hover.
- **Ink Muted** (#5E5A52): secondary text: category captions, product counts, tile body copy, emails, the copyright line, struck-through prices and menu icons.
- **Ink Fill (#3A3632):** a warm charcoal for every solid fill: black pills, the selected profile tab, photo labels (rating, Out of stock), View item and empty-state buttons. Softer than Ink, which stays the text colour. Chosen by the user over pitch black.
- **Veil Top / Veil Bottom** (#FBFAF6 to #E2DDD1): the vertical gradient of the interface glass (the footer sheet, and the drawers and pop-ups still pending migration). Veil Bottom is also the photo well behind product and category images while they load.
- **Tile White** (#FFFFFF): nav dropdown panels, phone-menu category and social tiles, text on Ink labels and on Logo Purple.
- **Selection Wash** (#F3DDA8): text selection background, with Ink text.
- **Scrollbar Thumb** (#C9C3B5): the page scrollbar on a Stone track.

### Named Rules
**The Photographs Carry The Colour Rule.** Everything that isn't a product or category photo is stone, white, or ink, with one exception: a few homepage bento tiles are filled with Logo Purple or Ink Fill and carry a line illustration (see Illustrations). If any other surface needs colour to be interesting, it needs a photograph instead.

**The Small Mark Rule.** Logo Purple is for the logo, avatar, count badges, column heads, hover text and the saved heart. Never a fill larger than a badge or avatar, never a button, never a background.

**The Gold Is Light Rule.** Gold is a hover shadow under black pills, product cards and category tiles, nothing else. No gold text, fills, borders, icons, glows that follow the pointer, or static gold at rest.

## Typography

**Display Font:** Charis SIL (Charter's open-licence edition, loaded through next/font as `--font-charis`), with Charter, Cambria and Georgia fallbacks
**Body Font:** Geist (next/font, `--font-geist-sans`), with Helvetica Neue and Arial fallbacks

**Character:** A sturdy, bookish brand serif in bold speaks the headline and names things; a plain, precise grotesque does all the interface work. The serif is the wordmark's own face, so the page headline and the logo read as one voice.

### Hierarchy
- **Display** (700, `clamp(40px, 6.8vw, 96px)`, 0.96, -0.03em, balanced wrap): the homepage headline only, full width, capped at 96px.
- **Headline** (700, 28px on phones / 36px from 640px, tight, -0.02em): section headings ("New arrivals", "Shop by category", "Your corner").
- **Title** (700, 21px / 24px, -0.01em): bento tile titles; category tile names use the same serif at 17px / 21px. The phone menu's index rows use the title size (24px).
- **Wordmark** (700, 19px / 21px, 1, tight): "Miracle feng shui" beside the logo. The footer repeats it as a giant decorative band at 7% Ink.
- **Body** (400, 15px, 1.625): tile copy and empty states, in Ink Muted.
- **Nav label** (500, 15px): navbar links and panel rows.
- **Button label** (600, 15px, 1): pills and underlined text links.
- **Card name** (600, 12.5px / 15px, snug, 2-line clamp) and **card price** (700, 12px / 17px, tabular figures).
- **Caption** (400, 11.5px / 13px): category under a product name, low-stock note (500, Ink), copyright.
- **Column head** (600, 13px, Logo Purple): footer group heads, sentence case.
- **Photo label / badge** (600, 10–11px, tabular): rating and Out of stock labels, count badges.

### Named Rules
**The One Serif Rule.** The brand serif is the only display face. Don't introduce Young Serif, Playfair, Cinzel or any second display family on storefront surfaces.

**The Set It On The Span Rule.** `globals.css` gives `body`, buttons and `h1`–`h4` their own font family and colour outside Tailwind's layers. Put `font-display` / `font-geist` and the colour on an inner span inside every heading, link and button, as the shipped components do.

**The Sentence Case Rule.** Headings, labels and column heads are sentence case at normal tracking. No tracked capitals, no small label above a heading.

## Layout

Content sits in a centred container up to 1280px wide, with 16px gutters on phones and 24px from 640px. Homepage sections stack with 64px between them on phones and 96px from 640px; the headline block sits above with its own 32–56px top and 56–80px bottom space.

Every section opens with the same heading row: a 1px Ink-at-15% hairline across the full container, then the serif headline on the left and an optional underlined text link (View all, All products) on the right, baseline-aligned, 20–24px below the rule. Content starts 24–32px under the heading.

- **Product and category grids:** 2 columns on phones, 4 from 768px, with 12px gaps on phones and 20px from 640px. New arrivals shows 8 products on desktop and the first 4 on phones.
- **Bento:** 1 column on phones (account, cart, favorites, socials; Best sellers is hidden on phones); from 640px Best sellers moves to the top as a full-width shelf with the other four tiles 2 by 2 below; from 1024px those four sit in one row of 4 and the shelf shows 4 products at 4:3. 16px gaps. Guests (and while the session loads) see only Best sellers and the socials tile (just socials on phones): stacked on tablets, side by side from 1024px with Best sellers spanning three columns.
- **Breakpoints:** 640px (gutters, type step), 768px (navbar switches to desktop, grids go to 4), 1024px (bento goes to 4).
- **Navbar:** 64px tall on phones, 72px from 768px, sharing the 1280px container.

## Elevation & Depth

Flat by default. The page is one plane of stone; cards are outlined, not lifted, and the only shadows at rest belong to interface layers (the scrolled header hairline, dropdown panels and the footer sheet). Depth on content is a response to hover, and that response is warm gold light rather than a dark drop.

### Shadow Vocabulary
- **Gold pill glow** (`box-shadow: 0 10px 28px rgba(231,169,59,0.45)`): under a black pill on hover, over 300ms.
- **Gold card glow** (`box-shadow: 0 14px 36px rgba(231,169,59,0.35)`): under a product card or category tile on hover, over 500ms.
- **Header hairline** (`box-shadow: 0 1px 0 rgba(20,18,16,0.1)`): under the navbar once it takes its stone backing (Stone at 95% with medium backdrop blur).
- **Panel drop** (`box-shadow: 0 18px 40px rgba(20,18,16,0.12)`): under the white Categories and account dropdowns.
- **Footer glass** (`box-shadow: 0 -6px 10px rgba(20,18,16,0.12), inset 0 2px 0 rgba(255,255,255,0.7), inset 0 -3px 5px rgba(20,18,16,0.12)`): the footer sheet's upward lift, bright top rim and soft lower shade.

### Named Rules
**The Flat Until Touched Rule.** Content surfaces carry no shadow at rest. A card or pill gains depth only on hover, and only as gold light.

## Shapes

Two geometries meet: sharp rectangles for what shows products, soft rounds for what you press or what frames you.

- **Sharp (0px):** product cards and category tiles, with a 1px Ink-at-25% outline and a transparent body so the stone shows through. Photos run full bleed to the outline.
- **Label (2px):** the black photo labels (rating, Out of stock); they read as cut tags.
- **Thumb (6px):** small product photos in the navbar and search (bento photos are sharp).
- **Inset (8px):** social platform rows inside a tile, category photos in the dropdown.
- **Tile (10px):** phone-menu tiles and panel rows. Bento tiles are sharp, like the product card.
- **Panel (14px):** the white dropdown panels.
- **Pill (full):** every button, nav item hit area, badge and avatar.

Rules are hairlines: 1px Ink at 15% above section headings, card price rows and footer copyright; Ink at 10% inside white panels.

## Components

### Buttons
*Black ink and stone, the reference image's own pill.*
- **Shape:** full pill, 48px tall, 24px side padding.
- **Primary:** Ink Fill, Stone label (button label type). Used once per tile at most (View cart, Sign in in the Profile tile).
- **Outline:** 1.5px Ink stroke, transparent, Ink label; hover fills Tile White. Used for secondary guest invitations (Cart and Favorites tiles).
- **Hover / Focus:** primary gains the gold pill glow over 300ms; focus is the site-wide 2px Ink outline at 2px offset.
- **Text link:** Ink, button label type, 1.5px underline at 6px offset. On hover the text turns Logo Purple (`TextLink` in `home/components/homeUi.tsx`).

### Product Card (signature)
*`shop/components/ShopProductCard.tsx`, used on the homepage and (with lilac-era surroundings) the shop and favorites grids.*
- **Shape:** sharp corners, 1px Ink-at-25% outline, transparent background, equal heights in a row. The whole card opens the product.
- **Photo:** full bleed, square on phones and 5:4 from 640px, on a Veil Bottom well; zooms to 1.04 over 700ms on hover. Out of stock dims the photo to 60%.
- **Labels on the photo:** sharp black labels with white tabular text: Out of stock at top left, the admin-entered rating (star + number, hidden at 0) at bottom left. No discount, bestseller or other badges.
- **Details:** the name (card name type, 2 lines max), then its category caption in Ink Muted, then a low-stock note ("Only N left") under 10 in stock.
- **Price row:** under a 1px Ink-at-15% hairline at the card's foot: any real compare-at price struck through in Ink Muted, then the price in bold. The heart sits in this row with no ring or fill: left of right-aligned prices on phones, right of left-aligned prices from 640px. No arrow or chevron.
- **Hover:** the gold card glow, the photo zoom, and the name turning Logo Purple. The heart turns Logo Purple on its own hover and fills Logo Purple when saved.

### Category Tile
*`home/components/LatestCategories.tsx`.* The product card's treatment: sharp, Ink-at-25% outline, transparent, gold card glow and photo zoom on hover. A 4:5 photo (or a large faded serif initial when there is no image), then the name in the serif at title weight turning Logo Purple on hover, and a product count caption.

### Bento Tile
*`home/components/bento/`.* The same box as the product card: sharp corners, a 1px Ink-at-25% outline, the page showing through, and 20px / 24px padding; serif title, then content that pushes its action to the bottom. Signed in, Your account shows the name and email, then a sharp Logo Purple block (at least 96px, growing to fill the tile from the email down to the buttons) with the white serif initials (first and last initials, or a one-word name's first and last letters), exactly as wide as the Orders and Settings buttons below it. Guests see a reason line in Ink Muted and a sharp 48px button (Ink Fill in Profile, a 1px Ink outline in Cart and Favorites). Photos and thumbnails are sharp on Veil Bottom (Best sellers puts View all as a sharp 40px outlined button on the right of its title row. Favorites shows no photos: a line saying the saved pieces are waiting, the saved count and View all, over a large dark ink brush-stroke heart in the bottom right whose tail sweeps off the right edge, from 640px only); social platform rows are sharp with an Ink-at-15% outline, the platform's own full-colour icon, and a faint white hover. Loading shows pulsing Ink-at-10% bars.

- **Filled tiles:** two tiles break the outline for rhythm, each with sharp corners and an illustration. *Follow along* is filled Logo Purple: stone title, platform rows with a Stone-at-30% outline, each brand icon on a small stone square, and three neighbours drawn along the bottom edge. *Your cart* (signed in) is filled Ink Fill: stone title and text at 80%, a stone *View cart* block with an ink label, thumbnails ringed in the fill, a hand-drawn shopping bag (a candle, a crystal and a money tree sprig peeking out, a gold lucky coin as its tag), centred between the message ("Your cart is empty." or the item summary) and the action (Browse all products or View cart), 144px tall (160px from 640px).

### Illustrations
*`public/illustrations/`, credits in `CREDITS.md`.* Hand-drawn line art in one voice: Open Peeps figures (CC0) rendered to static SVG, plus objects from the shop's world drawn in the same line (the cart's shopping bag with its lucky coin tag). People appear only where the tile is about people (socials); a tile about a thing shows the thing. Lines are Stone on a filled tile and Ink on the page; the only fills are the tile colour, Gold for coins and charms, and the drawing's own blocks. Ink brush marks (the Favorites heart: one variable-width stroke, dry-brush edge, soft smudge) are the one exception to the even line. Illustrations are decorative (`aria-hidden`, empty alt), never carry information, and sit only on filled bento tiles for now. New drawings use the same stroke weight and these colours; no gradients, no shadows, no rounded tile corners around them.

### Navigation
*`components/Header.tsx`, `components/nav/`.*
- **Bar:** sticky and open on the page (transparent) at the top; once the page scrolls or the phone menu opens it takes a Stone-at-95% backing with blur and the header hairline.
- **Desktop (768px up):** three zones. Left: the round logo and the serif wordmark. Centre: Categories (with a chevron that turns over) and Products. Right: Search (icon, with label from 1024px), then Sign in for guests or a Favorites heart with a purple count, then the cart as a trolley icon with a purple count badge, then the Logo Purple avatar for signed-in customers.
- **Items:** nav label type in Ink, 40px tall pill hit areas; hover and the active page turn the label Logo Purple. No filled hover backgrounds.
- **Dropdowns:** white 14px panels with the panel drop, fading and sliding 4px over 200ms. Categories shows the 4 newest categories as photo tiles (8px) with an underlined All products link; the account panel shows name and email, My orders, Your profile and Sign out as rows that take a Stone hover. Escape or a press outside closes them.
- **Phones:** the bar holds the brand, a search icon, a favorites heart and a two-line menu button that crosses into an X. The menu is a full Stone sheet under the bar, set as a serif index: 56px rows in the brand serif at regular weight and 24px (the user found bold here heavy), divided by Ink-at-15% hairlines, the whole row tappable, turning Logo Purple on hover. All products (arrow on the right) with the newest categories under it as 17px Ink Muted serif links, then Search, then Cart and Favorites (count badges on the right), My orders, Your profile and Sign out, or Sign in for guests. A pinned foot holds Instagram and Facebook as 44px white icon tiles beside a sharp INR / AED switch (selected half in Ink Fill), with the AED note under them. While it is open the bar keeps only the brand and the X: its Search, Favorites and (on the shop page) Cart icons fade out in place, since the menu lists them. The sheet sits at z-60, above the z-50 bottom bars (profile tabs, cart bar) and below drawers and pop-ups. The page stops scrolling behind it.
- **Count badges:** an 18px Logo Purple pill with white tabular text.

### Footer
*`components/Footer.tsx`; hidden on the profile and admin.* A full-width sheet of the veil gradient with the footer glass shadow. The 1280px container holds the logo, a serif line naming what the shop sells and the social icons, then Shop, Your account and About columns with Logo Purple heads and Ink links that turn Logo Purple on hover. The copyright and region sit below a hairline. A giant wordmark at 7% Ink fills the container width and sinks past the bottom edge, decorative and hidden from screen readers. Guest account links open the sign in modal.

### Drawers
*`shop/components/ProductDetailsDrawer.tsx`, `ShopFilterDrawer.tsx`, `ProductReviews.tsx`, `cart/components/CheckoutDrawer.tsx`, `profile/components/AddressDetailsDrawer.tsx`, shared controls in `profile/components/profileUi.tsx`.*

Glass sheets from the right edge with square corners over a page dimmed with Ink at 25% and blur: the filter drawer up to 400px, the product details, checkout and address drawers up to 520px and full width on phones. They keep their behaviour (described under the surfaces below) and wear the system: Geist for every label and value, the brand serif in bold for names and section headings, Ink text with Ink Muted secondary text, Ink hairlines, and no purple except selected or hovered text and small marks.

- **Primary action:** a sharp 48px Ink Fill block with a Stone label and the gold hover shadow (Add to Cart, Login to cart, Pay now, Save address, Show N products).
- **Secondary action:** a sharp 48px block with a 1px Ink border and an Ink label that turns Logo Purple on hover (Buy It Now, Cancel).
- **Fields:** sharp 48px inputs with an Ink-at-25% border, 16px Geist text and an Ink caret; focus darkens the border to Ink with a soft Ink ring.
- **Tabs and options:** the selected tab or option turns Logo Purple with a 2px Ink underline or a check mark; others are Ink.
- **Cards inside:** Settings and drawer content cards are boxes with a 1px Ink-at-25% outline on the page, like the product card.

### Surfaces pending migration to Stone & Gold
These still carry lilac-era component styling (Awakened Violet #7A2FC0 text states, Muted Plum #5B4A70 secondary text, the Outfit interface font, and the goo-shell thread motion in `components/GooNavShell.tsx`). Their glass now renders in stone because the veil tokens changed. Their behaviour below is current; their look is not the system and must not be copied into new work.

- **Shop filter bar:** *Migrated:* a sharp search field (1px Ink at 25%, 16px text, clear button) that searches the server about 400ms after typing stops and on Enter, and a sharp Filters button: outlined at rest, Ink Fill with a Stone count square while filters are applied, icon-only on phones where search and Filters share the full width. On the shop page the navbar has no search; signed-in customers get the cart icon before Favorites instead. *Pending:* the applied-filter pills and Clear all link.
- **Product details drawer** (*migrated, see Drawers*): every product link opens it (`/shop?product=<id>`), from the right, up to 520px, full width on phones. Product details and Reviews tabs; fixed footer with Buy It Now and Add to Cart, which become View cart and a disabled Already in cart when the product is in the cart; guests get Login to cart. Reviews never change the product's rating. Only stored claims are shown.
- **Cart page and checkout drawer** (*checkout drawer migrated, see Drawers; the cart page is pending*): item cards with quantity capped at stock, Remove with Undo, a sticky summary on desktop and a fixed bottom bar on phones. Checkout is a right drawer with Deliver to, Payment and Order Summary; the total is exactly what's charged, it can't close or double-submit while processing.
- **Profile page:** Settings, Favorites and Orders; a sticky left column on desktop and a fixed bottom bar on phones. *Migrated:* the identity card uses the product card treatment (sharp corners, 1px Ink at 25%, transparent) with Logo Purple initials in a circle (56px phones, 80px desktop), the name in bold display serif and email and join date in Ink Muted. The tabs are sharp-cornered 48px rows stacked in one box on desktop (1px Ink at 25% outline, Ink-at-15% hairlines between rows) and 44px blocks in a Stone bar with a hairline top on phones, matching the cards; the selected tab fills Ink Fill with Stone text, others turn Logo Purple on hover. *Orders:* each order is a sharp box with a 1px Ink-at-25% outline on the page; the order number in bold display serif, date in Ink Muted, total bold; status in Ink (red #8F1610 only for cancellations); actions are sharp 40px bordered buttons (Cancel red outline; once a cancellation is approved on an order paid online, Refund and its pending state in the yellow refund colours; a requested cancellation shows only its red status); item rows with sharp photos, Ink names that turn Logo Purple on hover and a sharp View item button in Ink Fill with a Stone label and the gold hover shadow; Download invoice and Get help as underlined Ink links. *Settings:* the cards, buttons and fields now use the Drawers controls below. Order cancellation is one request per order and never promises a refund; refunds are requested, then approved by the owner.
- **Auth modal and search modal** (*migrated*): one sharp stone-glass panel (1px Ink at 10%, soft Ink shadow) over the page dimmed with Ink at 25%, fading and rising 4px in over 200ms; no pill, thread or goo. *Auth:* Sign in and Create account as text tabs in a 56px top row, the selected one in Logo Purple with a 2px Ink underline, a close button on the right; then a bold display heading, a purpose line, Drawers-style fields and a full-width Ink Fill submit with the gold hover shadow; errors in a sharp red-outlined box above the form. *Search:* the search field in the 56px top row with Clear and close; with no query, sharp category chips (Ink at 20%) and the 4 newest products; while typing, up to 6 server results as sharp-thumbnail rows and a See all results row.
- **Order confirmation:** a one-time seal animation on arrival for paid or pay-on-delivery orders only, then a summary with copyable Order and Payment IDs.

## Do's and Don'ts

### Do:
- **Do** keep the page Stone (#EEEBE3) and every text and control Ink (#141210), letting the photographs supply the colour.
- **Do** open every homepage section with the hairline rule, the bold serif headline and, where useful, an underlined text link on the right.
- **Do** use the black full pill for the single main action and the outline pill for secondary ones, both 48px tall.
- **Do** use the product card's sharp, Ink-at-25% outlined, transparent treatment for anything that shows products or categories.
- **Do** limit hover to three things: text turning Logo Purple, the photo zooming to 1.04, and the gold glow under pills and cards.
- **Do** keep focus visible as the 2px Ink outline, and honour reduced motion (all transitions collapse).
- **Do** put font and colour classes on an inner span inside headings, links and buttons.

### Don't:
- **Don't** paint Gold anywhere at rest: no gold text, fills, borders, icons or pointer-following glow.
- **Don't** use Logo Purple for buttons, backgrounds or large fills; it is for the logo, avatar, badges, column heads, hover text and the saved heart.
- **Don't** give product cards or category tiles rounded corners or a full-black outline; the user rejected the heavy outline.
- **Don't** add discount or bestseller badges, arrows or chevrons to product cards.
- **Don't** add a description or buttons under the homepage headline, or exceed 96px for it.
- **Don't** use Young Serif or any second display face; the brand serif is the only one.
- **Don't** turn the navbar cart into a pill; it is an icon with a count badge.
- **Don't** add ambient or looping motion to storefront pages.
- **Don't** copy lilac-era styling (Awakened Violet, Muted Plum, Outfit, goo threads) from the pending surfaces into new work.
