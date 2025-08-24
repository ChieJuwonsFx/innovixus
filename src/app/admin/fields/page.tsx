'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import AdminPageHeader from '../components/AdminPageHeader'
import { getFields, createField, updateField, deleteField } from './actions'
import toast from 'react-hot-toast'


interface Field {
  id: string
  name: string
}

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [newFieldName, setNewFieldName] = useState('')
  const [isAdding, setIsAdding] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  useEffect(() => {
    loadFields()
  }, [])

  const loadFields = async () => {
    try {
      const data = await getFields()
      setFields(data)
    } catch (error) {
      toast.error('Failed to load fields')
    } finally {
      setLoading(false)
    }
  }

  const handleAdd = async () => {
    if (!newFieldName.trim()) {
      toast.error('Field name is required')
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', newFieldName.trim())
      await createField(formData)
      setNewFieldName('')
      setIsAdding(false)
      await loadFields()
      toast.success('Field added successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to add field')
    }
  }

  const handleEdit = (field: Field) => {
    setEditingId(field.id)
    setEditingValue(field.name)
  }

  const handleSave = async (id: string) => {
    if (!editingValue.trim()) {
      toast.error('Field name is required')
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', editingValue.trim())
      await updateField(id, formData)
      setEditingId(null)
      setEditingValue('')
      await loadFields()
      toast.success('Field updated successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update field')
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteField(id)
      await loadFields()
      setShowDeleteModal(null)
      toast.success('Field deleted successfully')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to delete field')
      setShowDeleteModal(null)
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
          title="Manajemen Bidang"
          buttonLabel="Tambah Bidang Baru"
          description='Halaman Bidang Admin'
        />

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                All Fields ({fields.length})
              </h2>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add New Field
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
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Enter field name"
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                  />
                  <button
                    onClick={handleAdd}
                    className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    <Save className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      setIsAdding(false)
                      setNewFieldName('')
                    }}
                    className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {fields.length === 0 ? (
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
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No fields found
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Get started by creating your first field.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field) => (
                  <div
                    key={field.id}
                    className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    {editingId === field.id ? (
                      <div className="flex items-center space-x-3 flex-1">
                        <input
                          type="text"
                          value={editingValue}
                          onChange={(e) => setEditingValue(e.target.value)}
                          className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                          onKeyPress={(e) => e.key === 'Enter' && handleSave(field.id)}
                        />
                        <button
                          onClick={() => handleSave(field.id)}
                          className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                        >
                          <Save className="w-4 h-4" />
                        </button>
                        <button
                          onClick={handleCancel}
                          className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <span className="text-gray-900 dark:text-white font-medium">
                          {field.name}
                        </span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleEdit(field)}
                            className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(field.id)}
                            className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
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
              Delete Field
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Are you sure you want to delete this field? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}