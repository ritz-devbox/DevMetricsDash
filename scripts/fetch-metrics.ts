// ============================================================
// DevMetricsDash — GitHub Metrics Fetcher
// ============================================================
// Fetches real metrics from the GitHub API using Octokit.
// Requires GITHUB_TOKEN environment variable.
// ============================================================

import { Octokit } from "@octokit/rest";
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as yaml from "js-yaml";
import type {
  Config,
  MetricsData,
  ContributorStats,
  CommitData,
  PullRequestData,
  IssueData,
  ReleaseData,
  DailyActivity,
  WeeklyActivity,
  RepositoryStats,
  DORAMetrics,
  HeatmapData,
  LanguageBreakdown,
} from "./types.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, "..");

// ─── Load Config ────────────────────────────────────────
function loadConfig(): Config {
  const configPath = join(ROOT, "config.yml");
  const raw = readFileSync(configPath, "utf-8");
  return yaml.load(raw) as Config;
}

// ─── Initialize Octokit ─────────────────────────────────
function getOctokit(): Octokit {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    console.error("❌ GITHUB_TOKEN environment variable is required.");
    console.error("   Set it in .env or as a GitHub Actions secret.");
    process.exit(1);
  }
  return new Octokit({ auth: token });
}

// ─── Fetch Repositories ─────────────────────────────────
async function fetchRepos(octokit: Octokit, config: Config): Promise<any[]> {
  if (config.repositories && config.repositories.length > 0) {
    const repos = [];
    for (const name of config.repositories) {
      const { data } = await octokit.repos.get({ owner: config.owner, repo: name });
      repos.push(data);
    }
    return repos;
  }

  // Fetch all repos for the owner
  const repos = await octokit.paginate(octokit.repos.listForUser, {
    username: config.owner,
    sort: "updated",
    per_page: 100,
  });
  return repos;
}

// ─── Fetch Commits ──────────────────────────────────────
async function fetchCommits(
  octokit: Octokit,
  owner: string,
  repo: string,
  since: string
): Promise<CommitData[]> {
  try {
    const commits = await octokit.paginate(octokit.repos.listCommits, {
      owner,
      repo,
      since,
      per_page: 100,
    });

    return commits.map((c: any) => ({
      sha: c.sha.substring(0, 8),
      message: c.commit.message.split("\n")[0].substring(0, 100),
      author: c.author?.login || c.commit.author?.name || "unknown",
      author_avatar: c.author?.avatar_url || "",
      date: c.commit.author?.date || "",
      additions: 0, // Would need individual commit API calls
      deletions: 0,
      files_changed: 0,
      repo,
    }));
  } catch (e) {
    console.warn(`  ⚠️ Could not fetch commits for ${repo}:`, (e as Error).message);
    return [];
  }
}

// ─── Fetch Pull Requests ────────────────────────────────
async function fetchPullRequests(
  octokit: Octokit,
  owner: string,
  repo: string,
  since: string
): Promise<PullRequestData[]> {
  try {
    const prs = await octokit.paginate(octokit.pulls.list, {
      owner,
      repo,
      state: "all",
      sort: "updated",
      direction: "desc",
      per_page: 100,
    });

    const sinceDate = new Date(since);

    return prs
      .filter((pr: any) => new Date(pr.created_at) >= sinceDate)
      .map((pr: any) => {
        const created = new Date(pr.created_at);
        const merged = pr.merged_at ? new Date(pr.merged_at) : null;
        const mergeHours = merged
          ? (merged.getTime() - created.getTime()) / 3600000
          : null;

        return {
          number: pr.number,
          title: pr.title.substring(0, 100),
          author: pr.user?.login || "unknown",
          author_avatar: pr.user?.avatar_url || "",
          state: pr.merged_at ? "merged" : pr.state as "open" | "closed",
          created_at: pr.created_at,
          merged_at: pr.merged_at,
          closed_at: pr.closed_at,
          additions: pr.additions || 0,
          deletions: pr.deletions || 0,
          files_changed: pr.changed_files || 0,
          comments: pr.comments || 0,
          review_comments: pr.review_comments || 0,
          reviews: 0,
          time_to_merge_hours: mergeHours ? parseFloat(mergeHours.toFixed(1)) : null,
          time_to_first_review_hours: null,
          repo,
          labels: (pr.labels || []).map((l: any) => l.name),
        };
      });
  } catch (e) {
    console.warn(`  ⚠️ Could not fetch PRs for ${repo}:`, (e as Error).message);
    return [];
  }
}

// ─── Fetch Issues ───────────────────────────────────────
async function fetchIssues(
  octokit: Octokit,
  owner: string,
  repo: string,
  since: string
): Promise<IssueData[]> {
  try {
    const issues = await octokit.paginate(octokit.issues.listForRepo, {
      owner,
      repo,
      state: "all",
      since,
      per_page: 100,
    });

    return issues
      .filter((i: any) => !i.pull_request) // Exclude PRs
      .map((i: any) => {
        const created = new Date(i.created_at);
        const closed = i.closed_at ? new Date(i.closed_at) : null;
        const closeHours = closed
          ? (closed.getTime() - created.getTime()) / 3600000
          : null;

        return {
          number: i.number,
          title: i.title.substring(0, 100),
          author: i.user?.login || "unknown",
          state: i.state as "open" | "closed",
          created_at: i.created_at,
          closed_at: i.closed_at,
          labels: (i.labels || []).map((l: any) => (typeof l === "string" ? l : l.name)),
          comments: i.comments || 0,
          time_to_close_hours: closeHours ? parseFloat(closeHours.toFixed(1)) : null,
          repo,
        };
      });
  } catch (e) {
    console.warn(`  ⚠️ Could not fetch issues for ${repo}:`, (e as Error).message);
    return [];
  }
}

// ─── Fetch Releases ─────────────────────────────────────
async function fetchReleases(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<ReleaseData[]> {
  try {
    const { data: releases } = await octokit.repos.listReleases({
      owner,
      repo,
      per_page: 50,
    });

    return releases.map((r: any) => ({
      tag: r.tag_name,
      name: r.name || r.tag_name,
      published_at: r.published_at || r.created_at,
      author: r.author?.login || "unknown",
      repo,
      is_prerelease: r.prerelease,
    }));
  } catch (e) {
    console.warn(`  ⚠️ Could not fetch releases for ${repo}:`, (e as Error).message);
    return [];
  }
}

// ─── Fetch Languages ────────────────────────────────────
async function fetchLanguages(
  octokit: Octokit,
  owner: string,
  repo: string
): Promise<Record<string, number>> {
  try {
    const { data } = await octokit.repos.listLanguages({ owner, repo });
    return data;
  } catch {
    return {};
  }
}

// ─── Build Aggregated Metrics ───────────────────────────
function buildMetrics(
  config: Config,
  repos: any[],
  allCommits: CommitData[],
  allPRs: PullRequestData[],
  allIssues: IssueData[],
  allReleases: ReleaseData[],
  allLanguages: Record<string, number>
): MetricsData {
  const lookbackDays = config.metrics.lookback_days;

  // ─── Contributors ─────────────────────────────────
  const contributorMap = new Map<string, ContributorStats>();
  allCommits.forEach((c) => {
    const existing = contributorMap.get(c.author) || {
      username: c.author,
      avatar_url: c.author_avatar,
      total_commits: 0,
      total_prs: 0,
      total_reviews: 0,
      total_issues: 0,
      additions: 0,
      deletions: 0,
      active_days: 0,
      first_commit_date: c.date,
      last_commit_date: c.date,
    };
    existing.total_commits++;
    existing.additions += c.additions;
    existing.deletions += c.deletions;
    if (c.date < existing.first_commit_date) existing.first_commit_date = c.date;
    if (c.date > existing.last_commit_date) existing.last_commit_date = c.date;
    contributorMap.set(c.author, existing);
  });

  allPRs.forEach((pr) => {
    const existing = contributorMap.get(pr.author);
    if (existing) existing.total_prs++;
  });

  allIssues.forEach((issue) => {
    const existing = contributorMap.get(issue.author);
    if (existing) existing.total_issues++;
  });

  const contributors = Array.from(contributorMap.values())
    .sort((a, b) => b.total_commits - a.total_commits);

  // ─── Daily Activity ───────────────────────────────
  const dailyMap = new Map<string, DailyActivity>();
  const now = new Date();
  for (let i = lookbackDays; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    dailyMap.set(key, {
      date: key,
      commits: 0,
      prs_opened: 0,
      prs_merged: 0,
      issues_opened: 0,
      issues_closed: 0,
      reviews: 0,
      additions: 0,
      deletions: 0,
    });
  }

  allCommits.forEach((c) => {
    const key = c.date.split("T")[0];
    const day = dailyMap.get(key);
    if (day) {
      day.commits++;
      day.additions += c.additions;
      day.deletions += c.deletions;
    }
  });

  allPRs.forEach((pr) => {
    const openKey = pr.created_at.split("T")[0];
    const openDay = dailyMap.get(openKey);
    if (openDay) openDay.prs_opened++;

    if (pr.merged_at) {
      const mergeKey = pr.merged_at.split("T")[0];
      const mergeDay = dailyMap.get(mergeKey);
      if (mergeDay) mergeDay.prs_merged++;
    }
  });

  allIssues.forEach((issue) => {
    const openKey = issue.created_at.split("T")[0];
    const openDay = dailyMap.get(openKey);
    if (openDay) openDay.issues_opened++;

    if (issue.closed_at) {
      const closeKey = issue.closed_at.split("T")[0];
      const closeDay = dailyMap.get(closeKey);
      if (closeDay) closeDay.issues_closed++;
    }
  });

  const dailyActivity = Array.from(dailyMap.values());

  // ─── Weekly Activity ──────────────────────────────
  const weeklyActivity: WeeklyActivity[] = [];
  for (let i = 0; i < dailyActivity.length; i += 7) {
    const weekSlice = dailyActivity.slice(i, i + 7);
    if (weekSlice.length === 0) continue;
    weeklyActivity.push({
      week_start: weekSlice[0].date,
      commits: weekSlice.reduce((s, d) => s + d.commits, 0),
      prs_opened: weekSlice.reduce((s, d) => s + d.prs_opened, 0),
      prs_merged: weekSlice.reduce((s, d) => s + d.prs_merged, 0),
      issues_opened: weekSlice.reduce((s, d) => s + d.issues_opened, 0),
      issues_closed: weekSlice.reduce((s, d) => s + d.issues_closed, 0),
      additions: weekSlice.reduce((s, d) => s + d.additions, 0),
      deletions: weekSlice.reduce((s, d) => s + d.deletions, 0),
      active_contributors: new Set(
        allCommits
          .filter((c) => {
            const cd = c.date.split("T")[0];
            return cd >= weekSlice[0].date && cd <= weekSlice[weekSlice.length - 1].date;
          })
          .map((c) => c.author)
      ).size,
    });
  }

  // ─── Heatmap (365 days) ───────────────────────────
  const heatmap: HeatmapData[] = [];
  for (let i = 365; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().split("T")[0];
    const dayData = dailyMap.get(key);
    const count = dayData ? dayData.commits : 0;
    const level = count === 0 ? 0 : count <= 3 ? 1 : count <= 7 ? 2 : count <= 12 ? 3 : 4;
    heatmap.push({ date: key, count, level: level as 0 | 1 | 2 | 3 | 4 });
  }

  // ─── Language Breakdown ───────────────────────────
  const totalBytes = Object.values(allLanguages).reduce((s, v) => s + v, 0) || 1;
  const langColors: Record<string, string> = {
    TypeScript: "#3178C6", JavaScript: "#F7DF1E", Python: "#3572A5",
    Go: "#00ADD8", Rust: "#DEA584", Java: "#B07219", CSS: "#563D7C",
    HTML: "#E34C26", Shell: "#89E051", Ruby: "#701516", C: "#555555",
    "C++": "#F34B7D", "C#": "#178600", PHP: "#4F5D95", Swift: "#F05138",
    Kotlin: "#A97BFF", Dart: "#00B4AB", HCL: "#844FBA",
  };
  const languages: LanguageBreakdown[] = Object.entries(allLanguages)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([lang, bytes]) => ({
      language: lang,
      percentage: parseFloat(((bytes / totalBytes) * 100).toFixed(1)),
      color: langColors[lang] || "#6B7280",
      bytes,
    }));

  // ─── Repository Stats ─────────────────────────────
  const repoStats: RepositoryStats[] = repos.map((r: any) => {
    const repoCommits = allCommits.filter((c) => c.repo === r.name);
    const repoPRs = allPRs.filter((p) => p.repo === r.name);
    const mergedPRs = repoPRs.filter((p) => p.state === "merged" && p.time_to_merge_hours != null);
    const avgMerge = mergedPRs.length > 0
      ? mergedPRs.reduce((s, p) => s + (p.time_to_merge_hours || 0), 0) / mergedPRs.length
      : 0;

    return {
      name: r.name,
      full_name: r.full_name,
      description: r.description || "",
      language: r.language || "Unknown",
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      open_issues: r.open_issues_count || 0,
      total_commits: repoCommits.length,
      total_prs: repoPRs.length,
      avg_pr_merge_time_hours: parseFloat(avgMerge.toFixed(1)),
      contributors_count: new Set(repoCommits.map((c) => c.author)).size,
      last_commit_date: repoCommits[0]?.date || "",
      languages: {},
    };
  });

  // ─── DORA Metrics ─────────────────────────────────
  const deploysPerWeek = allReleases.length / (lookbackDays / 7);
  const mergedPRs = allPRs.filter((p) => p.time_to_merge_hours != null);
  const avgLeadTime = mergedPRs.length > 0
    ? mergedPRs.reduce((s, p) => s + (p.time_to_merge_hours || 0), 0) / mergedPRs.length
    : 0;

  function doraRating(metric: string, value: number): "elite" | "high" | "medium" | "low" {
    if (metric === "deploy_freq") return value >= 7 ? "elite" : value >= 1 ? "high" : value >= 0.25 ? "medium" : "low";
    if (metric === "lead_time") return value <= 24 ? "elite" : value <= 168 ? "high" : value <= 720 ? "medium" : "low";
    if (metric === "failure_rate") return value <= 5 ? "elite" : value <= 10 ? "high" : value <= 15 ? "medium" : "low";
    if (metric === "mttr") return value <= 1 ? "elite" : value <= 24 ? "high" : value <= 168 ? "medium" : "low";
    return "medium";
  }

  const dora: DORAMetrics = {
    deployment_frequency: {
      value: parseFloat(deploysPerWeek.toFixed(1)),
      unit: "per_week",
      rating: doraRating("deploy_freq", deploysPerWeek),
    },
    lead_time_for_changes: {
      value_hours: parseFloat(avgLeadTime.toFixed(1)),
      rating: doraRating("lead_time", avgLeadTime),
    },
    change_failure_rate: {
      value_percent: 5.0, // Would need deployment tracking for accurate data
      rating: doraRating("failure_rate", 5.0),
    },
    mean_time_to_recovery: {
      value_hours: 4.0, // Would need incident tracking
      rating: doraRating("mttr", 4.0),
    },
  };

  // ─── Summary ──────────────────────────────────────
  const totalPRsMerged = allPRs.filter((p) => p.state === "merged").length;
  const totalIssuesClosed = allIssues.filter((i) => i.state === "closed").length;
  const avgReviewTime = mergedPRs
    .filter((p) => p.time_to_first_review_hours != null)
    .reduce((s, p) => s + (p.time_to_first_review_hours || 0), 0) / (mergedPRs.length || 1);
  const avgIssueClose = allIssues
    .filter((i) => i.time_to_close_hours != null)
    .reduce((s, i) => s + (i.time_to_close_hours || 0), 0) / (totalIssuesClosed || 1);

  return {
    generated_at: new Date().toISOString(),
    config: {
      owner: config.owner,
      lookback_days: lookbackDays,
    },
    summary: {
      total_commits: allCommits.length,
      total_prs: allPRs.length,
      total_prs_merged: totalPRsMerged,
      total_issues: allIssues.length,
      total_issues_closed: totalIssuesClosed,
      total_reviews: 0, // Would need review API
      total_releases: allReleases.length,
      total_contributors: contributors.length,
      total_repositories: repos.length,
      avg_pr_merge_time_hours: parseFloat(avgLeadTime.toFixed(1)),
      avg_time_to_first_review_hours: parseFloat(avgReviewTime.toFixed(1)),
      avg_issue_close_time_hours: parseFloat(avgIssueClose.toFixed(1)),
      code_additions: allCommits.reduce((s, c) => s + c.additions, 0),
      code_deletions: allCommits.reduce((s, c) => s + c.deletions, 0),
    },
    contributors,
    commits: allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()),
    pull_requests: allPRs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()),
    issues: allIssues,
    releases: allReleases.sort((a, b) => new Date(b.published_at).getTime() - new Date(a.published_at).getTime()),
    daily_activity: dailyActivity,
    weekly_activity: weeklyActivity,
    repositories: repoStats,
    dora,
    heatmap,
    languages,
  };
}

// ─── Main ───────────────────────────────────────────────
async function main() {
  console.log("🚀 DevMetricsDash — Fetching GitHub Metrics\n");

  const config = loadConfig();
  const octokit = getOctokit();
  const since = new Date();
  since.setDate(since.getDate() - config.metrics.lookback_days);
  const sinceISO = since.toISOString();

  console.log(`📋 Owner: ${config.owner}`);
  console.log(`📅 Lookback: ${config.metrics.lookback_days} days (since ${sinceISO.split("T")[0]})\n`);

  // Fetch repos
  console.log("📦 Fetching repositories...");
  const repos = await fetchRepos(octokit, config);
  console.log(`   Found ${repos.length} repositories\n`);

  let allCommits: CommitData[] = [];
  let allPRs: PullRequestData[] = [];
  let allIssues: IssueData[] = [];
  let allReleases: ReleaseData[] = [];
  let allLanguages: Record<string, number> = {};

  for (const repo of repos) {
    const name = repo.name;
    console.log(`🔍 Processing ${name}...`);

    if (config.metrics.collect.commits) {
      const commits = await fetchCommits(octokit, config.owner, name, sinceISO);
      allCommits.push(...commits);
      console.log(`   ${commits.length} commits`);
    }

    if (config.metrics.collect.pull_requests) {
      const prs = await fetchPullRequests(octokit, config.owner, name, sinceISO);
      allPRs.push(...prs);
      console.log(`   ${prs.length} pull requests`);
    }

    if (config.metrics.collect.issues) {
      const issues = await fetchIssues(octokit, config.owner, name, sinceISO);
      allIssues.push(...issues);
      console.log(`   ${issues.length} issues`);
    }

    if (config.metrics.collect.releases) {
      const releases = await fetchReleases(octokit, config.owner, name);
      allReleases.push(...releases);
      console.log(`   ${releases.length} releases`);
    }

    const langs = await fetchLanguages(octokit, config.owner, name);
    Object.entries(langs).forEach(([lang, bytes]) => {
      allLanguages[lang] = (allLanguages[lang] || 0) + bytes;
    });
  }

  console.log("\n📊 Building metrics...");
  const metrics = buildMetrics(config, repos, allCommits, allPRs, allIssues, allReleases, allLanguages);

  const outDir = join(ROOT, "data");
  mkdirSync(outDir, { recursive: true });
  writeFileSync(join(outDir, "metrics.json"), JSON.stringify(metrics, null, 2));

  console.log("\n✅ Metrics saved → data/metrics.json");
  console.log(`   📊 ${allCommits.length} commits`);
  console.log(`   🔀 ${allPRs.length} pull requests`);
  console.log(`   🐛 ${allIssues.length} issues`);
  console.log(`   🚀 ${allReleases.length} releases`);
  console.log(`   👥 ${metrics.contributors.length} contributors`);
}

main().catch(console.error);

