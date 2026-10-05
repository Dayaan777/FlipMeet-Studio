import Image from "next/image";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import AnimeDropReveal from "@/components/AnimeDropReveal";
import VideoCarousel from "@/components/VideoCarousel";
import TrustBadges from "@/components/TrustBadges";
import AnimeBundle from "@/components/AnimeBundle";
import { DARK_BLUR_DATA_URL } from "@/lib/image-placeholder";

export default function AnimePage() {
  return (
    <>
      <NavBar mobileSolid />
      <main className="bg-base-bg min-h-screen pt-[73px] md:pt-0">

        {/* ── HERO ── */}
        <section className="relative w-full aspect-square md:aspect-[1538/688] overflow-hidden border-b border-base-border bg-black">
          {/* Desktop hero */}
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
          {/* Mobile hero */}
          <div className="absolute inset-0 md:hidden aspect-square">
            <Image
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Hero%20image%20%28MOBILE%29-QGU6bIvrhkv2UcogDPbqDa1sEjfg0y.jpg"
              alt="FlipMeet Studio Anime Collection"
              fill
              priority
              sizes="100vw"
              placeholder="blur"
              blurDataURL={DARK_BLUR_DATA_URL}
              className="size-full object-cover object-center"
            />
          </div>

          {/* CTA */}
          <div className="absolute left-[5.2%] top-[78%] md:top-[75%] z-10">
            <Link
              href="#collection"
              className="inline-flex w-auto items-center justify-center gap-2 rounded-sm bg-accent px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.16em] text-text-primary hover:bg-accent-dim transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/40 md:gap-3 md:px-8 md:py-3.5 md:text-xs md:tracking-[0.2em]"
            >
              SHOP ANIME
            </Link>
          </div>

          {/* Scroll indicator */}
          <div className="absolute left-[5.2%] bottom-[5%] z-10 flex items-center gap-2.5 text-text-secondary/70 pointer-events-none">
            <div className="w-3.5 h-5 rounded-full border border-text-secondary/50 flex items-start justify-center p-0.5">
              <div className="w-1 h-1 bg-accent rounded-full animate-bounce" />
            </div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-medium">SCROLL</span>
          </div>
        </section>

        {/* Anchor */}
        <div id="collection" />

        {/* ── THE ANIME COLLECTION – 05 LOOKS (Editorial Reveal) ── */}
        <AnimeDropReveal />

        {/* ── ANIME PACK 5 IN 1 ── */}
        <section className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pb-12 sm:pb-20 pt-0 sm:pt-4">
          <AnimeBundle />
        </section>

        {/* ── VIDEO / EDITORIAL ARCHIVE ── */}
        <VideoCarousel />

        <TrustBadges />
      </main>
      <Footer />
    </>
  );
}
