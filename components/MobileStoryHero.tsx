"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

// ─── Types ───────────────────────────────────────────────────────────────────
interface Hotspot {
  id: string;
  name: string;
  price: number;
  slug: string;
  image: string;
  x: number; // % from left (0-100)
  y: number; // % from top  (0-100)
  timeRange?: [number, number]; // [startSeconds, endSeconds]
}

interface Slide {
  type: "image" | "video";
  src: string;
  duration?: number; // ms — image slides only
  hotspots: Hotspot[];
}

// ─── Slide data ──────────────────────────────────────────────────────────────
const SLIDES: Slide[] = [
  {
    type: "image",
    src: "/videos/mobile-ui/1st-slide.png",
    duration: 5500,
    hotspots: [
      {
        id: "saint-culture-jersey",
        name: "Saint Culture Jersey",
        price: 19500,
        slug: "saint-culture-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/saint-culture-jersey.png",
        x: 12, y: 53,
      },
      {
        id: "anime-op-flame-jersey",
        name: "One Piece Flame Jersey",
        price: 16500,
        slug: "anime-op-flame-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-op-flame-jersey.png",
        x: 33, y: 52,
      },
      {
        id: "dreamer-jersey",
        name: "Dreamer 84 Mesh Football Jersey",
        price: 23500,
        slug: "dreamer-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/dreamer-jersey.png",
        x: 78, y: 55,
      },
    ],
  },
  {
    type: "video",
    src: "/videos/mobile-ui/2nd-slide.mp4",
    hotspots: [
      {
        id: "limited-edition-1996-red-shirt",
        name: "1996 Vintage Red Quarter-Zip Polo",
        price: 23500,
        slug: "limited-edition-1996-red-shirt",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/limited-edition-1996-red-shirt.png",
        x: 12, y: 53,
      },
      {
        id: "anime-op-flame-jersey-s2",
        name: "One Piece Flame Jersey",
        price: 16500,
        slug: "anime-op-flame-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/anime-op-flame-jersey.png",
        x: 27, y: 55,
      },
      {
        id: "dreamer-jersey-s2",
        name: "Dreamer 84 Mesh Football Jersey",
        price: 23500,
        slug: "dreamer-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/dreamer-jersey.png",
        x: 77, y: 54,
      },
      {
        id: "saint-culture-jersey-s2",
        name: "Saint Culture Jersey",
        price: 19500,
        slug: "saint-culture-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/saint-culture-jersey.png",
        x: 90, y: 54,
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
        x: 50, y: 55,
        timeRange: [0, 3.99],
      },
      {
        id: "saint-culture-jersey-s3",
        name: "Saint Culture Jersey",
        price: 19500,
        slug: "saint-culture-jersey",
        image: "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/saint-culture-jersey.png",
        x: 50, y: 60,
        timeRange: [4.0, 999], // Until video ends
      },
    ],
  },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function MobileStoryHero() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isDiscoveryMode, setIsDiscoveryMode] = useState(false);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [liveProducts, setLiveProducts] = useState<Record<string, { price: number, name: string }>>({});

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const touchStartX = useRef<number | null>(null);
  const lastTouchTime = useRef<number>(0);

  const currentSlide = SLIDES[activeIndex];

  // Fetch live prices and names from Supabase
  useEffect(() => {
    async function fetchLiveProducts() {
      const { data } = await supabase.from("products").select("id, price, name");
      if (data) {
        const productMap: Record<string, { price: number, name: string }> = {};
        data.forEach(p => {
          productMap[p.id] = { price: p.price, name: p.name };
        });
        setLiveProducts(productMap);
      }
    }
    fetchLiveProducts();
  }, []);

  // ─── Playback control ────────────────────────────────────────────────────────
  const advanceSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % SLIDES.length);
    setProgress(0);
    setIsDiscoveryMode(false);
    setActiveHotspot(null);
    setCurrentTime(0);
    setIsPaused(false); // Fix: Ensure video unpauses when advancing!
  }, []);

  const goToSlide = (idx: number) => {
    setActiveIndex(idx);
    setProgress(0);
    setIsPaused(false);
    setIsDiscoveryMode(false);
    setActiveHotspot(null);
    setCurrentTime(0);
  };

  // Image slide timer
  useEffect(() => {
    if (currentSlide.type !== "image") return;
    if (isPaused) {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
      return;
    }
    const updateFreq = 50;
    const duration = currentSlide.duration || 5000;
    const step = (updateFreq / duration) * 100;

    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          advanceSlide();
          return 0;
        }
        return prev + step;
      });
    }, updateFreq);

    return () => {
      if (progressIntervalRef.current) clearInterval(progressIntervalRef.current);
    };
  }, [activeIndex, currentSlide, isPaused, advanceSlide]);

  // Video slide handling - Setup & Track Time
  useEffect(() => {
    if (currentSlide.type !== "video") return;
    const video = videoRef.current;
    if (!video) return;

    // Reset video on slide change
    video.currentTime = 0;
    video.load();
    setProgress(0);
    setCurrentTime(0);

    const onTimeUpdate = () => {
      if (video.duration) {
        setProgress((video.currentTime / video.duration) * 100);
      }
      setCurrentTime(video.currentTime);
    };
    const onEnded = () => advanceSlide();
    const onCanPlay = () => {
      // Don't play if we're paused
      if (!isPaused) video.play().catch(() => {});
    };

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
  }, [activeIndex]); // Only run on slide change!

  // Video slide handling - Play/Pause toggle
  useEffect(() => {
    if (currentSlide.type !== "video") return;
    const video = videoRef.current;
    if (!video) return;

    if (isPaused) {
      video.pause();
    } else {
      video.play().catch(() => {});
    }
  }, [isPaused, currentSlide.type]);

  // ─── Interaction Handlers ──────────────────────────────────────────────────
  const handleTouchEnd = (e: React.TouchEvent) => {
    lastTouchTime.current = Date.now();
    if (touchStartX.current === null) return;
    const touchEndX = e.changedTouches[0].clientX;
    const deltaX = touchStartX.current - touchEndX;

    if (Math.abs(deltaX) > 40) {
      // Swipe left or right -> switch slide, exit discovery
      if (deltaX > 0) {
        advanceSlide();
      } else {
        setActiveIndex((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
        setProgress(0);
        setIsDiscoveryMode(false);
        setActiveHotspot(null);
        setIsPaused(false); // Fix: unpause on back swipe too!
      }
    } else {
      // Tap (background)
      handleBackgroundTap();
    }
    touchStartX.current = null;
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleMouseClick = () => {
    if (Date.now() - lastTouchTime.current < 500) return; // Prevent double-fire from touch devices
    handleBackgroundTap();
  };

  const handleBackgroundTap = () => {
    if (isDiscoveryMode) {
      // Close UI and resume
      setIsDiscoveryMode(false);
      setActiveHotspot(null);
      setIsPaused(false);
    } else {
      // Pause and enter discovery mode
      setIsPaused(true);
      setIsDiscoveryMode(true);
    }
  };

  const handlePauseToggle = (e: React.MouseEvent | React.TouchEvent) => {
    e.stopPropagation();
    if (isPaused) {
      setIsPaused(false);
      setIsDiscoveryMode(false);
      setActiveHotspot(null);
    } else {
      setIsPaused(true);
      setIsDiscoveryMode(true);
    }
  };

  const handleHotspotTap = (e: React.MouseEvent | React.TouchEvent, hotspot: Hotspot) => {
    e.stopPropagation();
    setActiveHotspot(hotspot);
  };

  // ─── Filtering Hotspots ──────────────────────────────────────────────────
  const visibleHotspots = currentSlide.hotspots.filter(h => {
    if (!h.timeRange) return true;
    return currentTime >= h.timeRange[0] && currentTime <= h.timeRange[1];
  });

  // ─── Render ──────────────────────────────────────────────────────────────────
  return (
    <div className="relative w-full h-[calc(100vh-73px)] sm:h-screen bg-black overflow-hidden select-none">
      
      {/* ─── Media Layer (z-0) ───────────────────────────────────────────────── */}
      <div className="absolute inset-0 z-0">
        {currentSlide.type === "image" ? (
          <Image
            src={currentSlide.src}
            alt="Hero Look"
            fill
            priority
            className="object-cover"
          />
        ) : (
          <video
            ref={videoRef}
            src={currentSlide.src}
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        )}
        {/* Subtle gradient so bottom UI and dots stand out better */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60 pointer-events-none" />
      </div>

      {/* ─── Interaction Overlay (z-10) ──────────────────────────────────────── */}
      <div
        className="absolute inset-0 z-10 cursor-pointer"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        onClick={handleMouseClick}
      />

      {/* ─── Hotspot dots (z-20, above interaction overlay) ────────────────── */}
      {isDiscoveryMode && visibleHotspots.map((hotspot) => (
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

      {/* ─── Product card (z-30, above hotspots) ─────────────────────────────── */}
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
                {liveProducts[activeHotspot.slug]?.name || activeHotspot.name}
              </p>
              <p className="text-[11px] text-accent mt-1.5 font-semibold tracking-wider">
                {formatPrice(liveProducts[activeHotspot.slug]?.price || activeHotspot.price)}
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

      {/* ─── Discovery hint ──────────────────────────────────────────────────── */}
      {isDiscoveryMode && !activeHotspot && (
        <div className="absolute bottom-[72px] left-1/2 -translate-x-1/2 pointer-events-none z-20">
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/55 text-center animate-pulse">
            Tap a dot to explore
          </p>
        </div>
      )}

      {/* ─── Bottom controls (z-40, topmost) ─────────────────────────────────── */}
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

      {/* ─── Global Interaction Hint ─────────────────────────────────────────── */}
      {!isDiscoveryMode && (
        <div className="absolute bottom-5 left-4 z-40 pointer-events-none">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-white/40 animate-pulse" />
            <p className="text-[8px] uppercase tracking-[0.22em] text-white/40">
              Tap to shop the look
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
