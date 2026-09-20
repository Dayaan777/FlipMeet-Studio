import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function AnimePage() {
  return (
    <>
      <NavBar />
      <main className="bg-base-bg min-h-screen">
        {/* Hero Section: aspect ratio 1024/457 matches the full uncropped artwork */}
        <section className="relative w-full aspect-[1024/457] min-h-[460px] sm:min-h-[520px] md:min-h-0 flex flex-col justify-between overflow-hidden border-b border-base-border bg-black">
          {/* Background image: object-contain ensures 100% of the composition (including torii gate & vertical Japanese text on the right) is always fully visible without cropping */}
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

          {/* Spacer for navigation clearance */}
          <div className="pt-24 sm:pt-28" />

          {/* Interactive CTA & Scroll Indicator positioned naturally to match the reference */}
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-12 md:px-16 pb-6 sm:pb-8 md:pb-10 flex flex-col justify-end">
            {/* Solid orange CTA button */}
            <div className="mb-4 sm:mb-6">
              <a
                href="#collection"
                className="inline-flex items-center justify-center gap-3 rounded-sm bg-accent px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-text-primary hover:bg-accent-dim transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/40"
              >
                SHOP ANIME →
              </a>
            </div>

            {/* Scroll Indicator at bottom left */}
            <div className="flex items-center gap-2.5 text-text-secondary/70">
              <div className="w-3.5 h-5 rounded-full border border-text-secondary/50 flex items-start justify-center p-0.5">
                <div className="w-1 h-1 bg-accent rounded-full animate-bounce" />
              </div>
              <span className="text-[10px] tracking-[0.25em] uppercase font-medium">
                SCROLL
              </span>
            </div>
          </div>
        </section>

        {/* Anchor point for collection section */}
        <div id="collection" />
      </main>
      <Footer />
    </>
  );
}
