# FlipMeet Studio

> Limited-edition streetwear label storefront built on Next.js 15, React 19, Tailwind CSS, and Supabase.

FlipMeet Studio is an editorial, drop-centric digital experience designed for exclusive fashion drops. It combines high-contrast brutalist aesthetics, interactive 3D and scroll-scrubbed video presentation, an interactive outfit builder, and a seamless Supabase-backed order pipeline with WhatsApp integration.

---

## Features

- **Drop-Centric Landing**: Numbered drop announcements with countdown timers, dynamic look carousels, and dual marquee tickers.
- **Cinematic Presentation**: Scroll-scrubbed video hero and interactive 3D WebGL corridor built with Three.js & React Three Fiber.
- **Garment Catalog & Anime Capsule**: Filterable product catalog (`/shop`) and dedicated anime archive (`/anime`).
- **Interactive Outfit Builder**: Mix-and-match tops and bottoms with synchronized previews (`/make-your-own`).
- **Complete Checkout Flow**: Full validation, Supabase database persistence, transactional email receipts via Resend, and WhatsApp order handoff.
- **Admin Management Portal**: Password-gated dashboard (`/admin`) for viewing orders, managing status, and catalog updates.
- **Atmospheric Experience**: Integrated background audio engine (`GlobalAudioPlayer`) and interactive theme/gender switcher.

---

## Tech Stack

- **Framework**: [Next.js 15](https://nextjs.org/) (App Router, React Server Components)
- **UI & Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **3D Graphics**: [Three.js](https://threejs.org/) & [React Three Fiber](https://r3f.docs.pmnd.rs/)
- **State Management**: [Zustand](https://zustand-demo.pmnd.rs/) with persistent storage
- **Database & Storage**: [Supabase](https://supabase.com/) (PostgreSQL & Storage)
- **Transactional Email**: [Resend](https://resend.com/)

---

## Getting Started

### Prerequisites

- **Node.js**: `18.18.0` or higher (Node `20.x` recommended)
- **Package Manager**: `npm` or `pnpm`

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Dayaan777/FlipMeet-Studio.git
   cd FlipMeet-Studio
   ```

2. **Install dependencies**:
   ```bash
   npm install
   # or
   pnpm install
   ```

3. **Configure environment variables**:
   Create a `.env.local` file by copying `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
   Populate your `.env.local` with your configuration:
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key

   # Admin Dashboard Authentication
   ADMIN_PASSWORD=your-secure-admin-password

   # Transactional Email (Resend)
   RESEND_API_KEY=re_your_api_key

   # AI Try-On (Optional)
   AI_TRYON_API_KEY=your-api-key
   ```

4. **Run database setup (optional)**:
   If setting up your own Supabase instance, execute the SQL schema located at:
   ```
   supabase/schema.sql
   ```

### Running Locally

Start the development server:

```bash
npm run dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
├── app/                  # Next.js App Router pages and API routes
│   ├── admin/            # Protected admin portal and authentication
│   ├── anime/            # Anime capsule collection
│   ├── api/              # Backend endpoints (checkout, orders, try-on)
│   ├── make-your-own/    # Interactive outfit customizer
│   ├── shop/             # Product catalog with filters
│   └── page.tsx          # Homepage with video hero and drop carousel
├── components/           # UI, layout, video, and Three.js 3D components
├── data/                 # Drops configuration and fallback product archive
├── lib/                  # Supabase client, Zustand stores, email helper
├── public/               # Static assets (images, video clips, audio)
└── supabase/             # Database schema and RLS policies
```

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run dev` | Runs the development server at `localhost:3000` |
| `npm run build` | Builds the application for production |
| `npm run start` | Starts the production server |
| `npm run lint` | Runs ESLint to check for code quality issues |

---

## License & Credits

Created for the FlipMeet ecosystem. All rights reserved.