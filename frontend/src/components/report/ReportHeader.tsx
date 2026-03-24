'use client'
import { Link2, Share2, Printer, RotateCcw } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/ToastProvider'

export default function ReportHeader({ report }: { report: any }) {
  const router = useRouter()
  const { toast } = useToast()

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      toast('Report URL copied to clipboard!', 'success')
    } catch {
      toast('Failed to copy URL', 'error')
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const handleReverify = () => {
    if (report.input_type === 'url') {
      sessionStorage.setItem('aletheia_verify_payload', JSON.stringify({ type: 'url', content: report.input_source, ai: true, media: false }))
    } else {
      sessionStorage.setItem('aletheia_verify_payload', JSON.stringify({ type: 'text', content: report.input_source, ai: true, media: false }))
    }
    router.push('/')
  }

  const dateStr = new Date(report.created_at).toLocaleString()

  return (
    <div className="w-full glass p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-violet-500/20 shadow-lg">
      <div className="flex flex-col gap-2">
        <div className="flex items-center gap-3">
          {report.input_type === 'image' ? (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="text-white font-medium truncate max-w-[300px]">Image Analysis</span>
            </div>
          ) : report.input_type === 'url' ? (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <img src={`https://www.google.com/s2/favicons?domain=${new URL(report.input_source).hostname}&sz=32`} alt="icon" className="w-5 h-5 rounded-sm" />
              <a href={report.input_source} target="_blank" rel="noreferrer" className="text-white font-medium hover:text-cyan-400 truncate max-w-[300px] transition-colors hover:underline">
                {report.article_title || new URL(report.input_source).hostname}
              </a>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-lg border border-white/10">
              <span className="text-white font-medium truncate max-w-[300px]">Text Input Analysis</span>
            </div>
          )}
        </div>
        
        <div className="flex items-center gap-4 text-sm text-slate-400">
          <span>{dateStr}</span>
          <span className="w-1 h-1 rounded-full bg-slate-600" />
          <span>Processed in {report.processing_time_seconds}s</span>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
        <button onClick={handleShare} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-hover text-sm font-medium transition-colors text-white whitespace-nowrap">
          <Share2 size={16} /> Share
        </button>
        <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 rounded-lg glass-hover text-sm font-medium transition-colors text-white whitespace-nowrap">
          <Printer size={16} /> Save PDF
        </button>
        <button onClick={handleReverify} className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm font-medium transition-colors text-white whitespace-nowrap">
          <RotateCcw size={16} /> Re-Verify
        </button>
      </div>
    </div>
  )
}
