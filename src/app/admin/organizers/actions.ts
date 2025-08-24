'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

export async function createOrganizer(formData: FormData) {
  try {
    const supabase = createServerActionClient<Database>({ cookies })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Authentication failed. Please log in again.')
    }

    const name = formData.get('name') as string
    const instagram = formData.get('instagram') as string
    
    if (!name || !instagram) {
      throw new Error('Name and Instagram are required')
    }

    const { error } = await supabase
      .from('organizers')
      .insert({
        id: crypto.randomUUID(), 
        name: name.trim(),
        instagram: instagram.trim(),
        created_at: new Date().toISOString(), 
        updated_at: new Date().toISOString(), 
      })

    if (error) {
      console.error('Error creating organizer:', error)
      throw new Error(`Failed to create organizer: ${error.message}`)
    }

    revalidatePath('/admin/organizers')
  } catch (error) {
    console.error('Create organizer error:', error)
    throw error
  }
}

export async function updateOrganizer(id: string, formData: FormData) {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    const name = formData.get('name') as string
    const instagram = formData.get('instagram') as string
    
    if (!name || !instagram) {
      throw new Error('Name and Instagram are required')
    }

    const { error } = await supabase
      .from('organizers')
      .update({
        name: name.trim(),
        instagram: instagram.trim(),
      })
      .eq('id', id)

    if (error) {
      console.error('Error updating organizer:', error)
      throw new Error(`Failed to update organizer: ${error.message}`)
    }

    revalidatePath('/admin/organizers')
  } catch (error) {
    console.error('Update organizer error:', error)
    throw error
  }
}

export async function deleteOrganizer(id: string) {
  try {
    const supabase = await createServerActionClient<Database>({ cookies })
    
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
  } catch (error) {
    console.error('Delete organizer error:', error)
    throw error
  }
}

export async function getOrganizer(id: string) {
  const supabase = createServerActionClient<Database>({ cookies })
  
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
  const supabase = createServerActionClient<Database>({ cookies })
  
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
