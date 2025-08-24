'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { ChevronLeft, ChevronRight, MoreHorizontal } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

const generatePagination = (currentPage: number, totalPages: number) => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  if (currentPage <= 3) {
    return [1, 2, 3, 4, '...', totalPages];
  }

  if (currentPage > totalPages - 3) {
    return [1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
  }

  return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
};


export default function Pagination({ currentPage, totalPages }: PaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const navigateToPage = (page: number) => {
    if (page < 1 || page > totalPages) return;

    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const pages = generatePagination(currentPage, totalPages);

  if (totalPages <= 1) return null;

  const baseButtonClasses = "flex items-center justify-center w-10 h-10 rounded-xl text-sm font-medium transition-all duration-200";
  const arrowButtonClasses = "flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200";

  return (
    <nav className="flex flex-col items-center justify-center gap-3 w-full" aria-label="Pagination">
      
      <div className="flex items-center gap-1 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 p-2">
        <button
          onClick={() => navigateToPage(currentPage - 1)}
          disabled={currentPage === 1}
          className={`${arrowButtonClasses} ${
            currentPage === 1
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          aria-label="Halaman Sebelumnya"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
        </button>

        <div className="flex items-center gap-1">
          {pages.map((page, index) => {
            if (typeof page === 'string') {
              return (
                <div key={`ellipsis-${index}`} className="flex items-center justify-center w-10 h-10 text-gray-400 dark:text-gray-500 pointer-events-none">
                  <MoreHorizontal className="h-5 w-5" />
                </div>
              );
            }

            const isActive = page === currentPage;
            return (
              <button
                key={page}
                onClick={() => navigateToPage(page)}
                className={`${baseButtonClasses} ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-md scale-105'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
                aria-label={`Ke halaman ${page}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {page}
              </button>
            );
          })}
        </div>

        <button
          onClick={() => navigateToPage(currentPage + 1)}
          disabled={currentPage === totalPages}
          className={`${arrowButtonClasses} ${
            currentPage === totalPages
              ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50'
              : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400'
          }`}
          aria-label="Halaman Selanjutnya"
        >
          <span className="hidden sm:inline">Selanjutnya</span>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </nav>
  );
}