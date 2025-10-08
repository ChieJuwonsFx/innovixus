'use client'

import { createOrganizer, updateOrganizer } from '../../organizers/actions'
import SubmitButton from '../SubmitButton'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

interface Organizer {
  id: string
  name: string
  instagram: string
  created_at: string
  updated_at: string
}

interface OrganizerFormProps {
  organizer?: Organizer
  isViewMode?: boolean
}

export default function OrganizerForm({ organizer, isViewMode = false }: OrganizerFormProps) {
  const router = useRouter()
  const isEdit = !!organizer
  const action = isEdit ? updateOrganizer.bind(null, organizer.id) : createOrganizer

  const handleSubmit = async (formData: FormData) => {
    const promise = action(formData)

    await toast.promise(promise, {
      loading: 'Menyimpan data organizer...',
      success: () => {
        router.push('/admin/organizers')
        return isEdit ? 'Organizer berhasil diperbarui' : 'Organizer berhasil dibuat'
      },
      error: (err) => {
        return err.message || 'Terjadi kesalahan, silakan coba lagi.'
      },
    })
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-6">
        {isViewMode ? 'Detail Organizer' : isEdit ? 'Edit Organizer' : 'Buat Organizer Baru'}
      </h2>
      
      <form action={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Nama Organizer *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            defaultValue={organizer?.name}
            disabled={isViewMode}
            required
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
            placeholder="Masukkan nama organizer"
          />
        </div>

        <div>
          <label htmlFor="instagram" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Instagram Handle *
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400">
              @
            </span>
            <input
              type="text"
              id="instagram"
              name="instagram"
              defaultValue={organizer?.instagram}
              disabled={isViewMode}
              required
              className="w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white disabled:opacity-50 disabled:cursor-not-allowed"
              placeholder="contoh: innovixus"
            />
          </div>
        </div>

        {organizer && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Dibuat Pada
              </label>
              <input
                type="text"
                value={new Date(organizer.created_at).toLocaleString()}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-300"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Terakhir Diperbarui
              </label>
              <input
                type="text"
                value={new Date(organizer.updated_at).toLocaleString()}
                disabled
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700 dark:text-gray-300"
              />
            </div>
          </div>
        )}

        {!isViewMode && (
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
            >
              Batal
            </button>
            <SubmitButton
                label={isEdit ? 'Update Organizer' : 'Buat Organizer'}
                loadingLabel="Menyimpan..."
            />
          </div>
        )}
      </form>
    </div>
  )
}