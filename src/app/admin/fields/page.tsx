'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Save, X, MoreVertical } from 'lucide-react'
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
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    loadFields()
  }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && menuBtnRef.current && !menuBtnRef.current.contains(e.target as Node)) {
        setMenuOpenId(null)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
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
    if (submitting) return

    try {
      setSubmitting(true)
      const formData = new FormData()
      formData.append('name', editingValue.trim())
      formData.append('only_lomba', String(editingOnlyLomba))
      await updateField(id, formData)
      setEditingId(null)
      setEditingValue('')
      setEditingOnlyLomba(false)
      await loadFields()
      toast.success('Bidang berhasil diperbarui')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal memperbarui bidang')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (submitting) return
    try {
      setSubmitting(true)
      const result = await deleteField(id)
      if (result && !result.success) {
        toast.error(result.message || 'Gagal menghapus bidang')
        setSubmitting(false)
        return
      }
      await loadFields()
      setShowDeleteModal(null)
      toast.success('Bidang berhasil dihapus')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus bidang')
    } finally {
      setSubmitting(false)
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
        <div className="flex items-center justify-between">
          <AdminPageHeader
            title="Manajemen Bidang"
            description='Halaman Bidang Admin'
          />
          {!isAdding && (
            <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
              <Plus className="h-4 w-4" /> Tambah Bidang
            </button>
          )}
        </div>

        {isAdding && (
          <div className="rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center gap-3">
              <input
                type="text"
                value={newFieldName}
                onChange={(e) => setNewFieldName(e.target.value)}
                placeholder="Nama bidang baru..."
                className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                autoFocus
              />
              <button onClick={handleAdd} className="rounded-lg bg-green-600 p-2 text-white hover:bg-green-700">
                <Save className="h-4 w-4" />
              </button>
              <button onClick={handleCancelAdd} className="rounded-lg bg-slate-600 p-2 text-white hover:bg-slate-700">
                <X className="h-4 w-4" />
              </button>
            </div>
            <label className="mt-3 flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <input type="checkbox" checked={newFieldOnlyLomba} onChange={(e) => setNewFieldOnlyLomba(e.target.checked)} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
              Khusus Lomba
            </label>
          </div>
        )}

        {fields.length === 0 && !isAdding ? (
          <div className="py-12 text-center text-sm text-slate-400">Belum ada bidang.</div>
        ) : (
          <div className="border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3">Bidang</th>
                  <th className="px-4 py-3">Khusus Lomba</th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {fields.map((field) => (
                  <tr key={field.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    {editingId === field.id ? (
                      <td className="px-4 py-2" colSpan={3}>
                        <div className="flex items-start gap-3">
                          <div className="flex-1 space-y-2">
                            <input
                              type="text"
                              value={editingValue}
                              onChange={(e) => setEditingValue(e.target.value)}
                              className="w-full rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                              onKeyDown={(e) => e.key === 'Enter' && !submitting && handleSave(field.id)}
                              disabled={submitting}
                              autoFocus
                            />
                            <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                              <input type="checkbox" checked={editingOnlyLomba} onChange={(e) => setEditingOnlyLomba(e.target.checked)} className="h-3.5 w-3.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                              Khusus Lomba
                            </label>
                          </div>
                          <div className="flex gap-2 pt-0.5">
                            <button onClick={() => handleSave(field.id)} disabled={submitting} className="rounded-lg bg-green-600 p-1.5 text-white hover:bg-green-700 disabled:opacity-50"><Save className="h-3.5 w-3.5" /></button>
                            <button onClick={handleCancel} disabled={submitting} className="rounded-lg bg-slate-600 p-1.5 text-white hover:bg-slate-700 disabled:opacity-50"><X className="h-3.5 w-3.5" /></button>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">{field.name}</td>
                        <td className="whitespace-nowrap px-4 py-3 text-sm text-slate-500 dark:text-slate-400">
                          {field.only_lomba ? <span className="inline-block rounded-full bg-blue-100 px-2.5 py-0.5 text-[11px] font-semibold text-blue-600 dark:bg-blue-900/30 dark:text-blue-300">Khusus Lomba</span> : '-'}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="relative">
                            <button ref={(el) => { if (menuOpenId === field.id) menuBtnRef.current = el }} onClick={() => setMenuOpenId(menuOpenId === field.id ? null : field.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {menuOpenId === field.id && (
                              <div ref={(el) => { menuRef.current = el }} className="absolute right-0 top-8 z-50 w-40 origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                <button onClick={() => { handleEdit(field); setMenuOpenId(null) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700">
                                  <Edit2 className="h-3.5 w-3.5" /> Edit
                                </button>
                                <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                                <button onClick={() => { setShowDeleteModal(field.id); setMenuOpenId(null) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Hapus Bidang</h3>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">Yakin ingin menghapus bidang ini?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="rounded-lg px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">Batal</button>
              <button onClick={() => handleDelete(showDeleteModal)} disabled={submitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">{submitting ? 'Menghapus...' : 'Hapus'}</button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}