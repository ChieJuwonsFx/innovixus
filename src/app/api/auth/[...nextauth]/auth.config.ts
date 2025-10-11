import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { createClient } from "@supabase/supabase-js";

interface ExtendedUser {
  id?: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
  supabaseId?: string;
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
    }),
  ],

  callbacks: {
    async signIn({ user }) {
      try {
        if (!user.email) {
          console.error("No email provided");
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

          if (dbError) {
            console.error("Error inserting to users table:", dbError);
            if (dbError.code === '23505') {
              console.log("User already exists");
            } else {
              console.error("Unhandled database error:", dbError);
            }
          } else {
            console.log("User inserted to database");
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
            console.error("⚠️ Error updating user:", updateError);
          }

          (user as ExtendedUser).supabaseId = existingUser.id;
        }
        return true;
      } catch {
        return true;
      }
    },

    async jwt({ token, user, trigger }) {
      if (user) {
        const extendedUser = user as ExtendedUser;
        token.supabaseId = extendedUser.supabaseId;
        token.email = user.email ?? undefined;
      }

      if (token.email && (!token.role || trigger === 'update')) {
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
          session.user.supabaseId = token.supabaseId as string;
        }
        if (token?.email) {
          session.user.email = token.email as string;
        }
        if (token?.role) {
          session.user.role = token.role as string;
        }
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

  debug: process.env.NODE_ENV === 'development',
};