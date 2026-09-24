"use client";

import { useEffect, useRef } from "react";

export default function VideoHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    // Force preload for smooth frame scrubbing
    video.load();
    // Pause video since we are controlling it via scroll
    video.pause();

    let targetTime = 0;
    let actualTime = 0; // Smoothed time
    let animationFrameId: number;

    const handleScroll = () => {
      if (!containerRef.current || !videoRef.current) return;
      const { top, height } = containerRef.current.getBoundingClientRect();
      const scrolled = -top;
      const maxScroll = height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / maxScroll));

      if (Number.isFinite(videoRef.current.duration) && videoRef.current.duration > 0) {
        targetTime = progress * videoRef.current.duration;
      }
    };

    const updateVideo = () => {
      const video = videoRef.current;
      if (video) {
        // True lerp: glide towards the target time smoothly (0.07 = buttery smooth)
        actualTime += (targetTime - actualTime) * 0.07;

        if (Math.abs(actualTime - video.currentTime) > 0.01) {
          // Only push a new seek if the browser has finished decoding the last one
          if (!video.seeking) {
            video.currentTime = actualTime;
          }
        }
      }
      animationFrameId = window.requestAnimationFrame(updateVideo);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    video.addEventListener("loadedmetadata", handleScroll);
    
    // Start the optimized render loop
    animationFrameId = window.requestAnimationFrame(updateVideo);
    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      video.removeEventListener("loadedmetadata", handleScroll);
      window.cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div 
      ref={containerRef} 
      className="relative w-full bg-black" 
      style={{ height: "600vh" }} // Extended to 600vh for a slower, smoother scroll track
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black flex items-center justify-center">
        {/* Video */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="absolute inset-0 w-full h-full object-cover"
          src="/videos/homepage-hero-section.mp4"
        />

        {/* Cinematic "STUDIO" Typography Overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
          <h1 
            className="font-display text-[28vw] md:text-[22vw] font-bold text-white uppercase leading-none select-none mix-blend-overlay opacity-90 tracking-widest"
          >
            STUDIO
          </h1>
        </div>

        {/* Scroll Indicator */}
        <div className="pointer-events-none absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20">
          <span className="text-[9px] uppercase tracking-[0.5em] text-white/70 font-semibold">
            Scroll to explore
          </span>
          <div className="h-16 w-[2px] bg-gradient-to-b from-white/50 to-transparent animate-pulse rounded-full" />
        </div>
      </div>
    </div>
  );
}
