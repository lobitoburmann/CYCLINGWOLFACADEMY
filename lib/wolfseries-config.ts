import {
  getStorageSlug,
  storageKey,
  type FrameCategory,
} from "@/lib/champion-frame";
import { leaderPhotoPathname } from "@/lib/leader-photo";
import {
  LEADER_PHOTO_BUCKET,
  supabase,
} from "@/lib/supabase";

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

function publicLeaderPhotoUrl(category: FrameCategory): string {
  const pathname = leaderPhotoPathname(getStorageSlug(category));
  const { data } = supabase.storage
    .from(LEADER_PHOTO_BUCKET)
    .getPublicUrl(pathname);
  return data.publicUrl;
}

async function remotePhotoExists(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD", cache: "no-store" });
    return response.ok;
  } catch {
    return false;
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
  const url = publicLeaderPhotoUrl(category);
  const exists = await remotePhotoExists(url);
  return exists ? url : null;
}

export async function uploadLeaderPhoto(
  category: FrameCategory,
  file: File,
): Promise<string> {
  const pathname = leaderPhotoPathname(getStorageSlug(category));

  const { error } = await supabase.storage
    .from(LEADER_PHOTO_BUCKET)
    .upload(pathname, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
      cacheControl: "3600",
    });

  if (error) {
    throw new Error(error.message || "No se pudo subir la foto");
  }

  const url = `${publicLeaderPhotoUrl(category)}?t=${Date.now()}`;
  saveChampionPhotoUrl(category, url);
  return url;
}
