import NavBar from "@/components/NavBar";
import Hero from "@/components/Hero";
import LookCarousel from "@/components/LookCarousel";
import FeaturedLooksGrid from "@/components/FeaturedLooksGrid";
import TryOnPanel from "@/components/TryOnPanel";
import TrustBadges from "@/components/TrustBadges";
import VideoCarousel from "@/components/VideoCarousel";
import Footer from "@/components/Footer";
import { drops } from "@/data/drops";

export default function Home() {
  const drop = drops[0];

  return (
    <>
      <NavBar />
      <main className="bg-base-bg">
        <Hero drop={drop} />
        <LookCarousel drop={drop} />
        <FeaturedLooksGrid drop={drop} />
        <TryOnPanel drop={drop} />
        <TrustBadges />
        <VideoCarousel />
      </main>
      <Footer />
    </>
  );
}
