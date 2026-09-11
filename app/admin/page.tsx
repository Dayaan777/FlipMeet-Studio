import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin | FlipMeet Studio",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-base-bg text-text-primary flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md rounded-sm border border-base-border bg-base-surface/80 p-8 backdrop-blur-md">
        <div className="flex items-center gap-2 text-[10px] font-bold tracking-[0.28em] text-accent uppercase">
          <span className="size-2 rounded-full bg-accent animate-pulse" />
          STUDIO CONTROL // SECURE
        </div>

        <h1 className="font-display text-3xl font-bold uppercase tracking-wide text-text-primary mt-3">
          ADMIN AREA
        </h1>

        <div className="mt-4 rounded-sm border border-emerald-500/30 bg-emerald-500/10 p-4">
          <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
            <span>✓</span> Session Active
          </p>
          <p className="text-[11px] text-text-secondary mt-1">
            Authenticated via session cookie. Route is protected by password gate.
          </p>
        </div>

        <div className="mt-6 border-t border-base-border pt-6 flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-widest text-text-secondary">
            Password Gate Active
          </span>

          <form action="/api/admin/logout" method="POST">
            <button
              type="submit"
              className="rounded-sm border border-base-border bg-base-bg px-4 py-2 text-xs font-bold uppercase tracking-widest text-text-secondary hover:text-accent hover:border-accent/40 transition-colors"
            >
              Lock Session
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
