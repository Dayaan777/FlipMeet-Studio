import Image from "next/image";
import type { Drop, Look } from "@/data/drops";

const featuredLookIds = ["look-01", "look-04", "look-05", "look-06"];

function PlatformRing() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-[-8%] bottom-8 h-24 rounded-[50%] bg-[linear-gradient(108deg,transparent_12%,rgba(255,255,255,0.15)_28%,rgba(255,255,255,0.045)_42%,transparent_58%),radial-gradient(ellipse_at_50%_38%,rgba(255,255,255,0.14)_0%,rgba(255,77,30,0.16)_18%,rgba(25,25,25,0.98)_52%,rgba(3,3,3,1)_100%)] shadow-[0_10px_18px_rgba(0,0,0,0.8),0_0_42px_rgba(255,77,30,0.12),0_0_80px_rgba(255,77,30,0.08),inset_0_1px_0_rgba(255,255,255,0.3),inset_0_3px_7px_rgba(255,255,255,0.12),inset_0_-2px_0_rgba(0,0,0,0.92),inset_0_-10px_14px_rgba(0,0,0,0.72)] [transform:perspective(900px)_rotateX(62deg)_rotateZ(-2deg)] after:absolute after:inset-[3px] after:rounded-[50%] after:bg-[linear-gradient(108deg,transparent_18%,rgba(255,255,255,0.1)_31%,transparent_50%),radial-gradient(ellipse_at_50%_25%,rgba(255,255,255,0.08),transparent_42%,rgba(0,0,0,0.28)_100%)]"
    />
  );
}

function FeaturedLook({ look, active }: { look: Look; active: boolean }) {
  return (
    <article className={`relative flex min-w-0 flex-1 flex-col items-center text-center ${active ? "z-10" : "opacity-70"}`}>
      <div className="relative z-10 flex h-64 w-full items-end justify-center sm:h-72 lg:h-80">
        <div className={`absolute bottom-9 h-2/3 w-2/3 rounded-[50%] blur-2xl ${active ? "bg-accent/20" : "bg-text-secondary/10"}`} />
        <Image
          src={look.images[0]}
          alt={`${look.name} — ${look.description}`}
          fill
          sizes="(min-width: 1024px) 20vw, 45vw"
          className={`object-contain ${active ? "translate-y-2" : ""}`}
        />
      </div>
      <div className="relative z-10 mt-5 flex min-h-14 flex-col items-center">
        <p className={`text-sm ${active ? "text-text-primary" : "text-text-secondary"}`}>{look.name}</p>
        <p className="mt-1 text-[11px] text-text-secondary">{look.description}</p>
        <span className={`mt-3 block h-0.5 w-7 ${active ? "bg-accent" : "rounded-full bg-text-primary"}`} />
      </div>
    </article>
  );
}

export default function FeaturedLooksGrid({ drop }: { drop: Drop }) {
  const looks = featuredLookIds
    .map((id) => drop.looks.find((look) => look.id === id))
    .filter((look): look is Look => Boolean(look));

  return (
    <section className="overflow-hidden border-b border-base-border px-6 pb-24 pt-20" aria-labelledby="featured-looks-heading">
      <div className="mx-auto max-w-7xl">
        <p className="mb-2 text-center text-xs tracking-[0.28em] text-accent">THE COLLECTION</p>
        <h2 id="featured-looks-heading" className="text-balance text-center font-display text-3xl tracking-wide text-text-primary md:text-4xl">
          {drop.name} - FEATURED LOOKS
        </h2>
        <div className="relative mx-auto mt-10 max-w-6xl px-2 pb-1 sm:px-4">
          <PlatformRing />
          <div className="relative z-10 grid grid-cols-4 items-end gap-2 sm:gap-4 lg:gap-8">
            {looks.map((look, index) => (
              <FeaturedLook key={look.id} look={look} active={index === 0} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

