import { ChampionsGrid } from "@/components/ChampionsGrid";

export default function WolfSeriesPage() {
  return (
    <main className="min-h-screen bg-[#0B0B0D] px-4 py-12 md:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-10 text-center">
          <p className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
            CyclingWolf Series
          </p>
          <h1 className="text-3xl font-extrabold text-white md:text-4xl">
            Campeones WolfSeries 2026
          </h1>
          <p className="mt-3 text-sm text-white/55">
            Líderes y reconocimientos de la temporada
          </p>
        </header>

        <ChampionsGrid />
      </div>
    </main>
  );
}
