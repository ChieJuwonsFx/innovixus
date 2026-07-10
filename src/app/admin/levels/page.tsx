'use client'

import { useState, useEffect, useRef } from 'react'
import { Plus, Edit2, Trash2, Save, X, MoreVertical, Eye } from 'lucide-react'
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
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const menuBtnRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    loadLevels()
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
      const result = await deleteLevel(id)
      if (result && !result.success) {
        toast.error(result.message || 'Gagal menghapus level')
        setSubmitting(false)
        return
      }
      await loadLevels()
      setShowDeleteModal(null)
      toast.success('Level berhasil dihapus')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Gagal menghapus level')
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
        <div className="flex items-center justify-between">
          <AdminPageHeader
            title="Manajemen Level"
            description='Halaman Event Admin'
          />
          {!isAdding && (
            <button onClick={() => setIsAdding(true)} className="inline-flex items-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200">
              <Plus className="h-4 w-4" /> Tambah Level
            </button>
          )}
        </div>

        {isAdding && (
          <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
            <input
              type="text"
              value={newLevelName}
              onChange={(e) => setNewLevelName(e.target.value)}
              placeholder="Nama level baru..."
              className="flex-1 rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
              onKeyDown={(e) => e.key === 'Enter' && !submitting && handleAdd()}
              disabled={submitting}
              autoFocus
            />
            <button onClick={handleAdd} disabled={submitting} className="rounded-lg bg-green-600 p-2 text-white hover:bg-green-700 disabled:opacity-50">
              <Save className="h-4 w-4" />
            </button>
            <button onClick={() => { setIsAdding(false); setNewLevelName('') }} disabled={submitting} className="rounded-lg bg-slate-600 p-2 text-white hover:bg-slate-700 disabled:opacity-50">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {levels.length === 0 ? (
          <div className="py-12 text-center text-sm text-slate-400">
            {isAdding ? '' : 'Belum ada level. Klik "Tambah Level Baru" untuk mulai.'}
          </div>
        ) : (
          <div className="border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
            <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
              <thead>
                <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  <th className="px-4 py-3">Level</th>
                  <th className="w-12 px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {levels.map((level) => (
                  <tr key={level.id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    {editingId === level.id ? (
                      <td className="px-4 py-2" colSpan={2}>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={editingValue}
                            onChange={(e) => setEditingValue(e.target.value)}
                            className="flex-1 rounded-lg border border-slate-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white"
                            onKeyDown={(e) => e.key === 'Enter' && !submitting && handleSave(level.id)}
                            disabled={submitting}
                            autoFocus
                          />
                          <button onClick={() => handleSave(level.id)} disabled={submitting} className="rounded-lg bg-green-600 p-1.5 text-white hover:bg-green-700 disabled:opacity-50">
                            <Save className="h-3.5 w-3.5" />
                          </button>
                          <button onClick={handleCancel} disabled={submitting} className="rounded-lg bg-slate-600 p-1.5 text-white hover:bg-slate-700 disabled:opacity-50">
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </td>
                    ) : (
                      <>
                        <td className="whitespace-nowrap px-4 py-3 text-sm font-medium text-slate-900 dark:text-white">
                          {level.name}
                        </td>
                        <td className="whitespace-nowrap px-4 py-3 text-right">
                          <div className="relative">
                            <button ref={(el) => { if (menuOpenId === level.id) menuBtnRef.current = el }} onClick={() => setMenuOpenId(menuOpenId === level.id ? null : level.id)} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300">
                              <MoreVertical className="h-4 w-4" />
                            </button>
                            {menuOpenId === level.id && (
                              <div ref={(el) => { menuRef.current = el }} className="absolute right-0 top-8 z-50 w-40 origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                                <button onClick={() => { handleEdit(level); setMenuOpenId(null) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700">
                                  <Edit2 className="h-3.5 w-3.5" /> Edit
                                </button>
                                <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                                <button onClick={() => { setShowDeleteModal(level.id); setMenuOpenId(null) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
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
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Hapus Level</h3>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">Yakin ingin menghapus level ini?</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(null)} className="rounded-lg px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">Batal</button>
              <button onClick={() => handleDelete(showDeleteModal)} disabled={submitting} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">
                {submitting ? 'Menghapus...' : 'Hapus'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}