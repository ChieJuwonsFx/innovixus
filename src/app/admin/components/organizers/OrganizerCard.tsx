'use client'

import { useState } from 'react'
import { MoreVertical, Edit, Eye, Trash2, Instagram } from 'lucide-react'
import Link from 'next/link'
import { deleteOrganizer } from '../../organizers/actions'
import toast from 'react-hot-toast'

interface Organizer {
  id: string
  name: string
  instagram: string
  created_at: string
  updated_at: string
}

interface OrganizerCardProps {
  organizer: Organizer
}

export default function OrganizerCard({ organizer }: OrganizerCardProps) {
  const [showDropdown, setShowDropdown] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      await deleteOrganizer(organizer.id)
      toast.success('Organizer deleted successfully')
      setShowDeleteModal(false)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete organizer')
    } finally {
      setIsDeleting(false)
    }
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 relative">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {organizer.name}
            </h3>
            <div className="flex items-center text-gray-600 dark:text-gray-400 mb-2">
              <Instagram className="w-4 h-4 mr-2" />
              <span className="text-sm">{organizer.instagram}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Created: {new Date(organizer.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="relative">
            <button
              onClick={() => setShowDropdown(!showDropdown)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <MoreVertical className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </button>
            
            {showDropdown && (
              <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
                <Link
                  href={`/admin/organizers/${organizer.id}?view=true`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowDropdown(false)}
                >
                  <Eye className="w-4 h-4 mr-3" />
                  View Details
                </Link>
                <Link
                  href={`/admin/organizers/${organizer.id}`}
                  className="flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                  onClick={() => setShowDropdown(false)}
                >
                  <Edit className="w-4 h-4 mr-3" />
                  Edit
                </Link>
                <button
                  onClick={() => {
                    setShowDeleteModal(true)
                    setShowDropdown(false)
                  }}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <Trash2 className="w-4 h-4 mr-3" />
                  Delete
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Organizer
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete {organizer.name}? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {isDeleting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}