'use client'

import { SessionProvider } from 'next-auth/react'
import { SupabaseSessionSync } from '@/app/components/auth/SupabaseSessionSync'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <SupabaseSessionSync />
      {children}
    </SessionProvider>
  )
}
