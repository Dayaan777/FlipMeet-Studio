"use client";

import { useState } from "react";
import type { Drop } from "@/data/drops";

export default function TryOnPanel({ drop }: { drop: Drop }) {
  const [selectedLook, setSelectedLook] = useState(drop.looks[0]?.id);
  const [fileName, setFileName] = useState<string | null>(null);

  return (
    <section className="py-24 px-6 border-b border-base-border">
      <div className="mx-auto max-w-7xl grid md:grid-cols-2 gap-12">
        <div>
          <p className="text-accent text-xs tracking-widest mb-2">AI TRY-ON</p>
          <h2 className="font-display text-3xl md:text-4xl text-text-primary mb-8">
            SEE IT ON YOU.
          </h2>

          <label className="block text-xs tracking-widest text-text-secondary mb-2">
            1. SELECT LOOK
          </label>
          <select
            value={selectedLook}
            onChange={(e) => setSelectedLook(e.target.value)}
            className="w-full bg-base-surface border border-base-border rounded-sm px-4 py-3 text-sm text-text-primary mb-6"
          >
            {drop.looks.map((l) => (
              <option key={l.id} value={l.id}>
                {l.name} — {l.description}
              </option>
            ))}
          </select>

          <label className="block text-xs tracking-widest text-accent mb-2">
            2. UPLOAD YOUR PHOTO
          </label>
          <label className="block border border-dashed border-base-border rounded-sm px-6 py-10 text-center cursor-pointer hover:border-text-secondary transition-colors mb-6">
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
            <p className="text-text-primary text-sm">
              {fileName ?? "Click to upload"}
            </p>
            <p className="text-text-secondary text-xs mt-1">
              JPG, PNG, WEBP (Max 10MB)
            </p>
          </label>

          <button className="w-full bg-base-surface border border-base-border hover:border-text-secondary transition-colors text-text-primary text-sm tracking-wide px-6 py-3 rounded-sm">
            ✦ GENERATE TRY-ON
          </button>
        </div>

        <div className="bg-base-surface border border-base-border rounded-sm aspect-[4/5] flex flex-col items-center justify-center">
          <p className="text-text-secondary text-sm">Try-on result preview</p>
          <p className="text-text-secondary text-xs mt-4">
            AI results may vary. For reference only.
          </p>
        </div>
      </div>
    </section>
  );
}
