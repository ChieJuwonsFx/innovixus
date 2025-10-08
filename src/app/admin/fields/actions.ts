'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function getFields() {
  try {
    const supabase = createServerActionClient({ cookies })
    
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
    const supabase = createServerActionClient({ cookies })
    
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
    const supabase = createServerActionClient({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { success: false, message: 'Authentication failed. Please log in again.' }
    }
    
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
    const supabase = createServerActionClient({ cookies })
    
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
  try {
    const supabase = createServerActionClient({ cookies })
    
    const { data: eventFields, error: checkError } = await supabase
      .from('event_fields')
      .select('event_id')
      .eq('field_id', id)
      .limit(1)

    if (checkError) {
      throw new Error(`Failed to check field dependencies: ${checkError.message}`)
    }

    if (eventFields && eventFields.length > 0) {
      throw new Error('Cannot delete field because it is used in one or more events')
    }

    const { error } = await supabase
      .from('fields')
      .delete()
      .eq('id', id)

    if (error) {
      throw new Error(`Failed to delete field: ${error.message}`)
    }

    revalidatePath('/admin/fields')
    return { success: true }
  } catch (error) {
    throw error
  }
}