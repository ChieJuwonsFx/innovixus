import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { notFound } from 'next/navigation'
import AdminPageHeader from '../../components/AdminPageHeader'
import OrganizerForm from '../../components/organizers/OrganizerForm'
import { getOrganizer } from '../actions'

interface OrganizerDetailPageProps {
  params: Promise<{ id: string }>
  searchParams: Promise<{ view?: string }>
}

export default async function OrganizerDetailPage({ 
  params, 
  searchParams 
}: OrganizerDetailPageProps) {
  
  // Await the params and searchParams
  const { id } = await params
  const { view } = await searchParams
  
  const organizer = await getOrganizer(id)
  const isViewMode = view === 'true'

  if (!organizer) {
    notFound()
  }

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
          title={isViewMode ? organizer.name : `Edit ${organizer.name}`}
          description={isViewMode ? 'View organizer details' : 'Update organizer information'}
        />
      </div>

      <OrganizerForm organizer={organizer} isViewMode={isViewMode} />
    </div>
  )
}