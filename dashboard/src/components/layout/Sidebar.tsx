import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../../hooks/useTheme';

const navItems = [
  { to: '/', icon: '\u{1F4CA}', label: 'Overview' },
  { to: '/repositories', icon: '\u{1F4C1}', label: 'Repositories' },
  { to: '/team', icon: '\u{1F465}', label: 'Team' },
  { to: '/pull-requests', icon: '\u{1F500}', label: 'Pull Requests' },
  { to: '/issues', icon: '\u{1F41B}', label: 'Issues' },
  { to: '/code-velocity', icon: '\u{26A1}', label: 'Code Velocity' },
  { to: '/dora', icon: '\u{1F3AF}', label: 'DORA Metrics' },
];

export default function Sidebar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, toggle } = useTheme();

  const sidebarContent = (
    <>
      <div className="p-6 pb-4 flex items-center justify-between">
        <NavLink to="/" className="flex items-center gap-3 group" onClick={() => setMobileOpen(false)}>
          <motion.div
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: 'spring', stiffness: 300 }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-accent-purple to-accent-cyan shadow-lg shadow-accent-purple/20"
          >
            <span className="text-lg">{'\u26A1'}</span>
          </motion.div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-dark-50 group-hover:text-white transition-colors">
              DevMetrics
            </h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-dark-400 font-medium">
              Dashboard
            </p>
          </div>
        </NavLink>
        <button
          className="lg:hidden p-2 rounded-lg hover:bg-dark-700/50 transition-colors text-dark-300"
          onClick={() => setMobileOpen(false)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>

      <div className="mx-4 h-px bg-gradient-to-r from-transparent via-dark-600/50 to-transparent" />

      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/'}
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            onClick={() => setMobileOpen(false)}
          >
            <span className="text-base">{item.icon}</span>
            <span className="text-sm font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-dark-600/20 space-y-3">
        <button
          onClick={toggle}
          className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-dark-400 hover:bg-dark-700/40 hover:text-dark-200 transition-all text-xs"
        >
          <span className="text-sm">{theme === 'dark' ? '\u2600\uFE0F' : '\u{1F319}'}</span>
          <span>{theme === 'dark' ? 'Light Mode' : 'Dark Mode'}</span>
        </button>
        <div className="flex items-center gap-2 px-3">
          <div className="h-2 w-2 rounded-full bg-accent-green animate-pulse" />
          <span className="text-[11px] text-dark-400 font-medium">Auto-updating daily</span>
        </div>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 rounded-xl glass-card text-dark-200 hover:text-dark-50 transition-colors"
        onClick={() => setMobileOpen(true)}
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
      </button>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 h-screen w-64 border-r border-dark-600/30 bg-dark-900/95 backdrop-blur-xl z-50 flex-col">
        {sidebarContent}
      </aside>

      {/* Mobile overlay + sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="lg:hidden fixed left-0 top-0 h-screen w-64 border-r border-dark-600/30 bg-dark-900/98 backdrop-blur-xl z-50 flex flex-col"
            >
              {sidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
