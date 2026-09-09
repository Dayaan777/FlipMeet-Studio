"use client";

import { useState, useRef, useEffect, useCallback } from "react";

export type VideoItem = {
  id: string;
  title: string;
  subtitle: string;
  src: string;
  poster: string;
  tag: string;
};

const realVideos: VideoItem[] = [
  {
    id: "reel-01",
    title: "DROP 001 // THE SQUAD",
    subtitle: "Street Collective — Oversized Mesh Jerseys & Baggy Denim",
    src: "/videos/WhatsApp%20Video%202026-09-09%20at%206.40.50%20PM.mp4",
    poster: "/images/reels/thumb-01.jpg",
    tag: "01",
  },
  {
    id: "reel-02",
    title: "LOOK 01 // DREAMER 94",
    subtitle: "Heavyweight Navy Jersey + Baggy Denim Silhouette",
    src: "/videos/WhatsApp%20Video%202026-09-09%20at%206.41.42%20PM%20(1).mp4",
    poster: "/images/reels/thumb-02.jpg",
    tag: "02",
  },
  {
    id: "reel-03",
    title: "LOOK 02 // GOJO PURPLE",
    subtitle: "Oversized Anime Print Jersey + Ice Blue Denim",
    src: "/videos/WhatsApp%20Video%202026-09-09%20at%206.41.42%20PM.mp4",
    poster: "/images/reels/thumb-03.jpg",
    tag: "03",
  },
  {
    id: "reel-04",
    title: "LOOK 03 // GREEN 90 + PATCHWORK",
    subtitle: "Athletic Mesh Top + Dual-Tone Baggy Denim",
    src: "/videos/WhatsApp%20Video%202026-09-09%20at%206.41.57%20PM.mp4",
    poster: "/images/reels/thumb-04.jpg",
    tag: "04",
  },
  {
    id: "reel-05",
    title: "CRAFT // EMBROIDERY DETAIL",
    subtitle: "High-Density Thread Stitching on Heavyweight Mesh",
    src: "/videos/WhatsApp%20Video%202026-09-09%20at%206.43.43%20PM.mp4",
    poster: "/images/reels/thumb-05.jpg",
    tag: "05",
  },
  {
    id: "reel-06",
    title: "STUDIO CUT // ZORO 03",
    subtitle: "Green Athletic Mesh Jersey — Studio Table Review",
    src: "/videos/WhatsApp%20Video%202026-09-09%20at%206.44.21%20PM.mp4",
    poster: "/images/reels/thumb-06.jpg",
    tag: "06",
  },
];

export default function VideoCarousel() {
  const [active, setActive] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const total = realVideos.length;

  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);

  const shift = useCallback((direction: number) => {
    setActive((prev) => (prev + direction + total) % total);
  }, [total]);

  // Handle play/pause on active index change
  useEffect(() => {
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === active) {
        video.currentTime = 0;
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => {
              video.muted = true;
              video.play().catch(() => setIsPlaying(false));
            });
        }
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  }, [active]);

  // Sync mute state across videos
  useEffect(() => {
    videoRefs.current.forEach((video) => {
      if (video) {
        video.muted = isMuted;
      }
    });
  }, [isMuted]);

  // Touch swipe support for mobile
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null) return;
    const threshold = 45;
    if (touchDeltaX.current > threshold) {
      shift(-1);
    } else if (touchDeltaX.current < -threshold) {
      shift(1);
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
  };

  const currentVideo = realVideos[active];

  // Helper to calculate circular relative distance
  const getRelativePosition = (index: number) => {
    let diff = index - active;
    while (diff > total / 2) diff -= total;
    while (diff < -total / 2) diff += total;
    return diff;
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted((prev) => !prev);
  };

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    const activeVideo = videoRefs.current[active];
    if (!activeVideo) return;
    if (activeVideo.paused) {
      activeVideo.play();
      setIsPlaying(true);
    } else {
      activeVideo.pause();
      setIsPlaying(false);
    }
  };

  return (
    <section
      className="relative overflow-hidden border-b border-base-border px-4 py-20 sm:px-6 md:py-28"
      aria-labelledby="in-motion-heading"
    >
      {/* Background ambient orange glow behind center stage */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 bg-[radial-gradient(ellipse_at_center,rgba(255,77,30,0.12)_0%,rgba(255,77,30,0.03)_45%,transparent_70%)] blur-2xl"
      />

      <div className="relative mx-auto max-w-7xl">
        {/* Section label & heading */}
        <div className="mb-12 text-center md:mb-16">
          <p className="mb-2 text-xs tracking-[0.28em] text-accent">IN MOTION</p>
          <h2
            id="in-motion-heading"
            className="font-display text-3xl tracking-wide text-text-primary md:text-4xl"
          >
            DROP 001 — EDITORIAL ARCHIVE
          </h2>
          <p className="mt-2 text-xs tracking-wider text-text-secondary">
            CAMPAIGN FOOTAGE. STREET LEVEL. RAW CUTS.
          </p>
        </div>

        {/* Carousel stage container */}
        <div
          className="relative mx-auto flex flex-col items-center"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Side navigation arrows */}
          <button
            type="button"
            aria-label="Previous video"
            onClick={() => shift(-1)}
            className="absolute bottom-12 left-1/2 z-30 flex size-10 -translate-x-[calc(100%+0.75rem)] items-center justify-center rounded-full border border-text-secondary/50 bg-base-bg/80 text-lg text-text-primary backdrop-blur-sm transition-all hover:border-text-primary hover:bg-text-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:left-6 sm:top-[38%] sm:bottom-auto sm:translate-x-0 sm:-translate-y-1/2 md:left-12 md:size-12 md:text-xl"
          >
            <span aria-hidden="true">←</span>
          </button>

          <button
            type="button"
            aria-label="Next video"
            onClick={() => shift(1)}
            className="absolute bottom-12 left-1/2 z-30 flex size-10 translate-x-3/4 items-center justify-center rounded-full border border-text-secondary/50 bg-base-bg/80 text-lg text-text-primary backdrop-blur-sm transition-all hover:border-text-primary hover:bg-text-primary/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent sm:right-6 sm:left-auto sm:top-[38%] sm:bottom-auto sm:translate-x-0 sm:-translate-y-1/2 md:right-12 md:size-12 md:text-xl"
          >
            <span aria-hidden="true">→</span>
          </button>

          {/* Left/right edge dissolves for cinema depth */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-20 bg-gradient-to-r from-base-bg via-base-bg/80 to-transparent sm:block md:w-36 lg:w-48"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-20 bg-gradient-to-l from-base-bg via-base-bg/80 to-transparent sm:block md:w-36 lg:w-48"
          />

          {/* Reel stage viewport */}
          <div className="relative mb-16 h-[490px] w-[82vw] max-w-[310px] sm:mb-0 sm:h-[540px] sm:w-full sm:max-w-[340px] md:h-[590px] md:max-w-[370px]">
            {realVideos.map((video, index) => {
              const rel = getRelativePosition(index);
              const isActive = rel === 0;
              const isPrev = rel === -1;
              const isNext = rel === 1;
              const isVisible = Math.abs(rel) <= 1;

              // Smooth translate and scale inspired by Instagram Story carousel
              let transformStyle = "translate3d(0, 0, 0) scale(1)";
              let opacityStyle = 1;
              let zIndex = 20;

              if (isActive) {
                transformStyle = "translate3d(0, 0, 0) scale(1)";
                opacityStyle = 1;
                zIndex = 20;
              } else if (isPrev) {
                transformStyle = "translate3d(-124%, 0, 0) scale(0.82)";
                opacityStyle = 0.38;
                zIndex = 10;
              } else if (isNext) {
                transformStyle = "translate3d(124%, 0, 0) scale(0.82)";
                opacityStyle = 0.38;
                zIndex = 10;
              } else {
                transformStyle = `translate3d(${rel * 140}%, 0, 0) scale(0.72)`;
                opacityStyle = 0;
                zIndex = 0;
              }

              return (
                <div
                  key={video.id}
                  onClick={() => {
                    if (!isActive) shift(rel > 0 ? 1 : -1);
                  }}
                  className={`absolute inset-0 transition-all duration-500 ease-out ${
                    isActive ? "cursor-pointer" : "cursor-pointer hover:opacity-60"
                  } ${!isVisible ? "pointer-events-none" : ""}`}
                  style={{
                    transform: transformStyle,
                    opacity: opacityStyle,
                    zIndex,
                  }}
                >
                  {/* Video frame: raw, full-bleed, borderless */}
                  <div className="relative h-full w-full overflow-hidden bg-base-surface">
                    <video
                      ref={(el) => {
                        videoRefs.current[index] = el;
                      }}
                      src={video.src}
                      poster={video.poster}
                      playsInline
                      muted={isMuted}
                      loop
                      autoPlay={isActive}
                      preload={isVisible ? "auto" : "none"}
                      className="h-full w-full object-cover"
                    />

                    {/* Subtle vignette gradient top and bottom for raw film look */}
                    <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

                    {/* Top status bar overlay on active video */}
                    {isActive && (
                      <div className="absolute inset-x-0 top-3 z-20 flex items-center justify-between px-3.5">
                        <span className="flex items-center gap-1.5 text-[9px] font-bold tracking-widest text-accent">
                          <span className="size-1.5 animate-pulse rounded-full bg-accent" />
                          FM // {video.tag}
                        </span>

                        <div className="flex items-center gap-2">
                          {/* Audio toggle button */}
                          <button
                            type="button"
                            onClick={toggleSound}
                            aria-label={isMuted ? "Unmute video" : "Mute video"}
                            className="flex items-center gap-1 rounded-sm border border-white/20 bg-black/60 px-2 py-1 text-[9px] font-medium tracking-wider text-text-primary backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
                          >
                            {isMuted ? "MUTED" : "SOUND ON"}
                          </button>

                          {/* Play/pause toggle */}
                          <button
                            type="button"
                            onClick={togglePlay}
                            aria-label={isPlaying ? "Pause video" : "Play video"}
                            className="flex size-6 items-center justify-center rounded-sm border border-white/20 bg-black/60 text-[10px] text-text-primary backdrop-blur-sm transition-colors hover:border-accent hover:text-accent"
                          >
                            {isPlaying ? "❚❚" : "▶"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Caption below center video: bold uppercase title + thin gray subtext + orange underline */}
          <div className="relative z-20 mt-8 flex min-h-16 flex-col items-center text-center">
            <p className="text-[12px] font-bold uppercase tracking-widest text-text-primary md:text-[13px]">
              {currentVideo.title}
            </p>
            <p className="mt-1 text-[11px] font-normal tracking-wide text-text-secondary">
              {currentVideo.subtitle}
            </p>
            {/* Orange underline matching "LOOK 01" style */}
            <span className="mt-3 block h-0.5 w-7 bg-accent" />
          </div>

          {/* Small orange progress dots matching the site's existing dot style (6 dots total) */}
          <div
            className="mt-10 flex items-center justify-center gap-2 sm:mt-6"
            role="tablist"
            aria-label="Video carousel pagination"
          >
            {realVideos.map((video, idx) => {
              const isSelected = idx === active;
              return (
                <button
                  key={video.id}
                  type="button"
                  role="tab"
                  aria-selected={isSelected}
                  aria-label={`Go to slide ${idx + 1}: ${video.title}`}
                  onClick={() => setActive(idx)}
                  className="flex h-5 items-center justify-center px-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
                >
                  <span
                    className={`block transition-all duration-300 ${
                      isSelected
                        ? "h-0.5 w-7 bg-accent shadow-[0_0_8px_rgba(255,77,30,0.6)]"
                        : "size-2 rounded-full bg-white/30 hover:bg-white/60"
                    }`}
                  />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
