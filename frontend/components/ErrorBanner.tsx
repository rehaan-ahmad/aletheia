"use client";
import { motion } from "framer-motion";

interface ErrorBannerProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-4 border-[rgba(244,63,94,0.25)] border-l-[3px] border-l-[#f43f5e] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 w-full"
    >
      <p className="font-mono text-[13px] text-[#f87171] leading-relaxed">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 rounded-md bg-[rgba(245,158,11,0.15)] text-[var(--accent)] font-sans text-sm hover:bg-[rgba(245,158,11,0.25)] transition-colors whitespace-nowrap"
        >
          Retry
        </button>
      )}
    </motion.div>
  );
}
