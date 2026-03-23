"use client";
import { MediaResult } from "../lib/types";
import Image from "next/image";
import { useState } from "react";

interface MediaCardProps {
  result: MediaResult;
}

export default function MediaCard({ result }: MediaCardProps) {
  const [error, setError] = useState(false);

  const getBadgeStyle = (verdict: string) => {
    switch (verdict) {
      case "AI-Generated": return "bg-[rgba(139,92,246,0.85)] text-white";
      case "Likely AI": return "bg-[rgba(249,115,22,0.85)] text-white";
      case "Likely Real": return "bg-[rgba(245,158,11,0.85)] text-ink-950";
      case "Real": return "bg-[rgba(16,185,129,0.85)] text-ink-950";
      default: return "bg-[rgba(136,153,170,0.85)] text-ink-950";
    }
  };

  return (
    <div className="glass p-4 w-full flex flex-col gap-3">
      <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[var(--surface)] border border-[var(--glass-border)]">
        {!error ? (
          <Image
            src={result.image_url}
            alt="Analyzed media"
            fill
            className="object-cover"
            onError={() => setError(true)}
            unoptimized
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center p-4">
            <span className="font-mono text-[10px] text-[var(--text-3)] break-all text-center">
              Image unavailable: {result.image_url}
            </span>
          </div>
        )}
        
        <div className={`absolute bottom-3 left-3 px-2 py-1 rounded-full font-display font-bold text-[10px] tracking-wide backdrop-blur-md ${getBadgeStyle(result.verdict)}`}>
          {result.verdict}
        </div>
      </div>

      <div className="flex justify-between items-center ml-1">
        <span className="font-sans text-[11px] text-[var(--text-3)]">Confidence</span>
        <span className="font-mono font-medium text-[12px] text-[var(--text-1)]">{result.confidence}%</span>
      </div>

      {result.artifacts && result.artifacts.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-1">
          {result.artifacts.map((art, i) => (
            <span key={i} className="px-2 py-1 bg-[var(--surface)] text-[var(--text-2)] font-mono text-[10px] rounded-md border border-[var(--glass-border)] leading-tight">
              {art}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
