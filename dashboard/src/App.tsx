import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Sidebar from './components/layout/Sidebar';
import Overview from './pages/Overview';
import Repositories from './pages/Repositories';
import Team from './pages/Team';
import PullRequests from './pages/PullRequests';
import DoraMetrics from './pages/DoraMetrics';
import Issues from './pages/Issues';
import CodeVelocity from './pages/CodeVelocity';
import { loadMetrics } from './services/dataService';
import { useKeyboardNav } from './hooks/useKeyboardNav';
import type { MetricsData } from './types/metrics';
import { OverviewSkeleton } from './components/dashboard/Skeleton';

function LoadingScreen() {
  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <OverviewSkeleton />
    </div>
  );
}

function ErrorScreen({ error }: { error: string }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="text-center max-w-md p-8">
        <div className="text-4xl mb-4">⚠️</div>
        <h2 className="text-xl font-bold text-dark-50 mb-2">Failed to Load Data</h2>
        <p className="text-sm text-dark-300 mb-4">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 text-sm font-medium rounded-lg bg-accent-purple/20 text-accent-purple hover:bg-accent-purple/30 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}

export default function App() {
  const [data, setData] = useState<MetricsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  useKeyboardNav();

  useEffect(() => {
    loadMetrics()
      .then(setData)
      .catch(err => setError(err.message));
  }, []);

  if (error) return <ErrorScreen error={error} />;
  if (!data) return <LoadingScreen />;

  return (
    <div className="flex min-h-screen bg-dark-900">
      <Sidebar />
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<Overview data={data} />} />
          <Route path="/repositories" element={<Repositories data={data} />} />
          <Route path="/team" element={<Team data={data} />} />
          <Route path="/pull-requests" element={<PullRequests data={data} />} />
          <Route path="/issues" element={<Issues data={data} />} />
          <Route path="/code-velocity" element={<CodeVelocity data={data} />} />
          <Route path="/dora" element={<DoraMetrics data={data} />} />
        </Routes>
      </AnimatePresence>
    </div>
  );
}

