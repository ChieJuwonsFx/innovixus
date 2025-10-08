'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export async function cancelSubmission(partnershipId: string, eventId: string | null) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerActionClient<any>({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Anda harus login untuk melakukan aksi ini.' };
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