"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import { createPackage, updatePackage } from "../../packages/actions";
import SubmitButton from "../../components/SubmitButton";

interface Package {
  id?: string;
  name: string;
  description: string;
  price: number;
  is_active: boolean;
}

interface Props {
  initialData?: Package;
}

const formInputStyle = "block w-full rounded-lg border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors px-4 py-2.5";

export default function PackageForm({ initialData }: Props) {
  const router = useRouter(); // ✨ Inisialisasi router
  const [name, setName] = useState(initialData?.name || "");
  const [description, setDescription] = useState(initialData?.description || "");
  const [price, setPrice] = useState(initialData?.price || 0);
  const [isActive, setIsActive] = useState(initialData?.is_active ?? true);
  const [errors] = useState<Record<string, string>>({}); 

  const isEditing = !!initialData?.id;

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrice(value === '' ? 0 : parseInt(value, 10));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const toastId = toast.loading(isEditing ? 'Updating package...' : 'Creating package...');

    const action = isEditing ? updatePackage : createPackage;

    try {
      const result = await action(formData);

      if (result.success) {
        toast.success(result.message, { id: toastId });
        router.push('/admin/packages');
      } else {
        toast.error(result.message, { id: toastId });
      }
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      toast.error('Something went wrong. Please try again.', { id: toastId });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {isEditing && <input type="hidden" name="id" value={initialData.id} />}      
      <div className="space-y-6">
        <div>
          <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Package Name *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={`${formInputStyle} ${errors.name ? 'border-red-500' : ''}`}
            placeholder="e.g., Gold Partnership"
            required
          />
        </div>
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Description *
          </label>
          <textarea
            id="description"
            name="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={`${formInputStyle} ${errors.description ? 'border-red-500' : ''}`}
            placeholder="Describe what's included in this partnership package..."
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start pt-6 border-t border-gray-200 dark:border-slate-700">
        <div>
          <label htmlFor="price" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            Price (Rp)
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-500">Rp</div>
            <input
              type="number"
              id="price"
              name="price"
              min="0"
              value={price}
              onChange={handlePriceChange}
              className={`${formInputStyle} pl-12 ${errors.price ? 'border-red-500' : ''}`}
              placeholder="0"
            />
          </div>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Set to 0 for a free package.
          </p>
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Package Status
          </label>
          <label htmlFor="is_active" className="inline-flex items-center cursor-pointer">
            <input
              id="is_active"
              type="checkbox"
              name="is_active"
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 dark:bg-slate-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900 dark:text-gray-200">
              Active
            </span>
          </label>
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            Inactive packages won&apos;t be visible to users.
          </p>
        </div>
      </div>

      <div className="flex justify-end items-center pt-6 border-t border-gray-200 dark:border-slate-700 space-x-4">
        <Link
          href="/admin/packages"
          className="px-6 py-2.5 border border-gray-300 dark:border-slate-600 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-slate-700 hover:bg-gray-50 dark:hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Cancel
        </Link>
        <SubmitButton
          label={isEditing ? "Update Package" : "Create Package"}
          loadingLabel={isEditing ? "Updating..." : "Creating..."}
        />
      </div>
    </form>
  );
}