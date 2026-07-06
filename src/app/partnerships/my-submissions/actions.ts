'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { decode } from 'next-auth/jwt';

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function cancelSubmission(partnershipId: string, eventId: string | null) {
  const supabase = adminClient();

  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get('next-auth.session-token')?.value;
  if (!tokenCookie) {
    return { success: false, message: 'Anda harus login untuk melakukan aksi ini.' };
  }
  const decoded = await decode({ token: tokenCookie, secret: process.env.NEXTAUTH_SECRET! });
  const email = decoded?.email as string | undefined;
  if (!email) {
    return { success: false, message: 'Anda harus login untuk melakukan aksi ini.' };
  }
  const { data: user } = await supabase.from('users').select('id').eq('email', email).single();
  if (!user) {
    return { success: false, message: 'Pengguna tidak ditemukan.' };
  }

  try {
    const { error: partnershipError } = await supabase
      .from('partnerships')
      .update({ payment_status: 'Canceled' })
      .eq('id', partnershipId)
      .eq('user_id', user.id);

    if (partnershipError) throw partnershipError;

    if (eventId) {
      const { error: eventError } = await supabase
        .from('events')
        .update({ status: 'Canceled' })
        .eq('id', eventId)
        .eq('user_id', user.id);

      if (eventError) throw eventError;
    }

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Gagal membatalkan pengajuan.';
    return { success: false, message };
  }

  revalidatePath('/partnerships/my-submissions');
  redirect('/partnerships/my-submissions');
}