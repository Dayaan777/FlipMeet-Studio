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

    // ─── Resize canvas to exact device pixel ratio ───────────────────────────
    const syncSize = () => {
      const dpr = window.devicePixelRatio || 1;
      const w = canvas.offsetWidth;
      const h = canvas.offsetHeight;
      if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
        canvas.width = w * dpr;
        canvas.height = h * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      }
    };

    // ─── Blit the current video frame onto the canvas ────────────────────────
    const drawFrame = () => {
      if (video.readyState < 2) return;
      syncSize();
      ctx.drawImage(video, 0, 0, canvas.offsetWidth, canvas.offsetHeight);
    };

    // ─── Seek pipeline: queue at most ONE pending seek ────────────────────────
    const commitSeek = (t: number) => {
      if (isSeeking) {
        // Don't pile up seeks — just remember the latest target
        hasPendingSeek = true;
        return;
      }
      isSeeking = true;
      video.currentTime = t;
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

    // ─── Scroll handler (runs on scroll, passive) ────────────────────────────
    const handleScroll = () => {
      if (!containerRef.current || !video.duration) return;
      const { top, height } = containerRef.current.getBoundingClientRect();
      const scrolled = -top;
      const maxScroll = height - window.innerHeight;
      const progress = Math.max(0, Math.min(1, scrolled / maxScroll));
      const newTarget = progress * video.duration;

      // Only seek if the target moved more than one video frame (~16ms worth)
      if (Math.abs(newTarget - targetTime) > 0.01) {
        targetTime = newTarget;
        commitSeek(targetTime);
      }
    };

    // ─── RAF loop — keeps canvas visually in sync at full display refresh rate ─
    const tick = () => {
      // While not seeking, continuously blit so the canvas never goes stale
      if (!isSeeking && video.readyState >= 2) {
        drawFrame();
      }
      rafId = requestAnimationFrame(tick);
    };

    // ─── Warm up the decoder so the first scroll is instant ──────────────────
    const warmUp = () => {
      // Play a few milliseconds then pause — loads decoder state into memory
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
      className="relative w-full bg-black"
      style={{ height: "600vh" }}
    >
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">

        {/* Hidden video — decode-only, never rendered directly */}
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="hidden"
          src="/videos/homepage-hero-section.mp4"
        />

        {/* Canvas — the only visible surface; frames are blitted here */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full object-cover"
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
