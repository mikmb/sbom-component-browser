import type { SbomListItem } from "@/lib/types";

export async function fetchSboms(search?: string): Promise<SbomListItem[]> {
  const url = search
    ? `/api/sboms?search=${encodeURIComponent(search)}`
    : "/api/sboms";

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to load SBOMs");

  const data = (await res.json()) as { items: SbomListItem[] };
  return data.items;
}
