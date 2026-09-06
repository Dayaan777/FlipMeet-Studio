# FlipMeet Studio Guide

## 1. Brand Overview

FlipMeet Studio is a limited-drop streetwear label within the **FlipMeet ecosystem**. The brand is built around numbered drops, limited pieces, and countdown urgency: each release should feel scarce, anticipated, and culturally relevant rather than like an always-available catalog.

The tone is premium-but-street, combining editorial polish with the energy of a hype release. Cinematic, photography-led presentation is central to the experience, while an AI try-on feature adds a tech-forward layer. The core audience is streetwear-focused shoppers who respond to scarcity and hype mechanics associated with brands such as Supreme and Kith.

## 2. Visual Identity

| Element | Direction |
| --- | --- |
| Background | Near-black, ranging from `#0A0A0A` to `#111111` |
| Hero imagery | Concrete and tactile textures with studio-lit, high-contrast model photography |
| Accent | Burnt orange, approximately `#FF4D1E`, used sparingly for CTAs and active states |
| Primary text | White |
| Secondary text | Muted grey |
| Headlines | Bold condensed sans-serif with heavy tracking on labels such as `DROP 001` |
| Cards | Dark surfaces with thin 1px borders |
| Icons | Thin-line iconography for trust badges |

The design principle is minimal chrome: photography and typography should carry the page. Every section should feel like a **drop reveal**, not a standard e-commerce catalog.

## 3. Site Structure

The project uses the Next.js App Router.

| Route | Purpose |
| --- | --- |
| `/` | Home and current drop landing page |
| `/drop/[dropId]` | Drop-specific landing page |
| `/product/[slug]` | Product detail page |
| `/try-on` | AI try-on experience |
| `/about` | Brand and ecosystem story |
| `/process` | Design and production process |
| `/studio` | Studio/editorial content |
| `/cart` | Shopping cart |
| `/checkout` | Customer details and order submission |
| `/dashboard` | Auth-gated admin order dashboard |
| `/terms` | Terms and conditions |
| `/privacy` | Privacy policy |
| `/shipping` | Shipping information |
| `/returns` | Returns policy |

## 4. Page-by-Page Breakdown

### Home

The home page is the primary drop reveal and should include:

- Navigation bar with brand identity and cart access.
- Hero section with countdown timer, delivery window, dual CTA, and audio toggle.
- Collection carousel titled `DROP 001 - 4 OUTFITS`, with arrow navigation and a glow treatment for the active look.
- AI Try-On section with look selection, photo upload, generation action, result viewer, and history strip.
- Trust badge row: Limited Drop, Premium Quality, Secure Payments, and Worldwide Shipping.
- Footer with email waitlist signup.

### Product Detail

Product pages should provide editorial imagery, price, size selector, add-to-cart action, and fabric details. Product information should make scarcity, construction, and fit easy to understand without overwhelming the visual presentation.

### Cart

The cart should show line items with quantity and size controls, subtotal, and a clear proceed-to-checkout action.

### Checkout

The checkout form collects the customer name, WhatsApp number, and address. On submission, the server should validate the data, generate a formatted receipt, open a `wa.me` deep link pre-filled with order details, and log the order to Supabase.

### Dashboard

The admin dashboard is password-gated and displays a table of all orders, including date, customer, items, total, and status.

## 5. Component Inventory

| Component | Responsibility |
| --- | --- |
| `NavBar` | Site navigation, cart access, and scroll-aware presentation |
| `CountdownTimer` | Drop deadline display with animated digits |
| `Button` | Consistent CTA and action treatment |
| `LookCard` / `LookCarousel` | Outfit presentation and active-look interaction |
| `TryOnPanel` | Look selection, upload, generation, results, and history |
| `TrustBadge` | Thin-line trust and reassurance indicators |
| `CartItem` | Line-item display and quantity/size controls |
| `OrderSummary` | Checkout totals and receipt preview |
| `WaitlistForm` | Email capture for upcoming drops |
| `Footer` | Brand links, policies, and waitlist entry point |
| `OrderTable` | Admin order listing and status visibility |

## 6. Responsive Behavior

| Breakpoint | Behavior |
| --- | --- |
| Desktop (`1200px+`) | Full multi-column layouts and the complete editorial composition |
| Tablet (`768px–1199px`) | Hero stacks vertically; carousel shows 2–3 looks |
| Mobile (`<768px`) | Full stacking, swipeable single-look carousel, 2x2 countdown grid, and hamburger navigation |

All layouts should be mobile-first, preserve readable tap targets, and keep the current drop CTA visible without competing with the photography.

## 7. Languages & Frameworks

- **Next.js App Router** with **TypeScript**.
- **Tailwind CSS** for styling and responsive composition.
- **`next/image`** for all imagery and image optimization.
- Cart state managed with React Context or Zustand and persisted to `localStorage`.
- **Supabase hosted Postgres** for orders and the admin dashboard. Supabase is preferred over Google Sheets or Airtable for reliability and unlimited API requests on the free tier.
- A third-party AI image-generation API called server-side for try-on.
- Product and drop content stored as structured TypeScript or JSON files; no CMS initially.
- Hosted on **Vercel**.

## 8. Interactions & Motion

- Scroll-triggered fade and slide-up reveals for sections.
- Glow and scale treatment on the active carousel look.
- Flip/tick countdown digit animation.
- Button hover scale and brightness shift.
- Navigation blur-on-scroll behavior.

Motion should reinforce the feeling of a reveal and remain restrained enough that product imagery and typography stay dominant.

## 9. Security & Safety Measures

- Keep all API keys in environment variables.
- The browser communicates only with internal API routes; it never talks directly to Supabase or the AI provider.
- Apply server-side validation to every form input.
- Rate-limit `/api/order` and `/api/try-on`.
- Restrict try-on uploads to JPG, PNG, and WEBP files under 10MB; discard photos after processing.
- Protect the admin dashboard behind an environment-based password, session cookies, and `noindex` metadata.
- Enforce HTTPS everywhere.
- Return generic user-facing error messages while logging actionable details server-side.
- Lock CORS to the site’s own domain.
- Provide a plain-language privacy policy explaining that name, phone number, and address data are collected for order fulfillment and customer communication.

## 10. SEO & Performance

- Use static generation for marketing pages.
- Use dynamic rendering for live drop and product pages where inventory or timing requires it.
- Add per-drop metadata and Open Graph images.
- Prioritize image optimization throughout the site.
- Priority-load the hero image to protect Core Web Vitals.
- Use descriptive headings, semantic landmarks, accessible labels, and product-focused alt text.

## Open Decisions

- [ ] Confirm whether Tailwind CSS remains the styling approach or whether another styling system is required.
- [ ] Select the third-party AI try-on provider.
- [ ] Decide whether the environment-based dashboard password is sufficient or whether stronger authentication is needed.
- [ ] Confirm the try-on photo retention policy, including deletion timing and any user-facing consent language.
- [ ] Define the exact drop countdown source, timezone, and behavior after a drop closes.
- [ ] Confirm the order status values and who is responsible for updating them.
