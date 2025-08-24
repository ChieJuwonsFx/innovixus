'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database' 

export async function getFields() {
  try {
    const supabase = createServerActionClient<Database>({ cookies })
    
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

export async function createField(formData: FormData) {
  try {
    const supabase = createServerActionClient<Database>({ cookies })

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      throw new Error('Authentication failed. Please log in again.')
    }
    
    const name = formData.get('name') as string
    
    if (!name || !name.trim()) {
      throw new Error('Field name is required')
    }

    const { error } = await supabase
      .from('fields')
      .insert({
        id: crypto.randomUUID(), 
        name: name.trim()
      })

    if (error) {
      console.error('Error creating field:', error)
      throw new Error(`Failed to create field: ${error.message}`)
    }

    revalidatePath('/admin/fields')
    return { success: true }
  } catch (error) {
    console.error('Create field error:', error)
    throw error
  }
}

export async function updateField(id: string, formData: FormData) {
  try {
    const supabase = createServerActionClient<Database>({ cookies })
    
    const name = formData.get('name') as string
    
    if (!name || !name.trim()) {
      throw new Error('Field name is required')
    }

    const { error } = await supabase
      .from('fields')
      .update({ name: name.trim() })
      .eq('id', id)

    if (error) {
      console.error('Error updating field:', error)
      throw new Error(`Failed to update field: ${error.message}`)
    }

    revalidatePath('/admin/fields')
    return { success: true }
  } catch (error) {
    console.error('Update field error:', error)
    throw error
  }
}

export async function deleteField(id: string) {
  try {
    const supabase = createServerActionClient<Database>({ cookies })
    
    const { data: eventFields, error: checkError } = await supabase
      .from('event_fields')
      .select('event_id')
      .eq('field_id', id)
      .limit(1)

    if (checkError) {
      console.error('Error checking field dependencies:', checkError)
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
      console.error('Error deleting field:', error)
      throw new Error(`Failed to delete field: ${error.message}`)
    }

    revalidatePath('/admin/fields')
    return { success: true }
  } catch (error) {
    console.error('Delete field error:', error)
    throw error
  }
}
