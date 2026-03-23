'use client'
import { motion } from 'framer-motion'
import { FileText, Search, Shield, FileOutput, CheckCircle2, CircleDashed, Loader2 } from 'lucide-react'
import { useEffect, useRef } from 'react'
import anime from 'animejs'

type StepStatus = 'pending' | 'active' | 'done'

interface Step {
  id: string
  label: string
  icon: React.ReactNode
  status: StepStatus
  sublabel?: string
}

const SearchAnimation = ({ progress }: { progress: number }) => {
  const containerRef = useRef<HTMLDivElement>(null)
  const tlRef = useRef<any>(null)

  useEffect(() => {
    if (!containerRef.current) return
    tlRef.current = anime.timeline({
      easing: 'easeInOutExpo',
      duration: 1500,
      autoplay: false,
    })
    .add({ targets: containerRef.current.querySelector('.square'), translateX: '10rem' }, 0)
    .add({ targets: containerRef.current.querySelector('.circle'), translateX: '10rem' }, 500)
    .add({ targets: containerRef.current.querySelector('.triangle'), translateX: '10rem' }, 1000)
  }, [])

  useEffect(() => {
    if (tlRef.current) {
      // Tie animation loop heavily to the progress status dynamically
      tlRef.current.seek(tlRef.current.duration * (progress / 100))
    }
  }, [progress])

  return (
    <div ref={containerRef} className="large row mt-8 relative h-16 w-full overflow-hidden flex items-center bg-white/5 rounded-xl border border-white/5 shadow-inner">
      <div className="absolute left-6 medium pyramid flex flex-col gap-2">
        <div className="triangle border-l-[6px] border-r-[6px] border-b-[10.4px] border-transparent border-b-cyan-400"></div>
        <div className="square w-3 h-3 bg-violet-500"></div>
        <div className="circle w-3 h-3 rounded-full bg-emerald-400"></div>
      </div>
      <div className="absolute right-6 text-[10px] font-mono text-slate-500 tracking-widest uppercase">
        Neural Pipeline
      </div>
    </div>
  )
}

export default function PipelineProgress({ 
  currentStep, 
  progress, 
  statusMessage, 
  isUrl 
}: { 
  currentStep: string, 
  progress: number, 
  statusMessage: string, 
  isUrl: boolean 
}) {
  const stepsList = [
    ...(isUrl ? [{ id: 'scrape', label: 'Fetching Article', icon: <FileText size={20} /> }] : []),
    { id: 'extract', label: 'Extracting Claims', icon: <FileText size={20} /> },
    { id: 'retrieve', label: 'Searching Evidence', icon: <Search size={20} /> },
    { id: 'verify', label: 'Resolving Conflicts', icon: <Shield size={20} /> },
    { id: 'report', label: 'Building Report', icon: <FileOutput size={20} /> }
  ]

  let activeFound = false
  const activeStepId = ['extract_done'].includes(currentStep) ? 'retrieve' : currentStep
  
  const steps: Step[] = stepsList.map(step => {
    let status: StepStatus = 'pending'
    if (step.id === activeStepId) {
      status = 'active'
      activeFound = true
    } else if (!activeFound) {
      status = 'done'
    }

    return { ...step, status, sublabel: status === 'active' ? statusMessage : undefined }
  })

  if (currentStep === 'done') {
      steps.forEach(s => s.status = 'done')
  }

  return (
    <div className="w-full glass p-6 rounded-2xl flex flex-col h-full border border-white/5">
      <h3 className="text-xl font-bold mb-6 text-white tracking-tight">Processing Pipeline</h3>
      
      {/* Progress Bar */}
      <div className="relative w-full h-2 bg-white/10 rounded-full mb-8 overflow-hidden">
        <motion.div 
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-violet-500 to-cyan-400"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        />
      </div>

      <div className="flex flex-col gap-6 flex-grow">
        {steps.map((step, idx) => (
          <div key={idx} className={`flex items-start gap-4 transition-opacity duration-300 ${step.status === 'pending' ? 'opacity-40' : 'opacity-100'}`}>
            <div className="mt-0.5 relative">
              {step.status === 'done' ? (
                <CheckCircle2 className="text-emerald-500" size={24} />
              ) : step.status === 'active' ? (
                <div className="relative flex items-center justify-center">
                  <div className="absolute w-8 h-8 rounded-full bg-violet-500/20 animate-ping" />
                  <Loader2 className="text-violet-400 animate-spin" size={24} />
                </div>
              ) : (
                <CircleDashed className="text-slate-500" size={24} />
              )}
            </div>
            
            <div className="flex flex-col gap-1">
              <span className={`font-semibold ${step.status === 'active' ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]' : 'text-slate-300'}`}>
                {step.label}
              </span>
              {step.sublabel && (
                <motion.span 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="text-sm text-slate-400 max-w-[280px]"
                >
                  {step.sublabel}
                </motion.span>
              )}
            </div>
          </div>
        ))}
      </div>
      
      {/* Custom AnimeJS Timeline component tied to progress */}
      <SearchAnimation progress={progress} />
    </div>
  )
}
