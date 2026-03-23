'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import HeroSection from '@/components/landing/HeroSection'
import InputCard from '@/components/landing/InputCard'
import ExampleCards from '@/components/landing/ExampleCards'
import TrustBadges from '@/components/landing/TrustBadges'

export default function Home() {
  const [demoText, setDemoText] = useState('')

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center w-full min-h-full pb-20"
    >
      <HeroSection />
      
      <div className="w-full px-4 flex flex-col items-center z-10">
        <InputCard defaultText={demoText} />
        <ExampleCards onSelectDemos={setDemoText} />
        <TrustBadges />
      </div>
      
    </motion.div>
  )
}
