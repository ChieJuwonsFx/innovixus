import { getServerSession } from 'next-auth';
import { authOptions } from "@/app/api/auth/[...nextauth]/auth.config";
import { createClient } from '@supabase/supabase-js';
import { redirect } from 'next/navigation';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export interface ServerUser {
  id: string;
  email: string;
  name: string;
  avatar?: string | null;
  role: 'User' | 'Admin';
}

export async function getCurrentUser(): Promise<ServerUser | null> {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.email) {
    return null;
  }

  try {
    const { data: userData, error } = await supabase
      .from('users')
      .select('id, email, name, avatar, role')
      .eq('email', session.user.email)
      .single();

    if (error || !userData) {
      console.error('Error fetching user:', error);
      return null;
    }

    return userData as ServerUser;
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

export async function requireAuth(): Promise<ServerUser> {
  const user = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }
  
  return user;
}

export async function requireAdmin(): Promise<ServerUser> {
  const user = await requireAuth();
  
  if (user.role !== 'Admin') {
    redirect('/unauthorized');
  }
  
  return user;
}

export async function isAuthenticated(): Promise<boolean> {
  const user = await getCurrentUser();
  return !!user;
}

export async function isAdmin(): Promise<boolean> {
  const user = await getCurrentUser();
  return user?.role === 'Admin';
}