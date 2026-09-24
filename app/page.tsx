import NavBar from "@/components/NavBar";
import VideoHero from "@/components/VideoHero";
import LookCarousel from "@/components/LookCarousel";
import AnimeTeaser from "@/components/AnimeTeaser";
// import FeaturedLooksGrid from "@/components/FeaturedLooksGrid";
import TryOnPanel from "@/components/TryOnPanel";
import TrustBadges from "@/components/TrustBadges";
import VideoCarousel from "@/components/VideoCarousel";
import Footer from "@/components/Footer";
import { getSupabaseDrop } from "@/lib/products";

export default async function Home() {
  const drop = await getSupabaseDrop();

  return (
    <>
      <NavBar />
      <main className="bg-base-bg">
        <VideoHero />

        <LookCarousel drop={drop} />
        {/* <FeaturedLooksGrid drop={drop} /> */}
        <AnimeTeaser drop={drop} />
        {/* <TryOnPanel drop={drop} /> */}
        <VideoCarousel />
        <TrustBadges />
      </main>
     <Footer />
    </>
  );
}
