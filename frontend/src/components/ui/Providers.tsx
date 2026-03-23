'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ToastProvider as CustomToastProvider } from './ToastProvider'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <QueryClientProvider client={queryClient}>
      <CustomToastProvider>
        {children}
      </CustomToastProvider>
    </QueryClientProvider>
  )
}
