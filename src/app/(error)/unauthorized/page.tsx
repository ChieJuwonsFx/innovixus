'use client';

import { useRouter } from 'next/navigation';
import { Shield, Home, ArrowLeft, Lock } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="max-w-md w-full text-center">
        <div className="relative mb-8">
          <div className="w-24 h-24 mx-auto bg-gradient-to-br from-red-500 to-orange-500 dark:from-red-600 dark:to-orange-600 rounded-full flex items-center justify-center shadow-lg">
            <Shield className="w-12 h-12 text-white" />
          </div>
        </div>

        <h1 className="text-6xl md:text-7xl font-black text-transparent bg-gradient-to-r from-red-500 to-orange-500 dark:from-red-600 dark:to-orange-600 bg-clip-text leading-none mb-4">
          403
        </h1>

        <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Akses Ditolak
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
          Anda tidak memiliki izin untuk mengakses halaman ini. 
          Hanya pengguna dengan hak akses tertentu yang dapat membuka halaman admin.
        </p>

        <div className="mb-8 p-4 bg-gradient-to-r from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 rounded-xl border border-gray-200 dark:border-gray-600">
          <div className="flex items-center justify-center gap-2 text-gray-700 dark:text-gray-200">
            <Lock className="w-5 h-5 text-orange-500 dark:text-orange-400" />
            <p className="font-medium">Area Terproteksi</p>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Hubungi administrator sistem untuk meminta akses
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200 shadow hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          
          <button 
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow hover:shadow-md"
          >
            <Home className="w-5 h-5" />
            Ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}