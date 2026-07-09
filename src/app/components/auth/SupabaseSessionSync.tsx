'use client'

import { useSession } from 'next-auth/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useRef } from 'react'

export function SupabaseSessionSync() {
  const { data: session, status } = useSession()
  const supabase = createClientComponentClient()
  const synced = useRef(false)

  useEffect(() => {
    if (status === 'loading') return
    if (status === 'unauthenticated' || !session?.user?.email) return
    if (synced.current) return

    supabase.auth.getSession().then(({ data: { session: supabaseSession } }) => {
      if (supabaseSession) {
        synced.current = true
        return
      }

      fetch('/api/supabase-session', { method: 'POST' })
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.access_token && data?.refresh_token) {
            return supabase.auth.setSession({
              access_token: data.access_token,
              refresh_token: data.refresh_token,
            })
          }
        })
        .then(() => { synced.current = true })
        .catch(() => { synced.current = true })
    })
  }, [session, status, supabase.auth])

  return null
}