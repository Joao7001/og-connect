import type { ApiRecord } from "../api";

export type ProjectLink = { label: string; url: string };

export function externalUrl(value: unknown) {
  const url = String(value ?? "").trim();
  if (!url) return "";
  return /^https?:\/\//i.test(url) ? url : `https://${url}`;
}

export function projectExternalLink(project: ApiRecord): ProjectLink | undefined {
  if (!Array.isArray(project.links)) return undefined;
  return project.links.find(
    (item): item is ProjectLink =>
      typeof item === "object" &&
      item !== null &&
      typeof (item as Record<string, unknown>).url === "string" &&
      Boolean(String((item as Record<string, unknown>).url).trim()),
  );
}
