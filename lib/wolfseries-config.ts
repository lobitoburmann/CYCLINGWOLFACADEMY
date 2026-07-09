import {
  getStorageSlug,
  storageKey,
  type FrameCategory,
  type StorageSlug,
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

export function saveChampionPhotoUrl(
  category: FrameCategory,
  url: string,
): void {
  setLocal(category, "foto", url);
}

export async function fetchLeaderPhotoUrl(
  category: FrameCategory,
): Promise<string | null> {
  const classification = getStorageSlug(category);
  const response = await fetch(
    `/api/upload-leader-photo?classification=${encodeURIComponent(classification)}`,
  );

  if (!response.ok) {
    throw new Error("No se pudo obtener la foto del líder");
  }

  const data = (await response.json()) as { url?: string | null };
  return data.url ?? null;
}

export async function uploadLeaderPhoto(
  category: FrameCategory,
  file: File,
): Promise<string> {
  const classification: StorageSlug = getStorageSlug(category);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("classification", classification);

  const response = await fetch("/api/upload-leader-photo", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(payload?.error || "No se pudo subir la foto");
  }

  const data = (await response.json()) as { url?: string };
  if (!data.url) {
    throw new Error("La API no devolvió una URL");
  }

  saveChampionPhotoUrl(category, data.url);
  return data.url;
}
