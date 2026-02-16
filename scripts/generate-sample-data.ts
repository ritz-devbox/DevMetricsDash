// ============================================================
// DevMetricsDash — Sample Data Generator
// ============================================================
// Generates realistic demo data for development & preview.
// ============================================================

import { writeFileSync, mkdirSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import type { MetricsData, HeatmapData, DailyActivity, WeeklyActivity } from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min: number, max: number, decimals = 1): number {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function randomDate(daysAgo: number): string {
  const d = new Date();
  d.setDate(d.getDate() - randomInt(0, daysAgo));
  d.setHours(randomInt(8, 22), randomInt(0, 59), randomInt(0, 59));
  return d.toISOString();
}

function generateHeatmap(days: number): HeatmapData[] {
  const data: HeatmapData[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const baseChance = isWeekend ? 0.3 : 0.85;
    const active = Math.random() < baseChance;
    const count = active ? (isWeekend ? randomInt(1, 5) : randomInt(1, 18)) : 0;
    const level = count === 0 ? 0 : count <= 3 ? 1 : count <= 7 ? 2 : count <= 12 ? 3 : 4;
    data.push({
      date: d.toISOString().split("T")[0],
      count,
      level: level as 0 | 1 | 2 | 3 | 4,
    });
  }
  return data;
}

function generateDailyActivity(days: number): DailyActivity[] {
  const data: DailyActivity[] = [];
  const now = new Date();
  for (let i = days; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const isWeekend = d.getDay() === 0 || d.getDay() === 6;
    const multiplier = isWeekend ? 0.3 : 1;
    data.push({
      date: d.toISOString().split("T")[0],
      commits: Math.round(randomInt(0, 15) * multiplier),
      prs_opened: Math.round(randomInt(0, 4) * multiplier),
      prs_merged: Math.round(randomInt(0, 3) * multiplier),
      issues_opened: Math.round(randomInt(0, 5) * multiplier),
      issues_closed: Math.round(randomInt(0, 4) * multiplier),
      reviews: Math.round(randomInt(0, 6) * multiplier),
      additions: Math.round(randomInt(10, 800) * multiplier),
      deletions: Math.round(randomInt(5, 400) * multiplier),
    });
  }
  return data;
}

function generateWeeklyActivity(weeks: number): WeeklyActivity[] {
  const data: WeeklyActivity[] = [];
  const now = new Date();
  for (let i = weeks; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i * 7);
    const weekStart = new Date(d);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    data.push({
      week_start: weekStart.toISOString().split("T")[0],
      commits: randomInt(15, 85),
      prs_opened: randomInt(3, 18),
      prs_merged: randomInt(2, 15),
      issues_opened: randomInt(5, 20),
      issues_closed: randomInt(3, 18),
      additions: randomInt(500, 8000),
      deletions: randomInt(200, 4000),
      active_contributors: randomInt(2, 7),
    });
  }
  return data;
}

const contributors = [
  { username: "alexchen", avatar_url: "https://avatars.githubusercontent.com/u/1?v=4" },
  { username: "sarahdev", avatar_url: "https://avatars.githubusercontent.com/u/2?v=4" },
  { username: "mikejones", avatar_url: "https://avatars.githubusercontent.com/u/3?v=4" },
  { username: "emilyz", avatar_url: "https://avatars.githubusercontent.com/u/4?v=4" },
  { username: "jamesw", avatar_url: "https://avatars.githubusercontent.com/u/5?v=4" },
  { username: "priyak", avatar_url: "https://avatars.githubusercontent.com/u/6?v=4" },
];

const repos = [
  { name: "web-platform", language: "TypeScript", stars: 234, forks: 45, desc: "Main web application platform" },
  { name: "api-gateway", language: "Go", stars: 156, forks: 32, desc: "API gateway and routing service" },
  { name: "mobile-app", language: "TypeScript", stars: 89, forks: 12, desc: "React Native mobile application" },
  { name: "ml-pipeline", language: "Python", stars: 312, forks: 67, desc: "Machine learning data pipeline" },
  { name: "infra-config", language: "HCL", stars: 45, forks: 8, desc: "Infrastructure as code configurations" },
];

const commitMessages = [
  "feat: implement user authentication flow",
  "fix: resolve memory leak in data processing",
  "refactor: optimize database query performance",
  "feat: add real-time notification system",
  "fix: handle edge case in payment processing",
  "chore: update dependencies to latest versions",
  "feat: implement search functionality with filters",
  "fix: correct timezone handling in scheduler",
  "docs: update API documentation",
  "feat: add dark mode support",
  "perf: optimize bundle size with code splitting",
  "fix: resolve race condition in async operations",
  "feat: implement file upload with progress tracking",
  "test: add integration tests for auth module",
  "feat: add export to CSV functionality",
  "fix: handle null values in data transformation",
  "refactor: migrate to new state management",
  "feat: implement role-based access control",
  "fix: correct pagination logic",
  "feat: add webhook integration support",
];

const prTitles = [
  "Feature: User authentication with OAuth",
  "Fix: Memory leak in data processing pipeline",
  "Refactor: Database query optimization",
  "Feature: Real-time WebSocket notifications",
  "Fix: Payment processing edge cases",
  "Feature: Advanced search with Elasticsearch",
  "Fix: Timezone handling improvements",
  "Feature: Dark mode theme support",
  "Performance: Bundle optimization",
  "Feature: File upload with drag and drop",
  "Feature: CSV/Excel export functionality",
  "Fix: Race condition in concurrent requests",
  "Feature: Role-based access control system",
  "Feature: Webhook integration framework",
  "Fix: Pagination boundary conditions",
];

const labels = ["bug", "feature", "enhancement", "documentation", "performance", "security", "refactor", "dependencies"];

function generateSampleData(): MetricsData {
  const dailyActivity = generateDailyActivity(90);
  const weeklyActivity = generateWeeklyActivity(13);
  const heatmap = generateHeatmap(365);

  const totalCommits = dailyActivity.reduce((s, d) => s + d.commits, 0);
  const totalPRs = dailyActivity.reduce((s, d) => s + d.prs_opened, 0);
  const totalPRsMerged = dailyActivity.reduce((s, d) => s + d.prs_merged, 0);

  return {
    generated_at: new Date().toISOString(),
    config: {
      owner: "demo-org",
      lookback_days: 90,
    },
    summary: {
      total_commits: totalCommits,
      total_prs: totalPRs,
      total_prs_merged: totalPRsMerged,
      total_issues: randomInt(80, 180),
      total_issues_closed: randomInt(60, 140),
      total_reviews: randomInt(120, 350),
      total_releases: randomInt(8, 24),
      total_contributors: contributors.length,
      total_repositories: repos.length,
      avg_pr_merge_time_hours: randomFloat(4, 28),
      avg_time_to_first_review_hours: randomFloat(1, 8),
      avg_issue_close_time_hours: randomFloat(12, 72),
      code_additions: dailyActivity.reduce((s, d) => s + d.additions, 0),
      code_deletions: dailyActivity.reduce((s, d) => s + d.deletions, 0),
    },
    contributors: contributors.map((c, i) => ({
      ...c,
      total_commits: randomInt(30, 250 - i * 30),
      total_prs: randomInt(5, 60 - i * 8),
      total_reviews: randomInt(10, 80 - i * 10),
      total_issues: randomInt(3, 30 - i * 4),
      additions: randomInt(2000, 25000 - i * 3000),
      deletions: randomInt(500, 12000 - i * 1500),
      active_days: randomInt(30, 80 - i * 8),
      first_commit_date: randomDate(90),
      last_commit_date: randomDate(5),
    })),
    commits: Array.from({ length: 50 }, (_, i) => {
      const author = contributors[randomInt(0, contributors.length - 1)];
      const repo = repos[randomInt(0, repos.length - 1)];
      return {
        sha: Math.random().toString(36).substring(2, 10),
        message: commitMessages[randomInt(0, commitMessages.length - 1)],
        author: author.username,
        author_avatar: author.avatar_url,
        date: randomDate(90),
        additions: randomInt(5, 500),
        deletions: randomInt(1, 250),
        files_changed: randomInt(1, 20),
        repo: repo.name,
      };
    }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    pull_requests: Array.from({ length: 30 }, (_, i) => {
      const author = contributors[randomInt(0, contributors.length - 1)];
      const repo = repos[randomInt(0, repos.length - 1)];
      const created = randomDate(90);
      const isMerged = Math.random() > 0.25;
      const mergeHours = randomFloat(1, 72);
      const merged_at = isMerged
        ? new Date(new Date(created).getTime() + mergeHours * 3600000).toISOString()
        : null;
      return {
        number: 100 + i,
        title: prTitles[randomInt(0, prTitles.length - 1)],
        author: author.username,
        author_avatar: author.avatar_url,
        state: (isMerged ? "merged" : Math.random() > 0.5 ? "open" : "closed") as "open" | "closed" | "merged",
        created_at: created,
        merged_at,
        closed_at: isMerged ? merged_at : null,
        additions: randomInt(10, 800),
        deletions: randomInt(5, 400),
        files_changed: randomInt(1, 25),
        comments: randomInt(0, 15),
        review_comments: randomInt(0, 20),
        reviews: randomInt(1, 5),
        time_to_merge_hours: isMerged ? mergeHours : null,
        time_to_first_review_hours: randomFloat(0.5, 12),
        repo: repo.name,
        labels: Array.from(
          { length: randomInt(1, 3) },
          () => labels[randomInt(0, labels.length - 1)]
        ),
      };
    }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    issues: Array.from({ length: 20 }, (_, i) => {
      const author = contributors[randomInt(0, contributors.length - 1)];
      const repo = repos[randomInt(0, repos.length - 1)];
      const created = randomDate(90);
      const isClosed = Math.random() > 0.35;
      const closeHours = randomFloat(2, 120);
      return {
        number: 200 + i,
        title: commitMessages[randomInt(0, commitMessages.length - 1)],
        author: author.username,
        state: (isClosed ? "closed" : "open") as "open" | "closed",
        created_at: created,
        closed_at: isClosed
          ? new Date(new Date(created).getTime() + closeHours * 3600000).toISOString()
          : null,
        labels: Array.from(
          { length: randomInt(1, 3) },
          () => labels[randomInt(0, labels.length - 1)]
        ),
        comments: randomInt(0, 12),
        time_to_close_hours: isClosed ? closeHours : null,
        repo: repo.name,
      };
    }),
    releases: Array.from({ length: 12 }, (_, i) => ({
      tag: `v${3 - Math.floor(i / 4)}.${randomInt(0, 9)}.${randomInt(0, 20)}`,
      name: `Release ${3 - Math.floor(i / 4)}.${randomInt(0, 9)}.${randomInt(0, 20)}`,
      published_at: randomDate(90),
      author: contributors[randomInt(0, 2)].username,
      repo: repos[randomInt(0, repos.length - 1)].name,
      is_prerelease: Math.random() > 0.8,
    })),
    daily_activity: dailyActivity,
    weekly_activity: weeklyActivity,
    repositories: repos.map((r) => ({
      name: r.name,
      full_name: `demo-org/${r.name}`,
      description: r.desc,
      language: r.language,
      stars: r.stars,
      forks: r.forks,
      open_issues: randomInt(2, 15),
      total_commits: randomInt(100, 800),
      total_prs: randomInt(20, 120),
      avg_pr_merge_time_hours: randomFloat(3, 36),
      contributors_count: randomInt(2, 6),
      last_commit_date: randomDate(7),
      languages: {
        TypeScript: randomInt(40, 70),
        JavaScript: randomInt(5, 20),
        CSS: randomInt(5, 15),
        Python: randomInt(5, 25),
        Go: randomInt(5, 15),
        Other: randomInt(1, 10),
      },
    })),
    dora: {
      deployment_frequency: {
        value: randomFloat(2, 8),
        unit: "per_week",
        rating: "high",
      },
      lead_time_for_changes: {
        value_hours: randomFloat(4, 24),
        rating: "high",
      },
      change_failure_rate: {
        value_percent: randomFloat(2, 12),
        rating: "medium",
      },
      mean_time_to_recovery: {
        value_hours: randomFloat(1, 8),
        rating: "high",
      },
    },
    heatmap,
    languages: [
      { language: "TypeScript", percentage: 42.3, color: "#3178C6", bytes: 1245000 },
      { language: "Python", percentage: 22.1, color: "#3572A5", bytes: 651000 },
      { language: "Go", percentage: 15.7, color: "#00ADD8", bytes: 462000 },
      { language: "JavaScript", percentage: 8.4, color: "#F7DF1E", bytes: 247000 },
      { language: "CSS", percentage: 6.2, color: "#563D7C", bytes: 182000 },
      { language: "HCL", percentage: 3.8, color: "#844FBA", bytes: 112000 },
      { language: "Other", percentage: 1.5, color: "#6B7280", bytes: 44000 },
    ],
  };
}

// Generate and save
const data = generateSampleData();
const outDir = join(ROOT, "data");
mkdirSync(outDir, { recursive: true });
writeFileSync(join(outDir, "metrics.json"), JSON.stringify(data, null, 2));
console.log("✅ Sample data generated → data/metrics.json");

