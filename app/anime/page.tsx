import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

const FEATURED_JERSEY_IMAGE =
  "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Jersey%20look%20for%20%28WEBSITE%29-rOroc9coSYHxiavIxXod8cvmlPcgXW.png";

const ANIME_SERIES = [
  {
    name: "ONE PIECE",
    slug: "one-piece",
    image: "/images/anime/series/one-piece.jpg",
    href: "#one-piece",
  },
  {
    name: "JUJUTSU KAISEN",
    slug: "jujutsu-kaisen",
    image: "/images/anime/series/jujutsu-kaisen.jpg",
    href: "#jujutsu-kaisen",
  },
  {
    name: "NARUTO",
    slug: "naruto",
    image: "/images/anime/series/naruto.jpg",
    href: "#naruto",
  },
  {
    name: "DEMON SLAYER",
    slug: "demon-slayer",
    image: "/images/anime/series/demon-slayer.jpg",
    href: "#demon-slayer",
  },
  {
    name: "ATTACK ON TITAN",
    slug: "attack-on-titan",
    image: "/images/anime/series/attack-on-titan.jpg",
    href: "#attack-on-titan",
  },
];

export default function AnimePage() {
  return (
    <>
      <NavBar mobileSolid />
      <main className="bg-base-bg min-h-screen pt-[73px] md:pt-0">
        {/* Hero uses the artwork's square ratio on mobile and the wide desktop ratio at larger breakpoints. */}
        <section className="relative w-full aspect-square md:aspect-[1538/688] overflow-hidden border-b border-base-border bg-black">

          {/* Desktop keeps the original wide artwork; mobile uses the dedicated square composition. */}
          <div className="absolute inset-0 hidden md:block">
            <Image
              src="/images/anime-hero.jpg"
              alt="FlipMeet Studio Anime Collection"
              fill
              priority
              sizes="(max-width: 768px) 100vw, 80vw"
              className="object-contain md:object-cover object-center"
            />
          </div>
          <div className="absolute inset-0 md:hidden aspect-square">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hero%20image%20%28MOBILE%29-QGU6bIvrhkv2UcogDPbqDa1sEjfg0y.jpg"
              alt="FlipMeet Studio Anime Collection"
              className="size-full object-cover object-center"
            />
          </div>

          {/* Real Solid Orange CTA button */}
          <div className="absolute left-[5.2%] top-[65%] z-10">
            <a
              href="#collection"
              className="inline-flex w-auto items-center justify-center gap-2 rounded-sm bg-accent px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-text-primary hover:bg-accent-dim transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/40 md:gap-3 md:px-8 md:py-3.5 md:text-xs md:tracking-[0.2em]"
            >
              SHOP ANIME →
            </a>
          </div>

          {/* Real Scroll Indicator */}
          <div className="absolute left-[5.2%] bottom-[5%] z-10 flex items-center gap-2.5 text-text-secondary/70 pointer-events-none">
            <div className="w-3.5 h-5 rounded-full border border-text-secondary/50 flex items-start justify-center p-0.5">
              <div className="w-1 h-1 bg-accent rounded-full animate-bounce" />
            </div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-medium">
              SCROLL
            </span>
          </div>
        </section>

        {/* Anchor point for collection section */}
        <div id="collection" />

        {/* Anime Series Section */}
        <section className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 py-16 sm:py-24 border-b border-base-border">
          {/* Label */}
          <div className="flex items-center gap-3 text-xs tracking-[0.25em] text-text-secondary uppercase mb-8">
            <span className="w-5 h-[1px] bg-accent" />
            <span className="font-semibold text-text-secondary">ANIME SERIES</span>
          </div>

          {/* 5 Portrait Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 lg:gap-5">
            {ANIME_SERIES.map((series) => (
              <a
                key={series.slug}
                href={series.href}
                className="group relative aspect-[4/5] sm:aspect-[3/4] overflow-hidden rounded-sm border border-base-border bg-base-card hover:border-accent/60 transition-all duration-300 block shadow-md hover:shadow-accent/10"
              >
                {/* Character Artwork */}
                <Image
                  src={series.image}
                  alt={series.name}
                  fill
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                  className="object-cover object-center brightness-90 contrast-105 group-hover:scale-105 group-hover:brightness-100 transition-all duration-500"
                />

                {/* Moody Vignette / Dark Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-base-bg via-base-bg/40 to-transparent" />
                <div className="absolute inset-0 border border-white/5 group-hover:border-accent/30 transition-colors pointer-events-none" />

                {/* Bottom-left Content */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 flex flex-col justify-end">
                  <span className="text-xs sm:text-sm font-display tracking-widest text-text-primary uppercase font-bold group-hover:text-accent transition-colors">
                    {series.name}
                  </span>
                  <span className="text-xs text-text-secondary group-hover:text-accent group-hover:translate-x-1.5 transition-all mt-1 inline-block">
                    →
                  </span>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* The Anime Drop */}
        <section className="relative overflow-hidden border-b border-base-border bg-[#050505] px-6 py-16 sm:px-8 sm:py-24 lg:px-12">
          <div className="mx-auto grid max-w-7xl items-center gap-8 lg:grid-cols-[auto_1fr_auto_auto] lg:gap-10">
            {/* Left: Info & Controls */}
            <div className="relative z-10 flex flex-col items-start">
              <span className="mb-3 text-[10px] font-bold tracking-[0.34em] text-accent">FEATURED</span>
              <h2 className="font-display text-3xl font-bold tracking-tight text-text-primary sm:text-4xl">THE ANIME DROP</h2>
              <p className="mt-2 text-sm tracking-[0.22em] text-text-secondary">アニメ・ドロップ</p>
              <p className="mt-5 max-w-xs text-xs leading-5 text-text-secondary">Limited pieces. Iconic characters.<br />Only at FlipMeet Studio.</p>
              
              {/* Pagination */}
              <div className="mt-8 flex items-center gap-4">
                <span className="text-[11px] font-bold tracking-[0.18em] text-text-primary">01 / 06</span>
                <div className="relative h-px w-24 bg-white/15">
                  <div className="h-px w-6 bg-accent" />
                </div>
                <button type="button" aria-label="Previous featured piece" className="text-sm text-text-secondary transition hover:text-accent">←</button>
                <button type="button" aria-label="Next featured piece" className="text-sm text-text-secondary transition hover:text-accent">→</button>
              </div>
              <a href="#featured-pieces" className="mt-8 border border-accent px-5 py-3 text-[10px] font-bold tracking-[0.18em] text-text-primary transition hover:bg-accent hover:text-black">VIEW ALL PIECES →</a>
            </div>

            {/* Center: Jersey Image with Brush Background */}
            <div className="relative flex h-96 items-center justify-center overflow-hidden">
              {/* Moody brush-stroke background elements */}
              <div className="absolute inset-x-[-15%] top-1/2 h-40 -translate-y-1/2 rotate-[-12deg] bg-[#1a3d2a]/60 blur-sm" />
              <div className="absolute left-1/4 top-[35%] h-32 w-48 rotate-[8deg] bg-gradient-to-br from-[#2a5540]/40 to-transparent blur-md" />
              <div className="absolute right-1/4 top-[55%] h-24 w-40 -rotate-[6deg] bg-[#0d2418]/50" />
              
              {/* Jersey Image */}
              <img 
                src={FEATURED_JERSEY_IMAGE} 
                alt="Black Zoro FlipMeet jersey" 
                className="relative z-10 h-80 w-auto object-contain drop-shadow-[0_24px_32px_rgba(0,0,0,0.9)]" 
              />
            </div>

            {/* Right: Product Info */}
            <div className="relative z-10 flex flex-col border-l border-white/10 pl-6">
              <span className="text-[10px] font-bold tracking-[0.32em] text-accent">ONE PIECE</span>
              <h3 className="mt-3 font-display text-2xl font-bold tracking-tight text-text-primary">ZORO JERSEY</h3>
              <p className="mt-2 text-[10px] tracking-[0.24em] text-text-secondary">ANIME COLLECTION</p>
              <p className="mt-8 text-sm font-semibold tracking-[0.16em] text-text-primary">₦6,999</p>
              <a href="#zoro-jersey" className="mt-8 inline-flex border border-accent px-5 py-3 text-[10px] font-bold tracking-[0.18em] text-text-primary transition hover:bg-accent hover:text-black">VIEW DETAILS →</a>
            </div>

            {/* Far Right: Thumbnail Strip */}
            <div className="flex flex-col gap-3">
              {["one-piece", "jujutsu-kaisen", "naruto", "demon-slayer"].map((slug, index) => (
                <button 
                  type="button" 
                  key={slug} 
                  aria-label={`View ${slug} preview`} 
                  className={`relative h-20 w-16 overflow-hidden border transition ${index === 0 ? "border-accent" : "border-white/15 hover:border-accent/50"}`}
                >
                  <Image 
                    src={`/images/anime/series/${slug}.jpg`} 
                    alt="" 
                    fill 
                    sizes="64px" 
                    className={`object-cover transition ${index === 0 ? "brightness-100 grayscale-0" : "brightness-60 grayscale hover:brightness-75 hover:grayscale-0"}`}
                  />
                </button>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
