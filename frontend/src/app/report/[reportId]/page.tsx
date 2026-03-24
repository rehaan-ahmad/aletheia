'use client'
import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import ReportHeader from '@/components/report/ReportHeader'
import AccuracyMeter from '@/components/report/AccuracyMeter'
import OriginalTextHighlighter from '@/components/report/OriginalTextHighlighter'
import FilterControls, { SortOption } from '@/components/report/FilterControls'
import ClaimExplorer from '@/components/report/ClaimExplorer'
import AIDetectionPanel from '@/components/report/AIDetectionPanel'
import MediaDetectionPanel from '@/components/report/MediaDetectionPanel'
import { Loader2 } from 'lucide-react'

export default function ReportPage() {
  const params = useParams()
  const router = useRouter()
  const [report, setReport] = useState<any>(null)
  
  const [filter, setFilter] = useState('All')
  const [sort, setSort] = useState<SortOption>('Order in Text')
  const [search, setSearch] = useState('')

  useEffect(() => {
    // Attempt to load from session storage first (for rapid stream access)
    // In production, you'd fetch from backend if missing
    if (params.reportId) {
      const raw = sessionStorage.getItem(`report_${params.reportId}`)
      if (raw) {
        setReport(JSON.parse(raw))
      } else {
        // Mock fallback or redirect if no persistence set up
        router.push('/')
      }
    }
  }, [params.reportId, router])

  if (!report) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
         <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
      </div>
    )
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto w-full p-4 md:p-8 flex flex-col gap-8 pb-24"
    >
      <ReportHeader report={report} />
      
      {report.input_type !== 'image' && (
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 mb-8">
        {/* Top left - Accuracy Meter */}
        <div className="lg:col-span-4 h-[300px]">
           <AccuracyMeter score={report.overall_accuracy_score} counts={report.verdict_counts} />
        </div>
        
        {/* Top right - Original Text Context */}
        <div className="lg:col-span-8 h-[300px]">
           <OriginalTextHighlighter text={report.input_preview} claims={report.claims} />     
        </div>
      </div>
      )}

      {/* Detection Panels */}
      {(report.ai_detection || report.media_detection) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {report.ai_detection && <AIDetectionPanel data={report.ai_detection} />}
          {report.media_detection && <MediaDetectionPanel data={report.media_detection} />}
        </div>
      )}

      {/* Claim Explorer */}
      {report.input_type !== 'image' && (
      <div className="w-full mt-8 flex flex-col">
        <div className="flex flex-col md:flex-row justify-between items-end mb-6">
          <div className="mb-4 md:mb-0">
             <h2 className="text-3xl font-extrabold text-white tracking-tight">Claim Breakdown</h2>
             <p className="text-slate-400 mt-2">Analyzed {report.claims.length} verifiable statements from the input.</p>
          </div>
        </div>
        
        <FilterControls 
          filter={filter} setFilter={setFilter}
          sort={sort} setSort={setSort}
          search={search} setSearch={setSearch}
          counts={report.verdict_counts}
        />
        
        <ClaimExplorer claims={report.claims} filter={filter} sort={sort} search={search} />
      </div>
      )}

    </motion.div>
  )
}
