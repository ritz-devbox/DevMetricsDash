import { motion } from "framer-motion";
import type { CommitData, PullRequestData } from "../../types/metrics";
import { timeAgo } from "../../services/dataService";

interface RecentActivityProps {
  commits: CommitData[];
  pullRequests: PullRequestData[];
}

export default function RecentActivity({ commits, pullRequests }: RecentActivityProps) {
  // Merge and sort by date
  type ActivityItem = {
    type: "commit" | "pr";
    date: string;
    title: string;
    author: string;
    repo: string;
    meta: string;
    icon: string;
    color: string;
  };

  const items: ActivityItem[] = [
    ...commits.slice(0, 10).map((c) => ({
      type: "commit" as const,
      date: c.date,
      title: c.message,
      author: c.author,
      repo: c.repo,
      meta: `${c.sha}`,
      icon: "⚡",
      color: "#8B5CF6",
    })),
    ...pullRequests.slice(0, 10).map((pr) => ({
      type: "pr" as const,
      date: pr.created_at,
      title: pr.title,
      author: pr.author,
      repo: pr.repo,
      meta:
        pr.state === "merged"
          ? "Merged"
          : pr.state === "open"
          ? "Open"
          : "Closed",
      icon: pr.state === "merged" ? "🟣" : pr.state === "open" ? "🟢" : "🔴",
      color:
        pr.state === "merged"
          ? "#8B5CF6"
          : pr.state === "open"
          ? "#10B981"
          : "#EF4444",
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 12);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="glass-card p-6"
    >
      <h3 className="text-base font-semibold text-dark-50 mb-4">
        Recent Activity
      </h3>

      <div className="space-y-1">
        {items.map((item, i) => (
          <motion.div
            key={`${item.type}-${item.date}-${i}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.6 + i * 0.03 }}
            className="flex items-start gap-3 py-2.5 px-3 rounded-lg hover:bg-dark-700/30 transition-colors group"
          >
            <span className="text-sm mt-0.5 flex-shrink-0">{item.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-dark-100 truncate group-hover:text-dark-50 transition-colors">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[11px] text-dark-400 font-medium">
                  @{item.author}
                </span>
                <span className="text-dark-600">·</span>
                <span className="text-[11px] text-dark-500 font-mono">
                  {item.repo}
                </span>
                {item.type === "commit" && (
                  <>
                    <span className="text-dark-600">·</span>
                    <span className="text-[11px] text-dark-500 font-mono">
                      {item.meta}
                    </span>
                  </>
                )}
                {item.type === "pr" && (
                  <>
                    <span className="text-dark-600">·</span>
                    <span
                      className="text-[11px] font-medium"
                      style={{ color: item.color }}
                    >
                      {item.meta}
                    </span>
                  </>
                )}
              </div>
            </div>
            <span className="text-[11px] text-dark-500 flex-shrink-0 mt-0.5">
              {timeAgo(item.date)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

