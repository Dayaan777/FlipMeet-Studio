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
  title: "THE SQUAD",
  subtitle: "Street Collective Oversized Mesh Jerseys & Baggy Denim",
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
  subtitle: "Green Athletic Mesh Jersey Studio Table Review",
  src: "/videos/WhatsApp%20Video%202026-09-09%20at%206.44.21%20PM.mp4",
  poster: "/images/reels/thumb-06.jpg",
  tag: "06",
 },
];

export default function VideoCarousel() {
 const [active, setActive] = useState(0);
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
   video.muted = true;
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
   className="relative overflow-hidden px-4 py-10 sm:px-6 md:py-14"
   aria-labelledby="in-motion-heading"
  >
   {/* Background ambient orange glow behind center stage */}
   <div
    aria-hidden="true"
    className="pointer-events-none absolute left-1/2 top-1/2 h-[520px] w-[520px] -translate-x-1/2 -translate-y-1/2 blur-2xl"
    style={{ background: "radial-gradient(ellipse at center, rgb(var(--accent) / 0.12) 0%, rgb(var(--accent) / 0.03) 45%, transparent 70%)" }}
   />

   <div className="relative mx-auto max-w-7xl">
    {/* Section label & heading */}
    <div className="mb-8 text-center md:mb-10">
     <p className="mb-2 text-xs tracking-[0.28em] text-accent">IN MOTION</p>
     <h2
      id="in-motion-heading"
      className="font-display text-3xl tracking-wide text-[#1c1510] md:text-4xl"
     >
      EDITORIAL ARCHIVE
     </h2>
     <p className="mt-2 text-xs tracking-wider text-[#4e4034]">
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
     {/* Desktop Side navigation arrows */}
     <button
      type="button"
      aria-label="Previous video"
      onClick={() => shift(-1)}
      className="hidden sm:flex absolute left-6 top-[38%] z-30 size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#4a3f35] bg-[#181412]/85 text-lg text-[#f5eee6] backdrop-blur-sm transition-all hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:left-12 md:size-12 md:text-xl"
     >
      <span aria-hidden="true">←</span>
     </button>

     <button
      type="button"
      aria-label="Next video"
      onClick={() => shift(1)}
      className="hidden sm:flex absolute right-6 top-[38%] z-30 size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#4a3f35] bg-[#181412]/85 text-lg text-[#f5eee6] backdrop-blur-sm transition-all hover:border-accent hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:right-12 md:size-12 md:text-xl"
     >
      <span aria-hidden="true">→</span>
     </button>

     {/* Left/right edge dissolves for cinema depth */}
     <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-20 bg-gradient-to-r from-black/40 to-transparent sm:block md:w-36 lg:w-48"
     />
     <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-20 bg-gradient-to-l from-black/40 to-transparent sm:block md:w-36 lg:w-48"
     />

     {/* Reel stage viewport */}
     <div className="relative mb-4 h-[490px] w-[82vw] max-w-[310px] sm:mb-0 sm:h-[540px] sm:w-full sm:max-w-[340px] md:h-[590px] md:max-w-[370px]">
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
           muted
           loop
           autoPlay={isActive}
           preload={isActive ? "metadata" : "none"}
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
             HT // {video.tag}
            </span>

            <div className="flex items-center gap-2">
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

     {/* Caption below center video */}
     <div className="relative z-20 mt-4 sm:mt-8 flex flex-col items-center text-center px-4">
      <p className="text-[12px] font-bold uppercase tracking-widest text-[#1c1510] md:text-[13px]">
       {currentVideo.title}
      </p>
      <p className="mt-1 text-[11px] font-normal tracking-wide text-[#4e4034]">
       {currentVideo.subtitle}
      </p>

      {/* Mobile navigation arrows (positioned cleanly below subtext) */}
      <div className="mt-4 flex items-center justify-center gap-4 sm:hidden">
       <button
        type="button"
        aria-label="Previous video"
        onClick={() => shift(-1)}
        className="flex size-10 items-center justify-center rounded-full border border-[#4a3f35] bg-[#181412] text-lg text-[#f5eee6] shadow-md transition-all active:scale-95 hover:border-accent hover:text-accent focus-visible:outline-none"
       >
        <span aria-hidden="true">←</span>
       </button>
       <button
        type="button"
        aria-label="Next video"
        onClick={() => shift(1)}
        className="flex size-10 items-center justify-center rounded-full border border-[#4a3f35] bg-[#181412] text-lg text-[#f5eee6] shadow-md transition-all active:scale-95 hover:border-accent hover:text-accent focus-visible:outline-none"
       >
        <span aria-hidden="true">→</span>
       </button>
      </div>
     </div>

     {/* Small orange progress dots matching the site's existing dot style (6 dots total) */}
     <div
      className="mt-6 flex items-center justify-center gap-2"
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
            ? "h-0.5 w-7 bg-accent"
            : "size-2 rounded-full bg-white/30 hover:bg-white/60"
          }`}
          style={isSelected ? { boxShadow: "0 0 8px rgb(var(--accent) / 0.6)" } : undefined}
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
