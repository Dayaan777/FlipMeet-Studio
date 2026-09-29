"use client";

import { useEffect, useRef, useState, useCallback } from "react";

const PLAYLIST = [
  "/music/king-von.mp3",
  "/music/pop-smoke.mp3",
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
  const attemptPlay = useCallback(async () => {
    if (!audioRef.current || isMuted) return;
    try {
      await audioRef.current.play();
      setIsPlaying(true);
    } catch (err) {
      console.warn("Autoplay blocked, waiting for interaction.");
      setIsPlaying(false);
    }
  }, [isMuted]);

  // Attempt to play or pause on mount (or when ready / track changes / mute changes)
  useEffect(() => {
    if (!isReady || !audioRef.current) return;
    
    if (isMuted) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      attemptPlay();
    }
  }, [isReady, currentTrack, isMuted, attemptPlay]);

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
  }, [isPlaying, isMuted, attemptPlay]);

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
      />

      {/* Floating control button */}
      <button
        onClick={togglePlay}
        className="fixed bottom-6 right-6 z-[100] flex h-10 w-10 items-center justify-center rounded-full bg-base-surface/80 backdrop-blur-md border border-base-border text-white/70 hover:text-white hover:border-accent transition-all duration-300 shadow-lg hover:shadow-[0_0_15px_rgba(255,168,56,0.3)]"
        aria-label="Toggle Music"
      >
        {isPlaying ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
        )}
      </button>
    </>
  );
}
