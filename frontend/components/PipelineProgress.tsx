"use client";
import { PipelineStage } from "../lib/types";
import { motion, AnimatePresence } from "framer-motion";

interface PipelineProgressProps {
  currentStage: PipelineStage;
  statusMessage: string;
  completedStages: string[];
}

const STAGES = [
  { id: "extracting", label: "Extracting Claims" },
  { id: "searching", label: "Searching Evidence" },
  { id: "verifying", label: "Verifying Claims" },
  { id: "ai_detection", label: "AI Detection" },
  { id: "media", label: "Media Scan" },
];

export default function PipelineProgress({ currentStage, statusMessage, completedStages }: PipelineProgressProps) {
  // If idle/complete/error, we show full or empty list based on completedStages length
  const isPendingView = currentStage === 'idle';

  return (
    <div className="glass p-5 w-full flex flex-col">
      <AnimatePresence>
        {STAGES.map((stage, i) => {
          const isCompleted = completedStages.includes(stage.id);
          const isActive = currentStage === stage.id;
          
          return (
            <motion.div
              key={stage.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className={`flex items-center justify-between py-3 ${
                i !== STAGES.length - 1 ? "border-b border-[var(--grid-line)]" : ""
              }`}
            >
              <div className="flex items-center gap-3">
                <div 
                  className={`w-2.5 h-2.5 rounded-full ${
                    isCompleted 
                      ? "bg-[#10b981] shadow-[0_0_6px_#10b981]" 
                      : isActive 
                        ? "bg-[#f59e0b] animate-fade-pulse" 
                        : "bg-[var(--text-3)]"
                  }`} 
                />
                <span className={`font-sans font-medium text-[14px] ${
                  isCompleted || isActive ? "text-[var(--text-1)]" : "text-[var(--text-3)]"
                }`}>
                  {stage.label}
                </span>
              </div>
              
              {isActive && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="font-mono text-[10px] text-[var(--accent)] text-right max-w-[50%] truncate"
                >
                  {statusMessage}
                </motion.span>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
