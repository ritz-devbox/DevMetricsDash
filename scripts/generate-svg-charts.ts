// ============================================================
// DevMetricsDash — SVG Chart Generator
// ============================================================
// Creates beautiful SVG charts for embedding in README.md
// ============================================================

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { MetricsData, HeatmapData } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

// ─── Color Palette ──────────────────────────────────────
const COLORS = {
  bg: "#0D1117",
  bgCard: "#161B22",
  bgCardHover: "#1C2333",
  border: "#30363D",
  text: "#E6EDF3",
  textMuted: "#8B949E",
  textDim: "#484F58",
  purple: "#8B5CF6",
  purpleLight: "#A78BFA",
  blue: "#3B82F6",
  cyan: "#06B6D4",
  green: "#10B981",
  emerald: "#34D399",
  yellow: "#F59E0B",
  orange: "#F97316",
  red: "#EF4444",
  pink: "#EC4899",
  heatmap: ["#161B22", "#0E4429", "#006D32", "#26A641", "#39D353"],
  gradientPurple: ["#7C3AED", "#8B5CF6", "#A78BFA"],
  gradientBlue: ["#2563EB", "#3B82F6", "#60A5FA"],
  gradientCyan: ["#0891B2", "#06B6D4", "#22D3EE"],
};

// ─── Contribution Heatmap ───────────────────────────────
function generateHeatmapSVG(heatmap: HeatmapData[], width: number): string {
  const cellSize = 11;
  const cellGap = 3;
  const totalSize = cellSize + cellGap;
  const weeks = Math.ceil(heatmap.length / 7);
  const svgWidth = width;
  const svgHeight = 180;
  const offsetX = 35;
  const offsetY = 30;

  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const days = ["", "Mon", "", "Wed", "", "Fri", ""];

  // Calculate month labels
  const monthLabels: { label: string; x: number }[] = [];
  let lastMonth = -1;
  heatmap.forEach((d, i) => {
    const month = new Date(d.date).getMonth();
    if (month !== lastMonth) {
      lastMonth = month;
      const weekIndex = Math.floor(i / 7);
      monthLabels.push({ label: months[month], x: offsetX + weekIndex * totalSize });
    }
  });

  // Total contributions
  const totalContribs = heatmap.reduce((s, d) => s + d.count, 0);
  const activeDays = heatmap.filter((d) => d.count > 0).length;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${svgWidth}" height="${svgHeight}" viewBox="0 0 ${svgWidth} ${svgHeight}">
  <defs>
    <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" style="stop-color:${COLORS.purple};stop-opacity:1" />
      <stop offset="100%" style="stop-color:${COLORS.cyan};stop-opacity:1" />
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
      <feMerge>
        <feMergeNode in="coloredBlur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  
  <style>
    .title { font: 600 13px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.text}; }
    .subtitle { font: 400 11px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.textMuted}; }
    .month-label { font: 400 10px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.textMuted}; }
    .day-label { font: 400 9px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.textDim}; }
    .stat-value { font: 700 13px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.text}; }
    .stat-label { font: 400 10px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.textMuted}; }
    .legend-label { font: 400 9px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.textDim}; }
    .cell { rx: 2; ry: 2; }
    .cell:hover { stroke: ${COLORS.text}; stroke-width: 1; }
  </style>
  
  <rect width="${svgWidth}" height="${svgHeight}" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>`;

  // Title
  svg += `\n  <text x="15" y="20" class="title">📊 Contribution Activity</text>`;
  svg += `\n  <text x="${svgWidth - 15}" y="20" class="subtitle" text-anchor="end">${totalContribs.toLocaleString()} contributions · ${activeDays} active days</text>`;

  // Month labels
  monthLabels.forEach((m) => {
    svg += `\n  <text x="${m.x}" y="${offsetY - 2}" class="month-label">${m.label}</text>`;
  });

  // Day labels
  days.forEach((d, i) => {
    if (d) {
      svg += `\n  <text x="${offsetX - 20}" y="${offsetY + i * totalSize + cellSize - 1}" class="day-label">${d}</text>`;
    }
  });

  // Heatmap cells
  heatmap.forEach((d, i) => {
    const weekIndex = Math.floor(i / 7);
    const dayIndex = i % 7;
    const x = offsetX + weekIndex * totalSize;
    const y = offsetY + dayIndex * totalSize;
    svg += `\n  <rect class="cell" x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" fill="${COLORS.heatmap[d.level]}" data-date="${d.date}" data-count="${d.count}">
    <title>${d.date}: ${d.count} contributions</title>
  </rect>`;
  });

  // Legend
  const legendX = svgWidth - 160;
  const legendY = svgHeight - 18;
  svg += `\n  <text x="${legendX - 30}" y="${legendY + 9}" class="legend-label">Less</text>`;
  COLORS.heatmap.forEach((color, i) => {
    svg += `\n  <rect x="${legendX + i * 15}" y="${legendY}" width="11" height="11" rx="2" fill="${color}"/>`;
  });
  svg += `\n  <text x="${legendX + 80}" y="${legendY + 9}" class="legend-label">More</text>`;

  svg += "\n</svg>";
  return svg;
}

// ─── Commit Activity Chart ──────────────────────────────
function generateActivitySVG(data: MetricsData, width: number): string {
  const height = 200;
  const padding = { top: 40, right: 20, bottom: 35, left: 50 };
  const chartW = width - padding.left - padding.right;
  const chartH = height - padding.top - padding.bottom;

  // Use last 30 days
  const daily = data.daily_activity.slice(-30);
  const maxCommits = Math.max(...daily.map((d) => d.commits), 1);
  const maxPRs = Math.max(...daily.map((d) => d.prs_merged), 1);
  const maxVal = Math.max(maxCommits, maxPRs);

  const xStep = chartW / (daily.length - 1);

  // Build path for commits (area chart)
  let commitPath = "";
  let commitLine = "";
  daily.forEach((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + chartH - (d.commits / maxVal) * chartH;
    if (i === 0) {
      commitLine = `M${x},${y}`;
      commitPath = `M${x},${padding.top + chartH}L${x},${y}`;
    } else {
      commitLine += `L${x},${y}`;
      commitPath += `L${x},${y}`;
    }
    if (i === daily.length - 1) {
      commitPath += `L${x},${padding.top + chartH}Z`;
    }
  });

  // Build path for PRs
  let prLine = "";
  daily.forEach((d, i) => {
    const x = padding.left + i * xStep;
    const y = padding.top + chartH - (d.prs_merged / maxVal) * chartH;
    if (i === 0) prLine = `M${x},${y}`;
    else prLine += `L${x},${y}`;
  });

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="commitGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${COLORS.purple}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${COLORS.purple}" stop-opacity="0.02"/>
    </linearGradient>
    <linearGradient id="lineGradPurple" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${COLORS.purple}"/>
      <stop offset="100%" stop-color="${COLORS.purpleLight}"/>
    </linearGradient>
    <linearGradient id="lineGradCyan" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${COLORS.blue}"/>
      <stop offset="100%" stop-color="${COLORS.cyan}"/>
    </linearGradient>
    <filter id="softGlow">
      <feGaussianBlur stdDeviation="1.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
  </defs>

  <style>
    .title { font: 600 13px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.text}; }
    .axis-label { font: 400 9px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.textDim}; }
    .legend-text { font: 400 10px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.textMuted}; }
  </style>

  <rect width="${width}" height="${height}" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
  <text x="15" y="22" class="title">📈 Activity (Last 30 Days)</text>

  <!-- Legend -->
  <circle cx="${width - 170}" cy="18" r="4" fill="${COLORS.purple}"/>
  <text x="${width - 162}" y="22" class="legend-text">Commits</text>
  <circle cx="${width - 100}" cy="18" r="4" fill="${COLORS.cyan}"/>
  <text x="${width - 92}" y="22" class="legend-text">PRs Merged</text>

  <!-- Grid lines -->
  ${Array.from({ length: 5 }, (_, i) => {
    const y = padding.top + (chartH / 4) * i;
    const val = Math.round(maxVal - (maxVal / 4) * i);
    return `<line x1="${padding.left}" y1="${y}" x2="${width - padding.right}" y2="${y}" stroke="${COLORS.border}" stroke-width="0.5" stroke-dasharray="4,4"/>
  <text x="${padding.left - 8}" y="${y + 3}" class="axis-label" text-anchor="end">${val}</text>`;
  }).join("\n  ")}

  <!-- Area fill -->
  <path d="${commitPath}" fill="url(#commitGrad)"/>

  <!-- Lines -->
  <path d="${commitLine}" fill="none" stroke="url(#lineGradPurple)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" filter="url(#softGlow)"/>
  <path d="${prLine}" fill="none" stroke="url(#lineGradCyan)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" filter="url(#softGlow)"/>

  <!-- X-axis labels -->
  ${daily
    .filter((_, i) => i % 5 === 0)
    .map((d, i, arr) => {
      const x = padding.left + (daily.indexOf(d)) * xStep;
      const label = new Date(d.date).toLocaleDateString("en", { month: "short", day: "numeric" });
      return `<text x="${x}" y="${height - 10}" class="axis-label" text-anchor="middle">${label}</text>`;
    })
    .join("\n  ")}

  <!-- Data dots (last point) -->
  <circle cx="${padding.left + (daily.length - 1) * xStep}" cy="${padding.top + chartH - (daily[daily.length - 1].commits / maxVal) * chartH}" r="4" fill="${COLORS.purple}" filter="url(#softGlow)"/>
  <circle cx="${padding.left + (daily.length - 1) * xStep}" cy="${padding.top + chartH - (daily[daily.length - 1].prs_merged / maxVal) * chartH}" r="3.5" fill="${COLORS.cyan}" filter="url(#softGlow)"/>
</svg>`;

  return svg;
}

// ─── Summary Stats Banner ───────────────────────────────
function generateStatsBannerSVG(data: MetricsData, width: number): string {
  const height = 110;
  const s = data.summary;

  const stats = [
    { icon: "⚡", label: "Commits", value: s.total_commits.toLocaleString(), color: COLORS.purple },
    { icon: "🔀", label: "PRs Merged", value: s.total_prs_merged.toLocaleString(), color: COLORS.cyan },
    { icon: "👀", label: "Reviews", value: s.total_reviews.toLocaleString(), color: COLORS.green },
    { icon: "🐛", label: "Issues Closed", value: s.total_issues_closed.toLocaleString(), color: COLORS.yellow },
    { icon: "🚀", label: "Releases", value: s.total_releases.toLocaleString(), color: COLORS.pink },
    { icon: "⏱️", label: "Avg Merge", value: `${s.avg_pr_merge_time_hours}h`, color: COLORS.orange },
  ];

  const colWidth = (width - 30) / stats.length;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bannerGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${COLORS.bg}"/>
      <stop offset="100%" stop-color="#111827"/>
    </linearGradient>
  </defs>

  <style>
    .stat-icon { font: 400 18px 'Segoe UI', system-ui, sans-serif; }
    .stat-value { font: 700 20px 'Segoe UI', system-ui, sans-serif; }
    .stat-label { font: 400 10px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.textMuted}; }
  </style>

  <rect width="${width}" height="${height}" rx="10" fill="url(#bannerGrad)" stroke="${COLORS.border}" stroke-width="1"/>`;

  stats.forEach((s, i) => {
    const x = 15 + i * colWidth + colWidth / 2;
    svg += `
  <text x="${x}" y="35" class="stat-icon" text-anchor="middle">${s.icon}</text>
  <text x="${x}" y="62" class="stat-value" text-anchor="middle" fill="${s.color}">${s.value}</text>
  <text x="${x}" y="80" class="stat-label" text-anchor="middle">${s.label}</text>`;

    // Divider
    if (i < stats.length - 1) {
      const divX = 15 + (i + 1) * colWidth;
      svg += `\n  <line x1="${divX}" y1="20" x2="${divX}" y2="90" stroke="${COLORS.border}" stroke-width="0.5"/>`;
    }
  });

  svg += "\n</svg>";
  return svg;
}

// ─── Language Breakdown ─────────────────────────────────
function generateLanguageSVG(data: MetricsData, width: number): string {
  const height = 80;
  const barHeight = 12;
  const barY = 42;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    .title { font: 600 13px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.text}; }
    .lang-label { font: 400 10px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.textMuted}; }
    .lang-pct { font: 600 10px 'Segoe UI', system-ui, sans-serif; }
  </style>

  <rect width="${width}" height="${height}" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
  <text x="15" y="22" class="title">🗂️ Languages</text>`;

  const barWidth = width - 30;
  let offsetX = 15;

  // Stacked bar
  data.languages.forEach((lang) => {
    const w = (lang.percentage / 100) * barWidth;
    svg += `\n  <rect x="${offsetX}" y="${barY}" width="${w}" height="${barHeight}" rx="${offsetX === 15 ? 6 : 0}" fill="${lang.color}" opacity="0.9">
    <title>${lang.language}: ${lang.percentage}%</title>
  </rect>`;
    offsetX += w;
  });

  // Round right edge
  svg += `\n  <rect x="${15}" y="${barY}" width="${barWidth}" height="${barHeight}" rx="6" fill="none" stroke="${COLORS.border}" stroke-width="0.5"/>`;

  // Legend dots
  let legendX = 15;
  data.languages.slice(0, 6).forEach((lang) => {
    svg += `\n  <circle cx="${legendX + 5}" cy="${barY + barHeight + 18}" r="4" fill="${lang.color}"/>`;
    svg += `\n  <text x="${legendX + 12}" y="${barY + barHeight + 22}" class="lang-label">${lang.language} <tspan class="lang-pct" fill="${lang.color}">${lang.percentage}%</tspan></text>`;
    legendX += lang.language.length * 6 + 55;
  });

  svg += "\n</svg>";
  return svg;
}

// ─── PR Stats Chart ─────────────────────────────────────
function generatePRStatsSVG(data: MetricsData, width: number): string {
  const height = 160;
  const s = data.summary;

  const prStats = [
    { label: "Opened", value: s.total_prs, max: s.total_prs, color: COLORS.blue },
    { label: "Merged", value: s.total_prs_merged, max: s.total_prs, color: COLORS.green },
    { label: "Avg Merge Time", value: s.avg_pr_merge_time_hours, max: 48, color: COLORS.purple, suffix: "h" },
    { label: "Avg Review Time", value: s.avg_time_to_first_review_hours, max: 24, color: COLORS.cyan, suffix: "h" },
  ];

  const barMaxWidth = width - 200;

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    ${prStats.map((p, i) => `<linearGradient id="prGrad${i}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${p.color}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${p.color}" stop-opacity="0.5"/>
    </linearGradient>`).join("\n    ")}
  </defs>

  <style>
    .title { font: 600 13px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.text}; }
    .bar-label { font: 400 11px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.textMuted}; }
    .bar-value { font: 700 12px 'Segoe UI', system-ui, sans-serif; }
  </style>

  <rect width="${width}" height="${height}" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
  <text x="15" y="22" class="title">🔀 Pull Request Analytics</text>`;

  prStats.forEach((p, i) => {
    const y = 45 + i * 28;
    const barW = Math.max(4, (p.value / p.max) * barMaxWidth);
    const suffix = (p as any).suffix || "";

    svg += `
  <text x="15" y="${y + 12}" class="bar-label">${p.label}</text>
  <rect x="140" y="${y}" width="${barW}" height="16" rx="8" fill="url(#prGrad${i})"/>
  <text x="${142 + barW + 6}" y="${y + 12}" class="bar-value" fill="${p.color}">${p.value}${suffix}</text>`;
  });

  svg += "\n</svg>";
  return svg;
}

// ─── Top Contributors Chart ─────────────────────────────
function generateContributorsSVG(data: MetricsData, width: number): string {
  const top5 = data.contributors.slice(0, 5);
  const height = 200;
  const maxCommits = Math.max(...top5.map((c) => c.total_commits));
  const barMaxWidth = width - 250;
  const contributorColors = [COLORS.purple, COLORS.cyan, COLORS.green, COLORS.yellow, COLORS.pink];

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    ${contributorColors.map((c, i) => `<linearGradient id="contribGrad${i}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="${c}" stop-opacity="0.9"/>
      <stop offset="100%" stop-color="${c}" stop-opacity="0.4"/>
    </linearGradient>`).join("\n    ")}
  </defs>

  <style>
    .title { font: 600 13px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.text}; }
    .contrib-name { font: 600 11px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.text}; }
    .contrib-stats { font: 400 9px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.textMuted}; }
    .contrib-value { font: 700 11px 'Segoe UI', system-ui, sans-serif; }
  </style>

  <rect width="${width}" height="${height}" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
  <text x="15" y="22" class="title">👥 Top Contributors</text>`;

  top5.forEach((c, i) => {
    const y = 42 + i * 30;
    const barW = Math.max(4, (c.total_commits / maxCommits) * barMaxWidth);
    const color = contributorColors[i];

    svg += `
  <circle cx="28" cy="${y + 10}" r="10" fill="${color}" opacity="0.2"/>
  <text x="28" y="${y + 14}" text-anchor="middle" style="font: 600 10px sans-serif; fill: ${color};">${c.username[0].toUpperCase()}</text>
  <text x="45" y="${y + 8}" class="contrib-name">@${c.username}</text>
  <text x="45" y="${y + 20}" class="contrib-stats">${c.total_commits} commits · ${c.total_prs} PRs · +${(c.additions / 1000).toFixed(1)}k/-${(c.deletions / 1000).toFixed(1)}k</text>
  <rect x="200" y="${y + 2}" width="${barW}" height="8" rx="4" fill="url(#contribGrad${i})"/>
  <text x="${204 + barW + 4}" y="${y + 11}" class="contrib-value" fill="${color}">${c.total_commits}</text>`;
  });

  svg += "\n</svg>";
  return svg;
}

// ─── DORA Metrics Chart ─────────────────────────────────
function generateDORASVG(data: MetricsData, width: number): string {
  const height = 160;
  const dora = data.dora;

  const ratingColors: Record<string, string> = {
    elite: COLORS.green,
    high: COLORS.cyan,
    medium: COLORS.yellow,
    low: COLORS.red,
  };

  const metrics = [
    { label: "Deployment Frequency", value: `${dora.deployment_frequency.value}/week`, rating: dora.deployment_frequency.rating },
    { label: "Lead Time for Changes", value: `${dora.lead_time_for_changes.value_hours}h`, rating: dora.lead_time_for_changes.rating },
    { label: "Change Failure Rate", value: `${dora.change_failure_rate.value_percent}%`, rating: dora.change_failure_rate.rating },
    { label: "Mean Time to Recovery", value: `${dora.mean_time_to_recovery.value_hours}h`, rating: dora.mean_time_to_recovery.rating },
  ];

  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <style>
    .title { font: 600 13px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.text}; }
    .metric-label { font: 400 11px 'Segoe UI', system-ui, sans-serif; fill: ${COLORS.textMuted}; }
    .metric-value { font: 700 18px 'Segoe UI', system-ui, sans-serif; }
    .metric-rating { font: 600 9px 'Segoe UI', system-ui, sans-serif; text-transform: uppercase; letter-spacing: 0.5px; }
  </style>

  <rect width="${width}" height="${height}" rx="10" fill="${COLORS.bg}" stroke="${COLORS.border}" stroke-width="1"/>
  <text x="15" y="22" class="title">🎯 DORA Metrics</text>`;

  const colWidth = (width - 30) / metrics.length;

  metrics.forEach((m, i) => {
    const x = 15 + i * colWidth + colWidth / 2;
    const color = ratingColors[m.rating];

    svg += `
  <text x="${x}" y="55" class="metric-value" text-anchor="middle" fill="${color}">${m.value}</text>
  <text x="${x}" y="75" class="metric-label" text-anchor="middle">${m.label}</text>
  <rect x="${x - 25}" y="88" width="50" height="18" rx="9" fill="${color}" opacity="0.15"/>
  <text x="${x}" y="100" class="metric-rating" text-anchor="middle" fill="${color}">${m.rating}</text>`;

    if (i < metrics.length - 1) {
      const divX = 15 + (i + 1) * colWidth;
      svg += `\n  <line x1="${divX}" y1="35" x2="${divX}" y2="110" stroke="${COLORS.border}" stroke-width="0.5"/>`;
    }
  });

  svg += `\n  <text x="${width / 2}" y="${height - 15}" text-anchor="middle" style="font: 400 9px sans-serif; fill: ${COLORS.textDim};">Based on DORA (DevOps Research and Assessment) industry benchmarks</text>`;
  svg += "\n</svg>";
  return svg;
}

// ─── Main ───────────────────────────────────────────────
function main() {
  const dataPath = join(ROOT, "data", "metrics.json");
  const data: MetricsData = JSON.parse(readFileSync(dataPath, "utf-8"));
  const chartWidth = 840;

  const assetsDir = join(ROOT, "assets");
  mkdirSync(assetsDir, { recursive: true });

  const charts = [
    { name: "stats-banner", fn: () => generateStatsBannerSVG(data, chartWidth) },
    { name: "contribution-heatmap", fn: () => generateHeatmapSVG(data.heatmap, chartWidth) },
    { name: "activity-chart", fn: () => generateActivitySVG(data, chartWidth) },
    { name: "language-breakdown", fn: () => generateLanguageSVG(data, chartWidth) },
    { name: "pr-stats", fn: () => generatePRStatsSVG(data, chartWidth) },
    { name: "top-contributors", fn: () => generateContributorsSVG(data, chartWidth) },
    { name: "dora-metrics", fn: () => generateDORASVG(data, chartWidth) },
  ];

  charts.forEach(({ name, fn }) => {
    const svg = fn();
    writeFileSync(join(assetsDir, `${name}.svg`), svg);
    console.log(`  ✅ ${name}.svg`);
  });

  console.log(`\n🎨 Generated ${charts.length} SVG charts → assets/`);
}

main();

