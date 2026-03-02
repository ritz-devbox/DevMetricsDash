import type { MetricsData } from '../types/metrics';

let cachedData: MetricsData | null = null;

export async function loadMetrics(): Promise<MetricsData> {
  if (cachedData) return cachedData;

  const basePath = import.meta.env.BASE_URL || '/';
  const res = await fetch(`${basePath}data/metrics.json`);
  if (!res.ok) throw new Error('Failed to load metrics data');
  cachedData = await res.json();
  return cachedData!;
}

export function formatNumber(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toLocaleString();
}

export function formatHours(h: number): string {
  if (h < 1) return `${Math.round(h * 60)}m`;
  if (h < 24) return `${h.toFixed(1)}h`;
  return `${(h / 24).toFixed(1)}d`;
}

export function timeAgo(date: string): string {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return `${Math.floor(days / 30)}mo ago`;
}

export function getDoraRatingColor(rating: string): string {
  switch (rating) {
    case 'elite': return '#10b981';
    case 'high': return '#06b6d4';
    case 'medium': return '#f59e0b';
    case 'low': return '#ef4444';
    default: return '#8b949e';
  }
}

export function getDoraRatingLabel(rating: string): string {
  return rating.charAt(0).toUpperCase() + rating.slice(1);
}

