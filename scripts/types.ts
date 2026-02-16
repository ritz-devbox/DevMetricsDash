// ============================================================
// DevMetricsDash — Core Types
// ============================================================

export interface Config {
  owner: string;
  repositories: string[];
  team: string[];
  metrics: {
    lookback_days: number;
    collect: {
      commits: boolean;
      pull_requests: boolean;
      issues: boolean;
      code_reviews: boolean;
      releases: boolean;
      code_frequency: boolean;
    };
  };
  dashboard: {
    title: string;
    theme: string;
    accent_color: string;
  };
  readme: {
    charts: string[];
    chart_width: number;
    chart_height: number;
  };
  schedule: string;
}

export interface ContributorStats {
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

export interface CommitData {
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

export interface PullRequestData {
  number: number;
  title: string;
  author: string;
  author_avatar: string;
  state: "open" | "closed" | "merged";
  created_at: string;
  merged_at: string | null;
  closed_at: string | null;
  additions: number;
  deletions: number;
  files_changed: number;
  comments: number;
  review_comments: number;
  reviews: number;
  time_to_merge_hours: number | null;
  time_to_first_review_hours: number | null;
  repo: string;
  labels: string[];
}

export interface IssueData {
  number: number;
  title: string;
  author: string;
  state: "open" | "closed";
  created_at: string;
  closed_at: string | null;
  labels: string[];
  comments: number;
  time_to_close_hours: number | null;
  repo: string;
}

export interface ReleaseData {
  tag: string;
  name: string;
  published_at: string;
  author: string;
  repo: string;
  is_prerelease: boolean;
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

export interface RepositoryStats {
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

export interface DORAMetrics {
  deployment_frequency: {
    value: number;
    unit: "per_day" | "per_week" | "per_month";
    rating: "elite" | "high" | "medium" | "low";
  };
  lead_time_for_changes: {
    value_hours: number;
    rating: "elite" | "high" | "medium" | "low";
  };
  change_failure_rate: {
    value_percent: number;
    rating: "elite" | "high" | "medium" | "low";
  };
  mean_time_to_recovery: {
    value_hours: number;
    rating: "elite" | "high" | "medium" | "low";
  };
}

export interface HeatmapData {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export interface LanguageBreakdown {
  language: string;
  percentage: number;
  color: string;
  bytes: number;
}

export interface MetricsData {
  generated_at: string;
  config: {
    owner: string;
    lookback_days: number;
  };
  summary: {
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
  };
  contributors: ContributorStats[];
  commits: CommitData[];
  pull_requests: PullRequestData[];
  issues: IssueData[];
  releases: ReleaseData[];
  daily_activity: DailyActivity[];
  weekly_activity: WeeklyActivity[];
  repositories: RepositoryStats[];
  dora: DORAMetrics;
  heatmap: HeatmapData[];
  languages: LanguageBreakdown[];
}

