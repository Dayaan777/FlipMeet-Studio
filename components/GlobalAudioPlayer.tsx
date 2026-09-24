"use client";

import { useEffect, useRef, useState } from "react";

const PLAYLIST = [
  "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/music/king-von---took-her-to-the-o.mp3",
  "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/music/pop-smoke---dior.mp3",
];

export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Handle track ending -> play next track
  const handleEnded = () => {
    setCurrentTrack((prev) => (prev + 1) % PLAYLIST.length);
  };

  // Play whenever the track changes, if we have interacted
  useEffect(() => {
    if (hasInteracted && audioRef.current) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err) => {
        console.warn("Audio playback blocked:", err);
        setIsPlaying(false);
      });
    }
  }, [currentTrack, hasInteracted]);

  // Attempt to play immediately on mount
  useEffect(() => {
    if (audioRef.current && !hasInteracted) {
      audioRef.current.play().then(() => {
        setIsPlaying(true);
        setHasInteracted(true);
      }).catch((err) => {
        console.warn("Autoplay blocked, waiting for user interaction:", err);
      });
    }
  }, [hasInteracted]);

  // Attempt to play on first interaction anywhere on the document
  useEffect(() => {
    const handleInteraction = () => {
      if (!hasInteracted) {
        setHasInteracted(true);
        if (audioRef.current && !isPlaying) {
          audioRef.current.play().then(() => {
            setIsPlaying(true);
          }).catch(console.error);
        }
      }
    };

    // Listeners for any initial user interaction
    document.addEventListener("click", handleInteraction, { once: true });
    document.addEventListener("keydown", handleInteraction, { once: true });
    document.addEventListener("touchstart", handleInteraction, { once: true });

    return () => {
      document.removeEventListener("click", handleInteraction);
      document.removeEventListener("keydown", handleInteraction);
      document.removeEventListener("touchstart", handleInteraction);
    };
  }, [hasInteracted, isPlaying]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().then(() => {
          setIsPlaying(true);
          setHasInteracted(true);
        }).catch(console.error);
      }
    }
  };

  return (
    <>
      <audio
        ref={audioRef}
        src={PLAYLIST[currentTrack]}
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        preload="auto"
        autoPlay
      />

      {/* Floating control button */}
      <button
        onClick={togglePlay}
        className="fixed bottom-6 right-6 z-[100] flex h-10 w-10 items-center justify-center rounded-full bg-base-surface/80 backdrop-blur-md border border-base-border text-white/70 hover:text-white hover:border-accent transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(255,168,56,0.3)]"
        aria-label="Toggle Music"
      >
        {isPlaying ? (
          <span className="text-sm">🔊</span>
        ) : (
          <span className="text-sm">🔇</span>
        )}
      </button>
    </>
  );
}
