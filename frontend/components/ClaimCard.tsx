"use client";
import { ClaimResult } from "../lib/types";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

interface ClaimCardProps {
  result: ClaimResult;
  index: number;
}

export default function ClaimCard({ result, index }: ClaimCardProps) {
  const [fillFinished, setFillFinished] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setFillFinished(true), 50);
    return () => clearTimeout(t);
  }, []);

  const badgeConfig: Record<string, { bg: string, text: string, border: string, fill: string }> = {
    "True": { bg: "bg-[rgba(16,185,129,0.12)]", text: "text-[#34d399]", border: "border-[rgba(16,185,129,0.25)]", fill: "#10b981" },
    "False": { bg: "bg-[rgba(244,63,94,0.12)]", text: "text-[#f87171]", border: "border-[rgba(244,63,94,0.25)]", fill: "#f43f5e" },
    "Partially True": { bg: "bg-[rgba(245,158,11,0.12)]", text: "text-[#fbbf24]", border: "border-[rgba(245,158,11,0.25)]", fill: "#f59e0b" },
    "Unverifiable": { bg: "bg-[var(--surface)]", text: "text-[var(--text-2)]", border: "border-[var(--glass-border)]", fill: "#8899aa" }
  };

  const style = badgeConfig[result.verdict] || badgeConfig["Unverifiable"];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.4 }}
      className="glass p-5 w-full flex flex-col gap-4"
    >
      <div className="flex justify-between items-center">
        <span className="font-mono text-[10px] text-[var(--text-3)] uppercase tracking-wider">
          Claim {index + 1}
        </span>
        <div className={`px-2.5 py-0.5 rounded-full border font-display font-bold text-[10px] tracking-[0.06em] uppercase ${style.bg} ${style.text} ${style.border}`}>
          {result.verdict}
        </div>
      </div>

      <p className="font-mono text-[12px] text-[var(--text-1)] leading-[1.65]">
        {result.claim}
      </p>

      {result.reasoning && (
        <p className="font-mono italic text-[11px] text-[var(--text-2)] leading-[1.6] mt-[-6px]">
          → {result.reasoning}
        </p>
      )}

      <div className="flex flex-col gap-1.5 mt-1">
        <div className="flex justify-between items-end">
          <span className="font-sans text-[11px] text-[var(--text-3)]">Confidence</span>
          <span className="font-mono font-medium text-[13px] text-[var(--text-1)]">{result.confidence}%</span>
        </div>
        <div className="h-[3px] w-full rounded-full overflow-hidden" style={{ backgroundColor: `${style.fill}1A` }}>
          <div 
            className="h-full rounded-full transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{ 
              width: fillFinished ? `${Math.max(2, result.confidence)}%` : "0%",
              backgroundColor: style.fill 
            }}
          />
        </div>
      </div>

      {result.sources && result.sources.length > 0 && (
        <div className="flex flex-col gap-2 mt-2">
          {result.sources.map((src, i) => (
            <a 
              key={i} 
              href={src} 
              target="_blank" 
              rel="noopener noreferrer"
              className="font-sans text-[11px] text-[var(--accent)] hover:underline truncate"
            >
              ↗ {src}
            </a>
          ))}
        </div>
      )}

      {result.search_query_used && (
        <details className="mt-1 group">
          <summary className="font-mono text-[10px] text-[var(--text-3)] cursor-pointer hover:text-[var(--text-2)] transition-colors list-none">
             <span className="mr-1 group-open:hidden">▶</span>
             <span className="mr-1 hidden group-open:inline">▼</span>
             Query used
          </summary>
          <p className="font-mono text-[10px] text-[var(--text-3)] mt-2 pl-3 border-l-[2px] border-[var(--grid-line)]">
            {result.search_query_used}
          </p>
        </details>
      )}
    </motion.div>
  );
}
