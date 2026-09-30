"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Hotspot {
  id: string;
  name: string;
  price: number;
  slug: string;
  image: string;
  x: number; // % from left (0-100)
  y: number; // % from top  (0-100)
}

interface Slide {
  type: "image" | "video";
  src: string;
  duration?: number; // ms — image slides only
  hotspots: Hotspot[];
}

// ─── Slide data ───────────────────────────────────────────────────────────────
// Adjust x/y values to land dots precisely on each garment after testing on device.
// x = % from left edge, y = % from top edge.
const SLIDES: Slide[] = [
  {
    type: "image",
    src: "/videos/mobile-ui/1st-slide.png",
    duration: 5500,
    hotspots: [
      {
        id: "dreamer-jersey",
        name: "Dreamer 84 Mesh Football Jersey",
        price: 23500,
        slug: "dreamer-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/dreamer-jersey.png",
        x: 20, y: 42,
      },
      {
        id: "anime-op-flame-jersey",
        name: "One Piece Flame Jersey",
        price: 16500,
        slug: "anime-op-flame-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-op-flame-jersey.png",
        x: 50, y: 40,
      },
      {
        id: "saint-culture-jersey",
        name: "Saint Culture Jersey",
        price: 19500,
        slug: "saint-culture-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/saint-culture-jersey.png",
        x: 80, y: 42,
      },
    ],
  },
  {
    type: "video",
    src: "/videos/mobile-ui/2nd-slide.mp4",
    hotspots: [
      {
        id: "anime-zoro-green-jersey",
        name: "One Piece Zoro Green Jersey",
        price: 16500,
        slug: "anime-zoro-green-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-zoro-green-jersey.png",
        x: 10, y: 42,
      },
      {
        id: "saint-culture-jersey-s2",
        name: "Saint Culture Jersey",
        price: 19500,
        slug: "saint-culture-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/saint-culture-jersey.png",
        x: 29, y: 40,
      },
      {
        id: "dreamer-jersey-s2",
        name: "Dreamer 84 Mesh Football Jersey",
        price: 23500,
        slug: "dreamer-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/dreamer-jersey.png",
        x: 50, y: 42,
      },
      {
        id: "anime-op-flame-jersey-s2",
        name: "One Piece Flame Jersey",
        price: 16500,
        slug: "anime-op-flame-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-op-flame-jersey.png",
        x: 70, y: 40,
      },
      {
        id: "limited-edition-1996-red-shirt",
        name: "1996 Vintage Red Quarter-Zip Polo",
        price: 23500,
        slug: "limited-edition-1996-red-shirt",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/limited-edition-1996-red-shirt.png",
        x: 89, y: 42,
      },
    ],
  },
  {
    type: "video",
    src: "/videos/mobile-ui/3rd-slide.mp4",
    hotspots: [
      {
        id: "limited-edition-1996-red-shirt-s3",
        name: "1996 Vintage Red Quarter-Zip Polo",
        price: 23500,
        slug: "limited-edition-1996-red-shirt",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/limited-edition-1996-red-shirt.png",
        x: 30, y: 42,
      },
      {
        id: "saint-culture-jersey-s3",
        name: "Saint Culture Jersey",
        price: 19500,
        slug: "saint-culture-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/saint-culture-jersey.png",
        x: 70, y: 42,
      },
    ],
  },
];

function formatPrice(price: number) {
  return `PKR ${price.toLocaleString()}`;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function MobileStoryHero() {
  const [activeIndex, setActiveIndex]           = useState(0);
  const [progress, setProgress]                 = useState(0);
  const [isPaused, setIsPaused]                 = useState(false);
  const [isDiscoveryMode, setIsDiscoveryMode]   = useState(false);
  const [activeHotspot, setActiveHotspot]       = useState<Hotspot | null>(null);

  const videoRef       = useRef<HTMLVideoElement>(null);
  const rafRef         = useRef<number>(0);
  const startTimeRef   = useRef<number>(0);
  const accumulatedRef = useRef<number>(0);
  // Touch tracking — all stored in refs so handlers always read fresh values
  const touchStartX    = useRef<number>(0);
  const touchStartY    = useRef<number>(0);

  const currentSlide = SLIDES[activeIndex];

  // ─── Navigation ───────────────────────────────────────────────────────────
  const goToSlide = useCallback((index: number) => {
    cancelAnimationFrame(rafRef.current);
    accumulatedRef.current = 0;
    setActiveIndex(index);
    setProgress(0);
    setIsDiscoveryMode(false);
    setActiveHotspot(null);
    setIsPaused(false);
  }, []);

  const advanceSlide = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    accumulatedRef.current = 0;
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    setProgress(0);
    setIsDiscoveryMode(false);
    setActiveHotspot(null);
    // NOTE: do not reset isPaused here — if user paused, stay paused on next slide
  }, []);

  // ─── Image slide timer ────────────────────────────────────────────────────
  useEffect(() => {
    if (currentSlide.type !== "image") return;
    const DURATION = currentSlide.duration ?? 5500;
    cancelAnimationFrame(rafRef.current);

    if (isPaused || isDiscoveryMode) return;

    startTimeRef.current = performance.now() - accumulatedRef.current;

    const tick = (now: number) => {
      const pct = Math.min(((now - startTimeRef.current) / DURATION) * 100, 100);
      setProgress(pct);
      if (pct >= 100) { advanceSlide(); return; }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
      accumulatedRef.current = performance.now() - startTimeRef.current;
    };
  }, [currentSlide, isPaused, isDiscoveryMode, advanceSlide]);

  // ─── Video: LOAD only when the slide index changes ────────────────────────
  // CRITICAL: isPaused and isDiscoveryMode are NOT in the dep array.
  // This guarantees video.load() is NEVER called when toggling discovery mode.
  useEffect(() => {
    if (currentSlide.type !== "video") return;
    const video = videoRef.current;
    if (!video) return;

    video.src = currentSlide.src;
    video.load();
    setProgress(0);

    const onTimeUpdate = () => {
      if (video.duration) setProgress((video.currentTime / video.duration) * 100);
    };
    const onEnded = () => advanceSlide();
    const onCanPlay = () => video.play().catch(() => {});

    video.addEventListener("timeupdate", onTimeUpdate);
    video.addEventListener("ended",      onEnded);
    video.addEventListener("canplay",    onCanPlay);

    return () => {
      video.removeEventListener("timeupdate", onTimeUpdate);
      video.removeEventListener("ended",      onEnded);
      video.removeEventListener("canplay",    onCanPlay);
      video.pause();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeIndex]);

  // ─── Video: PLAY/PAUSE only when paused state changes ────────────────────
  // Separated from load effect so browser preserves currentTime on toggle.
  useEffect(() => {
    if (currentSlide.type !== "video") return;
    const video = videoRef.current;
    if (!video) return;
    if (isPaused || isDiscoveryMode) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [isPaused, isDiscoveryMode, currentSlide.type]);

  // ─── Discovery mode toggle (called once per tap) ──────────────────────────
  const toggleDiscovery = useCallback(() => {
    setIsDiscoveryMode((prev) => {
      const entering = !prev;
      if (entering) {
        // Entering discovery → pause
        setIsPaused(true);
      } else {
        // Exiting discovery → snapshot image progress, resume
        if (currentSlide.type === "image") {
          // accumulatedRef is already set by the RAF cleanup; no extra work needed
        }
        setActiveHotspot(null);
        setIsPaused(false);
      }
      return entering;
    });
  }, [currentSlide.type]);

  // ─── Touch handlers ───────────────────────────────────────────────────────
  // All touch logic lives here. The interaction overlay (z-10) sits above the
  // media and video element so touch events are always reliably captured.
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    // Always preventDefault to stop mobile from also firing a click event.
    // Without this, every tap fires BOTH onTouchEnd AND onClick, calling the
    // handler twice which immediately toggles back to the previous state.
    e.preventDefault();

    const dx    = e.changedTouches[0].clientX - touchStartX.current;
    const dy    = e.changedTouches[0].clientY - touchStartY.current;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Horizontal swipe (dominant direction, > 50px)
    if (absDx > 50 && absDx > absDy * 1.5) {
      if (dx < 0) goToSlide((activeIndex + 1) % SLIDES.length);
      else        goToSlide((activeIndex - 1 + SLIDES.length) % SLIDES.length);
      return;
    }

    // Short movement = tap → toggle discovery mode
    if (absDx < 12 && absDy < 12) {
      toggleDiscovery();
    }
  }, [activeIndex, goToSlide, toggleDiscovery]);

  // Desktop mouse click fallback (touch devices won't reach here due to preventDefault above)
  const handleMouseClick = useCallback(() => {
    toggleDiscovery();
  }, [toggleDiscovery]);

  const handleHotspotTap = (e: React.MouseEvent | React.TouchEvent, hotspot: Hotspot) => {
    e.stopPropagation();
    if ("preventDefault" in e) (e as React.TouchEvent).preventDefault?.();
    setActiveHotspot((prev) => (prev?.id === hotspot.id ? null : hotspot));
  };

  const handlePauseToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isDiscoveryMode) {
      setIsDiscoveryMode(false);
      setActiveHotspot(null);
      setIsPaused(false);
    } else {
      if (currentSlide.type === "image" && !isPaused) {
        accumulatedRef.current = (progress / 100) * (currentSlide.duration ?? 5500);
      }
      setIsPaused((prev) => !prev);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-[88dvh] bg-black overflow-hidden select-none">

      {/* ── Media (no event handlers — interaction handled by overlay below) ── */}
      <div className="absolute inset-0">
        {currentSlide.type === "image" && (
          <Image
            src={currentSlide.src}
            alt="FlipMeet Studio Collection"
            fill priority
            className="object-cover object-center"
            sizes="100vw"
            draggable={false}
          />
        )}
        <video
          ref={videoRef}
          muted playsInline preload="auto"
          className={`absolute inset-0 w-full h-full object-cover object-center ${
            currentSlide.type === "video" ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
      </div>

      {/* ── Vignette ──────────────────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/65" />

      {/* ── Discovery dark tint ───────────────────────────────────────────── */}
      {isDiscoveryMode && (
        <div className="pointer-events-none absolute inset-0 bg-black/30 transition-opacity duration-300" />
      )}

      {/*
        ── INTERACTION OVERLAY ────────────────────────────────────────────────
        Sits at z-10, ABOVE the video element (which would otherwise swallow
        touch events on mobile). Handles ALL background taps and swipe gestures.
        Hotspots/cards at z-20+ sit above this overlay and handle their own taps.
      */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleMouseClick}
      />

      {/* ── Hotspot dots (z-20, above interaction overlay) ────────────────── */}
      {isDiscoveryMode && currentSlide.hotspots.map((hotspot) => (
        <div
          key={hotspot.id}
          className="absolute z-20 cursor-pointer"
          style={{
            left: `${hotspot.x}%`,
            top:  `${hotspot.y}%`,
            transform: "translate(-50%, -50%)",
          }}
          onTouchEnd={(e) => handleHotspotTap(e, hotspot)}
          onClick={(e) => handleHotspotTap(e, hotspot)}
        >
          {/* Pulse ring */}
          <div
            className="absolute rounded-full bg-white/20 animate-ping"
            style={{ inset: "-7px" }}
          />
          {/* Dot body */}
          <div className={`relative w-5 h-5 rounded-full border-2 border-white flex items-center justify-center transition-all duration-200 ${
            activeHotspot?.id === hotspot.id
              ? "bg-white scale-125"
              : "bg-white/25 backdrop-blur-sm"
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
              activeHotspot?.id === hotspot.id ? "bg-black" : "bg-white"
            }`} />
          </div>
        </div>
      ))}

      {/* ── Product card (z-30, above hotspots) ──────────────────────────── */}
      {activeHotspot && (
        <div
          className="absolute z-30 bottom-[72px] left-1/2 -translate-x-1/2 w-[calc(100%-32px)] max-w-xs"
          onTouchEnd={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <Link
            href={`/product/${activeHotspot.slug}`}
            className="flex items-center rounded-2xl overflow-hidden border border-white/10 bg-black/70 backdrop-blur-2xl shadow-2xl active:scale-[0.97] transition-transform duration-150"
          >
            <div className="relative w-20 h-20 flex-shrink-0 bg-white/5">
              <Image
                src={activeHotspot.image}
                alt={activeHotspot.name}
                fill className="object-cover" sizes="80px"
              />
            </div>
            <div className="flex-1 px-4 py-3">
              <p className="text-[8px] uppercase tracking-[0.28em] text-white/45 mb-1">
                FlipMeet Studio
              </p>
              <p className="text-[12px] font-bold text-white leading-snug tracking-wide line-clamp-2">
                {activeHotspot.name}
              </p>
              <p className="text-[11px] text-accent mt-1.5 font-semibold tracking-wider">
                {formatPrice(activeHotspot.price)}
              </p>
            </div>
            <div className="pr-4 text-white/40">
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M5 2.5l4.5 4.5L5 11.5" stroke="currentColor" strokeWidth="1.5"
                      strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </Link>
          <p className="text-center text-[9px] text-white/30 tracking-widest uppercase mt-2">
            Tap card to view product
          </p>
        </div>
      )}

      {/* ── Discovery hint ────────────────────────────────────────────────── */}
      {isDiscoveryMode && !activeHotspot && (
        <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 pointer-events-none z-20">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/55 text-center animate-pulse">
            Tap a dot to explore
          </p>
        </div>
      )}

      {/* ── Bottom controls (z-40, topmost) ──────────────────────────────── */}
      <div
        className="absolute bottom-5 right-4 z-40 flex items-center gap-2"
        onTouchEnd={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Progress bars */}
        <div className="flex items-center gap-1.5">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onTouchEnd={(e) => { e.stopPropagation(); goToSlide(i); }}
              onClick={() => goToSlide(i)}
              className="h-[3px] rounded-full overflow-hidden transition-all duration-300"
              style={{ width: i === activeIndex ? 38 : 22 }}
              aria-label={`Go to slide ${i + 1}`}
            >
              <div className="relative w-full h-full bg-white/30">
                <div
                  className="absolute left-0 top-0 h-full bg-white"
                  style={{
                    width:
                      i < activeIndex   ? "100%" :
                      i === activeIndex ? `${progress}%` :
                                          "0%",
                  }}
                />
              </div>
            </button>
          ))}
        </div>

        {/* Pause / Play */}
        <button
          onClick={handlePauseToggle}
          className="w-7 h-7 flex items-center justify-center rounded-full bg-black/35 backdrop-blur-sm border border-white/20 active:scale-90 transition-transform duration-150"
          aria-label={isPaused && !isDiscoveryMode ? "Play" : "Pause"}
        >
          {isPaused && !isDiscoveryMode ? (
            <svg width="9" height="11" viewBox="0 0 9 11" fill="none">
              <path d="M1 1l7 4.5L1 10V1z" fill="white" />
            </svg>
          ) : (
            <svg width="9" height="11" viewBox="0 0 9 11" fill="none">
              <rect x="0.5" y="0.5" width="2.5" height="10" rx="1" fill="white" />
              <rect x="6"   y="0.5" width="2.5" height="10" rx="1" fill="white" />
            </svg>
          )}
        </button>
      </div>

      {/* ── Swipe hint (first slide only) ────────────────────────────────── */}
      {activeIndex === 0 && !isDiscoveryMode && (
        <div className="absolute bottom-5 left-4 z-40 pointer-events-none">
          <p className="text-[8px] uppercase tracking-[0.22em] text-white/30">
            Swipe to browse
          </p>
        </div>
      )}
    </div>
  );
}
