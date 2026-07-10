'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function createOrganizer(formData: FormData) {
  try {
    const supabase = adminClient()
    
    const name = formData.get('name') as string
    const instagram = formData.get('instagram') as string
    
    if (!name) {
      throw new Error('Nama organizer wajib diisi')
    }

    const { error } = await supabase
      .from('organizers')
      .insert({
        id: crypto.randomUUID(), 
        name: name.trim(),
        instagram: instagram?.trim() || null,
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString(), 
      })

    if (error) {
      console.error('Error creating organizer:', error)
      throw new Error(`Gagal membuat organizer: ${error.message}`)
    }

    revalidatePath('/admin/organizers')
    revalidatePath('/admin/events')
  } catch (error) {
    console.error('Create organizer error:', error)
    throw error
  }
}

export async function updateOrganizer(id: string, formData: FormData) {
  try {
    const supabase = adminClient()

    const name = formData.get('name') as string
    const instagram = formData.get('instagram') as string
    
    if (!name) {
      throw new Error('Nama organizer wajib diisi')
    }

    const { error } = await supabase
      .from('organizers')
      .update({
        name: name.trim(),
        instagram: instagram?.trim() || null,
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating organizer:', error)
      throw new Error(`Gagal memperbarui organizer: ${error.message}`)
    }

    revalidatePath('/admin/organizers')
    revalidatePath('/admin/events')
  } catch (error) {
    console.error('Update organizer error:', error)
    throw error
  }
}

export async function deleteOrganizer(id: string) {
  try {
    const supabase = adminClient()
    
    const { data: events, error: checkError } = await supabase
      .from('events')
      .select('id')
      .eq('organizer_id', id)
      .limit(1)

    if (checkError) {
      console.error('Error checking organizer dependencies:', checkError)
      throw new Error(`Failed to check organizer dependencies: ${checkError.message}`)
    }

    if (events && events.length > 0) {
      throw new Error('Cannot delete organizer because it is used in one or more events')
    }

    const { error } = await supabase
      .from('organizers')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting organizer:', error)
      throw new Error(`Failed to delete organizer: ${error.message}`)
    }

    revalidatePath('/admin/organizers')
    revalidatePath('/admin/events')
  } catch (error) {
    console.error('Delete organizer error:', error)
    throw error
  }
}

export async function quickCreateOrganizer(name: string, instagram: string | null) {
  const supabase = adminClient()

  if (!name) {
    throw new Error('Nama wajib diisi')
  }

  const id = crypto.randomUUID()
  const { error } = await supabase
    .from('organizers')
    .insert({ id, name: name.trim(), instagram: instagram?.trim() || null, created_at: new Date().toISOString(), updated_at: new Date().toISOString() })

  if (error) throw new Error(`Gagal membuat organizer: ${error.message}`)

  revalidatePath('/admin/organizers')
  revalidatePath('/admin/events')
  return { id, name: name.trim(), instagram: instagram?.trim() || null }
}

export async function getOrganizer(id: string) {
  const supabase = adminClient()
  
  const { data, error } = await supabase
    .from('organizers')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    console.error(`Error fetching organizer with id ${id}:`, error)
    return null
  }

  return data
}

export async function getOrganizers() {
  const supabase = adminClient()
  
  const { data, error } = await supabase
    .from('organizers')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching organizers:', error)
    return []
  }

  return data || []
}