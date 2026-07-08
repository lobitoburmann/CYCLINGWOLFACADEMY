import {
  FRAME_CONFIG,
  storageKey,
  type FrameCategory,
} from "@/lib/champion-frame";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

export const WOLFSERIES_BUCKET =
  process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET ?? "athlete-documents";
export const WOLFSERIES_PREFIX = "wolfseries/";
export const WOLFSERIES_CONFIG_TABLE = "wolfseries_config";

export type WolfSeriesField = "name" | "points" | "photo_url";

export type WolfSeriesChampionData = {
  name: string | null;
  points: string | null;
  photoUrl: string | null;
};

function configKey(storageId: string, field: WolfSeriesField): string {
  return `${storageId}:${field}`;
}

export function getStorageId(category: FrameCategory): string {
  return FRAME_CONFIG[category].file.replace(/\.jpg$/i, "");
}

export function getStoragePath(category: FrameCategory): string {
  return `${WOLFSERIES_PREFIX}${FRAME_CONFIG[category].file}`;
}

function getLocal(category: FrameCategory, field: "name" | "points" | "photo") {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(storageKey(category, field));
  } catch {
    return null;
  }
}

function setLocal(
  category: FrameCategory,
  field: "name" | "points" | "photo",
  value: string,
) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(storageKey(category, field), value);
  } catch {
    // ignore quota errors
  }
}

async function getRemoteValue(
  storageId: string,
  field: WolfSeriesField,
): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data, error } = await supabase
    .from(WOLFSERIES_CONFIG_TABLE)
    .select("value")
    .eq("key", configKey(storageId, field))
    .maybeSingle();

  if (error || !data) return null;
  return data.value;
}

async function setRemoteValue(
  storageId: string,
  field: WolfSeriesField,
  value: string,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) return false;

  const { error } = await supabase.from(WOLFSERIES_CONFIG_TABLE).upsert(
    {
      key: configKey(storageId, field),
      value,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "key" },
  );

  return !error;
}

export function getPublicPhotoUrl(category: FrameCategory): string | null {
  const supabase = getSupabase();
  if (!supabase) return null;

  const { data } = supabase.storage
    .from(WOLFSERIES_BUCKET)
    .getPublicUrl(getStoragePath(category));

  return data.publicUrl || null;
}

export async function loadChampionData(
  category: FrameCategory,
): Promise<WolfSeriesChampionData> {
  const storageId = getStorageId(category);

  if (isSupabaseConfigured()) {
    const [name, points, photoUrl] = await Promise.all([
      getRemoteValue(storageId, "name"),
      getRemoteValue(storageId, "points"),
      getRemoteValue(storageId, "photo_url"),
    ]);

    if (name !== null) setLocal(category, "name", name);
    if (points !== null) setLocal(category, "points", points);
    if (photoUrl !== null) setLocal(category, "photo", photoUrl);

    return { name, points, photoUrl };
  }

  return {
    name: getLocal(category, "name"),
    points: getLocal(category, "points"),
    photoUrl: getLocal(category, "photo"),
  };
}

export async function saveChampionName(
  category: FrameCategory,
  name: string,
): Promise<void> {
  setLocal(category, "name", name);

  if (isSupabaseConfigured()) {
    await setRemoteValue(getStorageId(category), "name", name);
  }
}

export async function saveChampionPoints(
  category: FrameCategory,
  points: string,
): Promise<void> {
  setLocal(category, "points", points);

  if (isSupabaseConfigured()) {
    await setRemoteValue(getStorageId(category), "points", points);
  }
}

export async function uploadLeaderPhoto(
  category: FrameCategory,
  file: File,
): Promise<string> {
  const supabase = getSupabase();

  if (!supabase) {
    const dataUrl = await readFileAsDataUrl(file);
    setLocal(category, "photo", dataUrl);
    return dataUrl;
  }

  const path = getStoragePath(category);
  const { error } = await supabase.storage
    .from(WOLFSERIES_BUCKET)
    .upload(path, file, {
      upsert: true,
      contentType: file.type || "image/jpeg",
      cacheControl: "3600",
    });

  if (error) {
    throw error;
  }

  const publicUrl = getPublicPhotoUrl(category);
  if (!publicUrl) {
    throw new Error("No se pudo obtener la URL pública de la imagen.");
  }

  const versionedUrl = `${publicUrl}?v=${Date.now()}`;
  setLocal(category, "photo", versionedUrl);
  await setRemoteValue(getStorageId(category), "photo_url", versionedUrl);

  return versionedUrl;
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

export async function resolvePhotoSrc(
  category: FrameCategory,
  savedPhotoUrl: string | null,
  fallbackPath: string,
): Promise<string> {
  if (savedPhotoUrl) return savedPhotoUrl;

  if (isSupabaseConfigured()) {
    const remoteUrl = getPublicPhotoUrl(category);
    if (remoteUrl) {
      return `${remoteUrl}?v=${Date.now()}`;
    }
  }

  return fallbackPath;
}
