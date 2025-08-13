'use client';

import { useRouter } from 'next/navigation';
import { SearchX, Home, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NotFound() {
  const router = useRouter();


  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
            (function() {
              try {
                var theme = localStorage.getItem('theme');
                var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                var shouldBeDark = theme === 'dark' || (!theme && prefersDark);
                
                if (shouldBeDark) {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (e) {
                console.warn('Theme initialization failed:', e);
              }
            })();
          `,
        }}
      />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-100 to-slate-200 dark:from-slate-900 dark:via-gray-800 dark:to-slate-900 flex items-center justify-center p-4 text-center">
        <div className="max-w-lg w-full">
          <div className="relative mb-8 flex justify-center items-center">
            <SearchX className="w-24 h-24 text-blue-500/50 dark:text-blue-400/30" strokeWidth={1} />
            <div className="absolute text-center">
              <h1 className="text-8xl md:text-9xl font-black text-transparent bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text">
                404
              </h1>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 dark:text-white mb-4">
            Halaman Tidak Ditemukan
          </h2>
          
          <p className="text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-md mx-auto">
            Oops! Sepertinya Anda tersesat. Halaman yang Anda cari mungkin telah dihapus, diganti namanya, atau memang tidak pernah ada.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button 
              onClick={() => router.back()}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white font-semibold rounded-full hover:from-gray-700 hover:to-gray-800 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <ArrowLeft className="w-5 h-5" />
              Kembali
            </button>
            
            <Link href="/"
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-full hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg"
            >
              <Home className="w-5 h-5" />
              Ke Beranda
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}