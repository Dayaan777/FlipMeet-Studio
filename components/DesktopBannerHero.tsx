"use client";

import Image from "next/image";
import { useState, useEffect, useRef, useCallback } from "react";
import { DARK_BLUR_DATA_URL } from "@/lib/image-placeholder";

const SLIDES = [
  {
    type: "image" as const,
    id: "campaign-shoot",
    src: "/images/hero-banner-v3.jpg",
    alt: "HT x Studio Campaign Banner",
    objectPosition: "object-top",
  },
  {
    type: "image" as const,
    id: "studio-rail",
    src: "/images/hero-banner-2.jpg",
    alt: "HT x Studio Garment Collection Showcase",
    objectPosition: "object-center",
  },
  {
    type: "video" as const,
    id: "hero-video",
    src: "/videos/temporary-homepage-hero-section.mp4",
    alt: "HT x Studio Campaign Video",
    objectPosition: "object-center",
  },
] as const;

export default function DesktopBannerHero() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startX = useRef<number | null>(null);
  const currentX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setActiveSlide((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setActiveSlide((prev) => (prev === 0 ? SLIDES.length - 1 : prev - 1));
  }, []);

  // Manage video playback based on active slide
  useEffect(() => {
    if (videoRef.current) {
      if (SLIDES[activeSlide].type === "video") {
        videoRef.current.currentTime = 0;
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [activeSlide]);

  // Automatic slideshow timer: 8s on video, 5.5s on images (paused on hover)
  useEffect(() => {
    if (isHovered) return;
    const duration = SLIDES[activeSlide].type === "video" ? 8000 : 5500;
    const timer = setInterval(() => {
      nextSlide();
    }, duration);
    return () => clearInterval(timer);
  }, [isHovered, activeSlide, nextSlide]);

  // Swipe / Drag handlers for touch and pointer gestures
  const handlePointerDown = (e: React.PointerEvent) => {
    startX.current = e.clientX;
    currentX.current = e.clientX;
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (startX.current !== null) {
      currentX.current = e.clientX;
    }
  };

  const handlePointerUp = () => {
    if (startX.current !== null && currentX.current !== null) {
      const diff = currentX.current - startX.current;
      if (diff < -50) {
        nextSlide();
      } else if (diff > 50) {
        prevSlide();
      }
    }
    startX.current = null;
    currentX.current = null;
  };

  return (
    <section
      className="group relative w-full h-screen min-h-[650px] overflow-hidden bg-[#141210] border-b border-base-border select-none touch-pan-y"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        startX.current = null;
        currentX.current = null;
      }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={() => {
        startX.current = null;
        currentX.current = null;
      }}
    >
      {/* Top ambient vignette for crisp navbar contrast and breathing room */}
      <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/75 via-black/30 to-transparent pointer-events-none z-10" />

      {/* Carousel Track with smooth horizontal translation */}
      <div
        className="flex h-full w-full transition-transform duration-700 ease-[cubic-bezier(0.25,1,0.5,1)] will-change-transform"
        style={{ transform: `translateX(-${activeSlide * 100}%)` }}
      >
        {SLIDES.map((slide, idx) => (
          <div key={slide.id} className="relative h-full w-full shrink-0 overflow-hidden bg-black">
            {slide.type === "image" ? (
              <Image
                src={slide.src}
                alt={slide.alt}
                fill
                priority={idx === 0}
                sizes="100vw"
                placeholder="blur"
                blurDataURL={DARK_BLUR_DATA_URL}
                className={`object-cover ${slide.objectPosition}`}
                draggable={false}
              />
            ) : (
              <video
                ref={videoRef}
                src={slide.src}
                playsInline
                muted={isMuted}
                loop
                autoPlay
                preload="metadata"
                className="h-full w-full object-cover"
              />
            )}
          </div>
        ))}
      </div>

      {/* Subtle bottom gradient to blend cleanly into the concrete wall section */}
      <div className="absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-[#141210] via-[#141210]/40 to-transparent pointer-events-none z-10" />

      {/* Side Navigation Arrow Buttons (subtle, reveal on hover) */}
      <button
        type="button"
        aria-label="Previous slide"
        onClick={(e) => {
          e.stopPropagation();
          prevSlide();
        }}
        className="absolute left-6 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-lg text-white/90 backdrop-blur-md opacity-60 transition-all duration-300 hover:scale-105 hover:opacity-100 hover:border-accent hover:bg-black/70 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group-hover:opacity-100"
      >
        <span aria-hidden="true">←</span>
      </button>

      <button
        type="button"
        aria-label="Next slide"
        onClick={(e) => {
          e.stopPropagation();
          nextSlide();
        }}
        className="absolute right-6 top-1/2 z-20 flex size-11 -translate-y-1/2 items-center justify-center rounded-full border border-white/20 bg-black/40 text-lg text-white/90 backdrop-blur-md opacity-60 transition-all duration-300 hover:scale-105 hover:opacity-100 hover:border-accent hover:bg-black/70 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent group-hover:opacity-100"
      >
        <span aria-hidden="true">→</span>
      </button>

      {/* Minimal luxury pagination dots at bottom center (3 slides total) */}
      <div
        className="absolute bottom-8 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2.5"
        role="tablist"
        aria-label="Hero carousel pagination"
      >
        {SLIDES.map((slide, idx) => {
          const isSelected = idx === activeSlide;
          return (
            <button
              key={slide.id}
              type="button"
              role="tab"
              aria-selected={isSelected}
              aria-label={`Go to slide ${idx + 1}`}
              onClick={(e) => {
                e.stopPropagation();
                setActiveSlide(idx);
              }}
              className="flex h-6 items-center justify-center px-1 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-accent"
            >
              <span
                className={`block rounded-full transition-all duration-300 ${
                  isSelected
                    ? "h-1.5 w-8 bg-accent shadow-[0_0_10px_rgba(194,120,71,0.7)]"
                    : "h-1.5 w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            </button>
          );
        })}
      </div>

      {/* Mute/Unmute audio button when video slide is active */}
      {SLIDES[activeSlide].type === "video" && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted((prev) => !prev);
          }}
          aria-label={isMuted ? "Unmute video" : "Mute video"}
          className="absolute bottom-8 right-6 z-20 flex size-8 items-center justify-center rounded-full border border-white/20 bg-black/60 text-[11px] text-white/90 backdrop-blur-md transition-all hover:border-accent hover:text-accent"
        >
          {isMuted ? "✕" : "♪"}
        </button>
      )}
    </section>
  );
}
