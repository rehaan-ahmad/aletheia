'use client'
import { motion } from 'framer-motion'
import { AlertTriangle, Info } from 'lucide-react'

export default function AIDetectionPanel({ data }: { data: any }) {
  if (!data) return null
  
  const percentage = Math.round(data.ai_probability * 100)
  const rotation = (percentage / 100) * 180 - 90

  let colorClass = 'text-amber-500'
  let bgClass = 'bg-amber-500/10 border-amber-500/20'
  if (percentage > 70) {
    colorClass = 'text-rose-500'
    bgClass = 'bg-rose-500/10 border-rose-500/20'
  } else if (percentage < 30) {
    colorClass = 'text-emerald-500'
    bgClass = 'bg-emerald-500/10 border-emerald-500/20'
  }

  return (
    <div className="glass p-6 md:p-8 rounded-2xl flex flex-col h-full border border-white/5 relative overflow-hidden">
      {data.is_mock && (
        <div className="absolute top-0 right-0 bg-violet-600/80 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg text-white">
          Demo Data (GPTZero API)
        </div>
      )}

      <div className="flex justify-between items-center w-full mb-8">
        <h3 className="text-lg font-semibold text-slate-300">AI Text Analysis</h3>
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${bgClass} ${colorClass}`}>
          {data.classification}
        </span>
      </div>

      <div className="flex flex-col md:flex-row gap-8 items-center h-full">
        {/* Gauge */}
        <div className="relative w-48 h-24 flex shrink-0 items-end justify-center overflow-hidden">
          {/* Semi-Circle SVG */}
          <svg className="absolute w-48 h-48 top-0 left-0">
            <path d="M 24 96 A 72 72 0 0 1 168 96" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="16" />
            <path d="M 24 96 A 72 72 0 0 1 96 24" fill="none" stroke="#10b981" strokeWidth="16" />
            <path d="M 96 24 A 72 72 0 0 1 168 96" fill="none" stroke="#ef4444" strokeWidth="16" />
          </svg>
          
          {/* Needle */}
          <motion.div 
            className="absolute bottom-0 w-1 h-20 bg-white origin-bottom rounded-t-full shadow-[0_0_10px_white]"
            style={{ x: '-50%' }}
            initial={{ rotate: -90 }}
            animate={{ rotate: rotation }}
            transition={{ type: 'spring', stiffness: 60, damping: 12, delay: 0.5 }}
          />
          
          <div className="absolute -bottom-1 w-4 h-4 rounded-full bg-white shadow-[0_0_10px_white]" />
          
          <div className="absolute bottom-[-16px] flex justify-between w-full px-6 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span>Human</span>
            <span>AI</span>
          </div>
        </div>

        {/* Breakdown & Heatmap */}
        <div className="flex flex-col flex-grow w-full gap-4">
          <div className="flex justify-between items-center text-sm font-semibold">
             <span className="text-slate-400">AI Probability:</span>
             <span className={`text-xl ${colorClass}`}>{percentage}%</span>
          </div>
          
          <div className="mt-4">
             <div className="flex items-center gap-2 mb-2">
               <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sentence Heatmap</span>
               <Info size={12} className="text-slate-500" />
             </div>
             
             <div className="w-full max-h-[140px] overflow-y-auto custom-scrollbar p-3 bg-black/30 rounded-lg text-sm leading-relaxed border border-white/5 flex flex-wrap gap-1">
               {data.sentence_scores?.map((s: any, i: number) => {
                 // Green (human) to Red (AI) interpolation roughly
                 const p = s.generated_prob
                 // color logic: p=0 -> emerald (16,185,129), p=1 -> rose (239,68,68)
                 const r = Math.round(16 + (239 - 16) * p)
                 const g = Math.round(185 + (68 - 185) * p)
                 const b = Math.round(129 + (68 - 129) * p)
                 
                 return (
                   <span 
                     key={i} 
                     style={{ backgroundColor: `rgba(${r},${g},${b},0.3)` }}
                     className="px-1 rounded-sm"
                     title={`AI Prob: ${Math.round(p * 100)}%`}
                   >
                     {s.sentence}
                   </span>
                 )
               })}
             </div>
          </div>
        </div>
      </div>
    </div>
  )
}
