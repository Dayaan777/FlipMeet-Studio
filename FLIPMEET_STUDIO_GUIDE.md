# FlipMeet Studio — Website Guidance & Structure

## 1. Brand Overview

**FlipMeet Studio** is a limited-drop streetwear label ("part of the FlipMeet ecosystem"). The brand identity leans into:

- Exclusivity — numbered drops, limited pieces ("100 pieces per look"), countdown urgency
- Premium-but-street tone — "Premium fabrics. Built for the culture."
- Cinematic, editorial presentation — model photography over flat product shots
- Tech-forward touches — AI try-on feature as a differentiator

**Target audience:** streetwear-focused, culturally plugged-in shoppers who respond to scarcity/hype drop mechanics (similar to Supreme/Kith-style releases).

---

## 2. Visual Identity

| Element | Spec |
|---|---|
| Background | Near-black (`#0A0A0A` – `#111111`), concrete/texture imagery in hero |
| Primary accent | Burnt orange / red-orange (`#FF4D1E`-ish) — used sparingly for CTAs, active states, glows |
| Text | White (`#FFFFFF`) primary, muted grey (`#9A9A9A`) secondary/body copy |
| Typography | Bold, condensed/tight sans-serif for headlines (heavy tracking on labels like "DROP 001"); clean sans-serif for body |
| Imagery | Studio-lit model photography, moody/concrete backdrops, high contrast |
| UI style | Dark cards with thin 1px borders, rounded-sm corners, subtle glow/shadow on active/hovered product |
| Iconography | Thin-line icons (shield, sparkle, box, globe) for trust badges |

**Design principle:** minimal chrome, let the photography and typography carry the page. Every section should feel like a "drop reveal," not a standard e-commerce catalog.

---

## 3. Site Structure (Next.js App Router)

```
/app
  /page.tsx                → Home (Drop landing page)
  /drop/[dropId]/page.tsx  → Full collection view for a specific drop
  /product/[slug]/page.tsx → Single look/product detail
  /try-on/page.tsx         → Standalone AI Try-On experience (also embedded on home)
  /about/page.tsx          → Brand story
  /process/page.tsx        → How it's made / behind the scenes
  /studio/page.tsx         → Studio/lookbook page
  /cart/page.tsx           → Cart review
  /checkout/page.tsx       → Checkout → generates receipt → sends to WhatsApp
  /dashboard/page.tsx      → Admin-only: list of all orders (auth-gated)
  /terms, /privacy, /shipping, /returns → Static policy pages
```

**Recommended data approach (no custom backend):**
- Product/drop data: local JSON/TS files in the repo (fully static, versioned with drops)
- Orders: Next.js API route (`/app/api/order/route.ts`) that writes each order to **Supabase** — acts as the "database" without a server to maintain (see §7a for why Supabase over Sheets/Airtable)
- Dashboard reads from Supabase to list orders — protected route, gated behind password/env-based auth since there's no full auth system

---

## 4. Page-by-Page Breakdown

### 4.1 Home / Drop Landing
1. **Nav bar** — logo left, links (DROP 001, ABOUT, PROCESS, STUDIO), cart icon w/ count, menu icon
2. **Hero** — drop label ("DROP 001"), two-line headline, subcopy, countdown timer (days/hrs/mins/secs), delivery window, dual CTA (Pre-order / Watch Trailer), full-bleed model photography, "Play Intro" audio toggle
3. **Collection carousel** — "DROP 001 – 4 OUTFITS," arrow navigation, look thumbnails on a podium/stage, active look glows with accent color, look name + description, dot indicators
4. **AI Try-On** — left panel: select look, upload photo, generate button; right panel: result preview with thumbnail history strip; disclaimer text ("AI results may vary")
5. **Trust badges row** — 4 columns: Limited Drop / Premium Quality / Secure Payments / Worldwide Shipping, each with icon + one-line description
6. **Footer** — brand name + copyright, policy links, email waitlist signup for next drop

### 4.2 Product/Look Detail
- Large imagery (model + flat-lay), look name, price, size selector, "Add to Cart," fabric/material details, size guide

### 4.3 Cart
- Line items with look thumbnail, quantity, size, remove option, subtotal, "Proceed to Checkout"

### 4.4 Checkout
- Customer details form (name, phone/WhatsApp number, address)
- Order summary
- On submit: generate a formatted order receipt → open WhatsApp deep link (`wa.me`) pre-filled with order details → simultaneously log the order to Supabase via API route

### 4.5 Dashboard (admin)
- Simple password gate
- Table of all orders: date, customer, items, total, status (pending/confirmed/shipped — manually updated)

---

## 5. Component Inventory

- `NavBar` (transparent-on-hero → solid on scroll)
- `CountdownTimer`
- `Button` (primary/orange, secondary/outline)
- `LookCard` / `LookCarousel`
- `TryOnPanel` (upload + generate + result viewer)
- `TrustBadge`
- `CartItem`
- `OrderSummary`
- `WaitlistForm`
- `Footer`
- `OrderTable` (dashboard)

---

## 6. Responsive Behavior

| Breakpoint | Behavior |
|---|---|
| Desktop (1200px+) | Full multi-column layouts as in reference (hero split, 4-look carousel visible) |
| Tablet (768–1199px) | Hero stacks copy above image; carousel shows 2–3 looks with scroll/swipe |
| Mobile (<768px) | Full stack, single-column; carousel becomes swipeable single-look view; countdown timer wraps to 2x2 grid; nav collapses to hamburger menu |

---

## 7. Languages & Frameworks

| Layer | Choice | Why |
|---|---|---|
| Core framework | **Next.js** (App Router), **TypeScript** | Type safety, file-based routing, built-in API routes remove the need for a separate backend service |
| Styling | **Tailwind CSS** | Fits the utility-driven dark theme, fast to iterate, keeps design tokens (colors, spacing) consistent site-wide |
| Images | `next/image` | Automatic optimization/lazy-loading — critical since this design is photography-heavy |
| State (cart) | React Context or **Zustand**, persisted to `localStorage` | No backend required for cart state; survives page refresh |
| Orders database | **Supabase** (hosted Postgres, auto-generated API) | Real database behavior without maintaining a server; unlimited API requests on free tier vs. Airtable's 1,000/month cap — see §7a |
| AI Try-On | Third-party image-generation API, called from a Next.js API route | Keeps the provider's API key server-side, never exposed to the browser |
| Content (products/drops) | Structured TS/JSON files in the repo | No CMS needed yet; versioned alongside code; easy to swap for a headless CMS later if drop volume grows |
| Hosting | **Vercel** (native fit for Next.js) | Zero-config deploys, edge network, environment variable management for API keys |
| Package manager | npm or pnpm | Either is fine; pick one and stay consistent |

### 7a. On the Orders Database Decision

Supabase is the confirmed approach for order storage and the admin dashboard, chosen over Google Sheets and Airtable:
- **Google Sheets** — good for instant prototyping, not reliable enough for a live professional launch (fragile under concurrent writes, no real dashboard querying)
- **Airtable** — nicer UI, but free tier caps at 1,000 records/base and only 1,000 API calls/month total — easy to exceed with real checkout + dashboard traffic
- **Supabase** — real Postgres DB, unlimited API requests on the free tier, feels like actual product infrastructure while still requiring no server code to write or maintain

One caveat to plan around: Supabase free-tier projects pause after 7 days of inactivity, which matters for a drop-based brand with quiet periods between releases. Mitigate with a free scheduled keep-alive ping (e.g. GitHub Actions cron) or budget $25/month for Supabase Pro once real orders are flowing.

---

## 8. Interactions & Motion

- Subtle fade/slide-up on section entry (scroll-triggered)
- Active look in carousel: glow ring + scale-up
- Countdown digits: flip/tick animation on change
- Buttons: slight scale + brightness shift on hover
- Nav: background blur/solid transition on scroll

---

## 9. Security & Safety Measures

### Data handling
- **Customer data** (name, phone, address) is entered at checkout and sent straight to Supabase over HTTPS — never logged in plaintext, never sent to third-party analytics
- All API keys (Supabase service key, AI try-on provider key) live in **environment variables** on Vercel, never in client-side code or committed to the repo
- The browser only ever talks to your own Next.js API routes, not directly to Supabase or the AI provider — keeps every secret server-side

### Input validation & abuse prevention
- Server-side validation on the checkout form (name, phone format, address) before writing to Supabase — never trust client-side validation alone
- Rate-limit the `/api/order` and `/api/try-on` routes (e.g. per-IP limits) to prevent spam orders or someone hammering the AI try-on endpoint and running up provider costs
- Sanitize/validate uploaded photos for the AI Try-On feature: restrict file type (JPG/PNG/WEBP as shown in the reference) and size (10MB cap, matching the UI), and never execute or serve uploaded files directly — pass them straight to the AI provider and discard after processing (or store only if explicitly needed, with a retention policy)

### Admin dashboard
- Password/env-based gate is the minimum bar — the credential should live in an environment variable, not hardcoded
- Consider a short session cookie (rather than re-sending the password on every request) and make sure the dashboard route is excluded from search indexing (`noindex`, not linked in sitemap/nav)
- Dashboard should only ever be reachable over HTTPS — never expose it on an `http://` preview link

### Infrastructure
- Enforce HTTPS everywhere (Vercel does this by default)
- Keep dependencies patched — Next.js, any AI/image libraries, and Supabase client should be updated regularly since this is customer-facing and handles PII
- Error messages shown to users should be generic ("Something went wrong, please try again") — never surface raw database or API errors to the browser
- CORS on API routes should only allow requests from your own domain

### Privacy/compliance basics
- Since customer data (name, phone, address) is collected, the Privacy Policy page (already in the sitemap) should plainly state what's collected and how it's used (order fulfillment via WhatsApp)
- If shipping worldwide as the trust badge claims, be aware some regions (e.g. EU/GDPR) have specific rules about storing personal data — worth a plain-language note in the policy even at small scale

---

## 10. SEO & Performance

- Static generation for marketing pages (home, about, process, studio)
- Dynamic rendering only for drop/product pages tied to live data
- Meta tags + OG images per drop for social sharing (drops are inherently shareable/hype-driven)
- Image optimization critical given photography-heavy design
- Core Web Vitals priority: hero image should be priority-loaded, avoid layout shift on countdown/carousel

---

## Open Decisions
- [x] Order-storage approach: **Supabase** (see §7a)
- [ ] Confirm styling approach: Tailwind vs CSS Modules
- [ ] AI try-on: which provider/API for image generation
- [ ] Dashboard auth: simple password vs a more robust session-based login
- [ ] Uploaded try-on photos: discard immediately after processing, or retain with a defined policy?
