import { head, put } from "@vercel/blob";
import { NextResponse } from "next/server";

import {
  isLeaderPhotoClassification,
  LEADER_PHOTO_CLASSIFICATIONS,
  leaderPhotoPathname,
  type LeaderPhotoClassification,
} from "@/lib/leader-photo";

export const runtime = "nodejs";

async function resolveBlobUrl(
  classification: LeaderPhotoClassification,
): Promise<string | null> {
  try {
    const meta = await head(leaderPhotoPathname(classification));
    return meta.url;
  } catch {
    return null;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const classification = searchParams.get("classification");

  if (classification) {
    if (!isLeaderPhotoClassification(classification)) {
      return NextResponse.json(
        { error: "Clasificación inválida" },
        { status: 400 },
      );
    }

    const url = await resolveBlobUrl(classification);
    return NextResponse.json({ classification, url });
  }

  const photos: Record<string, string | null> = {};
  await Promise.all(
    LEADER_PHOTO_CLASSIFICATIONS.map(async (key) => {
      photos[key] = await resolveBlobUrl(key);
    }),
  );

  return NextResponse.json({ photos });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const classificationRaw = formData.get("classification");

    if (!(file instanceof File)) {
      return NextResponse.json(
        { error: "Archivo requerido" },
        { status: 400 },
      );
    }

    if (typeof classificationRaw !== "string") {
      return NextResponse.json(
        { error: "Clasificación requerida" },
        { status: 400 },
      );
    }

    if (!isLeaderPhotoClassification(classificationRaw)) {
      return NextResponse.json(
        { error: "Clasificación inválida" },
        { status: 400 },
      );
    }

    if (!file.type.startsWith("image/")) {
      return NextResponse.json(
        { error: "El archivo debe ser una imagen" },
        { status: 400 },
      );
    }

    const pathname = leaderPhotoPathname(classificationRaw);
    const blob = await put(pathname, file, {
      access: "public",
      allowOverwrite: true,
      contentType: file.type || "image/jpeg",
    });

    return NextResponse.json({
      url: blob.url,
      classification: classificationRaw,
      pathname,
    });
  } catch (error) {
    console.error("Error al subir foto de líder:", error);
    return NextResponse.json(
      { error: "No se pudo subir la foto" },
      { status: 500 },
    );
  }
}
