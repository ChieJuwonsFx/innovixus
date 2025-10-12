import { createClient } from '@/lib/supabase/server'
import { PlusCircle } from 'lucide-react'
import AdminPageHeader from '@/app/admin/components/AdminPageHeader'
import PackageTable from '@/app/admin/components/packages/Row'

export default async function PackagesPage() {
  const supabase = await createClient()
  const { data: packages, error } = await supabase
    .from('packages')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching packages:', error)
  }

  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Manage Packages"
        description="Create, edit, and manage partnership packages."
        buttonHref="/admin/packages/new"
        buttonLabel="Add New Package"
        icon={PlusCircle}
      />

      <PackageTable packages={packages || []} />
    </div>
  )
}