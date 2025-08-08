import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import PublicNavbar from './PublicNavbar';

export type Profile = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: 'User' | 'Admin';
};

async function getServerProfile(): Promise<Profile | null> {
  try {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });
    
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      return null;
    }

    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', session.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') { 
      console.error('Error fetching user profile:', profileError);
      return {
        id: session.user.id,
        name: session.user.email!,
        email: session.user.email!,
        avatar: null,
        role: 'User'
      };
    }

    if (userProfile) {
      return {
        ...userProfile,
        email: session.user.email!
      };
    } else {
      return {
        id: session.user.id,
        name: session.user.email!,
        email: session.user.email!,
        avatar: null,
        role: 'User'
      };
    }
  } catch (error) {
    console.error('Error in getServerProfile:', error);
    return null;
  }
}

export default async function NavbarWrapper() {
  const initialProfile = await getServerProfile();
  
  return <PublicNavbar initialProfile={initialProfile} />;
}