import { Octokit } from '@octokit/rest';
import * as fs from 'fs';
import * as path from 'path';
import * as yaml from 'js-yaml';
import 'dotenv/config';

// ── Config ──────────────────────────────────────────────
interface Config {
  owner: string;
  repositories: string[];
  lookback_days: number;
}

const configPath = path.resolve(process.cwd(), 'config.yml');
const config = yaml.load(fs.readFileSync(configPath, 'utf8')) as Config;

const OWNER = config.owner;
const LOOKBACK_DAYS = config.lookback_days || 90;
const since = new Date(Date.now() - LOOKBACK_DAYS * 86400000).toISOString();

const token = process.env.GITHUB_TOKEN || process.env.GH_PAT;
if (!token) {
  console.error('Missing GITHUB_TOKEN or GH_PAT environment variable.');
  console.error('Create a token at https://github.com/settings/tokens with "repo" scope,');
  console.error('then run:  $env:GITHUB_TOKEN="ghp_your_token_here"');
  process.exit(1);
}

const octokit = new Octokit({ auth: token });
const log = (msg: string) => console.log(`  ${msg}`);

// ── Language colors ─────────────────────────────────────
const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3572A5',
  Go: '#00ADD8', Rust: '#DEA584', Java: '#B07219', 'C#': '#178600',
  'C++': '#F34B7D', C: '#555555', Ruby: '#701516', PHP: '#4F5D95',
  Swift: '#F05138', Kotlin: '#A97BFF', Dart: '#00B4AB', Shell: '#89E051',
  CSS: '#563D7C', HTML: '#E34C26', HCL: '#844FBA', Dockerfile: '#384D54',
  SCSS: '#C6538C', Vue: '#41B883', Svelte: '#FF3E00',
};

// ── Helpers ─────────────────────────────────────────────
function hoursBetween(a: string, b: string): number {
  return Math.abs(new Date(b).getTime() - new Date(a).getTime()) / 3600000;
}

function avg(arr: number[]): number {
  return arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : 0;
}

function dateKey(d: string): string {
  return new Date(d).toISOString().slice(0, 10);
}

function weekStart(d: string): string {
  const dt = new Date(d);
  dt.setDate(dt.getDate() - dt.getDay());
  return dt.toISOString().slice(0, 10);
}

function doraRating(metric: string, value: number): string {
  switch (metric) {
    case 'df':
      if (value >= 7) return 'elite';
      if (value >= 1) return 'high';
      if (value >= 0.25) return 'medium';
      return 'low';
    case 'lt':
      if (value < 1) return 'elite';
      if (value < 168) return 'high';
      if (value < 720) return 'medium';
      return 'low';
    case 'cfr':
      if (value <= 5) return 'elite';
      if (value <= 10) return 'high';
      if (value <= 15) return 'medium';
      return 'low';
    case 'mttr':
      if (value < 1) return 'elite';
      if (value < 24) return 'high';
      if (value < 168) return 'medium';
      return 'low';
    default: return 'medium';
  }
}

// ── Main ────────────────────────────────────────────────
async function main() {
  console.log('\n⚡ DevMetricsDash — Fetching real GitHub metrics\n');
  console.log(`  Owner:    ${OWNER}`);
  console.log(`  Lookback: ${LOOKBACK_DAYS} days (since ${since.slice(0, 10)})`);

  // 1. Discover repos
  let repoNames = config.repositories?.filter(Boolean) || [];
  if (repoNames.length === 0) {
    log('No repos specified — auto-discovering...');
    const { data: allRepos } = await octokit.repos.listForUser({
      username: OWNER, sort: 'pushed', per_page: 100, type: 'owner',
    });
    repoNames = allRepos
      .filter(r => !r.fork && !r.archived)
      .filter(r => new Date(r.pushed_at || 0) > new Date(since))
      .slice(0, 20)
      .map(r => r.name);
  }
  log(`Tracking ${repoNames.length} repos: ${repoNames.join(', ')}\n`);

  // Collect data across all repos
  const allCommits: any[] = [];
  const allPRs: any[] = [];
  const allIssues: any[] = [];
  const allReleases: any[] = [];
  const repoData: any[] = [];
  const langBytes: Record<string, number> = {};
  const contributorMap: Record<string, any> = {};

  for (const repoName of repoNames) {
    log(`📦 ${repoName}`);

    // Repo info
    let repoInfo: any;
    try {
      const { data } = await octokit.repos.get({ owner: OWNER, repo: repoName });
      repoInfo = data;
    } catch (e: any) {
      log(`  ⚠ Skipping (${e.status || e.message})`);
      continue;
    }

    // Languages
    let repoLangs: Record<string, number> = {};
    try {
      const { data: langs } = await octokit.repos.listLanguages({ owner: OWNER, repo: repoName });
      repoLangs = langs;
      for (const [lang, bytes] of Object.entries(langs)) {
        langBytes[lang] = (langBytes[lang] || 0) + bytes;
      }
    } catch { /* empty */ }

    // Commits (paginated, up to 300)
    const commits: any[] = [];
    try {
      for (let page = 1; page <= 3; page++) {
        const { data } = await octokit.repos.listCommits({
          owner: OWNER, repo: repoName, since, per_page: 100, page,
        });
        if (data.length === 0) break;
        commits.push(...data);
      }
    } catch { /* empty */ }
    log(`  ${commits.length} commits`);

    for (const c of commits) {
      const author = c.author?.login || c.commit?.author?.name || 'unknown';
      const avatar = c.author?.avatar_url || '';
      const date = c.commit?.author?.date || '';

      // Fetch commit detail for stats (rate-limit friendly: only recent 50)
      let additions = 0, deletions = 0, filesChanged = 0;
      if (allCommits.length < 50) {
        try {
          const { data: detail } = await octokit.repos.getCommit({
            owner: OWNER, repo: repoName, ref: c.sha,
          });
          additions = detail.stats?.additions || 0;
          deletions = detail.stats?.deletions || 0;
          filesChanged = detail.files?.length || 0;
        } catch { /* empty */ }
      }

      allCommits.push({
        sha: c.sha?.slice(0, 8),
        message: c.commit?.message?.split('\n')[0] || '',
        author, author_avatar: avatar, date,
        additions, deletions, files_changed: filesChanged,
        repo: repoName,
      });

      // Track contributors
      if (!contributorMap[author]) {
        contributorMap[author] = {
          username: author, avatar_url: avatar,
          total_commits: 0, total_prs: 0, total_reviews: 0, total_issues: 0,
          additions: 0, deletions: 0, active_days_set: new Set(),
          first_commit_date: date, last_commit_date: date,
        };
      }
      const ct = contributorMap[author];
      ct.total_commits++;
      ct.additions += additions;
      ct.deletions += deletions;
      if (date) {
        ct.active_days_set.add(dateKey(date));
        if (date < ct.first_commit_date) ct.first_commit_date = date;
        if (date > ct.last_commit_date) ct.last_commit_date = date;
      }
    }

    // Pull requests (up to 200)
    const prs: any[] = [];
    try {
      for (let page = 1; page <= 2; page++) {
        const { data } = await octokit.pulls.list({
          owner: OWNER, repo: repoName, state: 'all', sort: 'created',
          direction: 'desc', per_page: 100, page,
        });
        const filtered = data.filter(pr => new Date(pr.created_at) > new Date(since));
        prs.push(...filtered);
        if (data.length < 100 || filtered.length < data.length) break;
      }
    } catch { /* empty */ }
    log(`  ${prs.length} PRs`);

    for (const pr of prs) {
      const author = pr.user?.login || 'unknown';
      const mergeTime = pr.merged_at ? hoursBetween(pr.created_at, pr.merged_at) : 0;

      // Get review info
      let reviews = 0, reviewComments = 0, firstReviewHours = 0;
      try {
        const { data: revs } = await octokit.pulls.listReviews({
          owner: OWNER, repo: repoName, pull_number: pr.number, per_page: 10,
        });
        reviews = revs.length;
        if (revs.length > 0) {
          firstReviewHours = hoursBetween(pr.created_at, revs[0].submitted_at || pr.created_at);
        }
        if (contributorMap[author]) contributorMap[author].total_reviews += reviews;
        for (const rev of revs) {
          const reviewer = rev.user?.login;
          if (reviewer && contributorMap[reviewer]) {
            contributorMap[reviewer].total_reviews++;
          }
        }
      } catch { /* empty */ }

      allPRs.push({
        number: pr.number,
        title: pr.title,
        author,
        author_avatar: pr.user?.avatar_url || '',
        state: pr.merged_at ? 'merged' : pr.state,
        created_at: pr.created_at,
        merged_at: pr.merged_at,
        closed_at: pr.closed_at,
        additions: pr.additions || 0,
        deletions: pr.deletions || 0,
        files_changed: pr.changed_files || 0,
        comments: pr.comments || 0,
        review_comments: reviewComments,
        reviews,
        time_to_merge_hours: Math.round(mergeTime * 10) / 10,
        time_to_first_review_hours: Math.round(firstReviewHours * 10) / 10,
        repo: repoName,
        labels: pr.labels?.map((l: any) => l.name) || [],
      });

      if (contributorMap[author]) contributorMap[author].total_prs++;
    }

    // Issues (up to 200)
    const issues: any[] = [];
    try {
      for (let page = 1; page <= 2; page++) {
        const { data } = await octokit.issues.listForRepo({
          owner: OWNER, repo: repoName, state: 'all', since,
          per_page: 100, page,
        });
        const realIssues = data.filter(i => !i.pull_request);
        issues.push(...realIssues.filter(i => new Date(i.created_at) > new Date(since)));
        if (data.length < 100) break;
      }
    } catch { /* empty */ }
    log(`  ${issues.length} issues`);

    for (const issue of issues) {
      const closeTime = issue.closed_at ? hoursBetween(issue.created_at, issue.closed_at) : undefined;
      allIssues.push({
        number: issue.number,
        title: issue.title,
        author: issue.user?.login || 'unknown',
        state: issue.state,
        created_at: issue.created_at,
        closed_at: issue.closed_at,
        labels: issue.labels?.map((l: any) => typeof l === 'string' ? l : l.name) || [],
        comments: issue.comments || 0,
        repo: repoName,
        time_to_close_hours: closeTime ? Math.round(closeTime * 10) / 10 : undefined,
      });
      const ia = issue.user?.login;
      if (ia && contributorMap[ia]) contributorMap[ia].total_issues++;
    }

    // Releases
    try {
      const { data: releases } = await octokit.repos.listReleases({
        owner: OWNER, repo: repoName, per_page: 50,
      });
      allReleases.push(...releases.filter(r => new Date(r.created_at) > new Date(since)));
    } catch { /* empty */ }

    // Build repo summary
    const repoPRsMerged = allPRs.filter(p => p.repo === repoName && p.state === 'merged');
    const langTotal = Object.values(repoLangs).reduce((s, v) => s + v, 0) || 1;
    const langPcts: Record<string, number> = {};
    for (const [lang, bytes] of Object.entries(repoLangs)) {
      langPcts[lang] = Math.round((bytes / langTotal) * 100);
    }

    repoData.push({
      name: repoName,
      full_name: repoInfo.full_name,
      description: repoInfo.description || '',
      language: repoInfo.language || 'Unknown',
      stars: repoInfo.stargazers_count || 0,
      forks: repoInfo.forks_count || 0,
      open_issues: repoInfo.open_issues_count || 0,
      total_commits: commits.length,
      total_prs: prs.length,
      avg_pr_merge_time_hours: Math.round(avg(repoPRsMerged.map(p => p.time_to_merge_hours)) * 10) / 10,
      contributors_count: new Set(commits.map(c => c.author?.login)).size,
      last_commit_date: commits[0]?.commit?.author?.date || repoInfo.pushed_at,
      languages: langPcts,
    });
  }

  // ── Build aggregate data ───────────────────────────────

  // Sort commits by date desc
  allCommits.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  allPRs.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Contributors
  const contributors = Object.values(contributorMap).map((c: any) => ({
    username: c.username,
    avatar_url: c.avatar_url,
    total_commits: c.total_commits,
    total_prs: c.total_prs,
    total_reviews: c.total_reviews,
    total_issues: c.total_issues,
    additions: c.additions,
    deletions: c.deletions,
    active_days: c.active_days_set.size,
    first_commit_date: c.first_commit_date,
    last_commit_date: c.last_commit_date,
  }));

  // Daily activity
  const dailyMap: Record<string, any> = {};
  const startDate = new Date(since);
  const endDate = new Date();
  for (let d = new Date(startDate); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = {
      date: key, commits: 0, prs_opened: 0, prs_merged: 0,
      issues_opened: 0, issues_closed: 0, reviews: 0, additions: 0, deletions: 0,
    };
  }
  for (const c of allCommits) {
    const k = dateKey(c.date);
    if (dailyMap[k]) { dailyMap[k].commits++; dailyMap[k].additions += c.additions; dailyMap[k].deletions += c.deletions; }
  }
  for (const pr of allPRs) {
    const k = dateKey(pr.created_at);
    if (dailyMap[k]) dailyMap[k].prs_opened++;
    if (pr.merged_at) { const mk = dateKey(pr.merged_at); if (dailyMap[mk]) dailyMap[mk].prs_merged++; }
  }
  for (const issue of allIssues) {
    const k = dateKey(issue.created_at);
    if (dailyMap[k]) dailyMap[k].issues_opened++;
    if (issue.closed_at) { const ck = dateKey(issue.closed_at); if (dailyMap[ck]) dailyMap[ck].issues_closed++; }
  }
  const daily_activity = Object.values(dailyMap).sort((a, b) => a.date.localeCompare(b.date));

  // Weekly activity
  const weeklyMap: Record<string, any> = {};
  for (const day of daily_activity) {
    const ws = weekStart(day.date);
    if (!weeklyMap[ws]) {
      weeklyMap[ws] = {
        week_start: ws, commits: 0, prs_opened: 0, prs_merged: 0,
        issues_opened: 0, issues_closed: 0, additions: 0, deletions: 0,
        contributors_set: new Set(),
      };
    }
    const w = weeklyMap[ws];
    w.commits += day.commits; w.prs_opened += day.prs_opened; w.prs_merged += day.prs_merged;
    w.issues_opened += day.issues_opened; w.issues_closed += day.issues_closed;
    w.additions += day.additions; w.deletions += day.deletions;
  }
  for (const c of allCommits) {
    const ws = weekStart(c.date);
    if (weeklyMap[ws]) weeklyMap[ws].contributors_set.add(c.author);
  }
  const weekly_activity = Object.values(weeklyMap)
    .sort((a: any, b: any) => a.week_start.localeCompare(b.week_start))
    .map((w: any) => ({
      week_start: w.week_start, commits: w.commits, prs_opened: w.prs_opened,
      prs_merged: w.prs_merged, issues_opened: w.issues_opened, issues_closed: w.issues_closed,
      additions: w.additions, deletions: w.deletions,
      active_contributors: w.contributors_set.size,
    }));

  // Heatmap (365 days)
  const heatmapStart = new Date(Date.now() - 365 * 86400000);
  const maxCount = Math.max(...daily_activity.map(d => d.commits), 1);
  const heatmap: any[] = [];
  for (let d = new Date(heatmapStart); d <= endDate; d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const count = dailyMap[key]?.commits || 0;
    const level = count === 0 ? 0 : Math.min(4, Math.ceil((count / maxCount) * 4));
    heatmap.push({ date: key, count, level });
  }

  // Languages
  const totalBytes = Object.values(langBytes).reduce((s, v) => s + v, 0) || 1;
  const languages = Object.entries(langBytes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([lang, bytes]) => ({
      language: lang,
      percentage: Math.round((bytes / totalBytes) * 1000) / 10,
      color: LANG_COLORS[lang] || '#6B7280',
      bytes,
    }));

  // Summary
  const mergedPRs = allPRs.filter(p => p.state === 'merged');
  const closedIssues = allIssues.filter(i => i.state === 'closed');
  const summary = {
    total_commits: allCommits.length,
    total_prs: allPRs.length,
    total_prs_merged: mergedPRs.length,
    total_issues: allIssues.length,
    total_issues_closed: closedIssues.length,
    total_reviews: allPRs.reduce((s, p) => s + p.reviews, 0),
    total_releases: allReleases.length,
    total_contributors: contributors.length,
    total_repositories: repoData.length,
    avg_pr_merge_time_hours: Math.round(avg(mergedPRs.map(p => p.time_to_merge_hours)) * 10) / 10,
    avg_time_to_first_review_hours: Math.round(avg(allPRs.filter(p => p.time_to_first_review_hours > 0).map(p => p.time_to_first_review_hours)) * 10) / 10,
    avg_issue_close_time_hours: Math.round(avg(closedIssues.filter(i => i.time_to_close_hours).map(i => i.time_to_close_hours!)) * 10) / 10,
    code_additions: allCommits.reduce((s, c) => s + c.additions, 0),
    code_deletions: allCommits.reduce((s, c) => s + c.deletions, 0),
  };

  // DORA metrics (estimated from available data)
  const weeksTracked = Math.max(weekly_activity.length, 1);
  const deploymentsPerWeek = Math.round((allReleases.length / weeksTracked) * 10) / 10 || Math.round((mergedPRs.length / weeksTracked) * 10) / 10;
  const leadTimeHours = summary.avg_pr_merge_time_hours || 0;
  const failedDeployments = allIssues.filter(i => i.labels.some((l: string) => /bug|incident|hotfix/i.test(l))).length;
  const cfr = mergedPRs.length ? Math.round((failedDeployments / mergedPRs.length) * 1000) / 10 : 0;
  const bugFixTimes = closedIssues
    .filter(i => i.labels.some((l: string) => /bug|incident/i.test(l)) && i.time_to_close_hours)
    .map(i => i.time_to_close_hours!);
  const mttr = Math.round(avg(bugFixTimes) * 10) / 10 || leadTimeHours * 2;

  const dora = {
    deployment_frequency: { value: deploymentsPerWeek, unit: 'per_week', rating: doraRating('df', deploymentsPerWeek) },
    lead_time_for_changes: { value_hours: leadTimeHours, rating: doraRating('lt', leadTimeHours) },
    change_failure_rate: { value_percent: cfr, rating: doraRating('cfr', cfr) },
    mean_time_to_recovery: { value_hours: mttr, rating: doraRating('mttr', mttr) },
  };

  // ── Write output ───────────────────────────────────────
  const output = {
    generated_at: new Date().toISOString(),
    config: { owner: OWNER, lookback_days: LOOKBACK_DAYS },
    summary,
    contributors,
    commits: allCommits.slice(0, 50),
    pull_requests: allPRs.slice(0, 200),
    issues: allIssues.slice(0, 200),
    daily_activity,
    weekly_activity,
    repositories: repoData,
    dora,
    heatmap,
    languages,
  };

  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'metrics.json'), JSON.stringify(output, null, 2));

  // Also copy to dashboard public folder
  const dashPublic = path.resolve(process.cwd(), 'dashboard', 'public', 'data');
  if (!fs.existsSync(dashPublic)) fs.mkdirSync(dashPublic, { recursive: true });
  fs.writeFileSync(path.join(dashPublic, 'metrics.json'), JSON.stringify(output, null, 2));

  console.log('\n✅ Done! Wrote data/metrics.json');
  console.log(`   ${summary.total_commits} commits, ${summary.total_prs} PRs, ${summary.total_issues} issues`);
  console.log(`   ${contributors.length} contributors across ${repoData.length} repos\n`);
}

main().catch(err => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
