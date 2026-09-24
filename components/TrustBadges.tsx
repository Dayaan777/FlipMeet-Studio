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
    <span className="mx-6 inline-block h-1 w-1 shrink-0 rounded-full bg-accent/60 align-middle" />
  );
}

function MarqueeRow({
  items,
  reverse = false,
  speed = 40,
}: {
  items: { label: string; accent: boolean }[];
  reverse?: boolean;
  speed?: number;
}) {
  const doubled = [...items, ...items, ...items, ...items];
  return (
    <div className="overflow-hidden flex items-center group">
      <div
        className="flex w-max items-center"
        style={{
          animation: `marquee ${speed}s linear infinite${reverse ? " reverse" : ""}`,
          animationPlayState: "running",
        }}
      >
        {doubled.map((item, i) => (
          <span key={i} className="flex items-center shrink-0">
            <span
              className={`text-[10px] font-black uppercase tracking-[0.22em] whitespace-nowrap transition-colors ${
                item.accent
                  ? "text-accent"
                  : "text-text-primary/80"
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
    <section className="border-y border-base-border bg-base-surface/50 py-5 space-y-4 overflow-hidden">
      {/* Row 1 — scrolls left */}
      <MarqueeRow items={ROW_ONE} speed={35} />
      {/* Row 2 — scrolls right (reverse) */}
      <MarqueeRow items={ROW_TWO} reverse speed={45} />
    </section>
  );
}
