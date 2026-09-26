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

    // desynchronized = skip the browser compositing queue for lowest latency
    const ctx = canvas.getContext("2d", { alpha: false, desynchronized: true });
    if (!ctx) return;

    let targetTime = 0;
    let isSeeking = false;
    let hasPendingSeek = false;
    let rafId: number;

    // â”€â”€â”€ Match canvas buffer to exact video dimensions â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const syncSize = () => {
      if (!video || video.videoWidth === 0) return;
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    };

    // â”€â”€â”€ Blit the current video frame onto the canvas 1:1 â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const drawFrame = () => {
      if (video.readyState < 2) return;
      syncSize();
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    };

    // â”€â”€â”€ Seek pipeline: queue at most ONE pending seek â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const commitSeek = (t: number) => {
      if (isSeeking) {
        // Don't pile up seeks â€” just remember the latest target
        hasPendingSeek = true;
        return;
      }
      isSeeking = true;
      // Use fastSeek on mobile browsers for massively improved FPS/lag reduction
      if (typeof video.fastSeek === 'function') {
        video.fastSeek(t);
      } else {
        video.currentTime = t;
      }
    };

    // When the browser finishes decoding a frame, draw it immediately
    video.addEventListener("seeked", () => {
      drawFrame();
      isSeeking = false;
      if (hasPendingSeek) {
        hasPendingSeek = false;
        commitSeek(targetTime);
      }
    });

    // â”€â”€â”€ Scroll handler (runs on scroll, passive) â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const handleScroll = () => {
      if (!containerRef.current || !video.duration) return;
      const { top, height } = containerRef.current.getBoundingClientRect();
      const scrolled = -top;
      const maxScroll = height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / maxScroll));
      const newTarget = progress * video.duration;

      // Only seek if the target moved more than one video frame (~16ms worth)
      if (Math.abs(newTarget - targetTime) > 0.033) { // Reduced seek frequency to boost FPS on mobile
        targetTime = newTarget;
        commitSeek(targetTime);
      }
    };

    // â”€â”€â”€ RAF loop â€” keeps canvas visually in sync at full display refresh rate â”€
    const tick = () => {
      // While not seeking, continuously blit so the canvas never goes stale
      if (!isSeeking && video.readyState >= 2) {
        drawFrame();
      }
      rafId = requestAnimationFrame(tick);
    };

    // â”€â”€â”€ Warm up the decoder so the first scroll is instant â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const warmUp = () => {
      // Play a few milliseconds then pause â€” loads decoder state into memory
      video.play()
        .then(() => {
          setTimeout(() => {
            video.pause();
            video.currentTime = 0;
          }, 80);
        })
        .catch(() => {});
    };

    video.addEventListener("loadeddata", () => {
      syncSize();
      drawFrame();
      handleScroll();
      warmUp();
      rafId = requestAnimationFrame(tick);
    });

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => { syncSize(); drawFrame(); });

    // Determine mobile vs desktop video
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    video.src = isMobile ? "/videos/mobile-homepage-hero-section.mp4" : "/videos/homepage-hero-section.mp4";

    // Kick off metadata load
    video.load();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black h-[350vh] md:h-[500vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

        {/* Hidden video â€” decode-only, never rendered directly */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="hidden"
        />

        {/* Canvas â€” the only visible surface; frames are blitted here */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover object-center"
          style={{ display: "block" }}
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
