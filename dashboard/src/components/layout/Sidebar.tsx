import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";

const navItems = [
  { path: "/", icon: "📊", label: "Overview" },
  { path: "/repositories", icon: "📦", label: "Repositories" },
  { path: "/team", icon: "👥", label: "Team" },
  { path: "/pull-requests", icon: "🔀", label: "Pull Requests" },
  { path: "/dora", icon: "🎯", label: "DORA Metrics" },
];

export default function Sidebar() {
  return (
    <motion.aside
      initial={{ x: -20, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="fixed left-0 top-0 h-screen w-64 border-r border-dark-600/50 bg-dark-900/95 backdrop-blur-xl z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-dark-600/50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-lg">
            ⚡
          </div>
          <div>
            <h1 className="font-bold text-base glow-text">DevMetricsDash</h1>
            <p className="text-[10px] text-dark-400 font-mono tracking-wider uppercase">
              Developer Analytics
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/"}
            className={({ isActive }) =>
              `nav-link ${isActive ? "active" : ""}`
            }
          >
            <span className="text-lg">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-dark-600/50">
        <div className="glass-card p-3 rounded-lg">
          <p className="text-[10px] text-dark-400 uppercase tracking-wider font-medium mb-1">
            Auto-Updated
          </p>
          <p className="text-xs text-dark-200 font-mono">Every day at 6AM UTC</p>
        </div>
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-2 mt-3 px-3 py-2 rounded-lg text-dark-400 hover:text-dark-200 transition-colors text-xs"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
          </svg>
          View on GitHub
        </a>
      </div>
    </motion.aside>
  );
}

