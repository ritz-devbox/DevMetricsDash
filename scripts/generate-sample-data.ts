import * as fs from 'fs';
import * as path from 'path';

const OWNER = 'demo-user';
const LOOKBACK_DAYS = 90;
const REPO_NAMES = ['web-app', 'api-server', 'mobile-app', 'shared-utils', 'infra-config'];
const CONTRIBUTORS = [
  { username: 'alice-dev', avatar: 'https://i.pravatar.cc/150?u=alice' },
  { username: 'bob-eng', avatar: 'https://i.pravatar.cc/150?u=bob' },
  { username: 'carol-ops', avatar: 'https://i.pravatar.cc/150?u=carol' },
  { username: 'dave-fe', avatar: 'https://i.pravatar.cc/150?u=dave' },
  { username: 'eve-qa', avatar: 'https://i.pravatar.cc/150?u=eve' },
  { username: 'frank-ml', avatar: 'https://i.pravatar.cc/150?u=frank' },
];

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178C6', JavaScript: '#F7DF1E', Python: '#3572A5',
  Go: '#00ADD8', Rust: '#DEA584', CSS: '#563D7C', HTML: '#E34C26',
  Shell: '#89E051', Dockerfile: '#384D54', SCSS: '#C6538C',
};

const COMMIT_MESSAGES = [
  'fix: resolve race condition in auth middleware',
  'feat: add dark mode toggle to settings',
  'refactor: extract shared validation logic',
  'chore: update dependencies to latest',
  'fix: handle edge case in date parsing',
  'feat: implement real-time notifications',
  'perf: optimize database query for dashboard',
  'docs: update API documentation',
  'feat: add export to CSV functionality',
  'fix: correct timezone offset in reports',
  'feat: implement user role management',
  'refactor: migrate to new routing library',
  'fix: prevent duplicate form submissions',
  'feat: add search with fuzzy matching',
  'chore: configure CI pipeline caching',
  'feat: implement webhook retry mechanism',
  'fix: resolve memory leak in websocket handler',
  'perf: add Redis caching layer',
  'feat: add two-factor authentication',
  'fix: sanitize user input on profile update',
];

const PR_TITLES = [
  'Add user authentication flow',
  'Implement dashboard analytics',
  'Fix production database connection pooling',
  'Migrate to TypeScript strict mode',
  'Add end-to-end test suite',
  'Implement rate limiting middleware',
  'Redesign settings page UI',
  'Add GraphQL subscriptions',
  'Fix CORS configuration for subdomains',
  'Implement file upload with progress',
  'Add automated deployment pipeline',
  'Refactor state management to Zustand',
  'Implement SSR for landing pages',
  'Add comprehensive error boundaries',
  'Fix race condition in concurrent updates',
];

const ISSUE_TITLES = [
  'Login fails intermittently on mobile Safari',
  'Dashboard charts not rendering with large datasets',
  'Add support for SSO with SAML',
  'Memory usage spikes during report generation',
  'Implement audit logging for admin actions',
  'API rate limit headers missing from responses',
  'Add dark mode support across all pages',
  'File upload timeout for files > 50MB',
  'Implement data export in multiple formats',
  'Add webhook delivery status tracking',
];

const LABELS = ['bug', 'feature', 'enhancement', 'documentation', 'performance', 'security', 'ui', 'backend', 'infrastructure', 'testing'];

function rand(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomDate(daysAgo: number): string {
  const d = new Date(Date.now() - rand(0, daysAgo) * 86400000 - rand(0, 86400000));
  return d.toISOString();
}

function dateKey(d: string): string {
  return new Date(d).toISOString().slice(0, 10);
}

function weekStart(d: string): string {
  const dt = new Date(d);
  dt.setDate(dt.getDate() - dt.getDay());
  return dt.toISOString().slice(0, 10);
}

function main() {
  console.log('\n⚡ Generating sample data for DevMetricsDash\n');

  const since = new Date(Date.now() - LOOKBACK_DAYS * 86400000);

  // Generate commits
  const commits = Array.from({ length: 180 }, (_, i) => {
    const contributor = pick(CONTRIBUTORS);
    const date = randomDate(LOOKBACK_DAYS);
    const additions = rand(1, 400);
    const deletions = rand(0, Math.floor(additions * 0.6));
    return {
      sha: Math.random().toString(36).slice(2, 10),
      message: pick(COMMIT_MESSAGES),
      author: contributor.username,
      author_avatar: contributor.avatar,
      date,
      additions,
      deletions,
      files_changed: rand(1, 15),
      repo: pick(REPO_NAMES),
    };
  }).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Generate PRs
  const pull_requests = Array.from({ length: 45 }, (_, i) => {
    const contributor = pick(CONTRIBUTORS);
    const created = randomDate(LOOKBACK_DAYS);
    const isMerged = Math.random() > 0.2;
    const isClosed = isMerged || Math.random() > 0.6;
    const mergeHours = rand(1, 120);
    const merged_at = isMerged ? new Date(new Date(created).getTime() + mergeHours * 3600000).toISOString() : null;
    const closed_at = isClosed ? (merged_at || new Date(new Date(created).getTime() + rand(1, 200) * 3600000).toISOString()) : null;
    const additions = rand(5, 500);

    return {
      number: i + 1,
      title: pick(PR_TITLES),
      author: contributor.username,
      author_avatar: contributor.avatar,
      state: merged_at ? 'merged' : isClosed ? 'closed' : 'open',
      created_at: created,
      merged_at,
      closed_at,
      additions,
      deletions: rand(0, Math.floor(additions * 0.5)),
      files_changed: rand(1, 20),
      comments: rand(0, 8),
      review_comments: rand(0, 12),
      reviews: rand(0, 4),
      time_to_merge_hours: isMerged ? mergeHours : 0,
      time_to_first_review_hours: rand(1, 48),
      repo: pick(REPO_NAMES),
      labels: Array.from({ length: rand(0, 3) }, () => pick(LABELS)),
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Generate issues
  const issues = Array.from({ length: 30 }, (_, i) => {
    const created = randomDate(LOOKBACK_DAYS);
    const isClosed = Math.random() > 0.35;
    const closeHours = rand(2, 500);
    const closed_at = isClosed ? new Date(new Date(created).getTime() + closeHours * 3600000).toISOString() : null;

    return {
      number: i + 100,
      title: pick(ISSUE_TITLES),
      author: pick(CONTRIBUTORS).username,
      state: isClosed ? 'closed' : 'open',
      created_at: created,
      closed_at,
      labels: Array.from({ length: rand(1, 3) }, () => pick(LABELS)),
      comments: rand(0, 15),
      repo: pick(REPO_NAMES),
      time_to_close_hours: isClosed ? closeHours : undefined,
    };
  }).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Build daily activity
  const dailyMap: Record<string, any> = {};
  for (let d = new Date(since); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    dailyMap[key] = {
      date: key, commits: 0, prs_opened: 0, prs_merged: 0,
      issues_opened: 0, issues_closed: 0, reviews: 0, additions: 0, deletions: 0,
    };
  }
  for (const c of commits) {
    const k = dateKey(c.date);
    if (dailyMap[k]) { dailyMap[k].commits++; dailyMap[k].additions += c.additions; dailyMap[k].deletions += c.deletions; }
  }
  for (const pr of pull_requests) {
    const k = dateKey(pr.created_at);
    if (dailyMap[k]) dailyMap[k].prs_opened++;
    if (pr.merged_at) { const mk = dateKey(pr.merged_at); if (dailyMap[mk]) dailyMap[mk].prs_merged++; }
  }
  for (const issue of issues) {
    const k = dateKey(issue.created_at);
    if (dailyMap[k]) dailyMap[k].issues_opened++;
    if (issue.closed_at) { const ck = dateKey(issue.closed_at); if (dailyMap[ck]) dailyMap[ck].issues_closed++; }
  }
  const daily_activity = Object.values(dailyMap).sort((a: any, b: any) => a.date.localeCompare(b.date));

  // Build weekly activity
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
  for (const c of commits) {
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

  // Build heatmap (365 days)
  const maxCount = Math.max(...daily_activity.map((d: any) => d.commits), 1);
  const heatmap: any[] = [];
  const heatmapStart = new Date(Date.now() - 365 * 86400000);
  for (let d = new Date(heatmapStart); d <= new Date(); d.setDate(d.getDate() + 1)) {
    const key = d.toISOString().slice(0, 10);
    const count = dailyMap[key]?.commits || (Math.random() > 0.6 ? rand(0, 6) : 0);
    const level = count === 0 ? 0 : Math.min(4, Math.ceil((count / Math.max(maxCount, 6)) * 4));
    heatmap.push({ date: key, count, level });
  }

  // Build contributors
  const contribMap: Record<string, any> = {};
  for (const c of CONTRIBUTORS) {
    contribMap[c.username] = {
      username: c.username, avatar_url: c.avatar,
      total_commits: 0, total_prs: 0, total_reviews: 0, total_issues: 0,
      additions: 0, deletions: 0, active_days: new Set(),
      first_commit_date: '', last_commit_date: '',
    };
  }
  for (const c of commits) {
    const ct = contribMap[c.author];
    if (!ct) continue;
    ct.total_commits++;
    ct.additions += c.additions;
    ct.deletions += c.deletions;
    ct.active_days.add(dateKey(c.date));
    if (!ct.first_commit_date || c.date < ct.first_commit_date) ct.first_commit_date = c.date;
    if (!ct.last_commit_date || c.date > ct.last_commit_date) ct.last_commit_date = c.date;
  }
  for (const pr of pull_requests) {
    if (contribMap[pr.author]) contribMap[pr.author].total_prs++;
    if (contribMap[pr.author]) contribMap[pr.author].total_reviews += pr.reviews;
  }
  for (const issue of issues) {
    if (contribMap[issue.author]) contribMap[issue.author].total_issues++;
  }
  const contributors = Object.values(contribMap).map((c: any) => ({
    username: c.username,
    avatar_url: c.avatar_url,
    total_commits: c.total_commits,
    total_prs: c.total_prs,
    total_reviews: c.total_reviews,
    total_issues: c.total_issues,
    additions: c.additions,
    deletions: c.deletions,
    active_days: c.active_days.size,
    first_commit_date: c.first_commit_date,
    last_commit_date: c.last_commit_date,
  }));

  // Languages
  const languages = [
    { language: 'TypeScript', percentage: 42.3, color: '#3178C6', bytes: 845000 },
    { language: 'Python', percentage: 18.7, color: '#3572A5', bytes: 374000 },
    { language: 'Go', percentage: 14.2, color: '#00ADD8', bytes: 284000 },
    { language: 'JavaScript', percentage: 8.9, color: '#F7DF1E', bytes: 178000 },
    { language: 'CSS', percentage: 6.1, color: '#563D7C', bytes: 122000 },
    { language: 'HTML', percentage: 4.5, color: '#E34C26', bytes: 90000 },
    { language: 'Shell', percentage: 3.1, color: '#89E051', bytes: 62000 },
    { language: 'Dockerfile', percentage: 2.2, color: '#384D54', bytes: 44000 },
  ];

  // Repositories
  const repoLangs: Record<string, Record<string, number>> = {
    'web-app': { TypeScript: 65, CSS: 20, HTML: 15 },
    'api-server': { Go: 70, Python: 20, Shell: 10 },
    'mobile-app': { TypeScript: 80, JavaScript: 15, CSS: 5 },
    'shared-utils': { TypeScript: 60, JavaScript: 30, Shell: 10 },
    'infra-config': { Python: 50, Shell: 30, Dockerfile: 20 },
  };
  const repositories = REPO_NAMES.map(name => {
    const repoCommits = commits.filter(c => c.repo === name).length;
    const repoPRs = pull_requests.filter(p => p.repo === name);
    const mergedPRs = repoPRs.filter(p => p.state === 'merged');
    const avgMerge = mergedPRs.length
      ? Math.round(mergedPRs.reduce((s, p) => s + p.time_to_merge_hours, 0) / mergedPRs.length * 10) / 10
      : 0;

    return {
      name,
      full_name: `${OWNER}/${name}`,
      description: `A sample ${name.replace(/-/g, ' ')} repository`,
      language: Object.keys(repoLangs[name])[0],
      stars: rand(5, 120),
      forks: rand(0, 30),
      open_issues: rand(0, 8),
      total_commits: repoCommits,
      total_prs: repoPRs.length,
      avg_pr_merge_time_hours: avgMerge,
      contributors_count: rand(2, 6),
      last_commit_date: commits.find(c => c.repo === name)?.date || new Date().toISOString(),
      languages: repoLangs[name],
    };
  });

  // Summary
  const mergedPRs = pull_requests.filter(p => p.state === 'merged');
  const closedIssues = issues.filter(i => i.state === 'closed');
  const summary = {
    total_commits: commits.length,
    total_prs: pull_requests.length,
    total_prs_merged: mergedPRs.length,
    total_issues: issues.length,
    total_issues_closed: closedIssues.length,
    total_reviews: pull_requests.reduce((s, p) => s + p.reviews, 0),
    total_releases: rand(3, 12),
    total_contributors: contributors.length,
    total_repositories: repositories.length,
    avg_pr_merge_time_hours: mergedPRs.length
      ? Math.round(mergedPRs.reduce((s, p) => s + p.time_to_merge_hours, 0) / mergedPRs.length * 10) / 10
      : 0,
    avg_time_to_first_review_hours: Math.round(
      pull_requests.filter(p => p.time_to_first_review_hours > 0)
        .reduce((s, p) => s + p.time_to_first_review_hours, 0) /
        Math.max(pull_requests.filter(p => p.time_to_first_review_hours > 0).length, 1) * 10
    ) / 10,
    avg_issue_close_time_hours: closedIssues.length
      ? Math.round(closedIssues.filter(i => i.time_to_close_hours).reduce((s, i) => s + (i.time_to_close_hours || 0), 0) / closedIssues.length * 10) / 10
      : 0,
    code_additions: commits.reduce((s, c) => s + c.additions, 0),
    code_deletions: commits.reduce((s, c) => s + c.deletions, 0),
  };

  // DORA metrics
  const weeksTracked = Math.max(weekly_activity.length, 1);
  const deploymentsPerWeek = Math.round((summary.total_releases / weeksTracked) * 10) / 10 || Math.round((mergedPRs.length / weeksTracked) * 10) / 10;
  const dora = {
    deployment_frequency: { value: deploymentsPerWeek, unit: 'per_week', rating: deploymentsPerWeek >= 7 ? 'elite' : deploymentsPerWeek >= 1 ? 'high' : 'medium' },
    lead_time_for_changes: { value_hours: summary.avg_pr_merge_time_hours, rating: summary.avg_pr_merge_time_hours < 24 ? 'elite' : summary.avg_pr_merge_time_hours < 168 ? 'high' : 'medium' },
    change_failure_rate: { value_percent: rand(3, 12), rating: 'high' },
    mean_time_to_recovery: { value_hours: rand(2, 36), rating: 'high' },
  };

  const output = {
    generated_at: new Date().toISOString(),
    config: { owner: OWNER, lookback_days: LOOKBACK_DAYS },
    summary,
    contributors,
    commits: commits.slice(0, 50),
    pull_requests: pull_requests.slice(0, 200),
    issues: issues.slice(0, 200),
    daily_activity,
    weekly_activity,
    repositories,
    dora,
    heatmap,
    languages,
  };

  const dataDir = path.resolve(process.cwd(), 'data');
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });
  fs.writeFileSync(path.join(dataDir, 'metrics.json'), JSON.stringify(output, null, 2));

  const dashPublic = path.resolve(process.cwd(), 'dashboard', 'public', 'data');
  if (!fs.existsSync(dashPublic)) fs.mkdirSync(dashPublic, { recursive: true });
  fs.writeFileSync(path.join(dashPublic, 'metrics.json'), JSON.stringify(output, null, 2));

  console.log('✅ Sample data generated!');
  console.log(`   ${summary.total_commits} commits, ${summary.total_prs} PRs, ${summary.total_issues} issues`);
  console.log(`   ${contributors.length} contributors across ${repositories.length} repos`);
  console.log('\n  Written to data/metrics.json and dashboard/public/data/metrics.json\n');
}

main();
