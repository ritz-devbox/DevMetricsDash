import Header from "../components/layout/Header";
import StatCard from "../components/dashboard/StatCard";
import ActivityChart from "../components/charts/ActivityChart";
import HeatmapChart from "../components/charts/HeatmapChart";
import LanguageChart from "../components/charts/LanguageChart";
import WeeklyChart from "../components/charts/WeeklyChart";
import RecentActivity from "../components/dashboard/RecentActivity";
import type { MetricsData } from "../types/metrics";

interface OverviewProps {
  data: MetricsData;
}

export default function Overview({ data }: OverviewProps) {
  const s = data.summary;

  return (
    <div>
      <Header
        title="Dashboard Overview"
        subtitle={`Tracking ${s.total_repositories} repositories · ${s.total_contributors} contributors · ${data.config.lookback_days}-day window`}
        generatedAt={data.generated_at}
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        <StatCard icon="⚡" label="Total Commits" value={s.total_commits} color="purple" delay={0} />
        <StatCard icon="🔀" label="PRs Merged" value={s.total_prs_merged} color="cyan" delay={100} />
        <StatCard icon="👀" label="Code Reviews" value={s.total_reviews} color="green" delay={200} />
        <StatCard icon="🐛" label="Issues Closed" value={s.total_issues_closed} color="yellow" delay={300} />
        <StatCard icon="🚀" label="Releases" value={s.total_releases} color="pink" delay={400} />
        <StatCard
          icon="⏱️"
          label="Avg Merge Time"
          value={s.avg_pr_merge_time_hours}
          suffix="h"
          color="orange"
          delay={500}
          animate={false}
        />
      </div>

      {/* Activity Chart */}
      <div className="mb-8">
        <ActivityChart data={data.daily_activity} />
      </div>

      {/* Heatmap */}
      <div className="mb-8">
        <HeatmapChart data={data.heatmap} />
      </div>

      {/* Weekly + Languages */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <WeeklyChart data={data.weekly_activity} />
        <LanguageChart data={data.languages} />
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <RecentActivity commits={data.commits} pullRequests={data.pull_requests} />
      </div>
    </div>
  );
}

