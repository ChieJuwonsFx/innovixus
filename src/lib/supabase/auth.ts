import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';

const supabase = createClientComponentClient();

export async function signInWithEmail(email: string, password: string) {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error };
    }

    return { data, error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function signUpWithEmail(email: string, password: string, name: string) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: {
          name,
        },
      },
    });

    if (authError) {
      return { error: authError };
    }

    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          email: authData.user.email,
          name,
          role: 'User',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'email'
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
      }
    }

    return { data: authData, error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      return { error };
    }

    return { error: null };
  } catch (error) {
    return { error: error as Error };
  }
}