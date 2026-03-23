'use client'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle, ChevronDown, ChevronUp, Link as LinkIcon, Search, Clock, AlertOctagon } from 'lucide-react'

const VERDICT_STYLES: Record<string, any> = {
  'True': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', icon: <CheckCircle2 size={16} /> },
  'False': { color: 'text-rose-400', bg: 'bg-rose-500/10', bar: 'bg-rose-500', icon: <XCircle size={16} /> },
  'Partially True': { color: 'text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-500', icon: <AlertTriangle size={16} /> },
  'Unverifiable': { color: 'text-slate-400', bg: 'bg-slate-500/10', bar: 'bg-slate-500', icon: <HelpCircle size={16} /> }
}

const CREDIBILITY_COLORS: Record<string, string> = {
  'high': 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]',
  'medium': 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.6)]',
  'low': 'bg-rose-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]'
}

export default function ClaimCard({ claim, index }: { claim: any, index: number }) {
  const [expanded, setExpanded] = useState(false)
  const [queriesExpanded, setQueriesExpanded] = useState(false)
  const style = VERDICT_STYLES[claim.verdict] || VERDICT_STYLES['Unverifiable']

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      layout
      transition={{ duration: 0.4 }}
      id={`claim-${claim.claim_id}`}
      className="w-full glass rounded-2xl border-l-[4px] shadow-lg flex flex-col overflow-hidden transition-all hover:-translate-y-1 hover:shadow-[0_8px_30px_rgba(124,58,237,0.15)]"
      style={{ borderLeftColor: `var(--color-${style.color.split('-')[1]}-500, currentColor)` }}
    >
      <div className="p-6 md:p-8 flex flex-col gap-6">
        
        {/* Header */}
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-slate-500 font-mono font-bold uppercase tracking-wider text-sm">CLAIM #{index + 1}</span>
            {claim.conflict_detected && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-400 text-xs font-bold uppercase tracking-widest border border-amber-500/20">
                <AlertOctagon size={14} /> Conflict Detected
              </span>
            )}
            {claim.temporal_flag && (
              <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-widest border border-cyan-500/20">
                <Clock size={14} /> Temporal
              </span>
            )}
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${style.bg} ${style.color} border-current/20 font-bold uppercase tracking-widest text-sm`}>
            {style.icon} {claim.verdict}
          </div>
        </div>

        {/* Claim Content */}
        <div className="flex flex-col gap-4">
          <div className="p-4 rounded-xl bg-white/5 border border-white/5 border-l-4 border-l-amber-500/50">
             <span className="text-xs font-bold text-amber-500/80 uppercase tracking-wider mb-2 block">📍 Source Context</span>
             <p className="text-sm text-slate-300 italic">"...{claim.original_context}..."</p>
          </div>
          
          <div>
            <span className="text-xs font-bold text-violet-400 uppercase tracking-wider mb-1 block">🔬 Atomic Claim</span>
            <h4 className="text-lg md:text-xl font-bold text-white leading-snug">{claim.claim_text}</h4>
          </div>

          <div>
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 block">⚖️ Justification</span>
             <p className="text-slate-300 leading-relaxed font-medium">{claim.justification}</p>
          </div>
        </div>

        {/* Expandable Reasoning */}
        <div className="flex flex-col border-t border-white/10 pt-4 mt-2">
          <button 
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-2 text-sm font-semibold text-violet-400 hover:text-violet-300 transition-colors w-fit"
          >
            {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />} 
            {expanded ? 'Hide CoT Reasoning' : 'Show Full Reasoning Chain'}
          </button>
          <AnimatePresence>
            {expanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }} 
                animate={{ height: 'auto', opacity: 1 }} 
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/5 font-mono text-xs md:text-sm text-slate-300 whitespace-pre-wrap max-h-[300px] overflow-y-auto custom-scrollbar">
                  {claim.reasoning_chain || 'No reasoning provided.'}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Citations */}
        {claim.citations && claim.citations.length > 0 && (
          <div className="flex flex-col gap-3">
             <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">🔗 Sources ({claim.citations.length})</span>
             <div className="flex flex-col gap-2">
               {claim.citations.map((cite: any, i: number) => {
                 const credColor = CREDIBILITY_COLORS[cite.credibility_tier.toLowerCase()] || CREDIBILITY_COLORS['low']
                 return (
                   <a 
                     key={i} 
                     href={cite.url} 
                     target="_blank" 
                     rel="noreferrer"
                     className="flex items-start gap-3 p-3 rounded-lg glass-hover border border-white/5 group transition-colors"
                   >
                     <div className={`mt-1.5 w-2 h-2 rounded-full shrink-0 ${credColor}`} title={`Credibility: ${cite.credibility_tier.toUpperCase()}`} />
                     <div className="flex flex-col min-w-0">
                       <span className="text-sm font-medium text-white truncate group-hover:text-cyan-400 transition-colors">{cite.title || cite.url}</span>
                       <span className="text-xs text-slate-500 truncate flex items-center gap-1"><LinkIcon size={10} /> {new URL(cite.url).hostname}</span>
                     </div>
                   </a>
                 )
               })}
             </div>
          </div>
        )}

        {/* Search Queries */}
        {claim.search_queries_used && claim.search_queries_used.length > 0 && (
          <div className="flex flex-col">
            <button 
              onClick={() => setQueriesExpanded(!queriesExpanded)}
              className="flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-300 transition-colors w-fit uppercase"
            >
              <Search size={14} /> Search Queries Used {queriesExpanded ? '[-]' : '[+]'}
            </button>
            <AnimatePresence>
              {queriesExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="mt-3 flex flex-wrap gap-2">
                    {claim.search_queries_used.map((q: string, i: number) => (
                      <span key={i} className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-xs font-mono text-cyan-200">"{q}"</span>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>

      {/* Confidence Footer */}
      <div className="w-full bg-black/20 p-4 border-t border-white/5 flex items-center gap-4">
        <div className="flex-grow h-2 bg-slate-800 rounded-full overflow-hidden shrink-0 max-w-xs">
          <motion.div 
            initial={{ width: 0 }} 
            whileInView={{ width: `${claim.confidence_score * 100}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
            className={`h-full ${style.bar}`}
          />
        </div>
        <span className="text-sm font-bold text-slate-300 font-mono tracking-wider">{Math.round(claim.confidence_score * 100)}% CONFIDENCE</span>
      </div>
    </motion.div>
  )
}
