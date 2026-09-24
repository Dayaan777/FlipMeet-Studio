"use client";

import { useEffect, useRef, useCallback, useState } from "react";

const MOBILE_SRC = "/videos/process-page.mp4";
const DESKTOP_SRC = "/videos/process-page-desktop.mp4";
const BREAKPOINT = 768; // px — matches Tailwind's `md:` breakpoint

export default function ProcessVideoScrubber() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rafRef = useRef<number | null>(null);
  const lastProgressRef = useRef(-1);

  // Responsive source determined on client mount
  const [src, setSrc] = useState<string | null>(null);

  // Core scrub: map scroll progress 0–1 → video.currentTime
  const scrub = useCallback(() => {
    const section = sectionRef.current;
    const video = videoRef.current;
    if (!section || !video || !video.duration) return;

    const rect = section.getBoundingClientRect();
    const totalScrollable = section.offsetHeight - window.innerHeight;
    const scrolledPx = Math.max(0, Math.min(-rect.top, totalScrollable));
    const progress = totalScrollable > 0 ? scrolledPx / totalScrollable : 0;

    if (Math.abs(progress - lastProgressRef.current) < 0.0003) return;
    lastProgressRef.current = progress;

    const target = progress * video.duration;
    // Seek to at least 0.001 to ensure the first frame is painted immediately
    const seekTime = Math.max(0.001, target);
    if (Math.abs(video.currentTime - seekTime) > 0.03) {
      video.currentTime = seekTime;
    }
  }, []);

  // RAF-throttled scroll handler
  const onScroll = useCallback(() => {
    if (rafRef.current !== null) return;
    rafRef.current = requestAnimationFrame(() => {
      rafRef.current = null;
      scrub();
    });
  }, [scrub]);

  // Determine correct source from viewport width and listen for breakpoint crossings
  useEffect(() => {
    const updateSrc = () => {
      const nextSrc = window.innerWidth >= BREAKPOINT ? DESKTOP_SRC : MOBILE_SRC;
      setSrc((prev) => {
        if (prev !== nextSrc) {
          lastProgressRef.current = -1;
          return nextSrc;
        }
        return prev;
      });
    };

    updateSrc();

    const mq = window.matchMedia(`(min-width: ${BREAKPOINT}px)`);
    const onMQChange = () => updateSrc();

    mq.addEventListener("change", onMQChange);
    window.addEventListener("resize", updateSrc, { passive: true });

    return () => {
      mq.removeEventListener("change", onMQChange);
      window.removeEventListener("resize", updateSrc);
    };
  }, []);

  // Handler when metadata or video data is ready
  const handleMediaReady = useCallback(() => {
    lastProgressRef.current = -1;
    scrub();
  }, [scrub]);

  // Wire scroll listeners and scrub whenever video element or src changes
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });

    // Initial scrub if duration is already available
    if (video.duration) {
      scrub();
    }

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [onScroll, scrub, src]);

  return (
    /**
     * 400vh outer container — 4 stage-lengths of scrollable space.
     * The sticky child keeps the video pinned to the viewport while scrolling.
     */
    <div ref={sectionRef} className="relative" style={{ height: "400vh" }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-black">
        {src && (
          <video
            key={src}
            ref={videoRef}
            src={src}
            muted
            playsInline
            preload="auto"
            onLoadedMetadata={handleMediaReady}
            onLoadedData={handleMediaReady}
            onCanPlay={handleMediaReady}
            className="absolute inset-0 h-full w-full object-contain md:object-cover"
            aria-label="FlipMeet jersey process video"
          />
        )}
      </div>
    </div>
  );
}
