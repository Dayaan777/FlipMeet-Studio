import Image from "next/image";
import CountdownTimer from "./CountdownTimer";
import type { Drop } from "@/data/drops";

export default function Hero({ drop }: { drop: Drop }) {
  return (
    <section className="relative overflow-hidden border-b border-base-border">
      {/* Full-bleed campaign image (desktop): sits behind/beside the copy,
          no card/border — blends into the page background via gradients
          instead of being framed as a separate widget. */}
      <div className="hidden md:block absolute inset-y-0 right-0 w-[58%]">
        <Image
          src="/images/hero-drop-001.jpg"
          alt="FlipMeet Studio Drop 001 campaign — two models wearing Look 01"
          fill
          priority
          sizes="58vw"
          className="object-cover object-top contrast-125 [mask-image:linear-gradient(to_right,transparent_0%,black_18%,black_88%,transparent_100%)]"
        />
        <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-base-bg to-transparent" />
        <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-base-bg to-transparent" />
        <button type="button" className="absolute bottom-6 right-6 rounded-full border border-text-secondary/50 bg-base-bg/70 px-4 py-2 text-[10px] tracking-widest text-text-primary backdrop-blur-sm">
          PLAY INTRO / SOUND ON
        </button>
      </div>

      <div className="relative mx-auto max-w-7xl px-6 pt-32 pb-20">
        <div className="max-w-xl">
          <p className="text-accent text-xs tracking-widest mb-4">• {drop.name} •</p>
          <h1 className="font-display text-5xl md:text-5xl font-bold uppercase leading-[0.95] text-text-primary">
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

          <div className="mt-8 flex flex-wrap gap-6 border-y border-base-border py-5 max-w-md bg-base-bg/40 backdrop-blur-sm">
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
                {new Date(drop.deliveryWindow.start).toLocaleDateString("en-GB", { month: "short", day: "2-digit" }).toUpperCase()}
                {" – "}
                {new Date(drop.deliveryWindow.end).toLocaleDateString("en-GB", { month: "short", day: "2-digit", year: "numeric" }).toUpperCase()}
              </p>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <a
              href={`/drop/${drop.id}`}
              className="bg-accent hover:bg-accent-dim transition-colors text-text-primary text-sm tracking-wide px-6 py-3 rounded-sm inline-flex items-center gap-2"
            >
              PRE-ORDER {drop.name}
              <span aria-hidden="true">→</span>
            </a>
            <button className="border border-base-border hover:border-text-secondary transition-colors text-text-primary text-sm tracking-wide px-6 py-3 rounded-sm inline-flex items-center gap-2">
              WATCH TRAILER
              <span aria-hidden="true">▶</span>
            </button>
          </div>
        </div>

        {/* Mobile: image stacks below the copy, same border-less blended treatment */}
        <div className="md:hidden relative mt-12 -mx-6 h-[420px]">
          <Image
            src="/images/hero-drop-001.jpg"
            alt="FlipMeet Studio Drop 001 campaign — two models wearing Look 01"
            fill
            sizes="100vw"
            className="object-cover object-top contrast-125 [mask-image:linear-gradient(to_right,transparent_0%,black_14%,black_86%,transparent_100%)]"
          />
          <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-base-bg to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-base-bg to-transparent" />
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_35%,rgba(0,0,0,0.45)_100%)]" />
          <button type="button" className="absolute bottom-6 right-4 rounded-full border border-text-secondary/50 bg-base-bg/70 px-4 py-2 text-[10px] tracking-widest text-text-primary backdrop-blur-sm">
            PLAY INTRO / SOUND ON
          </button>
        </div>
      </div>
    </section>
  );
}
