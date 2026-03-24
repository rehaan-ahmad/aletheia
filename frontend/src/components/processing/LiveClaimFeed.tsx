'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, XCircle, AlertTriangle, HelpCircle } from 'lucide-react'
import { useEffect, useRef } from 'react'

interface Claim {
  claim_id: string
  claim_text: string
  verdict: 'True' | 'False' | 'Partially True' | 'Unverifiable'
  confidence_score: number
}

const VERDICT_STYLES = {
  'True': { color: 'text-emerald-400', bg: 'bg-emerald-500/10', bar: 'bg-emerald-500', icon: <CheckCircle2 size={16} /> },
  'False': { color: 'text-rose-400', bg: 'bg-rose-500/10', bar: 'bg-rose-500', icon: <XCircle size={16} /> },
  'Partially True': { color: 'text-amber-400', bg: 'bg-amber-500/10', bar: 'bg-amber-500', icon: <AlertTriangle size={16} /> },
  'Unverifiable': { color: 'text-slate-400', bg: 'bg-slate-500/10', bar: 'bg-slate-500', icon: <HelpCircle size={16} /> }
}

const MorphingSVG = () => {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    let animationActive = true;
    let currentAnimation: any = null;

    import('animejs').then((animejs) => {
      const { animate, svg, utils } = animejs;
      if (!svgRef.current || !animationActive) return;

      const polygons = svgRef.current.querySelectorAll('polygon');
      if (polygons.length < 2) return;
      const $path1 = polygons[0];
      const $path2 = polygons[1];

      function generatePoints() {
        const total = utils.random(4, 20);
        const r1 = utils.random(4, 24);
        const r2 = 24;
        const isOdd = (n: number) => n % 2;
        let points = '';
        for (let i = 0, l = isOdd(total) ? total + 1 : total; i < l; i++) {
          const r = isOdd(i) ? r1 : r2;
          const a = (2 * Math.PI * i / l) - Math.PI / 2;
          const x = 28 + utils.round(r * Math.cos(a), 0);
          const y = 28 + utils.round(r * Math.sin(a), 0);
          points += `${x},${y} `;
        }
        return points;
      }

      // Initialize points immediately so Anime doesn't read empty paths
      const startPoints = generatePoints();
      $path1.setAttribute('points', startPoints);
      $path2.setAttribute('points', startPoints);

      function animateRandomPoints() {
        if (!animationActive) return;
        utils.set($path2, { points: generatePoints() });
        currentAnimation = animate($path1, {
          points: svg.morphTo($path2),
          ease: 'inOutCirc',
          duration: 1000,
          onComplete: animateRandomPoints
        });
      }

      animateRandomPoints();
    });

    return () => {
      animationActive = false;
      if (currentAnimation && typeof currentAnimation.pause === 'function') {
        currentAnimation.pause();
      }
    }
  }, [])

  return (
    <div className="w-14 h-14 shrink-0 flex items-center justify-center opacity-80 pointer-events-none">
      <svg ref={svgRef} width="56" height="56" viewBox="0 0 56 56" className="w-full h-full fill-cyan-400/50 mix-blend-screen drop-shadow-[0_0_8px_rgba(34,211,238,0.5)]">
        <polygon />
        <polygon className="hidden" />
      </svg>
    </div>
  )
}

export default function LiveClaimFeed({ claims }: { claims: Claim[] }) {
  return (
    <div className="flex flex-col gap-4 w-full h-full pb-10">
      <h3 className="text-xl font-bold mb-2 text-white tracking-tight">Live Claim Feed</h3>
      
      <AnimatePresence mode="popLayout">
        {claims.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="text-slate-500 text-sm italic mt-10 text-center"
          >
            Extracting claims, please wait...
          </motion.div>
        ) : (
          claims.map((claim, idx) => {
            const style = VERDICT_STYLES[claim.verdict]
            
            return (
              <motion.div
                key={claim.claim_id}
                layout
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: idx * 0.1, type: "spring", stiffness: 300, damping: 25 }}
                className="w-full glass p-5 rounded-xl border-l-[4px] shadow-lg flex flex-col gap-3"
                style={{ borderLeftColor: `var(--color-${style.color.split('-')[1]}-500, currentColor)` }}
              >
                <div className="flex items-center gap-4">
                  <MorphingSVG />
                  <p className="text-white text-md font-medium leading-relaxed flex-1">
                    "{claim.claim_text.length > 80 ? claim.claim_text.substring(0, 80) + '...' : claim.claim_text}"
                  </p>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-2 border-t border-white/5">
                  <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${style.bg} ${style.color} uppercase tracking-wider`}>
                    {style.icon} {claim.verdict}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-mono">{Math.round(claim.confidence_score * 100)}%</span>
                    <div className="w-24 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${claim.confidence_score * 100}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={`h-full ${style.bar}`}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })
        )}
      </AnimatePresence>
    </div>
  )
}
