'use server';

import { createClient } from '@/lib/supabase/server';

export async function uploadPaymentProof(partnershipId: string, proofUrl: string) {
  try {
    if (!proofUrl) {
      return { success: false, message: 'URL bukti pembayaran tidak ditemukan.' };
    }

    const supabase = await createClient();

    const { error: updateError } = await supabase
      .from('partnerships')
      .update({
        payment_proof: proofUrl,  
        payment_status: 'Unpaid',
      })
      .eq('id', partnershipId);

    if (updateError) {
      return { success: false, message: `Database error: ${updateError.message}` };
    }

    return { success: true, message: 'Bukti pembayaran berhasil dikirim.' };
  } catch (err) {
    return {
      success: false,
      message: err instanceof Error ? err.message : 'Unknown error',
    };
  }
}
