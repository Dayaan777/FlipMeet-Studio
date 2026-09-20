import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function AnimePage() {
  return (
    <>
      <NavBar />
      <main className="bg-base-bg min-h-screen">
        {/* Hero Section: aspect ratio 1538/688 matches the clean uncropped artwork */}
        <section className="relative w-full aspect-[1538/688] min-h-[480px] sm:min-h-[540px] md:min-h-0 overflow-hidden border-b border-base-border bg-black">
          {/* Background image: full clean artwork with no baked-in UI */}
          <div className="absolute inset-0">
            <Image
              src="/images/anime-hero.jpg"
              alt="FlipMeet Studio Anime Collection"
              fill
              priority
              sizes="100vw"
              className="object-contain md:object-cover object-center"
            />
          </div>

          {/* Real Solid Orange CTA button */}
          <div className="absolute left-[5.2%] top-[65%] z-10">
            <a
              href="#collection"
              className="inline-flex items-center justify-center gap-3 rounded-sm bg-accent px-8 py-3.5 text-xs font-bold uppercase tracking-[0.2em] text-text-primary hover:bg-accent-dim transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/40"
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
      </main>
      <Footer />
    </>
  );
}
