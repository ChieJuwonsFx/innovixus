import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

export interface SignUpData {
  email: string;
  password: string;
  name: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'User' | 'Admin';
  avatar?: string;
  created_at: string;
  updated_at: string;
}

const supabase = createClientComponentClient();

async function createUserProfile(userId: string, email: string, name: string, avatar?: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .insert({
        id: userId,
        name: name,
        email: email,
        avatar: avatar,
        role: 'User'
      })
      .select()
      .single();

    if (error && error.code !== '23505') { 
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating user profile:', error);
    return { data: null, error };
  }
}

async function checkUserProfile(userId: string) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    return { exists: !!data, error };
  } catch (error) {
    return { exists: false, error };
  }
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name,
          full_name: name,
        },
      },
    });

    if (error) throw error;

    if (data.user && data.user.email_confirmed_at) {
      const { exists } = await checkUserProfile(data.user.id);
      if (!exists) {
        console.log('Creating user profile manually after sign up...');
        await createUserProfile(data.user.id, email, name);
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Sign up error:', error);
    return { data: null, error };
  }
}

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      const { exists } = await checkUserProfile(data.user.id);
      if (!exists) {
        console.log('User profile missing after sign in, creating...');
        const name = data.user.user_metadata?.name || email.split('@')[0];
        const avatar = data.user.user_metadata?.avatar_url;
        await createUserProfile(data.user.id, email, name, avatar);
      }
    }

    return { data, error: null };
  } catch (error) {
    console.error('Sign in error:', error);
    return { data: null, error };
  }
}

export async function signInWithGoogle() {
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${location.origin}/auth/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Google sign in error:', error);
    return { data: null, error };
  }
}


export async function signOut() {
  try {
    await supabase.auth.signOut();
    return { error: null };
  } catch (error) {
    console.error('Sign out error:', error);
    return { error };
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${location.origin}/auth/reset-password`,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Reset password error:', error);
    return { error };
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Update password error:', error);
    return { error };
  }
}

export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      return null;
    }

    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileError) {
      if (profileError.code === 'PGRST116') {
        console.log('User profile not found for current user, creating...');
        const name = user.user_metadata?.name || user.email?.split('@')[0] || 'User';
        const avatar = user.user_metadata?.avatar_url;
        const { data: newProfile } = await createUserProfile(user.id, user.email!, name, avatar);
        return newProfile as User; 
      }
      
      console.error('Error fetching user profile:', profileError);
      return null;
    }

    return profile;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function updateUserProfile(updates: Partial<User>) {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('users')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Update profile error:', error);
    return { data: null, error };
  }
}

export function useAuthStateChange() {
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session?.user) {
      const { exists } = await checkUserProfile(session.user.id);
      
      if (!exists) {
        console.log('Auth state change detected missing profile, creating...');
        const name = session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User';
        const avatar = session.user.user_metadata?.avatar_url;
        await createUserProfile(session.user.id, session.user.email!, name, avatar);
      }
    }
  });
}