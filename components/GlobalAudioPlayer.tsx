"use client";

import { useEffect, useRef, useState } from "react";

const PLAYLIST = [
  "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/music/king-von---took-her-to-the-o.mp3",
  "https://gqazaajfycutqildyrqw.supabase.co/storage/v1/object/public/products/music/pop-smoke---dior.mp3",
];

export default function GlobalAudioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  
  // States
  const [currentTrack, setCurrentTrack] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false); // Explicit user mute state
  const [isReady, setIsReady] = useState(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    try {
      const savedTrack = localStorage.getItem("fm-music-track");
      const savedTime = localStorage.getItem("fm-music-time");
      const savedMuted = localStorage.getItem("fm-music-muted");

      if (savedTrack !== null) setCurrentTrack(Number(savedTrack));
      if (savedMuted === "true") setIsMuted(true);

      if (audioRef.current && savedTime !== null) {
        audioRef.current.currentTime = Number(savedTime);
      }
    } catch (e) {
      console.error("Failed to read music state", e);
    }
    setIsReady(true);
  }, []);

  // Save playback progress every second
  useEffect(() => {
    const interval = setInterval(() => {
      if (audioRef.current && isPlaying) {
        localStorage.setItem("fm-music-track", currentTrack.toString());
        localStorage.setItem("fm-music-time", audioRef.current.currentTime.toString());
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, currentTrack]);

  // Handle track ending -> play next track
  const handleEnded = () => {
    const nextTrack = (currentTrack + 1) % PLAYLIST.length;
    setCurrentTrack(nextTrack);
    localStorage.setItem("fm-music-track", nextTrack.toString());
    localStorage.setItem("fm-music-time", "0");
  };

  // Centralized play function that aggressively tries to play
  const attemptPlay = async () => {
    if (!audioRef.current || isMuted) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn("Autoplay blocked, waiting for interaction.");
      setIsPlaying(false);
    }
  };

  // Attempt to play on mount (or when ready / track changes)
  useEffect(() => {
    if (isReady && !isMuted) {
      attemptPlay();
    }
  }, [isReady, currentTrack, isMuted]);

  // Aggressive event listeners to bypass autoplay restrictions on first interaction
  useEffect(() => {
    const handleInteraction = () => {
      if (!isPlaying && !isMuted && audioRef.current) {
        attemptPlay();
      }
    };

    // Any physical interaction with the page will trigger audio if blocked
    const events = ["mousedown", "keydown", "touchstart", "pointerdown"];
    events.forEach(e => document.addEventListener(e, handleInteraction, { passive: true }));

    return () => {
      events.forEach(e => document.removeEventListener(e, handleInteraction));
    };
  }, [isPlaying, isMuted]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
        setIsMuted(true);
        localStorage.setItem("fm-music-muted", "true");
      } else {
        setIsMuted(false);
        localStorage.setItem("fm-music-muted", "false");
        audioRef.current.play().then(() => {
          setIsPlaying(true);
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
