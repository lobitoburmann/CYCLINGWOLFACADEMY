import type { EmblemName } from "@/lib/classifications";

type EmblemProps = {
  name: EmblemName;
  size?: number;
  className?: string;
};

const CLAW_STROKES = [
  "M7 3C8 8 8 15 7 21",
  "M12 3C13 8 13 15 12 21",
  "M17 3C18 8 18 15 17 21",
] as const;

export function Emblem({ name, size = 24, className }: EmblemProps) {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    className,
    "aria-hidden": true as const,
  };

  if (name === "claw") {
    return (
      <svg {...common} fill="none">
        {CLAW_STROKES.map((d) => (
          <path
            key={d}
            d={d}
            stroke="currentColor"
            strokeWidth={2.4}
            strokeLinecap="round"
          />
        ))}
      </svg>
    );
  }

  const paths: Record<Exclude<EmblemName, "claw">, string> = {
    wolf: "M3 3 9 7 12 5 15 7 21 3 19 10C19 16 16 21 12 21 8 21 5 16 5 10Z",
    mountain: "M2 20 8 9 12 15 15 10 22 20Z",
    bolt: "M13 2 5 13H10L9 22 19 9H13Z",
  };

  return (
    <svg {...common} fill="currentColor">
      <path d={paths[name]} />
    </svg>
  );
}
