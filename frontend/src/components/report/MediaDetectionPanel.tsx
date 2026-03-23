'use client'
import { motion } from 'framer-motion'
import { AlertOctagon, CheckCircle2, Image as ImageIcon } from 'lucide-react'

export default function MediaDetectionPanel({ data }: { data: any }) {
  if (!data || !data.available) {
    return (
      <div className="glass p-6 md:p-8 rounded-2xl flex flex-col items-center justify-center h-full border border-white/5 text-center gap-4">
         <ImageIcon size={48} className="text-slate-600 mb-2" />
         <h3 className="text-lg font-semibold text-slate-300">Media Analysis Unavailable</h3>
         <p className="text-sm text-slate-500 max-w-sm">
           The Hive AI API is not configured or upgrading is required to enable deepfake image detection.
         </p>
      </div>
    )
  }

  const isSynthetic = data.overall_verdict.includes('Synthetic')

  return (
    <div className="glass p-6 md:p-8 rounded-2xl flex flex-col h-full border border-white/5 relative overflow-hidden">
      {data.is_mock && (
        <div className="absolute top-0 right-0 bg-cyan-600/80 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-bl-lg text-white z-10">
          Mock Data (Hive AI API Required)
        </div>
      )}

      <div className="flex justify-between items-center w-full mb-6 relative z-10">
        <h3 className="text-lg font-semibold text-slate-300 flex items-center gap-2">
          <ImageIcon size={18} /> Media Analysis
        </h3>
        <span className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${isSynthetic ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'}`}>
          {isSynthetic ? <AlertOctagon size={14} /> : <CheckCircle2 size={14} />}
          {data.overall_verdict.replace(" (Mock Data)", "")}
        </span>
      </div>

      {data.analyzed_assets?.length === 0 ? (
        <div className="flex-grow flex items-center justify-center text-slate-500 text-sm">
          No media assets found in the text/URL to analyze.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {data.analyzed_assets?.map((asset: any, i: number) => {
            const prob = Math.round(asset.deepfake_probability * 100)
            const isFake = prob > 50
            return (
              <motion.div 
                key={i}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: i * 0.1 }}
                className="relative aspect-square rounded-xl overflow-hidden border border-white/10 group bg-black/50"
              >
                <img src={asset.url} alt="Analyzed Media" className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent flex items-end p-3">
                   <div className={`w-full flex justify-between items-center text-xs font-bold ${isFake ? 'text-rose-400' : 'text-emerald-400'}`}>
                     <span>{isFake ? 'SYNTHETIC' : 'AUTHENTIC'}</span>
                     <span>{prob}%</span>
                   </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
