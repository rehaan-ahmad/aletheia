"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { 
  PipelineStage, 
  ClaimResult, 
  AITextResult, 
  MediaResult 
} from "../lib/types";
import { streamVerification } from "../lib/api";

import ThemeToggle from "../components/ThemeToggle";
import InputPanel from "../components/InputPanel";
import PipelineProgress from "../components/PipelineProgress";
import ReportHeader from "../components/ReportHeader";
import ClaimCard from "../components/ClaimCard";
import AITextMeter from "../components/AITextMeter";
import MediaCard from "../components/MediaCard";
import ErrorBanner from "../components/ErrorBanner";

export default function Page() {
  const [isLoading, setIsLoading] = useState(false);
  const [currentStage, setCurrentStage] = useState<PipelineStage>("idle");
  const [statusMessage, setStatusMessage] = useState("");
  const [completedStages, setCompletedStages] = useState<string[]>([]);
  const [extractedClaims, setExtractedClaims] = useState<string[]>([]);
  const [claimResults, setClaimResults] = useState<ClaimResult[]>([]);
  const [summary, setSummary] = useState<any>(null);
  const [aiTextResult, setAiTextResult] = useState<AITextResult | null>(null);
  const [mediaResults, setMediaResults] = useState<MediaResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  const [lastInput, setLastInput] = useState<{text: string | null, url: string | null}>({text: null, url: null});

  const handleSubmit = async (text: string | null, url: string | null) => {
    // Reset state
    setLastInput({ text, url });
    setIsLoading(true);
    setCurrentStage("idle");
    setStatusMessage("");
    setCompletedStages([]);
    setExtractedClaims([]);
    setClaimResults([]);
    setSummary(null);
    setAiTextResult(null);
    setMediaResults([]);
    setError(null);

    let previousStage = "idle";
    const compStages = new Set<string>();

    try {
      for await (const event of streamVerification(text, url)) {
        switch (event.type) {
          case "status":
            const newStage = event.data.stage;
            if (previousStage !== "idle" && previousStage !== newStage) {
              compStages.add(previousStage);
              setCompletedStages(Array.from(compStages));
            }
            previousStage = newStage;
            setCurrentStage(newStage as PipelineStage);
            setStatusMessage(event.data.message || "");
            break;
            
          case "claims":
            setExtractedClaims(event.data.claims || []);
            break;
            
          case "claim_result":
            setClaimResults(prev => [...prev, event.data as ClaimResult]);
            break;
            
          case "ai_text":
            setAiTextResult(event.data as AITextResult);
            compStages.add("ai_detection");
            setCompletedStages(Array.from(compStages));
            break;
            
          case "media":
            setMediaResults(prev => [...prev, event.data as MediaResult]);
            break;
            
          case "complete":
            setSummary(event.data);
            setCurrentStage("complete");
            setIsLoading(false);
            compStages.add(previousStage);
            setCompletedStages(Array.from(compStages));
            break;
            
          case "error":
            setError(event.data.message || "An unknown error occurred.");
            setIsLoading(false);
            break;
        }
      }
    } catch (err: any) {
      if (err.name !== "AbortError") {
        setError(err.message || "Connection to verification server failed.");
      }
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    handleSubmit(lastInput.text, lastInput.url);
  };

  return (
    <div 
      className="min-h-screen w-full relative pb-20"
      style={{
        backgroundImage: "radial-gradient(circle, var(--grid-line) 1px, transparent 1px)",
        backgroundSize: "24px 24px"
      }}
    >
      <div className="max-w-[860px] mx-auto px-4 py-8 flex flex-col gap-6">
        
        {/* Header */}
        <header className="flex justify-between items-center mb-2">
          <div className="flex flex-col">
            <h1 className="font-display font-extrabold text-[32px] text-[var(--text-1)] tracking-[-0.04em] leading-none">
              ALETHEIA
            </h1>
            <p className="font-mono text-[11px] text-[var(--accent)] tracking-[0.1em] uppercase mt-1">
              FACT · CLAIM · VERIFICATION
            </p>
          </div>
          <ThemeToggle />
        </header>

        <InputPanel onSubmit={handleSubmit} isLoading={isLoading} />

        {error && <ErrorBanner message={error} onRetry={handleRetry} />}

        {isLoading && (
          <PipelineProgress 
            currentStage={currentStage} 
            statusMessage={statusMessage} 
            completedStages={completedStages} 
          />
        )}

        {summary && <ReportHeader summary={summary} aiTextResult={aiTextResult} />}

        {/* Claim Cards */}
        {claimResults.length > 0 && (
          <div className="flex flex-col gap-4">
            <AnimatePresence>
              {claimResults.map((result, idx) => (
                <ClaimCard key={idx} result={result} index={idx} />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Skeleton Loaders */}
        {isLoading && claimResults.length === 0 && (
          <div className="flex flex-col gap-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass p-5 w-full flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <div className="w-16 h-3 bg-[var(--surface)] animate-fade-pulse rounded-full" />
                  <div className="w-20 h-4 bg-[var(--surface)] animate-fade-pulse rounded-full" />
                </div>
                <div className="w-full h-4 bg-[var(--surface)] animate-fade-pulse rounded-full mt-2" />
                <div className="w-3/4 h-4 bg-[var(--surface)] animate-fade-pulse rounded-full" />
                <div className="w-1/2 h-3 bg-[var(--surface)] animate-fade-pulse rounded-full mt-2" />
              </div>
            ))}
          </div>
        )}

        {aiTextResult && <AITextMeter result={aiTextResult} />}

        {mediaResults.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mediaResults.map((mRes, i) => (
              <MediaCard key={i} result={mRes} />
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
