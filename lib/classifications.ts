export const CLASSIFICATIONS = {
  general: {
    label: "General",
    color: "#DAA520",
    labelColor: "#DAA520",
    icon: "wolf",
    kind: "LÍDER",
  },
  montana: {
    label: "Montaña",
    color: "#E24B4A",
    labelColor: "#E24B4A",
    icon: "mountain",
    kind: "LÍDER",
  },
  metasVolantes: {
    label: "Metas Volantes",
    color: "#1D9E75",
    labelColor: "#1D9E75",
    icon: "bolt",
    kind: "LÍDER",
  },
  masCombativo: {
    label: "Más Combativo",
    color: "#D85A30",
    labelColor: "#D85A30",
    icon: "claw",
    kind: "RECONOCIMIENTO",
  },
  corredorFecha: {
    label: "Corredor de la Fecha",
    color: "#C0C0C0",
    labelColor: "#C0C0C0",
    icon: "wolf",
    kind: "RECONOCIMIENTO",
  },
} as const;

export type ClassificationKey = keyof typeof CLASSIFICATIONS;

export type EmblemName =
  (typeof CLASSIFICATIONS)[ClassificationKey]["icon"];
