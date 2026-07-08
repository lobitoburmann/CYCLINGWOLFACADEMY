import {
  getStorageSlug,
  storageKey,
  type FrameCategory,
} from "@/lib/champion-frame";

export type WolfSeriesChampionData = {
  name: string | null;
  points: string | null;
  photoUrl: string | null;
};

function getLocal(
  category: FrameCategory,
  field: "nombre" | "puntos" | "foto",
): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(storageKey(getStorageSlug(category), field));
  } catch {
    return null;
  }
}

function setLocal(
  category: FrameCategory,
  field: "nombre" | "puntos" | "foto",
  value: string,
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(getStorageSlug(category), field), value);
  } catch {
    // ignore quota errors
  }
}

export function loadChampionData(
  category: FrameCategory,
): WolfSeriesChampionData {
  return {
    name: getLocal(category, "nombre"),
    points: getLocal(category, "puntos"),
    photoUrl: getLocal(category, "foto"),
  };
}

export function saveChampionName(
  category: FrameCategory,
  name: string,
): void {
  setLocal(category, "nombre", name);
}

export function saveChampionPoints(
  category: FrameCategory,
  points: string,
): void {
  setLocal(category, "puntos", points);
}

export async function uploadLeaderPhoto(
  category: FrameCategory,
  file: File,
): Promise<string> {
  const dataUrl = await readFileAsDataUrl(file);
  setLocal(category, "foto", dataUrl);
  return dataUrl;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}
