import { motion } from "framer-motion";

interface HeaderProps {
  title: string;
  subtitle?: string;
  generatedAt?: string;
}

export default function Header({ title, subtitle, generatedAt }: HeaderProps) {
  return (
    <motion.header
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.3 }}
      className="flex items-center justify-between mb-8"
    >
      <div>
        <h2 className="text-2xl font-bold text-dark-50">{title}</h2>
        {subtitle && (
          <p className="text-sm text-dark-300 mt-1">{subtitle}</p>
        )}
      </div>
      {generatedAt && (
        <div className="text-right">
          <p className="text-[10px] text-dark-500 uppercase tracking-wider font-medium">
            Last Updated
          </p>
          <p className="text-xs text-dark-300 font-mono mt-0.5">
            {new Date(generatedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </div>
      )}
    </motion.header>
  );
}

