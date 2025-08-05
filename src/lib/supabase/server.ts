// src/lib/supabase/server.ts

import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { type Database } from '@/types/database'

export const createClient = () => {
  // Biarkan cookieStore di sini. TypeScript di proyek Anda menganggap ini adalah Promise.
  const cookieStore = cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        // PERUBAHAN 1: Jadikan fungsi 'get' menjadi 'async'
        async get(name: string) {
          // PERUBAHAN 2: 'await' cookieStore sebelum memanggil .get()
          return (await cookieStore).get(name)?.value
        },
        // PERUBAHAN 3: Jadikan fungsi 'set' menjadi 'async'
        async set(name: string, value: string, options: CookieOptions) {
          try {
            // PERUBAHAN 4: 'await' cookieStore sebelum memanggil .set()
            await (await cookieStore).set({ name, value, ...options })
          } catch (_error) { // Perbaiki juga linting error di sini
            // Error ini wajar terjadi di Server Actions, jadi kita abaikan.
          }
        },
        // PERUBAHAN 5: Jadikan fungsi 'remove' menjadi 'async'
        async remove(name: string, options: CookieOptions) {
          try {
            // PERUBAHAN 6: 'await' cookieStore sebelum memanggil .set()
            await (await cookieStore).set({ name, value: '', ...options })
          } catch (_error) { // Perbaiki juga linting error di sini
            // Sama seperti 'set'
          }
        },
      },
    }
  )
}