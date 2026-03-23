"use client";
import { useState } from "react";
import { Link, FileText, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

interface InputPanelProps {
  onSubmit: (text: string | null, url: string | null) => void;
  isLoading: boolean;
}

export default function InputPanel({ onSubmit, isLoading }: InputPanelProps) {
  const [mode, setMode] = useState<"text" | "url">("text");
  const [textValue, setTextValue] = useState("");
  const [urlValue, setUrlValue] = useState("");

  const handleSubmit = () => {
    onSubmit(mode === "text" ? textValue : null, mode === "url" ? urlValue : null);
  };

  const isDisabled = isLoading || (mode === "text" && !textValue.trim()) || (mode === "url" && !urlValue.trim());

  return (
    <div className="glass p-5 w-full flex flex-col gap-4">
      <div className="flex gap-2">
        <button
          onClick={() => setMode("text")}
          className={`px-3 py-1 rounded-full font-mono text-[11px] border transition-colors flex items-center gap-1.5 ${
            mode === "text" 
              ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-dim)]" 
              : "border-[var(--glass-border)] text-[var(--text-3)]"
          }`}
        >
          <FileText size={12} /> Text
        </button>
        <button
          onClick={() => setMode("url")}
          className={`px-3 py-1 rounded-full font-mono text-[11px] border transition-colors flex items-center gap-1.5 ${
            mode === "url" 
              ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-dim)]" 
              : "border-[var(--glass-border)] text-[var(--text-3)]"
          }`}
        >
          <Link size={12} /> URL
        </button>
      </div>

      {mode === "text" ? (
        <textarea
          value={textValue}
          onChange={(e) => setTextValue(e.target.value)}
          placeholder="Paste article text here to verify its claims..."
          className="w-full min-h-[100px] p-3 rounded-lg bg-[var(--surface)] border border-[var(--glass-border)] font-mono text-[12px] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent-border)] resize-y transition-colors"
        />
      ) : (
        <div className="relative w-full">
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-3)]">
            <Link size={16} />
          </div>
          <input
            type="url"
            value={urlValue}
            onChange={(e) => setUrlValue(e.target.value)}
            placeholder="https://example.com/article"
            className="w-full p-3 pl-9 rounded-lg bg-[var(--surface)] border border-[var(--glass-border)] font-mono text-[12px] text-[var(--text-1)] placeholder:text-[var(--text-3)] focus:outline-none focus:border-[var(--accent-border)] transition-colors"
          />
        </div>
      )}

      <motion.button
        whileHover={isDisabled ? {} : { scale: 1.01 }}
        whileTap={isDisabled ? {} : { scale: 0.98 }}
        onClick={handleSubmit}
        disabled={isDisabled}
        className={`w-full py-2.5 rounded-lg flex justify-center items-center gap-2 font-display font-bold text-[13px] tracking-[0.04em] uppercase transition-all ${
          isDisabled 
            ? "bg-[var(--surface)] text-[var(--text-3)] cursor-not-allowed" 
            : "bg-[var(--accent)] text-ink-950 hover:brightness-110 shadow-[0_4px_14px_0_var(--accent-dim)]"
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="animate-spin" size={16} />
            Verifying...
          </>
        ) : (
          "Verify Source"
        )}
      </motion.button>
    </div>
  );
}
