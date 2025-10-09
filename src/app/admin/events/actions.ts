'use server';

import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { revalidatePath } from 'next/cache';
import { deleteMultipleCloudinaryImages } from '@/lib/cloudinary.action'; 
export type FormState = {
  success: boolean;
  message: string;
} | null;

type PosterData = {
  id?: string;
  url: string;
  [key: string]: unknown;
}[];

interface EventCreateData {
  title: string;
  caption: string;
  poster: PosterData; 
  guidelink: string;
  registerlink: string;
  open_date: string;
  close_date: string | null;
  extend_date?: string | null;
  kategori: 'Info Lomba' | 'Info Magang' | 'Info Loker';
  is_online: 'Online' | 'Offline' | 'Online & Offline';
  location: string;
  is_free: boolean;
  status?: 'Pending' | 'Success' | 'Canceled';
  organizer_id: string;
  user_id: string;
  partnership_id?: string | null;
}

interface EventUpdateData {
  title: string;
  caption: string;
  poster: PosterData;
  guidelink: string;
  registerlink: string;
  open_date: string;
  close_date: string | null;
  extend_date?: string | null;
  kategori: 'Info Lomba' | 'Info Magang' | 'Info Loker';
  is_online: 'Online' | 'Offline' | 'Online & Offline';
  location: string;
  is_free: boolean;
  status?: 'Pending' | 'Success' | 'Canceled';
  organizer_id: string;
  partnership_id?: string | null;
}

export async function createEvent(prevState: FormState, formData: FormData): Promise<FormState> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerActionClient<any>({ cookies });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { success: false, message: 'Otentikasi gagal. Silakan login kembali.' };
  }

  const posterJsonString = formData.get('poster_json') as string;

  const eventData: EventCreateData = {
    title: formData.get('title') as string,
    caption: formData.get('caption') as string,
    guidelink: formData.get('guidelink') as string,
    registerlink: formData.get('registerlink') as string,
    open_date: formData.get('open_date') as string,
    close_date: (formData.get('close_date') as string) || null,
    kategori: formData.get('kategori') as 'Info Lomba' | 'Info Magang' | 'Info Loker',
    is_online: formData.get('is_online') as 'Online' | 'Offline' | 'Online & Offline',
    location: formData.get('location') as string,
    is_free: formData.get('is_free') === 'true',
    organizer_id: formData.get('organizer_id') as string,
    poster: JSON.parse(posterJsonString || '[]') as PosterData,
    user_id: user.id,
    status: formData.get('status') as 'Pending' | 'Success' | 'Canceled',
  };

  if (!eventData.title || !eventData.kategori || !eventData.organizer_id) {
    return { success: false, message: 'Judul, Kategori, dan Penyelenggara wajib diisi.' };
  }

  const { data: newEvent, error: eventError } = await supabase
    .from('events')
    .insert(eventData)
    .select('id')
    .single();

  if (eventError || !newEvent) {
    console.error('Error creating event:', eventError);
    return { success: false, message: `Gagal menyimpan ke database: ${eventError?.message}` };
  }

  const levelIds = formData.getAll('level_ids') as string[];
  const fieldIds = formData.getAll('field_ids') as string[];

  if (levelIds.length > 0) {
    await supabase.from('event_levels').insert(levelIds.map(id => ({ event_id: newEvent.id, level_id: id })));
  }
  if (fieldIds.length > 0) {
    await supabase.from('event_fields').insert(fieldIds.map(id => ({ event_id: newEvent.id, field_id: id })));
  }

  revalidatePath('/admin/events');
  if (eventData.kategori) {
    revalidatePath(`/${eventData.kategori.replace(/\s+/g, '-').toLowerCase()}`);
  }

  return { success: true, message: 'Event berhasil dibuat!' };
}

export async function updateEvent(id: string, prevState: FormState, formData: FormData): Promise<FormState> {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerActionClient<any>({ cookies });

  const posterJsonString = formData.get('poster_json') as string;

  const eventData: EventUpdateData = {
    title: formData.get('title') as string,
    caption: formData.get('caption') as string,
    guidelink: formData.get('guidelink') as string,
    registerlink: formData.get('registerlink') as string,
    open_date: formData.get('open_date') as string,
    close_date: (formData.get('close_date') as string) || null,
    kategori: formData.get('kategori') as 'Info Lomba' | 'Info Magang' | 'Info Loker',
    is_online: formData.get('is_online') as 'Online' | 'Offline' | 'Online & Offline',
    location: formData.get('location') as string,
    is_free: formData.get('is_free') === 'true',
    organizer_id: formData.get('organizer_id') as string,
    poster: JSON.parse(posterJsonString || '[]') as PosterData,
    status: formData.get('status') as 'Pending' | 'Success' | 'Canceled',
  };

  const { error: updateError } = await supabase
    .from('events')
    .update(eventData)
    .eq('id', id);

  if (updateError) {
    console.error('Error updating event:', updateError);
    return { success: false, message: `Gagal memperbarui data: ${updateError.message}` };
  }

  await supabase.from('event_levels').delete().eq('event_id', id);
  await supabase.from('event_fields').delete().eq('event_id', id);

  const levelIds = formData.getAll('level_ids') as string[];
  const fieldIds = formData.getAll('field_ids') as string[];

  if (levelIds.length > 0) {
    await supabase.from('event_levels').insert(levelIds.map(levelId => ({ event_id: id, level_id: levelId })));
  }
  if (fieldIds.length > 0) {
    await supabase.from('event_fields').insert(fieldIds.map(fieldId => ({ event_id: id, field_id: fieldId })));
  }

  revalidatePath('/admin/events');
  revalidatePath(`/admin/events/${id}`);
  if (eventData.kategori) {
    revalidatePath(`/${eventData.kategori.replace(/\s+/g, '-').toLowerCase()}`);
  }

  return { success: true, message: 'Event berhasil diperbarui!' };
}

export async function deleteEvent(id: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerActionClient<any>({ cookies });
  
  const { data: event, error: fetchError } = await supabase
    .from('events')
    .select('poster, kategori')
    .eq('id', id)
    .single();

  if (fetchError) {
    console.error('Error fetching event:', fetchError);
    return;
  }

  if (event?.poster && Array.isArray(event.poster)) {
    const imageUrls = event.poster.map((p: { url: string }) => p.url).filter(Boolean);
    
    if (imageUrls.length > 0) {
      console.log('Deleting images from Cloudinary:', imageUrls);
      await deleteMultipleCloudinaryImages(imageUrls);
    }
  }

  const { error } = await supabase.from('events').delete().eq('id', id);

  if (error) {
    console.error('Error deleting event:', error);
    return;
  }

  revalidatePath('/admin/events');
  if (event?.kategori) {
    revalidatePath(`/${event.kategori.replace(/\s+/g, '-').toLowerCase()}`);
  }
}