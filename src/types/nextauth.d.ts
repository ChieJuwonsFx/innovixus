import "next-auth"
import { DefaultSession } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      supabaseId?: string
      email: string
      role?: string
    } & DefaultSession["user"]
    idToken?: string
  }

  interface User {
    supabaseId?: string
    role?: string
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    supabaseId?: string
    role?: string
    idToken?: string
  }
}