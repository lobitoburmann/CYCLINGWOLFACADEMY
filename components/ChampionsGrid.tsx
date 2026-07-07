import { ChampionCard } from "@/components/ChampionCard";
import type { ClassificationKey } from "@/lib/classifications";

type ChampionEntry = {
  classification: ClassificationKey;
  defaultName: string;
  defaultPoints: number | null;
};

const DEMO_CHAMPIONS: ChampionEntry[] = [
  {
    classification: "general",
    defaultName: "Matías Medel",
    defaultPoints: 53,
  },
  {
    classification: "montana",
    defaultName: "Matías Medel",
    defaultPoints: 41,
  },
  {
    classification: "metasVolantes",
    defaultName: "Matías Medel",
    defaultPoints: 10,
  },
  {
    classification: "masCombativo",
    defaultName: "Sergio Vargas",
    defaultPoints: null,
  },
  {
    classification: "corredorFecha",
    defaultName: "Pato Otarola",
    defaultPoints: null,
  },
];

export function ChampionsGrid() {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5 [&>*:last-child]:col-span-2 [&>*:last-child]:mx-auto [&>*:last-child]:max-w-[50%] md:[&>*:last-child]:col-span-1 md:[&>*:last-child]:mx-0 md:[&>*:last-child]:max-w-none">
      {DEMO_CHAMPIONS.map((champion) => (
        <ChampionCard key={champion.classification} {...champion} />
      ))}
    </div>
  );
}
