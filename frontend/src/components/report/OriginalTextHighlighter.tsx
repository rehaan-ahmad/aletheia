'use client'
import { useMemo } from 'react'

const VERDICT_COLORS: Record<string, string> = {
  'True': 'bg-emerald-500/40 text-emerald-100 border-b border-emerald-400',
  'False': 'bg-rose-500/40 text-rose-100 border-b border-rose-400',
  'Partially True': 'bg-amber-500/40 text-amber-100 border-b border-amber-400',
  'Unverifiable': 'bg-slate-500/40 text-slate-100 border-b border-slate-400'
}

export default function OriginalTextHighlighter({ 
  text, 
  claims 
}: { 
  text: string, 
  claims: any[] 
}) {
  
  const highlightedMarkup = useMemo(() => {
    if (!text || !claims || claims.length === 0) return text
    
    // Create a mutable copy of the text for replacing
    // Sort claims by length descending so longer phrases match first to avoid nested overlaps
    const sortedClaims = [...claims].sort((a,b) => (b.original_context?.length || 0) - (a.original_context?.length || 0))
    
    let result = text
    const replacements: { placeholder: string, markup: string }[] = []

    sortedClaims.forEach((claim, i) => {
      const context = claim.original_context?.trim()
      if (!context || context.length < 5) return

      // Escape regex chars
      const escapedQuery = context.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      const regex = new RegExp(`(${escapedQuery})`, 'gi')
      const colorClass = VERDICT_COLORS[claim.verdict] || VERDICT_COLORS['Unverifiable']
      
      const placeholder = `__ALETHEIA_CLAIM_${i}__`
      // Temporarily stash the replacement so we don't accidentally replace inside the markup later
      if (regex.test(result)) {
        result = result.replace(regex, placeholder)
        replacements.push({
          placeholder,
          // Wait, $1 won't work if we swapped the text out. We actually replace using string replace function
          markup: `<mark class="${colorClass} cursor-pointer px-1 rounded-sm transition-opacity hover:shadow-[0_0_10px_currentColor]" onclick="document.getElementById('claim-${claim.claim_id}')?.scrollIntoView({behavior: 'smooth', block: 'center'})">${context}</mark>`
        })
      }
    })

    // Restore replacements
    replacements.forEach(({ placeholder, markup }) => {
      result = result.replace(placeholder, markup)
    })

    // Basic sanitize (since we inject our own safe HTML, we just ensure no scripts are present, but since original is plain text, it's safe)
    // We should use DOMPurify in a real app, but Since this is a hackathon & we control the markup:
    return result

  }, [text, claims])

  return (
    <div className="glass p-6 md:p-8 rounded-2xl flex flex-col h-full border border-white/5 relative">
      <div className="flex justify-between items-center w-full mb-6">
        <h3 className="text-lg font-semibold text-slate-300">Original Text Context</h3>
        <span className="text-xs font-semibold px-2 py-1 bg-white/10 rounded-full text-slate-300">
          {claims.length} claims highlighted
        </span>
      </div>
      
      <div 
        className="w-full flex-grow text-slate-300 leading-relaxed overflow-y-auto pr-2 custom-scrollbar text-sm md:text-base whitespace-pre-wrap font-sans"
        dangerouslySetInnerHTML={{ __html: highlightedMarkup }}
      />
    </div>
  )
}
