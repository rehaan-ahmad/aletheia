'use client'
import { motion } from 'framer-motion'
import { Search } from 'lucide-react'

export type SortOption = 'Order in Text' | 'Confidence High→Low' | 'Confidence Low→High'

export default function FilterControls({
  filter, setFilter,
  sort, setSort,
  search, setSearch,
  counts
}: {
  filter: string, setFilter: (val: string) => void,
  sort: SortOption, setSort: (val: SortOption) => void,
  search: string, setSearch: (val: string) => void,
  counts: Record<string, number>
}) {
  const filters = ['All', 'True', 'False', 'Partially True', 'Unverifiable']

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex flex-wrap items-center gap-2">
        {filters.map(f => {
          const count = f === 'All' ? Object.values(counts).reduce((a,b)=>a+b,0) : counts[f] || 0
          return (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all border ${
                filter === f 
                  ? 'bg-violet-600 text-white border-violet-500 shadow-[0_0_15px_rgba(124,58,237,0.4)]' 
                  : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10 hover:text-white'
              }`}
            >
              {f} ({count})
            </button>
          )
        })}
      </div>

      <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="Search claims..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
        </div>

        <select 
          value={sort}
          onChange={(e) => setSort(e.target.value as SortOption)}
          className="w-full md:w-auto bg-white/5 border border-white/10 rounded-xl py-2.5 px-4 text-white focus:outline-none focus:ring-2 focus:ring-violet-500/50 appearance-none [&>option]:bg-navy [&>option]:text-white"
        >
          <option value="Order in Text">Sort: Order in Text</option>
          <option value="Confidence High→Low">Sort: Confidence High→Low</option>
          <option value="Confidence Low→High">Sort: Confidence Low→High</option>
        </select>
      </div>
    </div>
  )
}
