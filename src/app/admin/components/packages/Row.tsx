'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { MoreVertical, Edit } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '@/types/database';
import DeleteButton from '../../components/DeleteButton';
import { deletePackage } from '../../packages/actions';

type Package = Database['public']['Tables']['packages']['Row'];

export default function PackageTableRow({ pkg }: { pkg: Package }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleDeleteAction = async () => {
    const formData = new FormData();
    formData.append('id', pkg.id);
    await deletePackage(formData);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current && !menuRef.current.contains(event.target as Node) &&
        buttonRef.current && !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]); 

  return (
    <tr className="border-b dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white whitespace-nowrap">
        <Link href={`/admin/packages/${pkg.id}`} className="hover:underline hover:text-blue-600">
          {pkg.name}
        </Link>
      </td>
      
      <td className="px-6 py-4 text-slate-600 dark:text-slate-300 hidden md:table-cell">
        <p>{pkg.description}</p>
      </td>
      
      <td className="px-6 py-4 text-slate-700 dark:text-slate-200 font-medium">
        {pkg.price === 0 ? 'Free' : `Rp ${pkg.price.toLocaleString('id-ID')}`}
      </td>
      <td className="px-6 py-4">
        <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
          pkg.is_active 
          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300' 
          : 'bg-slate-200 text-slate-800 dark:bg-slate-700/50 dark:text-slate-300'
        }`}>
          {pkg.is_active ? 'Active' : 'Inactive'}
        </span>
      </td>
      <td className="px-6 py-4 text-right relative">
        <button 
          ref={buttonRef}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400"
          aria-label="Open actions menu"
        >
          <MoreVertical size={20} />
        </button>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              ref={menuRef} 
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full right-4 mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-2xl z-10 border border-slate-200 dark:border-slate-700 py-1 origin-top-right"
            >
              <Link href={`/admin/packages/${pkg.id}`} className="flex items-center gap-3 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Edit size={16} /> Edit Package
              </Link>
              <DeleteButton action={handleDeleteAction} itemLabel={pkg.name} />
            </motion.div>
          )}
        </AnimatePresence>
      </td>
    </tr>
  );
}