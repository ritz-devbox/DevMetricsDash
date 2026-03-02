import * as fs from 'fs';
import * as path from 'path';

const dataPath = path.resolve(process.cwd(), 'data', 'metrics.json');
if (!fs.existsSync(dataPath)) {
  console.error('No data/metrics.json found. Run fetch-metrics.ts first.');
  process.exit(1);
}

const data = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
const assetsDir = path.resolve(process.cwd(), 'assets');
if (!fs.existsSync(assetsDir)) fs.mkdirSync(assetsDir, { recursive: true });

function write(name: string, svg: string) {
  fs.writeFileSync(path.join(assetsDir, name), svg.trim());
  console.log(`  Generated assets/${name}`);
}

// ── Shared styles ───────────────────────────────────────
const BG = '#0d1117';
const CARD_BG = '#161b22';
const BORDER = '#30363d';
const TEXT = '#e6edf3';
const TEXT_DIM = '#8b949e';
const TEXT_MUTED = '#484f58';
const PURPLE = '#8b5cf6';
const CYAN = '#06b6d4';
const GREEN = '#10b981';
const YELLOW = '#f59e0b';
const ORANGE = '#f97316';
const PINK = '#ec4899';
const RED = '#ef4444';

function formatNum(n: number): string {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'K';
  return n.toLocaleString();
}

// ── 1. Stats Banner ─────────────────────────────────────
function generateStatsBanner() {
  const s = data.summary;
  const stats = [
    { label: 'Commits', value: formatNum(s.total_commits), color: PURPLE },
    { label: 'PRs Merged', value: formatNum(s.total_prs_merged), color: CYAN },
    { label: 'Issues Closed', value: formatNum(s.total_issues_closed), color: GREEN },
    { label: 'Reviews', value: formatNum(s.total_reviews), color: YELLOW },
    { label: 'Contributors', value: s.total_contributors.toString(), color: PINK },
    { label: 'Releases', value: s.total_releases.toString(), color: ORANGE },
  ];

  const w = 800, h = 120, cardW = 120, gap = 10;
  const startX = (w - (stats.length * cardW + (stats.length - 1) * gap)) / 2;

  const cards = stats.map((st, i) => {
    const x = startX + i * (cardW + gap);
    return `
      <rect x="${x}" y="15" width="${cardW}" height="90" rx="10" fill="${CARD_BG}" stroke="${BORDER}" stroke-width="1"/>
      <rect x="${x}" y="15" width="${cardW}" height="3" rx="1.5" fill="${st.color}" opacity="0.6"/>
      <text x="${x + cardW / 2}" y="55" fill="${TEXT}" font-size="20" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">${st.value}</text>
      <text x="${x + cardW / 2}" y="80" fill="${TEXT_DIM}" font-size="10" text-anchor="middle" font-family="Inter,sans-serif" text-transform="uppercase" letter-spacing="0.5">${st.label}</text>`;
  }).join('');

  write('stats-banner.svg', `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${cards}</svg>`);
}

// ── 2. Contribution Heatmap ─────────────────────────────
function generateHeatmap() {
  const heatmap = data.heatmap || [];
  const levelColors = ['#161b22', '#8b5cf620', '#8b5cf650', '#8b5cf690', '#8b5cf6'];
  const cellSize = 12, gap = 3;

  const weeks: any[][] = [];
  for (let i = 0; i < heatmap.length; i += 7) {
    weeks.push(heatmap.slice(i, i + 7));
  }
  const displayWeeks = weeks.slice(-52);
  const w = displayWeeks.length * (cellSize + gap) + 60;
  const h = 7 * (cellSize + gap) + 40;

  const cells = displayWeeks.map((week: any[], wi: number) =>
    week.map((day: any, di: number) => {
      const x = 40 + wi * (cellSize + gap);
      const y = 10 + di * (cellSize + gap);
      const fill = levelColors[day.level] || levelColors[0];
      return `<rect x="${x}" y="${y}" width="${cellSize}" height="${cellSize}" rx="2" fill="${fill}"><title>${day.date}: ${day.count} contributions</title></rect>`;
    }).join('')
  ).join('');

  const dayLabels = ['Mon', 'Wed', 'Fri'].map((d, i) =>
    `<text x="30" y="${10 + (i * 2 + 1) * (cellSize + gap) + 9}" fill="${TEXT_MUTED}" font-size="9" text-anchor="end" font-family="Inter,sans-serif">${d}</text>`
  ).join('');

  write('contribution-heatmap.svg', `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${BG}" rx="8"/>
    ${dayLabels}${cells}
    <text x="40" y="${h - 6}" fill="${TEXT_MUTED}" font-size="9" font-family="Inter,sans-serif">Less</text>
    ${levelColors.map((c, i) => `<rect x="${70 + i * 16}" y="${h - 18}" width="12" height="12" rx="2" fill="${c}"/>`).join('')}
    <text x="${70 + levelColors.length * 16 + 4}" y="${h - 6}" fill="${TEXT_MUTED}" font-size="9" font-family="Inter,sans-serif">More</text>
  </svg>`);
}

// ── 3. Activity Chart ───────────────────────────────────
function generateActivityChart() {
  const weekly = data.weekly_activity || [];
  if (weekly.length === 0) return;
  const w = 800, h = 250, padL = 50, padR = 20, padT = 20, padB = 40;
  const chartW = w - padL - padR, chartH = h - padT - padB;

  const maxVal = Math.max(...weekly.map((w: any) => Math.max(w.commits, w.prs_merged, w.issues_closed)), 1);

  function polyline(key: string, color: string): string {
    const points = weekly.map((d: any, i: number) => {
      const x = padL + (i / Math.max(weekly.length - 1, 1)) * chartW;
      const y = padT + chartH - (d[key] / maxVal) * chartH;
      return `${x},${y}`;
    }).join(' ');
    return `<polyline points="${points}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>`;
  }

  const gridLines = [0, 0.25, 0.5, 0.75, 1].map(pct => {
    const y = padT + chartH - pct * chartH;
    const val = Math.round(pct * maxVal);
    return `<line x1="${padL}" y1="${y}" x2="${w - padR}" y2="${y}" stroke="${BORDER}" stroke-width="0.5" stroke-dasharray="3,3"/>
      <text x="${padL - 8}" y="${y + 4}" fill="${TEXT_MUTED}" font-size="9" text-anchor="end" font-family="Inter,sans-serif">${val}</text>`;
  }).join('');

  const xLabels = weekly.filter((_: any, i: number) => i % Math.ceil(weekly.length / 6) === 0).map((d: any, i: number, arr: any[]) => {
    const idx = weekly.indexOf(d);
    const x = padL + (idx / Math.max(weekly.length - 1, 1)) * chartW;
    const label = new Date(d.week_start).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    return `<text x="${x}" y="${h - 10}" fill="${TEXT_MUTED}" font-size="9" text-anchor="middle" font-family="Inter,sans-serif">${label}</text>`;
  }).join('');

  const legend = [
    { label: 'Commits', color: PURPLE },
    { label: 'PRs Merged', color: CYAN },
    { label: 'Issues Closed', color: GREEN },
  ].map((l, i) =>
    `<circle cx="${padL + i * 110}" cy="${h - 1}" r="4" fill="${l.color}"/>
     <text x="${padL + i * 110 + 10}" y="${h + 3}" fill="${TEXT_DIM}" font-size="9" font-family="Inter,sans-serif">${l.label}</text>`
  ).join('');

  write('activity-chart.svg', `<svg width="${w}" height="${h + 15}" viewBox="0 0 ${w} ${h + 15}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h + 15}" fill="${BG}" rx="8"/>
    ${gridLines}${xLabels}
    ${polyline('commits', PURPLE)}
    ${polyline('prs_merged', CYAN)}
    ${polyline('issues_closed', GREEN)}
    ${legend}
  </svg>`);
}

// ── 4. PR Stats ─────────────────────────────────────────
function generatePRStats() {
  const prs = data.pull_requests || [];
  const merged = prs.filter((p: any) => p.state === 'merged');
  const open = prs.filter((p: any) => p.state === 'open');
  const s = data.summary;
  const w = 800, h = 140;

  const items = [
    { label: 'Total PRs', value: s.total_prs, color: PURPLE },
    { label: 'Merged', value: merged.length, color: GREEN },
    { label: 'Open', value: open.length, color: CYAN },
    { label: 'Avg Merge Time', value: s.avg_pr_merge_time_hours + 'h', color: YELLOW },
    { label: 'Avg First Review', value: s.avg_time_to_first_review_hours + 'h', color: ORANGE },
  ];

  const cardW = 140, gapX = 12;
  const startX = (w - (items.length * cardW + (items.length - 1) * gapX)) / 2;

  const cards = items.map((item, i) => {
    const x = startX + i * (cardW + gapX);
    return `
      <rect x="${x}" y="15" width="${cardW}" height="100" rx="10" fill="${CARD_BG}" stroke="${BORDER}" stroke-width="1"/>
      <circle cx="${x + cardW / 2}" cy="45" r="3" fill="${item.color}"/>
      <text x="${x + cardW / 2}" y="78" fill="${TEXT}" font-size="22" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">${item.value}</text>
      <text x="${x + cardW / 2}" y="100" fill="${TEXT_DIM}" font-size="9" text-anchor="middle" font-family="Inter,sans-serif">${item.label}</text>`;
  }).join('');

  write('pr-stats.svg', `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${cards}</svg>`);
}

// ── 5. Top Contributors ─────────────────────────────────
function generateTopContributors() {
  const contribs = [...(data.contributors || [])].sort((a: any, b: any) => b.total_commits - a.total_commits).slice(0, 6);
  if (contribs.length === 0) return;
  const w = 800, rowH = 45, h = contribs.length * rowH + 30;
  const maxCommits = contribs[0]?.total_commits || 1;

  const rows = contribs.map((c: any, i: number) => {
    const y = 15 + i * rowH;
    const barW = (c.total_commits / maxCommits) * 350;
    return `
      <text x="30" y="${y + 25}" fill="${TEXT_MUTED}" font-size="12" font-family="Inter,sans-serif">${i + 1}</text>
      <text x="55" y="${y + 25}" fill="${TEXT}" font-size="13" font-weight="600" font-family="Inter,sans-serif">${c.username}</text>
      <rect x="220" y="${y + 10}" width="${barW}" height="18" rx="4" fill="${PURPLE}" opacity="0.7"/>
      <text x="${230 + barW}" y="${y + 24}" fill="${TEXT_DIM}" font-size="11" font-family="Inter,sans-serif">${c.total_commits} commits</text>
      <text x="700" y="${y + 24}" fill="${TEXT_MUTED}" font-size="10" font-family="JetBrains Mono,monospace">${c.total_prs} PRs · ${c.total_reviews} reviews</text>`;
  }).join('');

  write('top-contributors.svg', `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${BG}" rx="8"/>
    ${rows}
  </svg>`);
}

// ── 6. Language Breakdown ───────────────────────────────
function generateLanguageBreakdown() {
  const langs = data.languages || [];
  if (langs.length === 0) return;
  const w = 800, h = 120;
  const barY = 30, barH = 24, barW = 700;
  const startX = 50;

  let offset = 0;
  const segments = langs.map((l: any) => {
    const segW = (l.percentage / 100) * barW;
    const x = startX + offset;
    offset += segW;
    return `<rect x="${x}" y="${barY}" width="${Math.max(segW - 1, 1)}" height="${barH}" rx="${x === startX ? 6 : 0}" fill="${l.color}"/>`;
  }).join('');

  const labels = langs.filter((l: any) => l.percentage >= 3).map((l: any, i: number) => {
    const x = startX + i * 120;
    const y = barY + barH + 28;
    return `
      <circle cx="${x}" cy="${y - 4}" r="4" fill="${l.color}"/>
      <text x="${x + 10}" y="${y}" fill="${TEXT_DIM}" font-size="10" font-family="Inter,sans-serif">${l.language} <tspan fill="${TEXT_MUTED}" font-family="JetBrains Mono,monospace">${l.percentage}%</tspan></text>`;
  }).join('');

  write('language-breakdown.svg', `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${w}" height="${h}" fill="${BG}" rx="8"/>
    <clipPath id="barClip"><rect x="${startX}" y="${barY}" width="${barW}" height="${barH}" rx="6"/></clipPath>
    <g clip-path="url(#barClip)">${segments}</g>
    ${labels}
  </svg>`);
}

// ── 7. DORA Metrics ─────────────────────────────────────
function generateDoraMetrics() {
  const d = data.dora;
  if (!d) return;
  const w = 800, h = 140;

  const ratingColor = (r: string) => r === 'elite' ? GREEN : r === 'high' ? CYAN : r === 'medium' ? YELLOW : RED;

  const metrics = [
    { label: 'Deploy Freq', value: d.deployment_frequency.value + '/wk', rating: d.deployment_frequency.rating },
    { label: 'Lead Time', value: d.lead_time_for_changes.value_hours + 'h', rating: d.lead_time_for_changes.rating },
    { label: 'Failure Rate', value: d.change_failure_rate.value_percent + '%', rating: d.change_failure_rate.rating },
    { label: 'Recovery Time', value: d.mean_time_to_recovery.value_hours + 'h', rating: d.mean_time_to_recovery.rating },
  ];

  const cardW = 180, gapX = 12;
  const startX = (w - (metrics.length * cardW + (metrics.length - 1) * gapX)) / 2;

  const cards = metrics.map((m, i) => {
    const x = startX + i * (cardW + gapX);
    const color = ratingColor(m.rating);
    return `
      <rect x="${x}" y="10" width="${cardW}" height="110" rx="10" fill="${CARD_BG}" stroke="${BORDER}" stroke-width="1"/>
      <text x="${x + cardW / 2}" y="40" fill="${TEXT_DIM}" font-size="10" text-anchor="middle" font-family="Inter,sans-serif" letter-spacing="0.5">${m.label.toUpperCase()}</text>
      <text x="${x + cardW / 2}" y="72" fill="${TEXT}" font-size="22" font-weight="700" text-anchor="middle" font-family="Inter,sans-serif">${m.value}</text>
      <rect x="${x + cardW / 2 - 25}" y="85" width="50" height="20" rx="10" fill="${color}" opacity="0.15"/>
      <text x="${x + cardW / 2}" y="99" fill="${color}" font-size="10" font-weight="600" text-anchor="middle" font-family="Inter,sans-serif">${m.rating.toUpperCase()}</text>`;
  }).join('');

  write('dora-metrics.svg', `<svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg">${cards}</svg>`);
}

// ── Run all ─────────────────────────────────────────────
console.log('\n⚡ Generating SVG charts for README\n');
generateStatsBanner();
generateHeatmap();
generateActivityChart();
generatePRStats();
generateTopContributors();
generateLanguageBreakdown();
generateDoraMetrics();
console.log('\n✅ All SVG charts generated in assets/\n');
