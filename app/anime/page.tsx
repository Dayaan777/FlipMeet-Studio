import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function AnimePage() {
  return (
    <>
      <NavBar />
      <main className="bg-base-bg min-h-screen">
        {/* Hero Section with exact aspect ratio framing matching the original image */}
        <section className="relative w-full min-h-[540px] sm:min-h-[600px] md:min-h-0 md:aspect-[1024/457] flex flex-col justify-between overflow-hidden border-b border-base-border bg-black">
          {/* Full-bleed background image with zero cropping on the right */}
          <div className="absolute inset-0">
            <Image
              src="/images/anime-hero.jpg"
              alt="FlipMeet Studio Anime Collection"
              fill
              priority
              sizes="100vw"
              className="object-cover md:object-fill lg:object-cover object-center"
            />
          </div>

          {/* Spacer for navigation clearance */}
          <div className="pt-24 sm:pt-28" />

          {/* Interactive CTA & Scroll Indicator positioned naturally to match the reference */}
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-12 md:px-16 pb-8 sm:pb-10 md:pb-12 flex flex-col justify-end">
            {/* Outline CTA button aligned under the text block */}
            <div className="mb-6 sm:mb-8">
              <a
                href="#collection"
                className="inline-flex items-center justify-center gap-3 rounded-sm border border-white/25 bg-black/40 px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-white hover:border-white hover:bg-black/60 transition-all duration-200 backdrop-blur-sm"
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
