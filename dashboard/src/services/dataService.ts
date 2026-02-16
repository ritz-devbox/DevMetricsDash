import type { MetricsData } from "../types/metrics";

let cachedData: MetricsData | null = null;

export async function loadMetrics(): Promise<MetricsData> {
  if (cachedData) return cachedData;

  // Try loading from the data directory (relative to the GitHub Pages root)
  const base = import.meta.env.BASE_URL || "/";
  const paths = [
    `${base}data/metrics.json`,
    "./data/metrics.json",
    "../data/metrics.json",
    "/DevMetricsDash/data/metrics.json",
    "/data/metrics.json",
    "../../data/metrics.json",
  ];

  for (const path of paths) {
    try {
      const resp = await fetch(path);
      if (resp.ok) {
        cachedData = await resp.json();
        return cachedData!;
      }
    } catch {
      // Try next path
    }
  }

  throw new Error("Could not load metrics data. Run 'npm run update' first.");
}

export function formatNumber(n: number): string {
  if (n >= 1000000) return (n / 1000000).toFixed(1) + "M";
  if (n >= 1000) return (n / 1000).toFixed(1) + "K";
  return n.toLocaleString();
}

export function formatHours(hours: number): string {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${hours.toFixed(1)}h`;
  if (hours < 168) return `${(hours / 24).toFixed(1)}d`;
  return `${(hours / 168).toFixed(1)}w`;
}

export function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const hours = diff / 3600000;
  if (hours < 1) return `${Math.round(hours * 60)}m ago`;
  if (hours < 24) return `${Math.round(hours)}h ago`;
  if (hours < 168) return `${Math.round(hours / 24)}d ago`;
  return `${Math.round(hours / 168)}w ago`;
}

export function getRatingColor(rating: string): string {
  switch (rating) {
    case "elite": return "#10B981";
    case "high": return "#06B6D4";
    case "medium": return "#F59E0B";
    case "low": return "#EF4444";
    default: return "#8B949E";
  }
}

export function getRatingBadgeClass(rating: string): string {
  switch (rating) {
    case "elite": return "badge-elite";
    case "high": return "badge-high";
    case "medium": return "badge-medium";
    case "low": return "badge-low";
    default: return "";
  }
}

