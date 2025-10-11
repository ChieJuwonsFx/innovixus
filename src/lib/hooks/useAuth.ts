import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: string;
}

export function useAuth() {
  const { data: nextAuthSession, status: nextAuthStatus } = useSession();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const supabase = createClientComponentClient();

  useEffect(() => {
    let mounted = true;

    async function loadUser() {
      try {
        const { data: { session: supabaseSession } } = await supabase.auth.getSession();
        
        if (supabaseSession?.user) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, name, avatar, role')
            .eq('email', supabaseSession.user.email)
            .single();

          if (mounted && userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name || userData.email.split('@')[0],
              avatar: userData.avatar,
              role: userData.role || 'User',
            });
            setLoading(false);
            return;
          }
        }

        if (nextAuthStatus === 'authenticated' && nextAuthSession?.user?.email) {
          const { data: userData } = await supabase
            .from('users')
            .select('id, email, name, avatar, role')
            .eq('email', nextAuthSession.user.email)
            .single();

          if (mounted && userData) {
            setUser({
              id: userData.id,
              email: userData.email,
              name: userData.name || nextAuthSession.user.name || userData.email.split('@')[0],
              avatar: userData.avatar || nextAuthSession.user.image,
              role: userData.role || 'User',
            });
          }
        } else if (nextAuthStatus === 'unauthenticated') {
          if (mounted) {
            setUser(null);
          }
        }
      } catch (error) {
        console.error('Error loading user:', error);
        if (mounted) {
          setUser(null);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    loadUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        loadUser();
      } else if (!nextAuthSession) {
        setUser(null);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [nextAuthSession, nextAuthStatus, supabase]);

  return {
    user,
    loading: loading || nextAuthStatus === 'loading',
    isAuthenticated: !!user,
    isAdmin: user?.role === 'Admin',
  };
}