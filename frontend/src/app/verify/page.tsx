'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSSE } from '@/hooks/useSSE'
import PipelineProgress from '@/components/processing/PipelineProgress'
import LiveClaimFeed from '@/components/processing/LiveClaimFeed'
import RateLimitToast from '@/components/processing/RateLimitToast'
import { motion } from 'framer-motion'
import { useToast } from '@/components/ui/ToastProvider'

export default function VerifyPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [payload, setPayload] = useState<any>(null)
  
  const [claims, setClaims] = useState<any[]>([])
  const [currentStep, setCurrentStep] = useState('pending')
  const [statusMessage, setStatusMessage] = useState('Initializing...')
  const [progress, setProgress] = useState(0)
  const [showRateLimit, setShowRateLimit] = useState(false)

  useEffect(() => {
    const raw = sessionStorage.getItem('aletheia_verify_payload')
    if (!raw) {
      router.push('/')
      return
    }
    const p = JSON.parse(raw)
    // FastAPI verify endpoint expects text or url
    const apiPayload = {
      text: p.type === 'text' ? p.content : undefined,
      url: (p.type === 'url' || p.type === 'image') ? p.content : undefined,
      input_type: p.type,
      enable_ai_detection: p.ai,
      enable_media_detection: p.media
    }
    setPayload(apiPayload)
  }, [router])

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
  const { lastEvent, status } = useSSE(
    payload ? `${apiUrl}/api/verify/stream` : null, 
    payload
  )

  useEffect(() => {
    if (!lastEvent) return
    
    switch(lastEvent.event) {
      case 'status':
        if (lastEvent.data.step) setCurrentStep(lastEvent.data.step)
        if (lastEvent.data.message) setStatusMessage(lastEvent.data.message)
        if (lastEvent.data.progress) setProgress(lastEvent.data.progress)
        break
      case 'claim_complete':
        if (lastEvent.data.claim) {
          setClaims(prev => {
            const exists = prev.find(c => c.claim_id === lastEvent.data.claim.claim_id)
            if (exists) return prev
            return [lastEvent.data.claim, ...prev]
          })
        }
        if (lastEvent.data.progress) setProgress(lastEvent.data.progress)
        break
      case 'rate_limit_pause':
        setShowRateLimit(true)
        setTimeout(() => setShowRateLimit(false), 4000)
        break
      case 'done':
        setProgress(100)
        setCurrentStep('done')
        setStatusMessage('Complete!')
        if (lastEvent.data.report) {
          sessionStorage.setItem(`report_${lastEvent.data.report.report_id}`, JSON.stringify(lastEvent.data.report))
          setTimeout(() => {
            router.push(`/report/${lastEvent.data.report.report_id}`)
          }, 1500)
        }
        break
      case 'error':
        toast(lastEvent.data.message || 'An error occurred during verification', 'error')
        // Option to go back
        setTimeout(() => router.push('/'), 3000)
        break
    }
  }, [lastEvent, router, toast])

  if (!payload) return null

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl w-full mx-auto p-4 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-80px)]"
    >
      <div className="lg:col-span-4 h-full">
        <PipelineProgress 
          currentStep={currentStep} 
          progress={progress} 
          statusMessage={statusMessage} 
          isUrl={!!payload.url} 
        />
      </div>
      
      <div className="lg:col-span-8 h-full overflow-y-auto pr-2 custom-scrollbar">
        <LiveClaimFeed claims={claims} />
      </div>

      <RateLimitToast show={showRateLimit} />
    </motion.div>
  )
}
