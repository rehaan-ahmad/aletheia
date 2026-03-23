'use client'
import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { Loader2, Link2, Type, Check, AlertCircle } from 'lucide-react'

export default function InputCard({ defaultText = '' }: { defaultText?: string }) {
  const router = useRouter()
  const [tab, setTab] = useState<'text' | 'url'>('text')
  const [text, setText] = useState(defaultText)
  const [url, setUrl] = useState('')
  const [aiDetection, setAiDetection] = useState(true)
  const [mediaAnalysis, setMediaAnalysis] = useState(false)
  const [loading, setLoading] = useState(false)
  const [favicon, setFavicon] = useState<string | null>(null)
  
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (defaultText) {
      setTab('text')
      setText(defaultText)
      if (textareaRef.current) {
        textareaRef.current.focus()
      }
    }
  }, [defaultText])

  useEffect(() => {
    if (tab === 'url' && url) {
      try {
        const hostname = new URL(url).hostname
        setFavicon(`https://www.google.com/s2/favicons?domain=${hostname}&sz=32`)
      } catch {
        setFavicon(null)
      }
    } else {
      setFavicon(null)
    }
  }, [url, tab])

  const claimCount = Math.max(0, Math.floor((text.split(/[.!?]+/).filter(s => s.trim().length > 5).length) / 2))

  const handleVerify = () => {
    if (tab === 'text' && text.length < 30) return
    if (tab === 'url' && !url.startsWith('http')) return
    
    setLoading(true)
    const payload = {
      type: tab,
      content: tab === 'text' ? text : url,
      ai: aiDetection,
      media: mediaAnalysis
    }
    
    // Store in session storage so verify page can pick it up without URL bloat
    sessionStorage.setItem('aletheia_verify_payload', JSON.stringify(payload))
    router.push('/verify')
  }

  const isValid = tab === 'text' ? text.length >= 30 : url.startsWith('http')

  return (
    <div className="w-full max-w-3xl mx-auto glass rounded-2xl p-6 md:p-8 relative z-10 shadow-2xl transition-all focus-within:shadow-[0_0_40px_rgba(124,58,237,0.2)] focus-within:border-violet-500/50">
      
      {/* Tab Switcher */}
      <div className="flex gap-2 mb-6 border-b border-white/10 pb-4 relative">
        <button
          onClick={() => setTab('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'text' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Type size={18} /> Text Input
        </button>
        <button
          onClick={() => setTab('url')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${tab === 'url' ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
        >
          <Link2 size={18} /> URL Input
        </button>
        {/* Animated indicator */}
        <motion.div
          layoutId="tab-indicator"
          className="absolute bottom-[-1px] h-[2px] bg-violet-500"
          initial={false}
          animate={{
            width: tab === 'text' ? 120 : 120,
            x: tab === 'text' ? 0 : 133
          }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      </div>

      {/* Input Area */}
      <div className="mb-6 relative">
        <AnimatePresence mode="wait">
          {tab === 'text' ? (
            <motion.div
              key="text"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste an article, social media post, or statement to fact-check..."
                className="w-full h-48 bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 resize-none"
              />
              <div className="flex justify-between mt-2 text-xs text-slate-400">
                <span>{text.length} characters (min 30)</span>
                {text.length > 0 && <span>~{claimCount} claims to verify</span>}
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="url"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="relative"
            >
              <div className="absolute left-4 top-1/2 -translate-y-1/2">
                {favicon ? (
                  <img src={favicon} alt="favicon" className="w-5 h-5 rounded-sm" />
                ) : (
                  <Link2 className="text-slate-500" size={20} />
                )}
              </div>
              <input
                type="url"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://example.com/article"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Toggles */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 p-4 rounded-xl bg-white/5 border border-white/5">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className={`relative w-12 h-6 rounded-full transition-colors ${aiDetection ? 'bg-violet-600' : 'bg-slate-700'}`}>
            <motion.div 
              className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full"
              animate={{ x: aiDetection ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
          <input type="checkbox" className="hidden" checked={aiDetection} onChange={() => setAiDetection(!aiDetection)} />
          <div className="flex flex-col">
            <span className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">AI Text Detection</span>
            <span className="text-xs text-slate-400">Powered by GPTZero</span>
          </div>
        </label>

        <label className="flex items-center gap-3 cursor-pointer group relative" title="Analyzes embedded images for deepfakes">
          <div className={`relative w-12 h-6 rounded-full transition-colors ${mediaAnalysis ? 'bg-cyan-600' : 'bg-slate-700'}`}>
            <motion.div 
              className="absolute top-1 left-1 bg-white w-4 h-4 rounded-full"
              animate={{ x: mediaAnalysis ? 24 : 0 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          </div>
          <input type="checkbox" className="hidden" checked={mediaAnalysis} onChange={() => setMediaAnalysis(!mediaAnalysis)} />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-white group-hover:text-cyan-300 transition-colors">Media Analysis</span>
              <AlertCircle size={12} className="text-slate-400" />
            </div>
            <span className="text-xs text-slate-400">Detect deepfake images</span>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <button
        onClick={handleVerify}
        disabled={!isValid || loading}
        className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
          isValid && !loading 
            ? 'bg-gradient-to-r from-violet-600 to-cyan-500 hover:to-cyan-400 shadow-[0_0_20px_rgba(124,58,237,0.4)] text-white hover:scale-[1.01]' 
            : 'bg-white/10 text-slate-500 cursor-not-allowed'
        }`}
      >
        {loading ? (
          <>
            <Loader2 className="animate-spin" /> Processing...
          </>
        ) : (
          <>
            Verify Now <span className="text-xl">→</span>
          </>
        )}
      </button>
      
      <p className="text-center text-xs text-slate-500 mt-4">
        ~30–90 sec depending on claim count • Rate limited to 5/hr
      </p>

    </div>
  )
}
