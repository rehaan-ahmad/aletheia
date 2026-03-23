import { ShieldCheck, Network, Search, FileSignature, GitBranch } from 'lucide-react'

export default function TrustBadges() {
  const BADGES = [
    { label: 'LangGraph Orchestration', icon: <Network size={14} /> },
    { label: 'FIRE Iterative Search', icon: <Search size={14} /> },
    { label: 'AthenaGuard Secured', icon: <ShieldCheck size={14} /> },
    { label: 'GPTZero Detection', icon: <FileSignature size={14} /> },
    { label: 'Open Source', icon: <GitBranch size={14} /> },
  ]

  return (
    <div className="flex flex-wrap items-center justify-center gap-4 py-12 px-6">
      {BADGES.map((badge, idx) => (
        <div 
          key={idx} 
          className="flex items-center gap-2 glass px-3 py-1.5 rounded-full text-xs font-medium text-slate-300 border-white/5 whitespace-nowrap"
        >
          <span className="text-violet-400">{badge.icon}</span>
          {badge.label}
        </div>
      ))}
    </div>
  )
}
