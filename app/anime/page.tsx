import Image from "next/image";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function AnimePage() {
  return (
    <>
      <NavBar />
      <main className="bg-base-bg min-h-screen">
        {/* Hero Section */}
        <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center justify-center overflow-hidden border-b border-base-border">
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src="/images/anime-hero.jpg"
              alt="FlipMeet Studio Anime Capsule"
              fill
              priority
              sizes="100vw"
              className="object-cover object-center brightness-75 contrast-110"
            />
            {/* Gradient Overlays for seamless blending with base theme */}
            <div className="absolute inset-0 bg-gradient-to-t from-base-bg via-base-bg/40 to-base-bg/60" />
            <div className="absolute inset-0 bg-black/25" />
          </div>

          {/* Hero Content */}
          <div className="relative z-10 mx-auto max-w-4xl px-6 py-32 text-center">
            <p className="text-accent text-[10px] sm:text-xs tracking-[0.3em] uppercase font-bold mb-4">
              FLIPMEET STUDIO // CAPSULE COLLECTION
            </p>
            <h1 className="font-display text-5xl sm:text-7xl md:text-8xl font-bold uppercase tracking-tight text-text-primary leading-[0.9]">
              ANIME
            </h1>
            <p className="text-text-secondary mt-6 max-w-lg mx-auto text-sm sm:text-base tracking-wide">
              Where high-density Japanese cyber-aesthetics meet heavyweight luxury streetwear. Limited production run.
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
