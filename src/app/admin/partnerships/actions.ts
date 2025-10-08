'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { Database } from '@/types/database';

export async function approveFreePartnership(partnershipId: string, eventId: string | null) {
  if (!eventId) {
    throw new Error("Event ID tidak ditemukan untuk partnership ini.");
  }

  const supabase = createServerActionClient<Database>({ cookies });

  const { error: eventError } = await supabase
    .from('events')
    .update({ status: 'Success' })
    .eq('id', eventId);

  const { error: partnershipError } = await supabase
    .from('partnerships')
    .update({ payment_status: 'Paid' })
    .eq('id', partnershipId);

  if (eventError || partnershipError) {
    console.error("Error approving free partnership:", eventError, partnershipError);
    return; 
  }
  
  revalidatePath('/admin/partnerships');
  revalidatePath(`/admin/partnerships/${partnershipId}`);
  redirect(`/admin/partnerships/${partnershipId}`); 
}

export async function verifyPayment(partnershipId: string) {
  const supabase = createServerActionClient<Database>({ cookies });

  const { error } = await supabase
    .from('partnerships')
    .update({ payment_status: 'Paid' }) 
    .eq('id', partnershipId);

  if (error) {
    console.error("Error verifying payment:", error);
    return;
  }

  revalidatePath('/admin/partnerships');
  revalidatePath(`/admin/partnerships/${partnershipId}`);
  redirect(`/admin/partnerships/${partnershipId}`);
}

export async function publishEvent(eventId: string | null) {
  if (!eventId) {
    throw new Error("Event ID tidak valid untuk dipublikasikan.");
  }
  
  const supabase = createServerActionClient<Database>({ cookies });

  const { error } = await supabase
    .from('events')
    .update({ status: 'Success' })
    .eq('id', eventId);

  if (error) {
    console.error("Error publishing event:", error);
    return;
  }
  
  revalidatePath('/admin/partnerships'); 
  redirect('/admin/partnerships');
}


export async function rejectPartnership(partnershipId: string, eventId: string | null) {
  const supabase = createServerActionClient<Database>({ cookies });

  if (eventId) {
    const { error: eventError } = await supabase
      .from('events')
      .update({ status: 'Canceled' })
      .eq('id', eventId);
    if (eventError) {
      console.error("Error rejecting event:", eventError);
      return;
    }
  }

  const { error: partnershipError } = await supabase
    .from('partnerships')
    .update({ payment_status: 'Canceled' })
    .eq('id', partnershipId);

  if (partnershipError) {
    console.error("Error rejecting partnership:", partnershipError);
    return;
  }

  revalidatePath('/admin/partnerships');
  revalidatePath(`/admin/partnerships/${partnershipId}`);
  redirect(`/admin/partnerships/${partnershipId}`);
}