'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

type OrganizerData = {
  name: string;
  instagram: string;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type EventData = any;

interface FullPartnershipData {
  packageId: string;
  organizerId: string;
  eventData: EventData;
}

export async function checkAndCreateOrganizer(data: OrganizerData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerActionClient<any>({ cookies });

  const { data: existing, error } = await supabase
    .from('organizers')
    .select('*')
    .or(`name.eq.${data.name},instagram.eq.${data.instagram}`)
    .limit(1);

  if (error) {
    return { status: 'error', message: error.message, data: null };
  }

  if (existing && existing.length > 0) {
    const org = existing[0];
    if (org.name === data.name && org.instagram === data.instagram) {
      return { status: 'exact_match', data: org };
    }
    return { status: 'partial_match', data: org };
  }

  const { data: newOrg, error: insertError } = await supabase
    .from('organizers')
    .insert(data)
    .select('*')
    .single();
  
  if (insertError) {
    return { status: 'error', message: insertError.message, data: null };
  }

  return { status: 'created', data: newOrg };
}

export async function submitFullPartnership(data: FullPartnershipData) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerActionClient<any>({ cookies });
  
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: "Otentikasi gagal. Silakan login kembali." };
  }

  const { data: packageData, error: packageError } = await supabase
    .from('packages')
    .select('price')
    .eq('id', data.packageId)
    .single();

  if (packageError) {
    console.error('Supabase package fetch error:', packageError.message);
    return { success: false, message: `Gagal memverifikasi paket: ${packageError.message}` };
  }
  if (!packageData) {
    return { success: false, message: "Paket sponsorship yang dipilih tidak valid atau tidak ditemukan." };
  }

  const paymentStatus = packageData.price === 0 ? 'Paid' : 'Unpaid';

  const { data: newEvent, error: eventError } = await supabase
    .from('events')
    .insert({
      ...data.eventData,
      organizer_id: data.organizerId,
      user_id: user.id,
      status: 'Pending', 
    })
    .select('id')
    .single();

  if (eventError) {
    console.error('Supabase event insert error:', eventError.message);
    return { success: false, message: `Gagal membuat data event: ${eventError.message}` };
  }
  
  const { error: partnershipError } = await supabase
    .from('partnerships')
    .insert({
      package_id: data.packageId,
      user_id: user.id,
      event_id: newEvent.id,
      contact_person: user.email || '', 
      payment_status: paymentStatus,   
    });

  if (partnershipError) {
    console.error('Supabase partnership insert error:', partnershipError.message);
    return { success: false, message: `Gagal mengajukan partnership: ${partnershipError.message}` };
  }
  
  return { success: true, message: 'Partnership Anda telah berhasil diajukan!' };
}