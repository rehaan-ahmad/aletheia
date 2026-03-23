'use client'
import { motion } from 'framer-motion'
import { CheckCircle, ShieldAlert, AlertTriangle } from 'lucide-react'

const DEMOS = [
  {
    type: 'factual',
    title: 'Factual Article',
    icon: <CheckCircle className="text-emerald-500 mb-3" size={32} />,
    description: 'Verify established facts and historical events.',
    text: "NASA was established on July 29, 1958. It succeeded the National Advisory Committee for Aeronautics (NACA). The agency is responsible for the civilian space program, as well as aeronautics and space research."
  },
  {
    type: 'misinfo',
    title: 'Contains Misinformation',
    icon: <ShieldAlert className="text-rose-500 mb-3" size={32} />,
    description: 'Catch common myths and fabricated statements.',
    text: "Albert Einstein failed mathematics in school and was considered a poor student. The Great Wall of China is visible from space with the naked eye. Humans only use 10% of their brains at any given time. Napoleon Bonaparte was unusually short, standing at just 5 feet 2 inches tall."
  },
  {
    type: 'conflict',
    title: 'Conflicting Evidence',
    icon: <AlertTriangle className="text-amber-500 mb-3" size={32} />,
    description: 'See how the system handles ongoing scientific debate.',
    text: "Social media usage is directly linked to increased rates of depression in teenagers. The global average temperature has risen by exactly 1.1 degrees Celsius since pre-industrial times. Drinking coffee significantly reduces the risk of developing Alzheimer's disease."
  }
]

export default function ExampleCards({ onSelectDemos }: { onSelectDemos: (text: string) => void }) {
  return (
    <div className="w-full max-w-4xl pt-8">
      <h3 className="text-center text-slate-400 text-sm font-semibold tracking-wider uppercase mb-6">Or try an example</h3>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {DEMOS.map((demo) => (
          <motion.div
            key={demo.type}
            whileHover={{ y: -5, scale: 1.02 }}
            onClick={() => onSelectDemos(demo.text)}
            className="glass glass-hover p-6 rounded-2xl cursor-pointer transition-all flex flex-col items-start border-t border-l border-white/5 shadow-lg group"
          >
            {demo.icon}
            <h4 className="font-semibold text-lg text-white mb-2">{demo.title}</h4>
            <p className="text-sm text-slate-400 mb-4 flex-grow">{demo.description}</p>
            <span className="text-sm font-semibold text-violet-400 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 mt-auto">
              Click to try →
            </span>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
