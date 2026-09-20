import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function AnimePage() {
  return (
    <>
      <NavBar />
      <main className="min-h-screen bg-base-bg pt-32 pb-24 px-6 flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <p className="text-accent text-[10px] tracking-[0.28em] uppercase font-bold">
            FLIPMEET STUDIO // ANIME
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-bold uppercase tracking-wide text-text-primary">
            ANIME
          </h1>
          <p className="text-xs text-text-secondary tracking-widest uppercase">
            Section loading — content coming soon.
          </p>
        </div>
      </main>
      <Footer />
    </>
  );
}
