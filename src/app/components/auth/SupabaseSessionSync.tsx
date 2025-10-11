'use client'

import { useSession } from 'next-auth/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect } from 'react'

interface ExtendedSession {
  user?: {
    email?: string | null
  }
  idToken?: string
}

export function SupabaseSessionSync() {
  const { data: session } = useSession()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function syncSession() {
      const idToken = (session as ExtendedSession)?.idToken

      if (session?.user?.email && idToken) {
        try {
          const res = await fetch('/api/supabase-session', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ idToken }),
          })

          if (!res.ok) {
            console.error('Failed to sync Supabase session:', await res.text())
            return
          }

          const { access_token, refresh_token } = await res.json()

          if (access_token && refresh_token) {
            await supabase.auth.setSession({
              access_token,
              refresh_token,
            })
          }
        } catch (err) {
          console.error('Error syncing Supabase session:', err)
        }
      }
    }
    syncSession()
  }, [session, supabase.auth])

  return null
}