export const LEADER_PHOTO_CLASSIFICATIONS = [
  "general",
  "montana",
  "volantes",
  "combativo",
  "corredor",
] as const;

export type LeaderPhotoClassification =
  (typeof LEADER_PHOTO_CLASSIFICATIONS)[number];

export function isLeaderPhotoClassification(
  value: string,
): value is LeaderPhotoClassification {
  return (LEADER_PHOTO_CLASSIFICATIONS as readonly string[]).includes(value);
}

export function leaderPhotoPathname(
  classification: LeaderPhotoClassification,
): string {
  return `wolfseries/lider-${classification}.jpg`;
}
