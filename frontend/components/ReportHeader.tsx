"use client";
import { AITextResult } from "../lib/types";
import { motion } from "framer-motion";

interface ReportHeaderProps {
  summary: {
    overall_accuracy: number;
    true_count: number;
    false_count: number;
    partial_count: number;
    unverifiable_count: number;
  };
  aiTextResult?: AITextResult | null;
}

export default function ReportHeader({ summary, aiTextResult }: ReportHeaderProps) {
  const getAccuracyColor = (val: number) => {
    if (val >= 75) return "text-[#10b981]";
    if (val >= 50) return "text-[#f59e0b]";
    return "text-[#f43f5e]";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass p-6 w-full flex flex-col gap-6"
    >
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="flex flex-col">
          <span className={`font-display font-extrabold text-[52px] leading-none tracking-tight ${getAccuracyColor(summary.overall_accuracy)}`}>
            {Math.round(summary.overall_accuracy)}%
          </span>
          <span className="font-mono text-[11px] text-[var(--text-3)] tracking-widest mt-1">
            ACCURACY
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 w-full sm:w-auto">
          <div className="flex justify-between items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(16,185,129,0.12)] border border-[rgba(16,185,129,0.25)]">
            <span className="font-sans text-[12px] text-[#34d399] font-medium">True</span>
            <span className="font-display font-bold text-[#34d399] text-[14px]">{summary.true_count}</span>
          </div>
          <div className="flex justify-between items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(244,63,94,0.12)] border border-[rgba(244,63,94,0.25)]">
            <span className="font-sans text-[12px] text-[#f87171] font-medium">False</span>
            <span className="font-display font-bold text-[#f87171] text-[14px]">{summary.false_count}</span>
          </div>
          <div className="flex justify-between items-center gap-3 px-3 py-2 rounded-lg bg-[rgba(245,158,11,0.12)] border border-[rgba(245,158,11,0.25)]">
            <span className="font-sans text-[12px] text-[#fbbf24] font-medium">Partial</span>
            <span className="font-display font-bold text-[#fbbf24] text-[14px]">{summary.partial_count}</span>
          </div>
          <div className="flex justify-between items-center gap-3 px-3 py-2 rounded-lg bg-[var(--surface)] border border-[var(--glass-border)]">
            <span className="font-sans text-[12px] text-[var(--text-2)] font-medium">Unknown</span>
            <span className="font-display font-bold text-[var(--text-2)] text-[14px]">{summary.unverifiable_count}</span>
          </div>
        </div>
      </div>

      {aiTextResult && (
        <>
          <div className="h-[1px] w-full bg-[var(--grid-line)]" />
          <div className="flex justify-between items-center px-4 py-2.5 rounded-lg bg-[rgba(139,92,246,0.15)] border border-[rgba(139,92,246,0.25)]">
            <span className="font-display font-bold text-[#a78bfa] text-[13px] tracking-wide uppercase">
              AI SCORE: {aiTextResult.final_score}% · {aiTextResult.label}
            </span>
          </div>
        </>
      )}
    </motion.div>
  );
}
