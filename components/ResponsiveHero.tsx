"use client";

import { useEffect, useState } from "react";
import MobileStoryHero from "./MobileStoryHero";
import VideoHero from "./VideoHero";

export default function ResponsiveHero() {
  const [isMounted, setIsMounted] = useState(false);
  const [isMobile, setIsMobile] = useState(true); // default to mobile or desktop doesn't matter much if we delay

  useEffect(() => {
    setIsMounted(true);
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // During SSR and initial hydration, we render placeholders that match the height 
  // to avoid Cumulative Layout Shift (CLS) as much as possible, or just render the CSS hidden versions.
  // Actually, rendering the CSS hidden versions during SSR is good for SEO, but we don't want the 
  // assets to download. But if we use 'src' in the React elements, they download.

  if (!isMounted) {
    // Return empty structural placeholders that CSS hides appropriately
    return (
      <>
        <div className="block md:hidden h-[calc(100vh-73px)] sm:h-screen w-full bg-black"></div>
        <div className="hidden md:block h-[350vh] md:h-[500vh] w-full bg-black"></div>
      </>
    );
  }

  return isMobile ? <MobileStoryHero /> : <VideoHero />;
}
