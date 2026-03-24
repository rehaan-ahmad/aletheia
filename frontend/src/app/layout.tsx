import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import Providers from '@/components/ui/Providers'
import Link from 'next/link'
import ThemeToggle from '@/components/ui/ThemeToggle'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const jetbrainsMono = JetBrains_Mono({ subsets: ['latin'], variable: '--font-jetbrains' })

export const metadata: Metadata = {
  title: 'Aletheia — Truth, Verified',
  description: 'AI-Driven Fact-Check & Claim Verification System',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="min-h-screen flex flex-col relative overflow-x-hidden antialiased text-white bg-navy">
        {/* Animated Background Orb */}
        <div className="fixed inset-0 z-0 pointer-events-none flex justify-center overflow-hidden">
          <div className="absolute top-[-20%] w-[800px] h-[600px] bg-aletheia-hero blur-3xl opacity-50 animate-pulse-slow rounded-full mix-blend-screen" />
        </div>

        <Providers>
          {/* Navigation */}
          <nav className="relative z-40 w-full glass border-b border-white/10 px-6 py-4 flex justify-between items-center">
            <Link href="/" className="flex items-center gap-2 group">
              <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-violet-500 to-cyan-400 glow-violet">
                Α✓
              </span>
              <span className="text-lg font-semibold tracking-wide text-white group-hover:text-violet-300 transition-colors">
                Aletheia
              </span>
            </Link>
            <div className="flex gap-6 items-center text-sm font-medium text-slate-300">
              <Link href="/" className="hover:text-white transition-colors">Home</Link>
              <Link href="/history" className="hover:text-white transition-colors">History</Link>
              <a href="https://github.com/rehaan-ahmad/aletheia" target="_blank" rel="noreferrer" className="hover:text-white transition-colors">GitHub</a>
              <div className="w-[1px] h-4 bg-slate-300/30 mx-1"></div>
              <ThemeToggle />
            </div>
          </nav>

          <main className="relative z-10 flex-1 flex flex-col overflow-y-auto">
            {children}
          </main>
        </Providers>
      </body>
    </html>
  )
}
