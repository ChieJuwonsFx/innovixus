'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import AdminPageHeader from '../components/AdminPageHeader'
import { getLevels, createLevel, updateLevel, deleteLevel } from './actions'
import toast from 'react-hot-toast'

interface Level {
  id: string
  name: string
}

export default function LevelsPage() {
  const [levels, setLevels] = useState<Level[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [newLevelName, setNewLevelName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  useEffect(() => {
    loadLevels()
  }, [])

  const loadLevels = async () => {
    try {
      setLoading(true)
      const data = await getLevels()
      setLevels(data)
    } catch (error) {
      console.error('Load levels error:', error)
      toast.error('Failed to load levels')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newLevelName.trim()) {
      toast.error('Level name is required')
      return
    }

    if (submitting) return

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('name', newLevelName.trim())
      
      await createLevel(formData)
      setNewLevelName('')
      setIsAdding(false)
      await loadLevels()
      toast.success('Level added successfully')
    } catch (error) {
      console.error('Add level error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to add level'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleEdit = (level: Level) => {
    setEditingId(level.id)
    setEditingValue(level.name)
  }

  const handleSave = async (id: string) => {
    if (!editingValue.trim()) {
      toast.error('Level name is required')
      return
    }

    if (submitting) return

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('name', editingValue.trim())
      
      await updateLevel(id, formData)
      setEditingId(null)
      setEditingValue('')
      await loadLevels()
      toast.success('Level updated successfully')
    } catch (error) {
      console.error('Update level error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to update level'
      toast.error(errorMessage)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (submitting) return

    try {
      setSubmitting(true)
      await deleteLevel(id)
      await loadLevels()
      setShowDeleteModal(null)
      toast.success('Level deleted successfully')
    } catch (error) {
      console.error('Delete level error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete level'
      toast.error(errorMessage)
      setShowDeleteModal(null)
    } finally {
      setSubmitting(false)
    }
  }

  const handleCancel = () => {
    setEditingId(null)
    setEditingValue('')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6">
        <AdminPageHeader
          title="Manajemen Level"
          buttonLabel="Tambah Level Baru"
          description='Halaman Event Admin'
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Levels ({levels.length})
              </h2>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  disabled={submitting}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Level
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {isAdding && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newLevelName}
                    onChange={(e) => setNewLevelName(e.target.value)}
                    placeholder="Enter level name (e.g., Beginner, Intermediate, Advanced)"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && !submitting && handleAdd()}
                    disabled={submitting}
                  />
                  <button
                    onClick={handleAdd}
                    disabled={submitting}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submitting ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false)
                      setNewLevelName('')
                    }}
                    disabled={submitting}
                    className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {levels.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <svg
                    className="w-16 h-16 mx-auto mb-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No levels found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Get started by creating your first level.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {levels.map((level) => (
                  <div
                    key={level.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {editingId === level.id ? (
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          onKeyPress={(e) => e.key === 'Enter' && !submitting && handleSave(level.id)}
                          disabled={submitting}
                        />
                        <button
                          onClick={() => handleSave(level.id)}
                          disabled={submitting}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {submitting ? (
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          ) : (
                            <Save className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={handleCancel}
                          disabled={submitting}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {level.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(level)}
                            disabled={submitting}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(level.id)}
                            disabled={submitting}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Delete Level
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this level? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                disabled={submitting}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                disabled={submitting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {submitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}