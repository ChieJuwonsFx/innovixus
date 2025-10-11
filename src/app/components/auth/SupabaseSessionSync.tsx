'use client'

import { useSession } from 'next-auth/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

interface ExtendedSession {
  user?: {
    email?: string | null
  }
  idToken?: string
}

export function SupabaseSessionSync() {
  const { data: session, status } = useSession()
  const supabase = createClientComponentClient()
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    async function syncSession() {
      if (status === 'loading') {
        return
      }

      if (status === 'unauthenticated' || !session?.user?.email) {
        return
      }

      const { data: { session: supabaseSession } } = await supabase.auth.getSession()
      if (supabaseSession) {
        return
      }

      if (isSyncing) {
        return
      }

      const extendedSession = session as ExtendedSession
      const idToken = extendedSession?.idToken

      if (!idToken) {
        console.error('No idToken in session. Please logout and login again.')
        return
      }

      setIsSyncing(true)

      try {
        const res = await fetch('/api/supabase-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ idToken }),
        })

        if (!res.ok) {
          console.error('Failed to sync Supabase session')
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
      } finally {
        setIsSyncing(false)
      }
    }

    syncSession()
  }, [session, status, supabase.auth, isSyncing])

  return null
}