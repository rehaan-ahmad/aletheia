'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react'

interface Claim {
  claim_id: string
  claim_text: string
  verdict: 'True' | 'False' | 'Partially True' | 'Unverifiable'
  confidence_score: number
}

const VERDICT_STYLES = {
  'True': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', icon: <CheckCircle2 size={16} /> },
  'False': { color: 'text-rose-400', bg: 'bg-rose-500/10', bar: 'bg-rose-500', icon: <XCircle size={16} /> },
  'Partially True': { color: 'text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-500', icon: <AlertTriangle size={16} /> },
  'Unverifiable': { color: 'text-slate-400', bg: 'bg-slate-500/10', bar: 'bg-slate-500', icon: <HelpCircle size={16} /> }
}

export default function LiveClaimFeed({ claims }: { claims: Claim[] }) {
  return (
    <div className="flex flex-col gap-4 w-full h-full pb-10">
      <h3 className="text-xl font-bold mb-2 text-white tracking-tight">Live Claim Feed</h3>
      
      <AnimatePresence mode="popLayout">
        {claims.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-slate-500 text-sm italic mt-10 text-center"
          >
            Extracting claims, please wait...
          </motion.div>
        ) : (
          claims.map((claim, idx) => {
            const style = VERDICT_STYLES[claim.verdict]
            
            return (
              <motion.div
                key={claim.claim_id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                className="w-full glass p-5 rounded-xl border-l-[4px] shadow-lg flex flex-col gap-3"
                style={{ borderLeftColor: `var(--color-${style.color.split('-')[1]}-500, currentColor)` }}
              >
                <p className="text-white text-md font-medium leading-relaxed">
                  "{claim.claim_text.length > 80 ? claim.claim_text.substring(0, 80) + '...' : claim.claim_text}"
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${style.bg} ${style.color} uppercase tracking-wider`}>
                    {style.icon} {claim.verdict}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">{Math.round(claim.confidence_score * 100)}%</span>
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${claim.confidence_score * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${style.bar}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </AnimatePresence>
    </div>
  )
}
