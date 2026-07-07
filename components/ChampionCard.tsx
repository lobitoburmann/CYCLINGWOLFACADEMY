"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

import { Emblem } from "@/components/Emblem";
import {
  FRAME_CONFIG,
  loadImage,
  renderToCanvas,
  storageKey,
  type FrameCategory,
} from "@/lib/champion-frame";
import {
  CLASSIFICATIONS,
  type ClassificationKey,
} from "@/lib/classifications";

type ChampionCardProps = {
  classification: ClassificationKey;
  defaultName: string;
  defaultPoints: number | null;
};

export function ChampionCard({
  classification,
  defaultName,
  defaultPoints,
}: ChampionCardProps) {
  const cfg = CLASSIFICATIONS[classification];
  const frame = FRAME_CONFIG[classification as FrameCategory];
  const fileInputRef = useRef<HTMLInputElement>(null);
  const exportCanvasRef = useRef<HTMLCanvasElement>(null);

  const [name, setName] = useState(defaultName);
  const [points, setPoints] = useState(
    defaultPoints === null ? "" : String(defaultPoints),
  );
  const [photoSrc, setPhotoSrc] = useState(
    `/images/wolfseries/${frame.file}`,
  );
  const [hasCustomPhoto, setHasCustomPhoto] = useState(false);

  useEffect(() => {
    const savedName = localStorage.getItem(storageKey(classification, "name"));
    const savedPoints = localStorage.getItem(
      storageKey(classification, "points"),
    );
    const savedPhoto = localStorage.getItem(
      storageKey(classification, "photo"),
    );

    if (savedName) setName(savedName);
    if (savedPoints !== null) setPoints(savedPoints);
    if (savedPhoto) {
      setPhotoSrc(savedPhoto);
      setHasCustomPhoto(true);
    }
  }, [classification]);

  const persistName = useCallback(
    (value: string) => {
      setName(value);
      localStorage.setItem(storageKey(classification, "name"), value);
    },
    [classification],
  );

  const persistPoints = useCallback(
    (value: string) => {
      setPoints(value);
      localStorage.setItem(storageKey(classification, "points"), value);
    },
    [classification],
  );

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPhotoSrc(dataUrl);
      setHasCustomPhoto(true);
      localStorage.setItem(storageKey(classification, "photo"), dataUrl);
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleDownload = async () => {
    const canvas = exportCanvasRef.current;
    if (!canvas) return;

    const photo = await loadImage(photoSrc);
    const parsedPoints = points.trim() === "" ? null : Number(points);

    renderToCanvas(
      canvas,
      photo,
      classification as FrameCategory,
      name,
      parsedPoints,
    );

    const link = document.createElement("a");
    link.download = frame.file.replace(/\.jpg$/i, ".png");
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  const parsedPoints = points.trim() === "" ? null : Number(points);
  const showPoints =
    parsedPoints !== null && !Number.isNaN(parsedPoints);

  return (
    <div className="flex flex-col">
      <article className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-neutral-900">
        <div
          className="absolute left-0 right-0 top-0 z-20 h-[6px]"
          style={{ backgroundColor: frame.color }}
        />

        {photoSrc ? (
          <Image
            src={photoSrc}
            alt={`${name}, ${cfg.kind.toLowerCase()} ${cfg.label} WolfSeries 2026`}
            fill
            unoptimized={hasCustomPhoto}
            className="object-cover"
            sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 20vw"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-[#141416]">
            <Emblem
              name={cfg.icon}
              size={96}
              className="text-white opacity-25"
            />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent" />

        <div
          className="absolute left-3 top-5 z-10 flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white"
          style={{ backgroundColor: frame.color }}
        >
          <Emblem name={cfg.icon} size={13} />
          <span>{frame.label}</span>
        </div>

        <div className="absolute right-3 top-5 z-10 rounded-full bg-black/70 px-2.5 py-1 text-xs font-bold text-white">
          1°
        </div>

        <div className="absolute bottom-4 left-4 right-4 z-10">
          <p className="text-[26px] font-bold leading-tight text-white">
            {name.trim() || "Ciclista"}
          </p>
          <p className="mt-1 text-sm">
            {showPoints && (
              <span className="font-semibold" style={{ color: frame.color }}>
                {parsedPoints} pts
              </span>
            )}
            {showPoints && (
              <span className="text-white/55"> · </span>
            )}
            <span className="text-white/55">CyclingWolf Series 2026</span>
          </p>
        </div>

        <span className="absolute bottom-3 right-3 z-10 text-2xl font-extrabold text-white opacity-30">
          CW
        </span>
      </article>

      <div className="mt-3 flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="rounded-md bg-white/10 px-3 py-1.5 text-[11px] font-medium text-white transition hover:bg-white/15"
          >
            Subir foto
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleUpload}
          />
          <button
            type="button"
            onClick={handleDownload}
            className="rounded-md bg-emerald-500/15 px-3 py-1.5 text-[11px] font-medium text-emerald-400 transition hover:bg-emerald-500/25"
          >
            Descargar imagen
          </button>
        </div>
        <input
          type="text"
          value={name}
          onChange={(e) => persistName(e.target.value)}
          placeholder="Nombre del campeón"
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-white/25 focus:outline-none"
        />
        <input
          type="number"
          value={points}
          onChange={(e) => persistPoints(e.target.value)}
          placeholder="Puntos"
          min={0}
          className="w-full rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-white/35 focus:border-white/25 focus:outline-none"
        />
      </div>

      <canvas ref={exportCanvasRef} className="hidden" aria-hidden />
    </div>
  );
}
