import NavBar from "@/components/NavBar";
import LookCarousel from "@/components/LookCarousel";
import AnimeTeaser from "@/components/AnimeTeaser";
import AnimeBundle from "@/components/AnimeBundle";
// import FeaturedLooksGrid from "@/components/FeaturedLooksGrid";
import TryOnPanel from "@/components/TryOnPanel";
import TrustBadges from "@/components/TrustBadges";
import VideoCarousel from "@/components/VideoCarousel";
import Footer from "@/components/Footer";
import { getSupabaseDrop } from "@/lib/products";

import ResponsiveHero from "@/components/ResponsiveHero";

export default async function Home() {
  const drop = await getSupabaseDrop();

  return (
    <>
      <NavBar />
      <main className="bg-base-bg">
        <ResponsiveHero />

        <LookCarousel drop={drop} />
        {/* <FeaturedLooksGrid drop={drop} /> */}
        <AnimeTeaser drop={drop} />
        {/* <TryOnPanel drop={drop} /> */}
        
        {/* ── ANIME PACK 5 IN 1 ── */}
        <section className="relative mx-auto max-w-7xl px-6 sm:px-8 lg:px-12 pb-12 sm:pb-20 pt-12 sm:pt-20 border-t border-base-border">
          <AnimeBundle />
        </section>

        <VideoCarousel />
        <TrustBadges />
      </main>
     <Footer />
    </>
  );
}
