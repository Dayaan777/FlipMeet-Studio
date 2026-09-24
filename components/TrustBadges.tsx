"use client";

const ROW_ONE = [
  { label: "LIMITED DROP", accent: false },
  { label: "100 PIECES PER LOOK", accent: true },
  { label: "PREMIUM QUALITY", accent: false },
  { label: "HANDPICKED FABRICS", accent: true },
  { label: "WORLDWIDE SHIPPING", accent: false },
  { label: "FAST & RELIABLE", accent: true },
  { label: "ARCHIVE READY", accent: false },
  { label: "BUILT FOR THE CULTURE", accent: true },
  { label: "SECURE PAYMENTS", accent: false },
  { label: "100% SAFE & SECURE", accent: true },
];

const ROW_TWO = [
  { label: "DROP 001", accent: true },
  { label: "FLIPMEET STUDIO", accent: false },
  { label: "STREET COLLECTIVE", accent: true },
  { label: "OVERSIZED FIT", accent: false },
  { label: "ANIME ARCHIVE", accent: true },
  { label: "LIMITED EDITION", accent: false },
  { label: "RAW CUTS", accent: true },
  { label: "EDITORIAL GRADE", accent: false },
  { label: "NO RESTOCK", accent: true },
  { label: "CULTURE FIRST", accent: false },
];

function Dot() {
  return (
    <span className="mx-6 inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-accent/50 align-middle" />
  );
}

function MarqueeRow({
  items,
  reverse = false,
  duration = "38s",
}: {
  items: { label: string; accent: boolean }[];
  reverse?: boolean;
  duration?: string;
}) {
  // Two copies for a seamless -50% loop
  const doubled = [...items, ...items];

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
        WebkitMaskImage:
          "linear-gradient(to right, transparent, black 6%, black 94%, transparent)",
      }}
    >
      <div
        className="flex w-max items-center animate-marquee group-hover:[animation-play-state:paused]"
        style={{
          animationDuration: duration,
          animationDirection: reverse ? "reverse" : "normal",
          willChange: "transform",
        }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span
              className={`text-[10px] font-black uppercase tracking-[0.24em] whitespace-nowrap ${
                item.accent ? "text-accent" : "text-text-primary/70"
              }`}
            >
              {item.label}
            </span>
            <Dot />
          </span>
        ))}
      </div>
    </div>
  );
}

export default function TrustBadges() {
  return (
    // "group" here — hovering the section pauses both rows via group-hover
    <section className="group border-y border-base-border bg-base-surface/40 py-6 space-y-5 overflow-hidden cursor-default">
      {/* Row 1 — scrolls left */}
      <MarqueeRow items={ROW_ONE} duration="38s" />
      {/* Row 2 — scrolls right (reverse) */}
      <MarqueeRow items={ROW_TWO} reverse duration="44s" />
    </section>
  );
}
