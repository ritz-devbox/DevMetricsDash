import { motion } from "framer-motion";
import Header from "../components/layout/Header";
import type { MetricsData } from "../types/metrics";
import { formatHours } from "../services/dataService";

interface RepositoriesProps {
  data: MetricsData;
}

const langColors: Record<string, string> = {
  TypeScript: "#3178C6",
  JavaScript: "#F7DF1E",
  Python: "#3572A5",
  Go: "#00ADD8",
  Rust: "#DEA584",
  Java: "#B07219",
  CSS: "#563D7C",
  HCL: "#844FBA",
};

export default function Repositories({ data }: RepositoriesProps) {
  const repos = data.repositories;

  return (
    <div>
      <Header
        title="Repositories"
        subtitle={`${repos.length} repositories tracked`}
        generatedAt={data.generated_at}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {repos.map((repo, i) => (
          <motion.div
            key={repo.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="glass-card-hover p-6"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg">📦</span>
                  <h3 className="text-base font-semibold text-dark-50">
                    {repo.name}
                  </h3>
                </div>
                <p className="text-sm text-dark-400 mt-1 line-clamp-1">
                  {repo.description || "No description"}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{
                    backgroundColor:
                      langColors[repo.language] || "#6B7280",
                  }}
                />
                <span className="text-xs text-dark-300">{repo.language}</span>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-4 gap-3 mb-4">
              {[
                { label: "Commits", value: repo.total_commits, icon: "⚡" },
                { label: "PRs", value: repo.total_prs, icon: "🔀" },
                { label: "Stars", value: repo.stars, icon: "⭐" },
                {
                  label: "Avg Merge",
                  value: formatHours(repo.avg_pr_merge_time_hours),
                  icon: "⏱️",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="text-center py-2 rounded-lg bg-dark-700/30"
                >
                  <span className="text-xs">{stat.icon}</span>
                  <p className="text-sm font-bold text-dark-100 mt-0.5">
                    {stat.value}
                  </p>
                  <p className="text-[10px] text-dark-500">{stat.label}</p>
                </div>
              ))}
            </div>

            {/* Bottom bar */}
            <div className="flex items-center justify-between pt-3 border-t border-dark-600/30">
              <div className="flex items-center gap-3 text-xs text-dark-400">
                <span>👥 {repo.contributors_count} contributors</span>
                <span>🍴 {repo.forks} forks</span>
              </div>
              <span className="text-[11px] text-dark-500">
                🐛 {repo.open_issues} open issues
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

