'use client'

import { useSession } from 'next-auth/react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useEffect, useState } from 'react'

interface AuthUser {
  id: string
  email: string
  name?: string
  avatar?: string
  role?: string
}

export function useAuth() {
  const { data: session, status } = useSession()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadUser() {
      if (status === 'loading') {
        return
      }

      if (status === 'unauthenticated') {
        setUser(null)
        setLoading(false)
        return
      }

      if (session?.user?.email) {
        try {
          const { data: userData, error } = await supabase
            .from('users')
            .select('id, email, name, avatar, role')
            .eq('email', session.user.email)
            .single()

          if (error) {
            console.error('Error fetching user:', error)
            setUser(null)
          } else {
            setUser(userData)
          }
        } catch (error) {
          console.error('Error loading user:', error)
          setUser(null)
        }
      }

      setLoading(false)
    }

    loadUser()
  }, [session, status, supabase])

  return {
    user,
    loading: loading || status === 'loading',
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
  }
}