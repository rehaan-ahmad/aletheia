'use client'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

const AnimatedStat = ({ end, label }: { end: number, label: string }) => {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let start = 0
    const duration = 2000 // 2s
    const startTime = performance.now()

    const animate = (time: number) => {
      const elapsed = time - startTime
      const progress = Math.min(elapsed / duration, 1)
      setCount(Math.floor(progress * end))
      if (progress < 1) {
        requestAnimationFrame(animate)
      }
    }
    requestAnimationFrame(animate)
  }, [end])

  return (
    <div className="flex flex-col items-center">
      <span className="text-3xl font-bold text-white">{count}</span>
      <span className="text-xs text-slate-400 uppercase tracking-wider mt-1">{label}</span>
    </div>
  )
}

export default function HeroSection() {
  return (
    <section className="relative w-full max-w-5xl mx-auto pt-24 pb-16 px-6 text-center flex flex-col items-center">
      
      {/* Animated Orb */}
      <motion.div 
        animate={{ y: [0, -15, 0] }}
        transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        className="w-24 h-24 mb-8 rounded-full bg-gradient-to-tr from-violet-600 to-cyan-400 blur-md opacity-80"
      />

      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6">
        <span className="text-white">Every Claim. </span>
        <span className="gradient-text">Verified.</span>
      </h1>

      <p className="text-lg md:text-xl text-slate-300 max-w-2xl mx-auto mb-10 leading-relaxed group relative">
        Powered by multi-agent AI reasoning, real-time web search, and adversarial conflict resolution.
        <span className="absolute -top-10 left-1/2 -translate-x-1/2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-all bg-navy/90 border border-white/10 px-3 py-2 text-sm rounded-lg whitespace-nowrap z-50">
          <span className="font-mono text-violet-400">Ἀλήθεια (Aletheia):</span> "the state of not being hidden; truth"
        </span>
      </p>

      <div className="flex flex-wrap justify-center gap-8 md:gap-16 pt-8 border-t border-white/10 w-full max-w-3xl">
        <AnimatedStat end={10} label="Claims Analyzed Per Run" />
        <AnimatedStat end={3} label="Search Iterations Per Claim" />
        <AnimatedStat end={4} label="Verdict Classification Levels" />
      </div>

    </section>
  )
}
