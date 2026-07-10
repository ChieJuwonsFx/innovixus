'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

function adminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
}

export async function getFields() {
  try {
    const supabase = adminClient()
    
    const { data, error } = await supabase
      .from('fields')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching fields:', error)
      throw new Error(`Failed to get fields: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Get fields error:', error)
    return []
  }
}

export async function getFieldsForCategory(kategori?: string) {
  try {
    const supabase = adminClient()
    
    let query = supabase
      .from('fields')
      .select('*')
      .order('name')

    if (kategori && kategori !== 'info-lomba') {
      query = query.eq('only_lomba', false)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching fields:', error)
      throw new Error(`Failed to get fields: ${error.message}`)
    }

    return data || []
  } catch (error) {
    console.error('Get fields error:', error)
    return []
  }
}

export async function createField(formData: FormData) {
  try {
    const supabase = adminClient()
    
    const name = formData.get('name') as string
    const only_lomba = formData.get('only_lomba') === 'true'
    
    if (!name || !name.trim()) {
      return { success: false, message: 'Field name is required' }
    }

    const newFieldId = crypto.randomUUID()
    
    const { data, error } = await supabase
      .from('fields')
      .insert({
        id: newFieldId, 
        name: name.trim(),
        only_lomba
      })
      .select() 
      .single()

    if (error) {
      console.error('Create field error:', error)
      return { success: false, message: `Failed to create field: ${error.message}` }
    }

    revalidatePath('/admin/fields')

    return { 
      success: true, 
      data: data || {
        id: newFieldId,
        name: name.trim(),
        only_lomba
      }
    }
  } catch (error) {
    console.error('Create field error:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'Gagal menambah bidang.' 
    }
  }
}

export async function updateField(id: string, formData: FormData) {
  try {
    const supabase = adminClient()
    
    const name = formData.get('name') as string
    const only_lomba = formData.get('only_lomba') === 'true'
    
    if (!name || !name.trim()) {
      throw new Error('Field name is required')
    }

    const { error } = await supabase
      .from('fields')
      .update({ 
        name: name.trim(),
        only_lomba 
      })
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to update field: ${error.message}`)
    }

    revalidatePath('/admin/fields')
    return { success: true }
  } catch (error) {
    throw error
  }
}

export async function deleteField(id: string) {
  const supabase = adminClient()
  
  const { data: eventFields, error: checkError } = await supabase
    .from('event_fields')
    .select('event_id')
    .eq('field_id', id)

  if (checkError) {
    return { success: false, message: 'Gagal memeriksa ketergantungan bidang' }
  }

  if (eventFields && eventFields.length > 0) {
    const eventIds = eventFields.map(ef => ef.event_id)
    const { data: events } = await supabase
      .from('events')
      .select('title, status')
      .in('id', eventIds)

    const eventList = (events || [])
      .slice(0, 3)
      .map(e => `${e.title} (${e.status})`)
      .join(', ')
    const suffix = (events || []).length > 3 ? `, dan ${(events || []).length - 3} lainnya` : ''
    return { success: false, message: `Bidang masih digunakan di event: ${eventList}${suffix}` }
  }

  const { error } = await supabase
    .from('fields')
    .delete()
    .eq('id', id)

  if (error) {
    return { success: false, message: `Gagal menghapus bidang: ${error.message}` }
  }

  revalidatePath('/admin/fields')
  return { success: true, message: 'Bidang berhasil dihapus' }
}