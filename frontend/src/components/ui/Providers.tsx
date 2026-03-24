'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { ToastProvider as CustomToastProvider } from './ToastProvider'
import { ThemeProvider } from 'next-themes'

export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <QueryClientProvider client={queryClient}>
        <CustomToastProvider>
          {children}
        </CustomToastProvider>
      </QueryClientProvider>
    </ThemeProvider>
  )
}
