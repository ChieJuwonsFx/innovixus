'use client'

import { useState } from 'react'
import { Edit, Eye, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { deleteOrganizer } from '../../organizers/actions'
import toast from 'react-hot-toast'

interface Organizer {
  id: string
  name: string
  instagram: string
  created_at: string
}

interface OrganizerRowProps {
  organizer: Organizer
}

export default function OrganizerRow({ organizer }: OrganizerRowProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteOrganizer(organizer.id)
      toast.success('Organizer berhasil dihapus')
      setShowDeleteModal(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus organizer')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <tr className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <td className="px-6 py-4 whitespace-nowrap">
          <div className="text-sm font-medium text-gray-900 dark:text-white">{organizer.name}</div>
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <a 
            href={`https://instagram.com/${organizer.instagram}`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-sm text-blue-500 hover:underline"
          >
            @{organizer.instagram}
          </a>
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
          {new Date(organizer.created_at).toLocaleDateString('id-ID', {
            day: 'numeric', month: 'long', year: 'numeric'
          })}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
          <div className="flex items-center justify-end space-x-3">
            <Link href={`/admin/organizers/${organizer.id}?view=true`} title="Lihat Detail">
              <Eye className="w-5 h-5 text-gray-500 hover:text-blue-600 transition-colors" />
            </Link>
            <Link href={`/admin/organizers/${organizer.id}`} title="Edit">
              <Edit className="w-5 h-5 text-gray-500 hover:text-green-600 transition-colors" />
            </Link>
            <button onClick={() => setShowDeleteModal(true)} title="Hapus">
              <Trash2 className="w-5 h-5 text-gray-500 hover:text-red-600 transition-colors" />
            </button>
          </div>
        </td>
      </tr>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Konfirmasi Hapus
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Apakah Anda yakin ingin menghapus <strong>{organizer.name}</strong>? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg"
              >
                Batal
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center justify-center"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}