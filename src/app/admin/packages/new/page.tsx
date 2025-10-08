import PackageForm from "../../components/packages/Form";
import AdminPageHeader from "../../components/AdminPageHeader";

export default function NewPackagePage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        title="Create New Package"
        description="Fill in the details to create a new partnership package."
        buttonHref="/admin/packages"
        buttonLabel="Back to Packages"
      />

      <div className="bg-white dark:bg-slate-800 shadow-xl rounded-2xl overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-200 dark:border-slate-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-slate-100">
            Package Information
          </h3>
        </div>
        <div className="p-6 sm:p-8">
          <PackageForm />
        </div>
      </div>
    </div>
  );
}