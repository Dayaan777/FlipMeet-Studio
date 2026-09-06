import CountdownTimer from "./CountdownTimer";
import type { Drop } from "@/data/drops";

export default function Hero({ drop }: { drop: Drop }) {
  return (
    <section className="relative pt-32 pb-20 px-6 border-b border-base-border">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12 items-center">
        <div>
          <p className="text-accent text-xs tracking-widest mb-4">{drop.name}</p>
          <h1 className="font-display text-5xl md:text-7xl leading-[0.95] text-text-primary">
            {drop.tagline.split(". ").map((line, i) => (
              <span key={i} className={i === 1 ? "block text-text-secondary" : "block"}>
                {line}
                {i === 0 ? "." : ""}
              </span>
            ))}
          </h1>
          <p className="text-text-secondary mt-6 max-w-sm">
            A new clothing label from the FlipMeet ecosystem. Premium
            fabrics. Limited pieces. Built for the culture.
          </p>

          <div className="mt-8 flex flex-wrap gap-6 border border-base-border rounded-sm p-5 max-w-md">
            <div>
              <p className="text-[10px] tracking-widest text-text-secondary mb-2">
                PRE-ORDER CLOSES IN
              </p>
              <CountdownTimer target={drop.preOrderCloses} />
            </div>
            <div className="border-l border-base-border pl-6">
              <p className="text-[10px] tracking-widest text-text-secondary mb-2">
                EST. DELIVERY
              </p>
              <p className="text-text-primary text-sm">
                {new Date(drop.deliveryWindow.start).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                {" – "}
                {new Date(drop.deliveryWindow.end).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <a
              href={`/drop/${drop.id}`}
              className="bg-accent hover:bg-accent-dim transition-colors text-text-primary text-sm tracking-wide px-6 py-3 rounded-sm inline-flex items-center gap-2"
            >
              PRE-ORDER {drop.name}
            </a>
            <button className="border border-base-border hover:border-text-secondary transition-colors text-text-primary text-sm tracking-wide px-6 py-3 rounded-sm">
              WATCH TRAILER
            </button>
          </div>
        </div>

        <div className="relative aspect-[4/5] bg-base-surface rounded-sm border border-base-border flex items-center justify-center">
          <p className="text-text-secondary text-sm">Hero campaign image</p>
        </div>
      </div>
    </section>
  );
}
