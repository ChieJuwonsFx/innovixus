'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getLevels() {
  const supabase = adminClient()
  
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
    const supabase = adminClient()
    
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
    const supabase = adminClient()
    
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
  const supabase = adminClient()
  
  const { data: eventLevels, error: checkError } = await supabase
    .from('event_levels')
    .select('event_id')
    .eq('level_id', id)

  if (checkError) {
    console.error('Error checking level dependencies:', checkError)
    return { success: false, message: 'Gagal memeriksa ketergantungan level' }
  }

  if (eventLevels && eventLevels.length > 0) {
    const eventIds = eventLevels.map(el => el.event_id)
    const { data: events } = await supabase
      .from('events')
      .select('title, status')
      .in('id', eventIds)

    const eventList = (events || [])
      .slice(0, 3)
      .map(e => `${e.title} (${e.status})`)
      .join(', ')
    const suffix = (events || []).length > 3 ? `, dan ${(events || []).length - 3} lainnya` : ''
    return { success: false, message: `Level masih digunakan di event: ${eventList}${suffix}` }
  }

  const { error } = await supabase
    .from('levels')
    .delete()
    .eq('id', id)

  if (error) {
    console.error('Error deleting level:', error)
    return { success: false, message: `Gagal menghapus level: ${error.message}` }
  }

  revalidatePath('/admin/levels')
  return { success: true, message: 'Level berhasil dihapus' }
}