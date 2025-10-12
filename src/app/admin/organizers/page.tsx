import Link from 'next/link'
import { Plus, CirclePlus } from 'lucide-react'
import AdminPageHeader from '../components/AdminPageHeader'
import { getOrganizers } from './actions'
import OrganizerRow from '../components/organizers/OrganizerRow' 

export default async function OrganizersPage() {
  const organizers = await getOrganizers()

  return (
    <div className="space-y-6 px-4 sm:px-6 lg:px-8">
      <AdminPageHeader
        title="Manajemen Organizers"
        buttonLabel="Tambah Organizer Baru"
        buttonHref="/admin/organizers/new"
        description="Halaman untuk mengelola data organizer"
        icon={CirclePlus}
      />

      {organizers.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-lg shadow-md">
          <div className="text-gray-500 dark:text-gray-400">
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
                d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Belum ada organizer
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Mulai dengan menambahkan organizer pertama Anda.
            </p>
            <Link
              href="/admin/organizers/new"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus className="w-4 h-4 mr-2" />
              Tambah Organizer
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm sm:text-base">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Nama Organizer
                </th>
                <th scope="col" className="px-3 sm:px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Instagram
                </th>
                <th scope="col" className="relative px-3 sm:px-6 py-3">
                  <span className="sr-only">Aksi</span>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
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
