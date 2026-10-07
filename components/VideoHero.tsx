"use client";

import { useEffect, useRef } from "react";

export default function VideoHero() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) return;

    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    let targetScroll = 0;   // The raw scrollbar percentage (0.0 to 1.0)
    let currentScrub = 0;   // The smoothly interpolated percentage (0.0 to 1.0)
    let isSeeking = false;
    let rafId: number;

    // --- Dynamic Resizing (Safety Check)
    const syncSize = () => {
      if (!video || video.videoWidth === 0) return;
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    };

    // --- Fast Canvas Blitting
    const drawFrame = () => {
      if (video.readyState >= 2) {
        syncSize();
        ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
      }
    };

    // --- Passive Scroll Listener
    const handleScroll = () => {
      if (!containerRef.current) return;
      const { top, height } = containerRef.current.getBoundingClientRect();
      const scrolled = -top;
      const maxScroll = height - window.innerHeight;
      // Calculate target percentage (bounded between 0 and 1)
      targetScroll = Math.max(0, Math.min(1, scrolled / maxScroll));
    };

    // --- The Mathematical Engine (Lerping + Seek Throttling)
    const tick = () => {
      // 1. The Math: Smoothly glide currentScrub 8% closer to targetScroll on every frame
      currentScrub += (targetScroll - currentScrub) * 0.08;

      // 2. The Video Controller: Only seek if duration is loaded (Safety Check) and decoder is ready
      if (video.readyState >= 1 && video.duration && !isSeeking) {
        const targetTime = currentScrub * video.duration;
        
        // Prevent micro-jitter seeking if we are already close enough
        if (Math.abs(video.currentTime - targetTime) > 0.01) {
          isSeeking = true;
          video.currentTime = targetTime;
        } else {
          // We are exactly on the frame, just draw it
          drawFrame();
        }
      }

      rafId = requestAnimationFrame(tick);
    };

    // When the browser finishes decoding the requested frame, unlock the seeker
    video.addEventListener("seeked", () => {
      isSeeking = false;
      drawFrame();
    });

    // --- Initialization & Warmup
    let warmedUp = false;
    const warmUp = () => {
      if (warmedUp || video.readyState < 1) return;
      warmedUp = true;
      video.play()
        .then(() => {
          setTimeout(() => {
            video.pause();
            video.currentTime = 0;
            drawFrame();
          }, 80);
        })
        .catch(() => {});
    };

    const init = () => {
      syncSize();
      handleScroll();
      warmUp();
      rafId = requestAnimationFrame(tick);
    };

    // Listeners
    video.addEventListener("loadedmetadata", init);
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => {
      syncSize();
      handleScroll(); // Recalculate maxScroll bounds if height changed
    });

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    const targetVideoUrl = isMobile
      ? "/videos/mobile-homepage-hero-section.mp4"
      : "/videos/homepage-hero-section.mp4";

    video.src = targetVideoUrl;
    video.load();

    // Clean Garbage Collection (Safety Check)
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", syncSize);
      video.removeEventListener("loadedmetadata", init);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black h-[350vh] md:h-[500vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

        {/* Hidden video decoder */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute opacity-0 pointer-events-none w-px h-px top-0 left-0"
        />

        {/* Visible Canvas Renderer */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ display: "block" }}
        />

        {/* Cinematic STUDIO Typography Overlay */}
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center z-10">
          <h1 className="font-display text-[28vw] md:text-[22vw] font-bold text-white uppercase leading-none select-none mix-blend-overlay opacity-90 tracking-widest">
            STUDIO
          </h1>
        </div>

        {/* Scroll Indicator */}
        <div className="pointer-events-none absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center gap-4 z-20">
          <span className="text-[10px] uppercase tracking-[0.5em] text-white font-bold drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
            Scroll to explore
          </span>
          <div className="h-16 w-[2px] bg-gradient-to-b from-white to-transparent animate-pulse rounded-full drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]" />
        </div>
      </div>
    </div>
  );
}