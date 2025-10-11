import { NextAuthOptions } from "next-auth";
import { Session } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

interface ExtendedUser {
  id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  supabaseId?: string;
}

interface ExtendedSession extends Session {
  idToken?: string;
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          prompt: "consent",
          access_type: "offline",
          response_type: "code"
        }
      }
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      try {
        if (!user.email) {
          return false;
        }

        const { data: existingUser, error: selectError } = await supabase
          .from("users")
          .select("id, email")
          .eq("email", user.email)
          .maybeSingle();

        if (selectError) {
          console.error("Error checking existing user:", selectError);
        }

        if (!existingUser) {
          const { data: authData, error: authError } = await supabase.auth.admin.createUser({
            email: user.email,
            email_confirm: true,
            user_metadata: {
              name: user.name,
              avatar: user.image,
              provider: "google",
            },
          });

          if (authError) {
            console.error("Error creating Supabase auth user:", authError);
          }

          const supabaseUserId = authData?.user?.id || crypto.randomUUID();

          const { error: dbError } = await supabase
            .from("users")
            .insert({
              id: supabaseUserId,
              email: user.email,
              name: user.name || user.email.split('@')[0],
              avatar: user.image,
              role: "User",
            });

          if (dbError && dbError.code !== '23505') {
            console.error("Database error:", dbError);
          }

          (user as ExtendedUser).supabaseId = supabaseUserId;
        } else {
          const { error: updateError } = await supabase
            .from("users")
            .update({
              name: user.name,
              avatar: user.image,
              updated_at: new Date().toISOString(),
            })
            .eq("email", user.email);

          if (updateError) {
            console.error("Error updating user:", updateError);
          }

          (user as ExtendedUser).supabaseId = existingUser.id;
        }
        return true;
      } catch {
        return true;
      }
    },

    async jwt({ token, user, account }) {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.supabaseId = extendedUser.supabaseId;
        token.email = user.email ?? undefined;
      }

      if (account?.id_token) {
        token.idToken = account.id_token;
      }

      if (token.email) {
        const { data: userData } = await supabase
          .from('users')
          .select('role')
          .eq('email', token.email as string)
          .single();

        if (userData) {
          token.role = userData.role;
        }
      }

      return token;
    },

    async session({ session, token }) {
      if (session.user) {
        if (token?.supabaseId) {
          (session.user as { supabaseId?: string }).supabaseId = token.supabaseId as string;
        }
        if (token?.email) {
          session.user.email = token.email as string;
        }
        if (token?.role) {
          (session.user as { role?: string }).role = token.role as string;
        }
      }
      
      if (token?.idToken) {
        (session as ExtendedSession).idToken = token.idToken as string;
      }
      
      return session;
    },
  },

  pages: {
    signIn: '/login',
    error: '/login',
  },

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60,
  },

  debug: false,
};