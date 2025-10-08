import { createClient } from '@/lib/supabase/server'
import { PlusCircle } from 'lucide-react'
import AdminPageHeader from '@/app/admin/components/AdminPageHeader'
import PackageTableRow from '@/app/admin/components/packages/Row' 

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

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
          <thead className="text-xs text-gray-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-4 font-semibold">Name</th>
              <th scope="col" className="px-6 py-4 font-semibold hidden md:table-cell">Description</th>
              <th scope="col" className="px-6 py-4 font-semibold">Price</th>
              <th scope="col" className="px-6 py-4 font-semibold">Status</th>
              <th scope="col" className="px-6 py-4"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody>
            {packages && packages.length > 0 ? (
              packages.map(pkg => <PackageTableRow key={pkg.id} pkg={pkg} />)
            ) : (
              <tr>
                <td colSpan={5} className="text-center py-16 px-6">
                  <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">No Packages Found</h3>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Get started by creating a new partnership package.
                  </p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}