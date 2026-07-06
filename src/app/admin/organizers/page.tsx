import Link from 'next/link'
import { Plus, CirclePlus } from 'lucide-react'
import AdminPageHeader from '../components/AdminPageHeader'
import { getOrganizers } from './actions'
import OrganizerRow from '../components/organizers/OrganizerRow' 

export default async function OrganizersPage() {
  const organizers = await getOrganizers()

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Manajemen Organizers"
        buttonLabel="Tambah Organizer Baru"
        buttonHref="/admin/organizers/new"
        description="Halaman untuk mengelola data organizer"
        icon={CirclePlus}
      />

      {organizers.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-slate-400">Belum ada organizer.</p>
        </div>
      ) : (
        <div className="border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
          <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
            <thead>
              <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <th className="px-4 py-3">Nama Organizer</th>
                <th className="px-4 py-3">Instagram</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {organizers.map((organizer) => (
                <OrganizerRow key={organizer.id} organizer={organizer} />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
