import "next-auth";
import { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    supabaseId?: string;
    role?: string;
  }

  interface Session extends DefaultSession {
    user: {
      id?: string;
      supabaseId?: string;
      role?: string;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    supabaseId?: string;
    email?: string;
    role?: string;
  }
}


