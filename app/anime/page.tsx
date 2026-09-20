import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function AnimePage() {
  return (
    <>
      <NavBar />
      <main className="bg-base-bg min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-screen flex flex-col justify-between overflow-hidden border-b border-base-border">
          {/* Background Image with baked-in title & tagline */}
          <div className="absolute inset-0">
            <Image
              src="/images/anime-hero.jpg"
              alt="FlipMeet Studio Anime Collection"
              fill
              priority
              sizes="100vw"
              className="object-cover object-[30%_center] md:object-center"
            />
            {/* Top fade for navbar readability */}
            <div className="absolute inset-x-0 top-0 h-28 bg-gradient-to-b from-base-bg/80 via-base-bg/30 to-transparent pointer-events-none" />
            {/* Bottom edge fade seamlessly transitioning to the rest of the page */}
            <div className="absolute inset-x-0 bottom-0 h-36 bg-gradient-to-t from-base-bg via-base-bg/40 to-transparent pointer-events-none" />
          </div>

          {/* Spacer to push interactive CTA naturally below the baked-in text */}
          <div className="pt-24" />

          {/* Interactive CTA positioned cleanly beneath the image's text block */}
          <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-12 md:px-16 pb-24 md:pb-28">
            <div className="max-w-md pt-[38vh] sm:pt-[42vh] md:pt-[45vh]">
              <a
                href="#collection"
                className="inline-flex items-center justify-center gap-3 rounded-sm bg-accent px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-text-primary hover:bg-accent-dim transition-all duration-200 shadow-lg shadow-accent/20 hover:shadow-accent/40"
              >
                SHOP ANIME →
              </a>
            </div>
          </div>

          {/* Scroll Indicator */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 pointer-events-none">
            <span className="text-[10px] tracking-[0.25em] uppercase text-text-secondary/70 font-medium">
              SCROLL
            </span>
            <div className="w-[1px] h-7 bg-gradient-to-b from-accent to-transparent animate-pulse" />
          </div>
        </section>

        {/* Anchor point for collection section */}
        <div id="collection" />
      </main>
      <Footer />
    </>
  );
}
