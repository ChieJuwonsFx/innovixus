'use client'

import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { MoreVertical, Eye, Edit, Trash2 } from 'lucide-react'
import Link from 'next/link'
import { deleteOrganizer } from '../../organizers/actions'
import toast from 'react-hot-toast'

interface Organizer {
  id: string
  name: string
  instagram: string | null
}

interface OrganizerRowProps {
  organizer: Organizer
}

export default function OrganizerRow({ organizer }: OrganizerRowProps) {
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const btnRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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

  const [mounted, setMounted] = useState(false)
  useEffect(() => { setMounted(true) }, [])

  return (
    <>
      <tr className="border-b border-slate-100 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50">
        <td className="whitespace-nowrap px-4 py-3">
          <span className="text-sm font-medium text-slate-900 dark:text-white">
            {organizer.name}
          </span>
        </td>
        <td className="whitespace-nowrap px-4 py-3">
          {organizer.instagram ? (
            <a href={`https://instagram.com/${organizer.instagram}`} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-500 hover:underline">
              @{organizer.instagram}
            </a>
          ) : (
            <span className="text-sm text-slate-400">-</span>
          )}
        </td>
        <td className="whitespace-nowrap px-4 py-3 text-right">
          <div className="relative">
            <button ref={btnRef} onClick={() => setMenuOpen(!menuOpen)} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300">
              <MoreVertical className="h-4 w-4" />
            </button>
            {menuOpen && (
              <div ref={menuRef} className="absolute right-0 top-8 z-50 w-40 origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
                <Link href={`/admin/organizers/${organizer.id}?view=true`} className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setMenuOpen(false)}>
                  <Eye className="h-3.5 w-3.5" /> Lihat Detail
                </Link>
                <Link href={`/admin/organizers/${organizer.id}`} className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setMenuOpen(false)}>
                  <Edit className="h-3.5 w-3.5" /> Edit
                </Link>
                <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
                <button onClick={() => { setShowDeleteModal(true); setMenuOpen(false) }} className="flex w-full items-center gap-2.5 px-3 py-2 text-xs text-red-600 transition-colors hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20">
                  <Trash2 className="h-3.5 w-3.5" /> Hapus
                </button>
              </div>
            )}
          </div>
        </td>
      </tr>

      {mounted && showDeleteModal && createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg dark:bg-slate-800">
            <h3 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">Konfirmasi Hapus</h3>
            <p className="mb-6 text-sm text-slate-600 dark:text-slate-400">
              Apakah Anda yakin ingin menghapus <strong>{organizer.name}</strong>?
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowDeleteModal(false)} disabled={isDeleting} className="rounded-lg px-4 py-2 text-sm text-slate-600 transition-colors hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700">Batal</button>
              <button onClick={handleDelete} disabled={isDeleting} className="rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 disabled:opacity-50">
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus'}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}
