'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreVertical, Edit, DollarSign } from 'lucide-react';
import { Database } from '@/types/database';
import DeleteButton from '../../components/DeleteButton';
import { deletePackage } from '../../packages/actions';

type Package = Database['public']['Tables']['packages']['Row'];

function PackageRow({ pkg, onDelete }: { pkg: Package; onDelete: () => Promise<void> }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node) && btnRef.current && !btnRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <tr className="border-b border-slate-100 bg-white transition-colors hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:bg-slate-800/50">
      <td className="whitespace-nowrap px-4 py-3">
        <Link href={`/admin/packages/${pkg.id}`} className="text-sm font-medium text-slate-900 transition-colors hover:text-blue-600 dark:text-white dark:hover:text-blue-400">
          {pkg.name}
        </Link>
      </td>
      <td className="hidden max-w-xs truncate px-4 py-3 text-sm text-slate-500 lg:table-cell dark:text-slate-400">
        {pkg.description}
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
        {pkg.price === 0 ? 'Free' : `Rp ${pkg.price.toLocaleString('id-ID')}`}
      </td>
      <td className="whitespace-nowrap px-4 py-3">
        <span className={`inline-block rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
          pkg.is_active
            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
            : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'
        }`}>
          {pkg.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="whitespace-nowrap px-4 py-3 text-right">
        <div className="relative">
          <button ref={btnRef} onClick={() => setIsMenuOpen(!isMenuOpen)} className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:text-slate-500 dark:hover:bg-slate-700 dark:hover:text-slate-300">
            <MoreVertical className="h-4 w-4" />
          </button>
          {isMenuOpen && (
            <div ref={menuRef} className="absolute right-0 top-8 z-50 w-40 origin-top-right overflow-hidden rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
              <Link href={`/admin/packages/${pkg.id}`} className="flex items-center gap-2.5 px-3 py-2 text-xs text-slate-600 transition-colors hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700" onClick={() => setIsMenuOpen(false)}>
                <Edit className="h-3.5 w-3.5" /> Edit Package
              </Link>
              <div className="my-1 border-t border-slate-100 dark:border-slate-700"></div>
              <div className="px-1">
                <DeleteButton action={onDelete} itemLabel={pkg.name} />
              </div>
            </div>
          )}
        </div>
      </td>
    </tr>
  );
}

export default function PackageTable({ packages }: { packages: Package[] }) {
  const handleDeleteAction = async (pkg: Package) => {
    const formData = new FormData();
    formData.append('id', pkg.id);
    await deletePackage(formData);
  };

  if (!packages || packages.length === 0) {
    return <div className="py-12 text-center text-sm text-slate-400">Belum ada package.</div>;
  }

  return (
    <div className="border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900">
      <table className="min-w-full divide-y divide-slate-100 dark:divide-slate-800">
        <thead>
          <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <th className="px-4 py-3">Name</th>
            <th className="hidden px-4 py-3 lg:table-cell">Description</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Status</th>
            <th className="w-12 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
          {packages.map(pkg => (
            <PackageRow key={pkg.id} pkg={pkg} onDelete={() => handleDeleteAction(pkg)} />
          ))}
        </tbody>
      </table>
    </div>
  );
}