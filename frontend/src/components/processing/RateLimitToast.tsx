'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { Hourglass } from 'lucide-react'
import { useState, useEffect } from 'react'

export default function RateLimitToast({ show }: { show: boolean }) {
  const [countdown, setCountdown] = useState(4)

  useEffect(() => {
    if (!show) {
      setCountdown(4)
      return
    }
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1))
    }, 1000)
    return () => clearInterval(interval)
  }, [show])

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
          className="fixed bottom-6 right-6 z-50 glass shadow-[0_0_30px_rgba(245,158,11,0.3)] border-amber-500/30 px-5 py-4 rounded-xl flex items-center gap-4 min-w-[320px]"
        >
          <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
             <Hourglass className="text-amber-500 animate-pulse" size={20} />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-white">API rate limit reached</span>
            <span className="text-sm text-slate-400">Resuming automatically in {countdown}s...</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
