---
name: Miracle Feng Shui
description: A storefront for feng shui decor, jewelry, candles, crystals and books, with navigation made of liquid glass.
colors:
  royal-amethyst: "#431769"
  deep-plum: "#3A1F62"
  awakened-violet: "#7A2FC0"
  lilac-mist: "#F3ECFB"
  lilac-depth: "#DCCDF0"
  thread-lilac: "#E6DBF3"
  ink: "#111111"
  dusk-plum: "#2B1A3F"
  muted-plum: "#5B4A70"
  veil-plum: "#2B154C"
  page-white: "#FFFFFF"
typography:
  wordmark:
    fontFamily: "Charter, 'Charter Bitstream', Cambria, Georgia, serif"
    fontSize: "21px"
    fontWeight: 700
    lineHeight: 1
    letterSpacing: "-0.025em"
  nav-label:
    fontFamily: "Outfit, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    letterSpacing: "0.01em"
  menu-row:
    fontFamily: "Outfit, sans-serif"
    fontSize: "15px"
    fontWeight: 500
  input:
    fontFamily: "Outfit, sans-serif"
    fontSize: "16px"
    fontWeight: 500
  section-label:
    fontFamily: "Outfit, sans-serif"
    fontSize: "13px"
    fontWeight: 600
  caption:
    fontFamily: "Outfit, sans-serif"
    fontSize: "12px"
    fontWeight: 400
  card-title:
    fontFamily: "Outfit, sans-serif"
    fontSize: "16px"
    fontWeight: 600
  card-price:
    fontFamily: "Outfit, sans-serif"
    fontSize: "18px"
    fontWeight: 700
  image-label:
    fontFamily: "Outfit, sans-serif"
    fontSize: "11px"
    fontWeight: 600
rounded:
  thumbnail: "6px"
  card: "8px"
  row: "16px"
  panel: "28px"
  pill: "9999px"
spacing:
  thread-gap: "24px"
  row-inset: "12px"
  icon-target: "36px"
components:
  nav-pill:
    backgroundColor: "{colors.lilac-mist}"
    textColor: "{colors.ink}"
    typography: "{typography.nav-label}"
    rounded: "{rounded.pill}"
    height: "56px"
    padding: "0 16px"
  nav-pill-mobile:
    backgroundColor: "{colors.lilac-mist}"
    textColor: "{colors.ink}"
    rounded: "{rounded.pill}"
    height: "52px"
    padding: "0 8px 0 12px"
  drop-panel:
    backgroundColor: "{colors.lilac-mist}"
    textColor: "{colors.ink}"
    rounded: "{rounded.panel}"
    padding: "12px"
  nav-item:
    textColor: "{colors.ink}"
    typography: "{typography.nav-label}"
    height: "40px"
    padding: "0 12px"
  nav-item-hover:
    textColor: "{colors.awakened-violet}"
  nav-item-selected:
    textColor: "{colors.awakened-violet}"
  menu-row:
    textColor: "{colors.ink}"
    typography: "{typography.menu-row}"
    rounded: "{rounded.row}"
    height: "44px"
    padding: "0 12px"
  count-badge:
    backgroundColor: "{colors.royal-amethyst}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.pill}"
    height: "16px"
    padding: "0 4px"
  chip:
    textColor: "{colors.ink}"
    typography: "{typography.section-label}"
    rounded: "{rounded.pill}"
    height: "32px"
    padding: "0 10px"
  product-thumbnail:
    rounded: "{rounded.thumbnail}"
    size: "48px"
---

# Design System: Miracle Feng Shui

## Overview

**Creative North Star: "The Poured Thread"**

Everything that floats above the store is one body of liquid glass. A pill does not open a menu; it pours one. The second shape drains out of the first, stays joined by a thin thread of the same liquid, and is drawn back in when dismissed. In a shop about flow and connection, the navigation behaves the way the subject describes: nothing appears from nowhere, and connected things stay connected.

The glass is the only loud thing here. Products supply the colour and the imagery, so the chrome keeps to one family of lilac and plum, text stays dark and quiet, and interaction shows through a colour change, not extra shapes. The thread is the one authored motion moment, and it is worth more because nothing else competes with it.

This system currently covers the storefront header, the search modal, the customer sign in modal and the shop page. The rest of the storefront still uses an older Etsy-derived palette (the `etsy-*` tokens in `app/globals.css`), and the admin panel has its own restrained black-and-white working style. Treat the older storefront styling as not yet migrated, and don't copy it into new work. Leave the admin as it is unless asked.

**Key Characteristics:**
- Floating lilac glass pills on the shared goo filter, never on a solid header bar.
- A liquid thread linking every parent shape to whatever it opens.
- Text-only hover and selection: colour changes, no pills or fills.
- One purple family, with the products as the only other colour.
- Sharp product thumbnails set against soft, rounded glass.

## Colors

A single violet family, from pale lilac glass to near-black plum, on a white page.

### Primary
- **Royal Amethyst:** taken from the logo. Used for the logo mark, count badges, the account avatar, section labels, the **View all** link and panel icons.
- **Deep Plum:** the darker partner, used for focus rings.
- **Awakened Violet:** the state colour. Hover, selected and the keyboard-active row all use it, as does the text cursor. It never fills an area.

### Neutral
- **Lilac Mist and Lilac Depth:** the top and bottom of the glass gradient. Every pill and panel uses this exact pair.
- **Thread Lilac:** the solid midpoint that fills the thread, so it blends into both shapes it joins.
- **Ink:** default text and icons on glass.
- **Dusk Plum:** longer messages on glass, such as "no results" text.
- **Muted Plum:** secondary text on glass, such as placeholders and product categories. Never use a neutral gray on glass.
- **Veil Plum:** the tint behind blurred overlays, at 15% over the page for the phone menu and 25% for the search modal.
- **Page White:** the page background and text on Royal Amethyst. The page stays plain white so the glass is the only purple surface.

### Named Rules
**The State Is Violet Rule.** Hover, selected and active all mean text turning Awakened Violet. If a state needs anything else, question the state first.

**The Accent, Not The Ground Rule.** Purple belongs on the glass and small controls. Never tint a whole page or section lilac or purple: it was tried and read as generic AI styling, especially on phones.

**The Products Own Colour Rule.** Purple is the only chrome colour. Orange, green and other accents don't belong on glass, including highlights on a category or link.

## Typography

**Wordmark Font:** Charter (with Cambria and Georgia fallbacks)
**Interface Font:** Outfit (with sans-serif fallback)

**Character:** A bookish serif names the brand once, and a soft geometric sans does all the work around it. Outfit's round forms echo the pills they sit in.

### Hierarchy
- **Wordmark:** "Miracle feng shui" beside the logo, at 21px on tablet and up and 18px on phones.
- **Nav label:** the main links, the category pill and the Clear action.
- **Menu row:** rows in the phone menu.
- **Input:** the search field. It stays at 16px so iOS doesn't zoom when it's focused.
- **Section label:** "Browse categories" and "New arrivals", at a heavier weight in Royal Amethyst. Normal case, never tracked capitals.
- **Caption:** secondary lines such as a product's category.

### Named Rules
**The Set It On The Element Rule.** `globals.css` gives buttons and headings their own font and colour outside Tailwind's layers, so those override inherited styles and utilities. Inside glass, put `font-outfit` and the colour on an inner span of a button, link or heading. Skipping this produces the fallback font or the wrong colour.

## Layout

The header is a sticky, transparent strip holding a floating pill inside a container of up to 1040px, with 12px side margins on phones and 24px from the small breakpoint up. The strip ignores pointer events and only the shapes accept them, so the page stays clickable around the pill.

From the medium breakpoint (768px) up, the pill has three zones: brand on the left, main links in the centre, and social and account on the right. Below it, the pill holds only the brand and the bubble menu icon.

- **Tablet and up, category pill:** open on a visitor's first page load. Once they close it, it stays closed on later page loads until they open it again. While open, it pushes the page down instead of covering it. The space is reserved in CSS so the server render is already the right height.
- **Phones, menu panel:** floats over the page, which blurs and stops scrolling behind it.
- **Search modal:** a 640px column, placed 12vh from the top on tablet and up and at the top of the screen on phones.

Tall panels scroll inside themselves and keep within the viewport.

## Elevation & Depth

Depth comes from the material rather than a stack of shadows. A single soft violet drop shadow sits under the merged shape, and the puffiness comes from inside the filter: a bright rim along the top edge and a soft plum shade along the bottom. Real backdrop blur on the content layer lets the page show through the slightly translucent glass.

### Shadow Vocabulary
- **Glass lift** (`drop-shadow(0 6px 10px rgba(67, 23, 105, 0.14))`): under every goo shape, applied after the goo filter so the thread casts it too.
- **Top rim** (white at 70%, 2px inner offset): light catching the top edge, inside the filter.
- **Bottom shade** (Royal Amethyst at 16%, 3px inner offset, 2px blur): the underside of the glass, inside the filter.

### Named Rules
**The One Liquid Rule.** Joined shapes share one filtered layer, so the shadow and rim follow the merged outline. Don't add a `box-shadow` or border to a single pill; it breaks the illusion that they are one body.

## Shapes

Glass is fully round: pills use a full radius and panels use 28px. Corners inside the glass step down with their content: rows use 16px, chips are full pills, and product thumbnails, form fields and the primary button are deliberately sharp at 6px, so the things you act on read as crisp objects on soft liquid.

The thread is the signature shape. It's a narrow strip that the goo filter flares into concave shoulders where it meets each parent. It hangs below the control that opened it and stays on the straight edge of the shape below, clear of the rounded corners.

## Components

### Goo Shell (signature)
*The reusable base for all liquid surfaces (`components/GooNavShell.tsx`).* Use it for anything that opens from a pill.

- **Structure:** the shapes sit in a filtered layer behind the content, because the filter would melt text. The content sits above with backdrop blur and no background of its own.
- **Filter:** Gaussian blur (9) followed by an alpha threshold (`18a − 7`) merges shapes, then the rim and shade are added and alpha is scaled to 94%. Each shell needs a unique filter id, since a filter inside a hidden shell can't serve a visible one.
- **Geometry:** a 24px gap with a 14px thread. The blur keeps the two shapes apart at that gap, so only the thread joins them. Reducing the gap makes them merge outright.
- **Opening:** the shape starts squeezed inside the parent and pours out over 640ms. A small pill overshoots (`cubic-bezier(0.22, 1.3, 0.36, 1)`) and a tall panel settles more gently (`cubic-bezier(0.22, 1.08, 0.36, 1)`). The thread thins from 48px to 14px over 760ms.
- **Closing:** faster, at 300ms, with the thread retracting in 200ms.
- **Fallback:** with no filter support, the shapes and a plain connector still show. Reduced-motion users get no transitions.

### Navigation
- **Main pill:** text links in the centre: Categories, Products, Search, then Sign in for guests or Favorites and Cart for signed-in customers. Instagram and Facebook icons sit on the right, and signed-in customers also get an account avatar there.
- **Category pill:** the 4 latest categories from the server plus **View all**, separated by short 1px dividers. Categories shows as selected while it's open.
- **Phone bar:** only the logo with its wordmark and the bubble menu icon. The icon rotates 180° over 500ms as the menu opens.
- **Phone menu:** categories, then **View all**, a divider, and actions: Products, Search, Sign in (or the account items), Instagram and Facebook.

### Search Modal
- **Search pill:** icon, input, a Clear action once there's text, and a close button. The thread hangs from the search icon.
- **Cursor:** a 2px Awakened Violet blinking bar marks the empty focused field, since the native caret is too faint on glass. The browser's focus outline is switched off on this input only.
- **Panel:** with no query, category chips and New arrivals (the latest 4). While searching, up to 6 server results and a "See all results" row. It also has loading, no-results and failure states with **Try again**.
- **Rows:** a 48px thumbnail, name and category, and price. On tablet and up, an arrow marks the active row.

### Auth Modal
- **Pill:** a compact handle, centred above the panel and only as wide as its contents, with Sign in and Create account as text tabs and a close button. The thread hangs from the selected tab and slides across when the mode changes.
- **Panel:** a serif heading, one line of purpose, the fields, and the submit button. Errors appear above the form, naming the problem and the recovery.

### Inputs
- **Style:** translucent white (55%) with a white border (70%), with sharp 6px corners, 48px tall, with Royal Amethyst section labels above. Text stays 16px so iOS doesn't zoom.
- **Focus:** the border turns Awakened Violet with a soft 3px violet ring, replacing the site-wide outline on these fields.

### Primary Button
- **Style:** a solid Royal Amethyst block with sharp 6px corners, 48px tall, with white text. Hover deepens it to Deep Plum, and it dims while submitting. Keep it to a form's single main action.

### Shop Filter Bar
- **Layout:** a full-width white bar that sticks directly under the site header, with applied filters on the left and a glass Filters button with sharp 6px corners on the right. The button shows a badge counting active choices.
- **Scrolling:** products start below the bar and only ever scroll beneath it. The area behind the site header is white on this page too, so products never show around the pills or under the button.
- **Heading:** the shop has no visible page heading, because the navbar's Products link and the applied filters already say where you are. A screen-reader heading names the page.
- **Applied filters:** removable pills with a clear-all link. Sort isn't listed, since it doesn't hide anything.

### Filter Drawer
- **Shape:** glass from the right edge, up to 400px wide with square corners, over a blurred page. It has no thread, because it comes from the screen edge rather than from a pill.
- **Sections:** Category, Price, Offers and Sort, in that order. Sort defaults to Newest. Choices apply straight away and the drawer stays open, so the list updates behind it.
- **Footer:** Clear all, when something is active, and a primary button stating the result count, such as "Show 7 products".

### Shop Product Card
- **Shape:** a contained glass card with 8px corners, using the glass gradient and glass lift. The photo fills the top edge to edge, and cards in a row share one height.
- **On the photo:** Out of stock and Bestseller as small sharp labels at top left, with a round glass heart at top right. Discounts show only in the price row.
- **Details:** category with a small rating chip beside it, then a semibold name and a quiet low-stock note when it applies. The rating only appears when a product has reviews.
- **Price row:** below a thin divider, any real compare-at price struck through, then the price in bold, with a double chevron at the far right.
- **Hover:** the name turns Awakened Violet, the chevron shifts slightly, and the photo zooms a little. The card itself doesn't lift.

### Chips
- **Style:** translucent white (45%) with a white border (70%), in full pills 32px tall. They carry no shadow of their own.
- **State:** text only, turning Awakened Violet on hover.

### Count Badges
- **Style:** a small Royal Amethyst pill with white text. It sits inline on tablet and up and overlaps the icon on phones where needed.

### Social Icons
- **Style:** the brand's own full-colour SVGs (`instagram-badge.svg`, `facebook.svg`) at 24px in a 36px target, dimming slightly on hover. They are the only exception to the one-purple rule, because they are brand marks.

## Do's and Don'ts

### Do:
- **Do** build anything that opens from a pill with the Goo Shell, so the thread and material stay identical. Edge drawers use the same glass without a thread.
- **Do** hang the thread from the control that opened the shape.
- **Do** keep hover and selected states to a text colour change.
- **Do** push the page down for the persistent category pill on tablet and up, and float over a blurred page for the phone menu.
- **Do** load categories and products from the server in glass surfaces, never from the placeholder data.
- **Do** keep product thumbnails at the sharp 6px radius.
- **Do** keep every state working from the keyboard, with Deep Plum focus rings, and honour reduced motion.

### Don't:
- **Don't** use a lilac or purple page background.
- **Don't** add a white or filled pill behind a hovered item.
- **Don't** put a solid bar or border behind the header. The pills float.
- **Don't** use orange, gift icons or other accent highlights on navigation.
- **Don't** round product thumbnails or image labels to match the glass.
- **Don't** place text inside the filtered layer, or add a border or `box-shadow` to a single goo shape.
- **Don't** add a second ambient animation near the thread.
- **Don't** expand the search field in place. Search opens as a modal.
- **Don't** show fake urgency or invented claims on glass surfaces.
