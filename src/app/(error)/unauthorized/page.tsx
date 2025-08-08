import { Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  return (
    <>
      <h1 className="text-6xl md:text-7xl font-black text-transparent bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-600 dark:to-orange-600 bg-clip-text leading-none mb-2">
        403
      </h1>

      <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
        Akses Ditolak
      </h2>
      
      <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
        Anda tidak memiliki izin untuk mengakses halaman ini. 
        Hanya pengguna dengan hak akses tertentu yang dapat membuka halaman admin.
      </p>

      <div className="p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200">
          <Lock className="w-5 h-5 text-orange-500 dark:text-orange-400" />
          <p className="font-medium">Area Terproteksi</p>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
          Hubungi administrator sistem untuk meminta akses.
        </p>
      </div>
    </>
  );
}