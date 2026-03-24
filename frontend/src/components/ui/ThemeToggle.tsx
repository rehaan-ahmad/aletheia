'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Sun, Moon } from 'lucide-react'

export default function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) {
    return <div className="w-[68px] h-[34px] glass rounded-full" />
  }

  const isLight = resolvedTheme === 'light'

  return (
    <button
      onClick={() => setTheme(isLight ? 'dark' : 'light')}
      className="relative w-[68px] h-[34px] flex items-center glass glass-hover rounded-full p-1 cursor-pointer transition-colors outline-none"
      aria-label="Toggle Theme"
    >
      <div className="absolute w-full flex justify-between items-center px-1.5 z-0 text-slate-400 left-0">
        <Moon size={14} className={isLight ? 'opacity-100' : 'opacity-0'} />
        <Sun size={14} className={isLight ? 'opacity-0' : 'opacity-100'} />
      </div>
      
      <motion.div
        className="absolute top-1 bg-white dark:bg-slate-200 w-[26px] h-[26px] rounded-full shadow-lg flex items-center justify-center z-10"
        initial={false}
        animate={{
          left: isLight ? '38px' : '4px',
        }}
        transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      >
        {isLight ? (
          <Sun size={14} className="text-amber-500" />
        ) : (
          <Moon size={14} className="text-violet-500" />
        )}
      </motion.div>
    </button>
  )
}
