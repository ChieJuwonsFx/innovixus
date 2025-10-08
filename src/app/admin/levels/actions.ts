'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function getLevels() {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createServerActionClient<any>({ cookies })
  
  const { data, error } = await supabase
    .from('levels')
    .select('*')
    .order('name')

  if (error) {
    console.error('Error fetching levels:', error)
    return []
  }

  return data || []
}

export async function createLevel(formData: FormData) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerActionClient<any>({ cookies })
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, message: 'Authentication failed. Please log in again.' }
    }

    const name = formData.get('name') as string
    
    if (!name || !name.trim()) {
      return { success: false, message: 'Level name is required' }
    }

    const newLevelId = crypto.randomUUID()

    const { data, error } = await supabase
      .from('levels')
      .insert({
        id: newLevelId, 
        name: name.trim()
      })
      .select() 
      .single()

    if (error) {
      console.error('Error creating level:', error)
      return { success: false, message: `Failed to create level: ${error.message}` }
    }

    revalidatePath('/admin/levels')
    
    return { 
      success: true, 
      data: data || {
        id: newLevelId,
        name: name.trim()
      }
    }
  } catch (error) {
    console.error('Create level error:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Gagal menambah level.' 
    }
  }
}

export async function updateLevel(id: string, formData: FormData) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerActionClient<any>({ cookies })
    
    const name = formData.get('name') as string
    
    if (!name || !name.trim()) {
      throw new Error('Level name is required')
    }

    const { error } = await supabase
      .from('levels')
      .update({ name: name.trim() })
      .eq('id', id)

    if (error) {
      console.error('Error updating level:', error)
      throw new Error(`Failed to update level: ${error.message}`)
    }

    revalidatePath('/admin/levels')
    return { success: true }
  } catch (error) {
    console.error('Update level error:', error)
    throw error
  }
}

export async function deleteLevel(id: string) {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const supabase = createServerActionClient<any>({ cookies })
    
    const { data: eventLevels, error: checkError } = await supabase
      .from('event_levels')
      .select('event_id')
      .eq('level_id', id)
      .limit(1)

    if (checkError) {
      console.error('Error checking level dependencies:', checkError)
      throw new Error(`Failed to check level dependencies: ${checkError.message}`)
    }

    if (eventLevels && eventLevels.length > 0) {
      throw new Error('Cannot delete level because it is used in one or more events')
    }

    const { error } = await supabase
      .from('levels')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting level:', error)
      throw new Error(`Failed to delete level: ${error.message}`)
    }

    revalidatePath('/admin/levels')
    return { success: true }
  } catch (error) {
    console.error('Delete level error:', error)
    throw error
  }
}