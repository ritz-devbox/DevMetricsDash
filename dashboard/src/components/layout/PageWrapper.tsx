import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import ExportButton from '../dashboard/ExportButton';

interface Props {
  title: string;
  subtitle?: string;
  children: ReactNode;
}

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2 } },
};

const staggerContainer = {
  animate: {
    transition: { staggerChildren: 0.06 },
  },
};

export default function PageWrapper({ title, subtitle, children }: Props) {
  return (
    <motion.div
      variants={pageVariants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-screen lg:ml-64 p-4 pt-16 lg:p-8 lg:pt-8"
    >
      {/* Ambient background glows */}
      <div className="ambient-glow fixed top-[-200px] right-[-100px] w-[500px] h-[500px] bg-accent-purple/30" />
      <div className="ambient-glow fixed bottom-[-200px] left-[200px] w-[400px] h-[400px] bg-accent-cyan/20" style={{ animationDelay: '3s' }} />

      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-dark-50">{title}</h1>
          {subtitle && (
            <p className="mt-1.5 text-sm text-dark-300 leading-relaxed">{subtitle}</p>
          )}
        </div>
        <ExportButton />
      </div>

      {/* Content */}
      <motion.div variants={staggerContainer} initial="initial" animate="animate">
        {children}
      </motion.div>
    </motion.div>
  );
}

export const fadeInUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] } },
};

