'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight, ShieldCheck, Search, RotateCcw } from 'lucide-react'

export default function HistoryPage() {
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    const keys = Object.keys(sessionStorage).filter(k => k.startsWith('report_'))
    const loaded = keys.map(k => {
      try {
        return JSON.parse(sessionStorage.getItem(k) || '{}')
      } catch {
        return null
      }
    }).filter(r => r && r.report_id)
    
    // Sort by created_at desc
    loaded.sort((a,b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    setReports(loaded)
  }, [])

  return (
    <div className="max-w-5xl mx-auto w-full pt-16 px-6 pb-24">
      <div className="flex items-center justify-between mb-10">
        <h1 className="text-4xl font-extrabold text-white">Verification History</h1>
        <Link href="/" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-white text-sm font-medium">
          <RotateCcw size={16} /> New Fact Check
        </Link>
      </div>
      
      {reports.length === 0 ? (
        <div className="glass p-16 rounded-2xl text-center flex flex-col items-center gap-4 text-slate-400 border border-white/5 shadow-xl">
           <Search size={48} className="opacity-40" />
           <p className="text-lg">No verification history found in this local session.</p>
           <Link href="/" className="px-6 py-2.5 mt-4 rounded-lg bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-bold hover:scale-105 transition-transform shadow-[0_0_20px_rgba(124,58,237,0.3)]">
             Start a Verification
           </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {reports.map((report, idx) => (
            <motion.div 
              key={report.report_id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              className="glass p-6 rounded-2xl border border-white/5 hover:border-violet-500/50 hover:shadow-[0_0_30px_rgba(124,58,237,0.15)] transition-all group flex flex-col h-full"
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`flex items-center gap-2 px-2.5 py-1 rounded-md border ${
                  report.overall_accuracy_score > 0.7 ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : 
                  report.overall_accuracy_score > 0.4 ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                  "bg-rose-500/10 text-rose-400 border-rose-500/20"
                }`}>
                  <ShieldCheck size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {Math.round((report.overall_accuracy_score || 0) * 100)}% Accuracy
                  </span>
                </div>
                <span className="text-xs font-mono text-slate-500 mt-1">{new Date(report.created_at).toLocaleDateString()}</span>
              </div>
              
              <h3 className="text-lg font-medium text-white mb-6 line-clamp-3 leading-snug">
                "{report.input_preview}"
              </h3>
              
              <div className="flex items-center gap-4 mt-auto pt-4 border-t border-white/10">
                 <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded">
                   {report.claims?.length || 0} Claims
                 </span>
                 <span className="text-xs font-medium text-slate-400 bg-white/5 px-2 py-1 rounded">
                   {report.input_type === 'url' ? 'URL' : 'Text'}
                 </span>
                 <Link href={`/report/${report.report_id}`} className="ml-auto text-sm font-bold text-violet-400 flex items-center gap-1 group-hover:text-cyan-300 transition-colors">
                   View Report <ArrowRight size={14} />
                 </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
