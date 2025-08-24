import Link from 'next/link'
import { ArrowLeft} from 'lucide-react'
import AdminPageHeader from '../../components/AdminPageHeader'
import OrganizerForm from '../../components/organizers/OrganizerForm'

export default function NewOrganizerPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/admin/organizers"
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
        </Link>
        <AdminPageHeader
          title="Tambah Organizer Baru"
          description='Halaman Tambah Organizer Admin'
        />
      </div>

      <OrganizerForm />
    </div>
  )
}