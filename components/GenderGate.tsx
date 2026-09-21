"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "flipmeet-gender";

type Gender = "male" | "female";

export default function GenderGate({ children }: { children: React.ReactNode }) {
  const [choice, setChoice] = useState<Gender | null>(null);
  const [hasCheckedStorage, setHasCheckedStorage] = useState(false);

  useEffect(() => {
    const savedChoice = window.localStorage.getItem(STORAGE_KEY);
    if (savedChoice === "male" || savedChoice === "female") {
      setChoice(savedChoice);
    }
    setHasCheckedStorage(true);
  }, []);

  const selectGender = (gender: Gender) => {
    window.localStorage.setItem(STORAGE_KEY, gender);
    setChoice(gender);
  };

  const gateOpen = hasCheckedStorage && choice === null;

  return (
    <>
      <div className={gateOpen ? "blur-md transition-[filter] duration-500" : "transition-[filter] duration-500"}>
        {children}
      </div>

      {gateOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
          role="presentation"
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="gender-gate-title"
            className="w-full max-w-sm border border-base-border bg-base-bg/95 p-8 text-center shadow-2xl"
          >
            <p className="mb-3 text-[10px] tracking-[0.28em] text-text-secondary">WELCOME TO FLIPMEET</p>
            <h1 id="gender-gate-title" className="font-display text-4xl tracking-wide text-text-primary">
              SELECT YOUR FIT
            </h1>
            <p className="mt-3 text-sm leading-6 text-text-secondary">Choose a collection to enter the studio.</p>

            <div className="mt-8 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => selectGender("male")}
                className="border border-base-border px-4 py-4 text-xs tracking-[0.2em] text-text-primary transition-colors hover:border-accent hover:text-accent focus-visible:border-accent"
              >
                MALE
              </button>
              <button
                type="button"
                onClick={() => selectGender("female")}
                className="border border-base-border px-4 py-4 text-xs tracking-[0.2em] text-text-primary transition-colors hover:border-accent hover:text-accent focus-visible:border-accent"
              >
                FEMALE
              </button>
            </div>
          </section>
        </div>
      )}
    </>
  );
}
