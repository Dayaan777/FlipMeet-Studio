import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function AnimePage() {
  return (
    <>
      <NavBar />
      <main className="bg-base-bg min-h-screen">
        {/* Hero Section: aspect ratio 1024/457 matches the full uncropped artwork */}
        <section className="relative w-full aspect-[1024/457] min-h-[460px] sm:min-h-[520px] md:min-h-0 overflow-hidden border-b border-base-border bg-black">
          {/* Background image: full composition preserved without cropping */}
          <div className="absolute inset-0">
            <Image
              src="/images/anime-hero.jpg"
              alt="FlipMeet Studio Anime Collection"
              fill
              priority
              sizes="100vw"
              className="object-contain object-center"
            />
          </div>

          {/* Top header mask: ensures only the real interactive NavBar is visible and conceals any static mockup header text */}
          <div className="absolute inset-x-0 top-0 h-16 sm:h-20 bg-base-bg z-10 pointer-events-none" />

          {/* Single Solid Orange CTA button: positioned directly over the button slot */}
          <div className="absolute left-[5.2%] top-[57.5%] z-20 bg-base-bg/95 p-0.5 rounded-sm">
            <a
              href="#collection"
              className="inline-flex items-center justify-center gap-3 rounded-sm bg-accent px-8 py-3.5 min-w-[195px] text-xs font-bold uppercase tracking-[0.2em] text-text-primary hover:bg-accent-dim transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/40"
            >
              SHOP ANIME →
            </a>
          </div>

          {/* Single Scroll Indicator: positioned directly over the scroll slot */}
          <div className="absolute left-[5.2%] bottom-[6.5%] z-20 bg-base-bg/95 px-2 py-1 rounded-sm flex items-center gap-2.5 text-text-secondary/80 pointer-events-none">
            <div className="w-3.5 h-5 rounded-full border border-text-secondary/60 flex items-start justify-center p-0.5">
              <div className="w-1 h-1 bg-accent rounded-full animate-bounce" />
            </div>
            <span className="text-[10px] tracking-[0.25em] uppercase font-medium">
              SCROLL
            </span>
          </div>
        </section>

        {/* Anchor point for collection section */}
        <div id="collection" />
      </main>
      <Footer />
    </>
  );
}
