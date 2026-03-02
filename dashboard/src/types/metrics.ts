export interface MetricsData {
  generated_at: string;
  config: { owner: string; lookback_days: number };
  summary: Summary;
  contributors: Contributor[];
  commits: Commit[];
  pull_requests: PullRequest[];
  issues: Issue[];
  daily_activity: DailyActivity[];
  weekly_activity: WeeklyActivity[];
  repositories: Repository[];
  dora: DoraMetrics;
  heatmap: HeatmapDay[];
  languages: Language[];
}

export interface Summary {
  total_commits: number;
  total_prs: number;
  total_prs_merged: number;
  total_issues: number;
  total_issues_closed: number;
  total_reviews: number;
  total_releases: number;
  total_contributors: number;
  total_repositories: number;
  avg_pr_merge_time_hours: number;
  avg_time_to_first_review_hours: number;
  avg_issue_close_time_hours: number;
  code_additions: number;
  code_deletions: number;
}

export interface Contributor {
  username: string;
  avatar_url: string;
  total_commits: number;
  total_prs: number;
  total_reviews: number;
  total_issues: number;
  additions: number;
  deletions: number;
  active_days: number;
  first_commit_date: string;
  last_commit_date: string;
}

export interface Commit {
  sha: string;
  message: string;
  author: string;
  author_avatar: string;
  date: string;
  additions: number;
  deletions: number;
  files_changed: number;
  repo: string;
}

export interface PullRequest {
  number: number;
  title: string;
  author: string;
  author_avatar: string;
  state: string;
  created_at: string;
  merged_at: string | null;
  closed_at: string | null;
  additions: number;
  deletions: number;
  files_changed: number;
  comments: number;
  review_comments: number;
  reviews: number;
  time_to_merge_hours: number;
  time_to_first_review_hours: number;
  repo: string;
  labels: string[];
}

export interface Issue {
  number: number;
  title: string;
  author: string;
  state: string;
  created_at: string;
  closed_at: string | null;
  labels: string[];
  comments: number;
  repo: string;
  time_to_close_hours?: number;
}

export interface DailyActivity {
  date: string;
  commits: number;
  prs_opened: number;
  prs_merged: number;
  issues_opened: number;
  issues_closed: number;
  reviews: number;
  additions: number;
  deletions: number;
}

export interface WeeklyActivity {
  week_start: string;
  commits: number;
  prs_opened: number;
  prs_merged: number;
  issues_opened: number;
  issues_closed: number;
  additions: number;
  deletions: number;
  active_contributors: number;
}

export interface Repository {
  name: string;
  full_name: string;
  description: string;
  language: string;
  stars: number;
  forks: number;
  open_issues: number;
  total_commits: number;
  total_prs: number;
  avg_pr_merge_time_hours: number;
  contributors_count: number;
  last_commit_date: string;
  languages: Record<string, number>;
}

export interface DoraMetrics {
  deployment_frequency: { value: number; unit: string; rating: string };
  lead_time_for_changes: { value_hours: number; rating: string };
  change_failure_rate: { value_percent: number; rating: string };
  mean_time_to_recovery: { value_hours: number; rating: string };
}

export interface HeatmapDay {
  date: string;
  count: number;
  level: number;
}

export interface Language {
  language: string;
  percentage: number;
  color: string;
  bytes: number;
}

