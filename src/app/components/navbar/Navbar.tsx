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
    
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return null;
    }

    const { data: userProfile } = await supabase
      .from('users')
      .select('id, name, avatar, role')
      .eq('id', user.id)
      .single();
      
    if (userProfile) {
      return {
        ...userProfile,
        email: user.email!
      };
    }
    
    return {
      id: user.id,
      name: user.email!,
      email: user.email!,
      avatar: null,
      role: 'User' 
    };

  } catch (error) {
    console.error('Unexpected error in getServerProfile:', error);
    return null;
  }
}

export default async function NavbarWrapper() {
  const initialProfile = await getServerProfile();
  
  return <PublicNavbar initialProfile={initialProfile} />;
}