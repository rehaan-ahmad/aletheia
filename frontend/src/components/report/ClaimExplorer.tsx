'use client'
import { motion, AnimatePresence } from 'framer-motion'
import ClaimCard from './ClaimCard'

export default function ClaimExplorer({ 
  claims, 
  filter, 
  sort, 
  search 
}: { 
  claims: any[], 
  filter: string,
  sort: string,
  search: string
}) {
  let filtered = [...claims]

  if (filter !== 'All') {
    filtered = filtered.filter(c => c.verdict === filter)
  }

  if (search.trim()) {
    const s = search.toLowerCase()
    filtered = filtered.filter(c => 
      c.claim_text.toLowerCase().includes(s) || 
      c.original_context.toLowerCase().includes(s)
    )
  }

  filtered.sort((a, b) => {
    if (sort === 'Confidence High→Low') return b.confidence_score - a.confidence_score
    if (sort === 'Confidence Low→High') return a.confidence_score - b.confidence_score
    // default Order in Text
    return claims.indexOf(a) - claims.indexOf(b)
  })

  return (
    <div className="flex flex-col gap-6 w-full">
      <AnimatePresence mode="popLayout">
        {filtered.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="w-full glass p-10 rounded-2xl text-center text-slate-400 italic"
          >
            No claims match your filters.
          </motion.div>
        ) : (
          filtered.map(claim => (
            <ClaimCard 
              key={claim.claim_id} 
              claim={claim} 
              index={claims.indexOf(claim)} 
            />
          ))
        )}
      </AnimatePresence>
    </div>
  )
}
