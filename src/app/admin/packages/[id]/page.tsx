import { createClient } from '@/lib/supabase/server'
import PackageForm from '../../components/packages/Form'
import AdminPageHeader from '../../components/AdminPageHeader'
import { notFound } from 'next/navigation'

interface Props {
  params: Promise<{ id: string }>
}

export default async function EditPackagePage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  
  const { data: packageData, error } = await supabase
    .from('packages')
    .select(`
      *,
      partnerships(count)
    `)
    .eq('id', id) 
    .single()

  if (error || !packageData) {
    notFound()
  }

  const partnershipCount = (packageData.partnerships as unknown as { count: number }[])?.[0]?.count || 0;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Edit Package"
        description={`Edit package: ${packageData.name}`}
        buttonHref="/admin/packages"
        buttonLabel="Back to Packages"
      />

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Package Information</h3>
          {partnershipCount > 0 && (
            <p className="mt-1 text-sm text-amber-600">
              This package is currently used by {partnershipCount} partnership(s). Deactivating is recommended over deleting.
            </p>
          )}
        </div>
        <div className="p-6">
          <PackageForm initialData={packageData} />
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-medium text-gray-900 dark:text-slate-100">Usage Statistics</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {partnershipCount}
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Total Partnerships</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {packageData.is_active ? 'Active' : 'Inactive'}
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Current Status</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900 dark:text-slate-100">
                {packageData.price === 0 ? 'Free' : `Rp ${packageData.price.toLocaleString('id-ID')}`}
              </div>
              <div className="text-sm text-gray-500 dark:text-slate-400">Package Price</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}