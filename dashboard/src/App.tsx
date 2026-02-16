import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "./components/layout/Sidebar";
import Overview from "./pages/Overview";
import Repositories from "./pages/Repositories";
import Team from "./pages/Team";
import PullRequests from "./pages/PullRequests";
import DORA from "./pages/DORA";
import { loadMetrics } from "./services/dataService";
import type { MetricsData } from "./types/metrics";

function LoadingScreen() {
  return (
    <div className="flex items-center justify-center h-screen bg-dark-900">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="text-center"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 mx-auto mb-6 rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan flex items-center justify-center text-2xl"
        >
          ⚡
        </motion.div>
        <h2 className="text-xl font-bold glow-text mb-2">DevMetricsDash</h2>
        <p className="text-dark-400 text-sm">Loading metrics...</p>
        <div className="mt-4 w-48 h-1 bg-dark-700 rounded-full mx-auto overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-purple to-accent-cyan rounded-full"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}

function ErrorScreen({ error }: { error: string }) {
  return (
    <div className="flex items-center justify-center h-screen bg-dark-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center max-w-md"
      >
        <div className="w-16 h-16 mx-auto mb-6 rounded-xl bg-accent-red/10 flex items-center justify-center text-2xl">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-dark-50 mb-2">
          Could not load metrics
        </h2>
        <p className="text-dark-400 text-sm mb-4">{error}</p>
        <div className="glass-card p-4 text-left">
          <p className="text-xs text-dark-300 font-mono">
            Run these commands to generate sample data:
          </p>
          <pre className="text-xs text-accent-purple font-mono mt-2 bg-dark-900 p-3 rounded-lg">
            {`npm install\nnpx tsx scripts/generate-sample-data.ts\nnpx tsx scripts/generate-svg-charts.ts`}
          </pre>
        </div>
      </motion.div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMetrics()
      .then(setData)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <LoadingScreen />;
  if (error || !data) return <ErrorScreen error={error || "Unknown error"} />;

  return (
    <div className="flex min-h-screen bg-dark-900">
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-glow-purple opacity-20" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-glow-cyan opacity-10" />
      </div>

      <Sidebar />

      <main className="ml-64 flex-1 p-8 relative z-10">
        <AnimatePresence mode="wait">
          <Routes>
            <Route path="/" element={<Overview data={data} />} />
            <Route path="/repositories" element={<Repositories data={data} />} />
            <Route path="/team" element={<Team data={data} />} />
            <Route path="/pull-requests" element={<PullRequests data={data} />} />
            <Route path="/dora" element={<DORA data={data} />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  );
}

