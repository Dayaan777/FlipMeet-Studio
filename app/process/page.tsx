"use client";

import { useState, useEffect } from "react";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ProcessCanvas from "@/components/ProcessCanvas";

const STAGE_SECTIONS = [
  {
    title: "JERSEY MAKING",
    description: "Crafting the perfect fit from premium materials.",
    details:
      "Our expert tailors begin by selecting the finest fabrics and patterns, meticulously cutting and assembling each piece to create a jersey that defines your style.",
  },
  {
    title: "JERSEY FULL VIEW",
    description: "Seeing the complete garment come to life.",
    details:
      "Once all components are assembled, the jersey is carefully inspected to ensure every seam, stitch, and detail meets our exacting standards of quality.",
  },
  {
    title: "SMALL DETAILS",
    description: "The finishing touches that make all the difference.",
    details:
      "From custom embroidery to precision hemming, we perfect the smallest details that elevate your jersey from good to exceptional.",
  },
  {
    title: "PACKAGING UNBOXING",
    description: "A premium experience from arrival to closet.",
    details:
      "Your jersey arrives in carefully curated packaging, designed to create an unforgettable unboxing experience that reflects the quality within.",
  },
];

export default function ProcessPage() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrolled = window.scrollY;
      const progress = scrollHeight > 0 ? scrolled / scrollHeight : 0;
      setScrollProgress(progress);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (!isMounted) return null;

  return (
    <>
      <NavBar />
      <main className="bg-base-bg">
        {/* Header Section */}
        <section className="relative pt-28 pb-12 px-6 bg-base-bg border-b border-base-border">
          <div className="mx-auto max-w-7xl">
            <p className="text-xs tracking-widest text-text-secondary uppercase">
              THE JOURNEY
            </p>
            <h1 className="font-display text-4xl md:text-6xl text-text-primary mt-4 tracking-tight">
              THE PROCESS
            </h1>
            <p className="text-text-secondary mt-6 max-w-2xl text-lg">
              Every FlipMeet jersey is crafted with intention and precision. Discover the
              four stages that transform vision into reality.
            </p>
          </div>
        </section>

        {/* Sticky Canvas + Scrollable Content */}
        <div className="relative bg-base-bg">
          {/* Sticky Canvas */}
          <div className="sticky top-0 w-full h-screen pointer-events-none">
            <ProcessCanvas scrollProgress={scrollProgress} />
          </div>

          {/* Content Sections */}
          <div className="relative z-10 bg-base-bg">
            {STAGE_SECTIONS.map((stage, index) => (
              <section
                key={index}
                className="min-h-screen flex items-center justify-center px-6 py-24 border-b border-base-border last:border-b-0 bg-transparent"
              >
                <div className="mx-auto max-w-2xl">
                  <p className="text-xs tracking-widest text-text-secondary uppercase mb-4">
                    STAGE {index + 1} OF {STAGE_SECTIONS.length}
                  </p>
                  <h2 className="font-display text-3xl md:text-5xl text-text-primary mb-6 tracking-tight">
                    {stage.title}
                  </h2>
                  <p className="text-lg text-text-secondary mb-6">{stage.description}</p>
                  <p className="text-text-secondary leading-relaxed">{stage.details}</p>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
