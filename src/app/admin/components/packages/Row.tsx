'use client';

import { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { MoreVertical, Edit, DollarSign  } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database } from '@/types/database';
import DeleteButton from '../../components/DeleteButton';
import { deletePackage } from '../../packages/actions';

type Package = Database['public']['Tables']['packages']['Row'];

function PackageCard({ pkg, onDelete }: { pkg: Package; onDelete: () => Promise<void> }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 100;
      
      let top = rect.bottom + window.scrollY + 8;
      let left = rect.right + window.scrollX - menuWidth;
      
      if (left < 10) left = 10;
      if (left + menuWidth > window.innerWidth - 10) {
        left = window.innerWidth - menuWidth - 10;
      }
      
      if (top + menuHeight > window.innerHeight + window.scrollY - 10) {
        top = rect.top + window.scrollY - menuHeight - 8;
      }
      
      setMenuPosition({ top, left });
    }
  }, [isMenuOpen]);

  const menuContent = isMenuOpen ? (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'absolute',
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        zIndex: 9999
      }}
      className="w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 overflow-hidden"
    >
      <Link 
        href={`/admin/packages/${pkg.id}`} 
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        <Edit size={16} className="text-blue-500" />
        <span>Edit Package</span>
      </Link>
      <div className="border-t border-slate-200 dark:border-slate-700">
        <DeleteButton action={onDelete} itemLabel={pkg.name} />
      </div>
    </motion.div>
  ) : null;

  return (
    <>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl transition-shadow border border-slate-200 dark:border-slate-700 p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 min-w-0">
            <Link href={`/admin/packages/${pkg.id}`}>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
                {pkg.name}
              </h3>
            </Link>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-2">
              {pkg.description}
            </p>
          </div>
          <button 
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="ml-2 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors flex-shrink-0"
            aria-label="Open menu"
          >
            <MoreVertical size={20} />
          </button>
        </div>

        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-2">
            <DollarSign size={18} className="text-slate-400" />
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {pkg.price === 0 ? 'Free' : `Rp ${pkg.price.toLocaleString('id-ID')}`}
            </span>
          </div>
          <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
            pkg.is_active 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' 
            : 'bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300'
          }`}>
            {pkg.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      </div>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>{menuContent}</AnimatePresence>,
        document.body
      )}
    </>
  );
}

function PackageTableRow({ pkg, onDelete }: { pkg: Package; onDelete: () => Promise<void> }) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

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
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  useEffect(() => {
    if (isMenuOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      const menuWidth = 200;
      const menuHeight = 100;
      
      let top = rect.bottom + window.scrollY + 8;
      let left = rect.right + window.scrollX - menuWidth;
      
      if (left < 10) left = 10;
      if (left + menuWidth > window.innerWidth - 10) {
        left = window.innerWidth - menuWidth - 10;
      }
      
      if (top + menuHeight > window.innerHeight + window.scrollY - 10) {
        top = rect.top + window.scrollY - menuHeight - 8;
      }
      
      setMenuPosition({ top, left });
    }
  }, [isMenuOpen]);

  const menuContent = isMenuOpen ? (
    <motion.div
      ref={menuRef}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.15 }}
      style={{
        position: 'absolute',
        top: `${menuPosition.top}px`,
        left: `${menuPosition.left}px`,
        zIndex: 9999
      }}
      className="w-48 bg-white dark:bg-slate-800 rounded-xl shadow-2xl border border-slate-200 dark:border-slate-700 py-1 overflow-hidden"
    >
      <Link 
        href={`/admin/packages/${pkg.id}`} 
        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        onClick={() => setIsMenuOpen(false)}
      >
        <Edit size={16} className="text-blue-500" />
        <span>Edit Package</span>
      </Link>
      <div className="border-t border-slate-200 dark:border-slate-700">
        <DeleteButton action={onDelete} itemLabel={pkg.name} />
      </div>
    </motion.div>
  ) : null;

  return (
    <>
      <tr className="border-b dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
        <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
          <Link href={`/admin/packages/${pkg.id}`} className="hover:underline hover:text-blue-600 dark:hover:text-blue-400">
            {pkg.name}
          </Link>
        </td>
        
        <td className="px-6 py-4 text-slate-600 dark:text-slate-300 hidden lg:table-cell max-w-md">
          <p className="line-clamp-2">{pkg.description}</p>
        </td>
        
        <td className="px-6 py-4 text-slate-700 dark:text-slate-200 font-semibold whitespace-nowrap">
          {pkg.price === 0 ? 'Free' : `Rp ${pkg.price.toLocaleString('id-ID')}`}
        </td>
        
        <td className="px-6 py-4">
          <span className={`px-3 py-1 text-xs font-semibold rounded-full whitespace-nowrap ${
            pkg.is_active 
            ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300' 
            : 'bg-slate-200 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300'
          }`}>
            {pkg.is_active ? 'Active' : 'Inactive'}
          </span>
        </td>
        
        <td className="px-6 py-4 text-right">
          <button 
            ref={buttonRef}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors inline-flex"
            aria-label="Open menu"
          >
            <MoreVertical size={20} />
          </button>
        </td>
      </tr>

      {typeof document !== 'undefined' && createPortal(
        <AnimatePresence>{menuContent}</AnimatePresence>,
        document.body
      )}
    </>
  );
}

export default function PackageTable({ packages }: { packages: Package[] }) {
  const handleDeleteAction = async (pkg: Package) => {
    const formData = new FormData();
    formData.append('id', pkg.id);
    await deletePackage(formData);
  };

  if (!packages || packages.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            No Packages Found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Get started by creating a new partnership package.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:hidden">
        {packages.map(pkg => (
          <PackageCard 
            key={pkg.id} 
            pkg={pkg} 
            onDelete={() => handleDeleteAction(pkg)}
          />
        ))}
      </div>

      <div className="hidden lg:block rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-slate-100 dark:bg-slate-700 dark:text-gray-300">
              <tr>
                <th scope="col" className="px-6 py-4 font-semibold">Name</th>
                <th scope="col" className="px-6 py-4 font-semibold">Description</th>
                <th scope="col" className="px-6 py-4 font-semibold">Price</th>
                <th scope="col" className="px-6 py-4 font-semibold">Status</th>
                <th scope="col" className="px-6 py-4">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {packages.map(pkg => (
                <PackageTableRow 
                  key={pkg.id} 
                  pkg={pkg}
                  onDelete={() => handleDeleteAction(pkg)}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}