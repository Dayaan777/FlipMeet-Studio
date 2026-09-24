"use client";

import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";
import ProcessVideoScrubber from "@/components/ProcessVideoScrubber";

const STAGE_DETAILS = [
  "Our expert tailors begin by selecting the finest fabrics and patterns, meticulously cutting and assembling each piece to create a jersey that defines your style.",
  "Once all components are assembled, the jersey is carefully inspected to ensure every seam, stitch, and detail meets our exacting standards of quality.",
  "From custom embroidery to precision hemming, we perfect the smallest details that elevate your jersey from good to exceptional.",
  "Your jersey arrives in carefully curated packaging, designed to create an unforgettable unboxing experience that reflects the quality within.",
];

const STAGE_TITLES = [
  "JERSEY MAKING",
  "JERSEY FULL VIEW",
  "SMALL DETAILS",
  "PACKAGING UNBOXING",
];

export default function ProcessPage() {
  return (
    <>
      <NavBar />
      <main className="bg-base-bg">
        {/* ── Scroll-scrubbed video — first thing on the page, behind the transparent NavBar ── */}
        <ProcessVideoScrubber />

        {/* ── Static stage detail grid below the video section ── */}
        <section className="border-t border-base-border bg-base-bg">
          <div className="mx-auto max-w-7xl divide-y divide-base-border">
            {STAGE_TITLES.map((title, i) => (
              <div
                key={title}
                className="grid gap-6 px-6 py-14 md:grid-cols-[1fr_2fr] md:gap-16"
              >
                <div>
                  <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.3em] text-accent">
                    STAGE {i + 1} OF 4
                  </p>
                  <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary md:text-3xl">
                    {title}
                  </h2>
                </div>
                <p className="self-center text-base leading-relaxed text-text-secondary">
                  {STAGE_DETAILS[i]}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
