'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit2, Trash2, Save, X } from 'lucide-react'
import AdminPageHeader from '../components/AdminPageHeader'
import { getFields, createField, updateField, deleteField } from './actions'
import toast from 'react-hot-toast'

interface Field {
  id: string
  name: string
  only_lomba: boolean
}

export default function FieldsPage() {
  const [fields, setFields] = useState<Field[]>([])
  const [loading, setLoading] = useState(true)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingValue, setEditingValue] = useState('')
  const [editingOnlyLomba, setEditingOnlyLomba] = useState(false)
  const [newFieldName, setNewFieldName] = useState('')
  const [newFieldOnlyLomba, setNewFieldOnlyLomba] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState<string | null>(null)

  useEffect(() => {
    loadFields()
  }, [])

  const loadFields = async () => {
    try {
      setLoading(true)
      const data = await getFields()
      setFields(data)
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
      formData.append('only_lomba', String(newFieldOnlyLomba))
      await createField(formData)
      setNewFieldName('')
      setNewFieldOnlyLomba(false)
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
    setEditingOnlyLomba(field.only_lomba)
  }

  const handleSave = async (id: string) => {
    if (!editingValue.trim()) {
      toast.error('Field name is required')
      return
    }

    try {
      const formData = new FormData()
      formData.append('name', editingValue.trim())
      formData.append('only_lomba', String(editingOnlyLomba))
      await updateField(id, formData)
      setEditingId(null)
      setEditingValue('')
      setEditingOnlyLomba(false)
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
    setEditingOnlyLomba(false)
  }

  const handleCancelAdd = () => {
    setIsAdding(false)
    setNewFieldName('')
    setNewFieldOnlyLomba(false)
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
                Semua Bidang ({fields.length})
              </h2>
              {!isAdding && (
                <button
                  onClick={() => setIsAdding(true)}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Tambah Bidang
                </button>
              )}
            </div>
          </div>

          <div className="p-6">
            {isAdding && (
              <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg space-y-3">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    value={newFieldName}
                    onChange={(e) => setNewFieldName(e.target.value)}
                    placeholder="Nama bidang baru..."
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                    onKeyPress={(e) => e.key === 'Enter' && handleAdd()}
                    autoFocus
                  />
                  <button onClick={handleAdd} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Save className="w-5 h-5" />
                  </button>
                  <button onClick={handleCancelAdd} className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="flex items-center">
                  <input
                    id="only_lomba_add"
                    type="checkbox"
                    checked={newFieldOnlyLomba}
                    onChange={(e) => setNewFieldOnlyLomba(e.target.checked)}
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <label htmlFor="only_lomba_add" className="ml-2 block text-sm text-gray-900 dark:text-gray-300 select-none">
                    Khusus Lomba
                  </label>
                </div>
              </div>
            )}

            {fields.length === 0 && !isAdding ? (
              <div className="text-center py-12">
                <div className="text-gray-500 dark:text-gray-400 mb-4">
                  <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Belum ada bidang
                  </h3>
                  <p className="text-gray-500 dark:text-gray-400">
                    Silakan mulai dengan menambahkan bidang baru.
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {fields.map((field) => (
                  <div key={field.id} className="flex items-center justify-between p-3 border border-gray-200 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    {editingId === field.id ? (
                      <div className="flex-1 flex items-start space-x-3">
                        <div className="flex-1 space-y-2">
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:text-white"
                            onKeyPress={(e) => e.key === 'Enter' && handleSave(field.id)}
                            autoFocus
                          />
                          <div className="flex items-center">
                            <input
                              id={`only_lomba_edit_${field.id}`}
                              type="checkbox"
                              checked={editingOnlyLomba}
                              onChange={(e) => setEditingOnlyLomba(e.target.checked)}
                              className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor={`only_lomba_edit_${field.id}`} className="ml-2 block text-sm text-gray-900 dark:text-gray-300 select-none">
                              Khusus Lomba
                            </label>
                          </div>
                        </div>
                        <div className="flex space-x-2 pt-1">
                          <button onClick={() => handleSave(field.id)} className="p-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                            <Save className="w-5 h-5" />
                          </button>
                          <button onClick={handleCancel} className="p-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700">
                            <X className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center space-x-3">
                           <span className="text-gray-900 dark:text-white font-medium">
                            {field.name}
                          </span>
                          {field.only_lomba && (
                            <span className="text-xs font-semibold inline-block py-1 px-2.5 uppercase rounded-full text-blue-600 bg-blue-200 dark:bg-blue-700 dark:text-blue-200">
                              Khusus Lomba
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          <button onClick={() => handleEdit(field)} className="p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg">
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button onClick={() => setShowDeleteModal(field.id)} className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg">
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Hapus Bidang
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Apakah Anda yakin ingin menghapus bidang ini? Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="flex justify-end space-x-3">
              <button onClick={() => setShowDeleteModal(null)} className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg">
                Batal
              </button>
              <button onClick={() => handleDelete(showDeleteModal)} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">
                Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}