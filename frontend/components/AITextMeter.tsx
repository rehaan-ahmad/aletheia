"use client";
import { AITextResult } from "../lib/types";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";
import { motion } from "framer-motion";

interface AITextMeterProps {
  result: AITextResult;
}

export default function AITextMeter({ result }: AITextMeterProps) {
  const getPathColor = (score: number) => {
    if (score < 35) return "#10b981";
    if (score < 55) return "#f59e0b";
    if (score < 80) return "#f97316";
    return "#8b5cf6";
  };

  const pathColor = getPathColor(result.final_score);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass p-6 w-full flex flex-col items-center gap-4"
    >
      <div className="w-[120px] h-[120px]">
        <CircularProgressbar
          value={result.final_score}
          text={`${result.final_score}%`}
          strokeWidth={8}
          styles={buildStyles({
            pathColor,
            trailColor: "var(--surface)",
            textColor: "var(--text-1)",
            textSize: "24px",
            pathTransitionDuration: 1.5,
          })}
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <span className="font-mono font-medium text-[13px] text-[var(--text-2)] uppercase tracking-wider">
          {result.label}
        </span>

        {result.gemini?.signals && result.gemini.signals.length > 0 && (
          <div className="flex flex-wrap justify-center gap-2 max-w-[280px]">
            {result.gemini.signals.map((sig, i) => (
              <span key={i} className="px-2.5 py-1 bg-[var(--surface)] text-[var(--text-2)] font-mono text-[10px] rounded-full border border-[var(--glass-border)]">
                {sig}
              </span>
            ))}
          </div>
        )}

        <div className="flex flex-col items-center mt-2">
          {result.gptzero?.score !== undefined && result.gptzero.score !== -1 && (
            <span className="font-mono text-[10px] text-[var(--text-3)]">
              GPTZero: {result.gptzero.score}%
            </span>
          )}
          {result.gemini?.score !== undefined && result.gemini.score !== -1 && (
            <span className="font-mono text-[10px] text-[var(--text-3)]">
              Gemini Style: {result.gemini.score}%
            </span>
          )}
        </div>
      </div>
    </motion.div>
  );
}
