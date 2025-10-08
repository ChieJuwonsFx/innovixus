'use server'

import { createServerActionClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { Database } from '@/types/database'

interface ActionResponse {
  success: boolean;
  message: string;
}

export async function createPackage(formData: FormData): Promise<ActionResponse> {
  const supabase = createServerActionClient<Database>({ cookies })

  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseInt(formData.get('price') as string) || 0
  const is_active = formData.get('is_active') === 'on';

  if (!name || !description) {
    return { success: false, message: 'Name and description are required.' };
  }

  const { error } = await supabase
    .from('packages')
    .insert({ name, description, price, is_active });

  if (error) {
    return { success: false, message: `Failed to create package: ${error.message}` };
  }

  revalidatePath('/admin/packages')
  return { success: true, message: 'Package created successfully!' };
}

export async function updatePackage(formData: FormData): Promise<ActionResponse> {
  const supabase = createServerActionClient<Database>({ cookies })

  const id = formData.get('id') as string
  const name = formData.get('name') as string
  const description = formData.get('description') as string
  const price = parseInt(formData.get('price') as string) || 0
  const is_active = formData.get('is_active') === 'on';

  if (!id || !name || !description) {
    return { success: false, message: 'ID, name, and description are required.' };
  }

  const { error } = await supabase
    .from('packages')
    .update({ name, description, price, is_active, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) {
    return { success: false, message: `Failed to update package: ${error.message}` };
  }

  revalidatePath('/admin/packages')
  return { success: true, message: 'Package updated successfully!' };
}

export async function deletePackage(formData: FormData) {
  const supabase = createServerActionClient<Database>({ cookies })
  const id = formData.get('id') as string

  if (!id) {
    throw new Error('Package ID is required')
  }

  const { data: partnerships, error: checkError } = await supabase
    .from('partnerships')
    .select('id')
    .eq('package_id', id)
    .limit(1)

  if (checkError) {
    throw new Error(checkError.message)
  }

  if (partnerships && partnerships.length > 0) {
    const { error: updateError } = await supabase
      .from('packages')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)

    if (updateError) {
      throw new Error(updateError.message)
    }
  } else {
    const { error: deleteError } = await supabase
      .from('packages')
      .delete()
      .eq('id', id)

    if (deleteError) {
      throw new Error(deleteError.message)
    }
  }

  revalidatePath('/admin/packages')
}

export async function togglePackageStatus(formData: FormData) {
  const supabase = createServerActionClient<Database>({ cookies })

  const id = formData.get('id') as string
  const currentStatus = formData.get('currentStatus') === 'true'

  if (!id) {
    throw new Error('Package ID is required')
  }

  const { error } = await supabase
    .from('packages')
    .update({
      is_active: !currentStatus,
      updated_at: new Date().toISOString()
    })
    .eq('id', id)

  if (error) {
    throw new Error(error.message)
  }

  revalidatePath('/admin/packages')
}