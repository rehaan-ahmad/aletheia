'use client'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react'

export default function AccuracyMeter({ 
  score, 
  counts 
}: { 
  score: number, 
  counts: Record<string, number> 
}) {
  const percentage = Math.round(score * 100)
  const radius = 60
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (percentage / 100) * circumference

  let colorClass = 'text-rose-500'
  let strokeClass = 'stroke-rose-500'
  if (percentage >= 70) {
    colorClass = 'text-emerald-500'
    strokeClass = 'stroke-emerald-500'
  } else if (percentage >= 40) {
    colorClass = 'text-amber-500'
    strokeClass = 'stroke-amber-500'
  }

  return (
    <div className="glass p-8 rounded-2xl flex flex-col items-center justify-center gap-8 h-full">
      <h3 className="text-lg font-semibold text-slate-300 w-full text-left">Overall Accuracy</h3>
      
      <div className="relative flex items-center justify-center">
        {/* Background circle */}
        <svg className="w-40 h-40 transform -rotate-90">
          <circle
            cx="80" cy="80" r={radius}
            className="stroke-white/10 fill-none"
            strokeWidth="12"
          />
          {/* Animated progress circle */}
          <motion.circle
            cx="80" cy="80" r={radius}
            className={`${strokeClass} fill-none`}
            strokeWidth="12"
            strokeLinecap="round"
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            style={{ strokeDasharray: circumference }}
          />
        </svg>
        
        {/* Center Text */}
        <div className="absolute flex flex-col items-center justify-center">
          <span className={`text-4xl font-extrabold ${colorClass}`}>{percentage}%</span>
          <span className="text-xs font-semibold text-slate-400 tracking-widest uppercase mt-1">Score</span>
        </div>
      </div>

      <div className="flex flex-wrap justify-center gap-3 w-full">
        <Badge icon={<CheckCircle2 size={14}/>} count={counts['True'] || 0} label="True" color="text-emerald-400 bg-emerald-500/10 border-emerald-500/20" />
        <Badge icon={<XCircle size={14}/>} count={counts['False'] || 0} label="False" color="text-rose-400 bg-rose-500/10 border-rose-500/20" />
        <Badge icon={<AlertTriangle size={14}/>} count={counts['Partially True'] || 0} label="Partial" color="text-amber-400 bg-amber-500/10 border-amber-500/20" />
        <Badge icon={<HelpCircle size={14}/>} count={counts['Unverifiable'] || 0} label="Unknown" color="text-slate-400 bg-slate-500/10 border-slate-500/20" />
      </div>
    </div>
  )
}

function Badge({ icon, count, label, color }: { icon: any, count: number, label: string, color: string }) {
  if (count === 0) return null
  return (
    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${color}`}>
      {icon} {count} {label}
    </div>
  )
}
