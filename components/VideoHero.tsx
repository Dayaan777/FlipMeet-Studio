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
    let rafStarted = false;

    // --- Match canvas buffer to exact video dimensions
    const syncSize = () => {
      if (!video || video.videoWidth === 0) return;
      if (canvas.width !== video.videoWidth || canvas.height !== video.videoHeight) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
      }
    };

    // --- Blit the current video frame onto the canvas 1:1
    const drawFrame = () => {
      if (video.readyState < 2) return;
      syncSize();
      ctx.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
    };

    // --- Seek pipeline: queue at most ONE pending seek
    const commitSeek = (t: number) => {
      if (isSeeking) {
        hasPendingSeek = true;
        return;
      }
      isSeeking = true;
      if (typeof video.fastSeek === "function") {
        video.fastSeek(t);
      } else {
        video.currentTime = t;
      }
    };

    video.addEventListener("seeked", () => {
      drawFrame();
      isSeeking = false;
      if (hasPendingSeek) {
        hasPendingSeek = false;
        commitSeek(targetTime);
      }
    });

    // --- Scroll handler
    const handleScroll = () => {
      if (!containerRef.current || !video.duration) return;
      const { top, height } = containerRef.current.getBoundingClientRect();
      const scrolled = -top;
      const maxScroll = height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / maxScroll));
      const newTarget = progress * video.duration;

      if (Math.abs(newTarget - targetTime) > 0.033) {
        targetTime = newTarget;
        commitSeek(targetTime);
      }
    };

    // --- RAF loop
    const startRaf = () => {
      if (rafStarted) return;
      rafStarted = true;
      const tick = () => {
        if (!isSeeking && video.readyState >= 2) {
          drawFrame();
        }
        rafId = requestAnimationFrame(tick);
      };
      rafId = requestAnimationFrame(tick);
    };

    // --- Warm up decoder - MUST fire from a real user gesture.
    // We piggyback on the first click anywhere (always the Gender Gate for new users).
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

    const onFirstInteraction = () => {
      warmUp();
      window.removeEventListener("click", onFirstInteraction, true);
      window.removeEventListener("touchend", onFirstInteraction, true);
    };

    // Capture phase catches Gender Gate click before propagation stops
    window.addEventListener("click", onFirstInteraction, true);
    window.addEventListener("touchend", onFirstInteraction, true);

    // --- Video readiness: fire on whichever event arrives first.
    // iOS Safari often skips loadeddata but fires canplay reliably.
    let initialised = false;
    const onReady = () => {
      if (initialised) return;
      initialised = true;
      syncSize();
      drawFrame();
      handleScroll();
      startRaf();
      // Attempt warm-up in case user has already interacted (returning users / fast loads)
      if (!warmedUp) warmUp();
    };

    video.addEventListener("loadeddata",     onReady);
    video.addEventListener("canplay",        onReady);
    video.addEventListener("canplaythrough", onReady);

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", () => { syncSize(); drawFrame(); });

    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    video.src = isMobile
      ? "/videos/mobile-homepage-hero-section.mp4"
      : "/videos/homepage-hero-section.mp4";

    video.load();

    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("click", onFirstInteraction, true);
      window.removeEventListener("touchend", onFirstInteraction, true);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-black h-[350vh] md:h-[500vh]"
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

        {/*
          Video is NOT hidden with display:none - that suppresses browser
          preloading and decoding entirely on first visit.
          We render it visually invisible but layout-present so the browser
          keeps downloading and decoding frames while the Gender Gate is up.
        */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
          className="absolute opacity-0 pointer-events-none w-px h-px top-0 left-0"
        />

        {/* Canvas - the only visible surface */}
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