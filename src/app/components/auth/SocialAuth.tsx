'use client';

import { useState } from 'react';
import { FormMessage } from './FormMessage';
import { signInWithGoogle } from '@/lib/supabase/auth';

const GoogleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
  </svg>
);

export const SocialAuth = () => {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setMessage(null);
    try {
      await signInWithGoogle();
      setMessage({ type: 'success', message: 'Mengarahkan ke Google...' });
    } catch (err) {
      const error = err as Error;
      let errorMessage = 'Gagal masuk dengan Google. Silakan coba lagi.';
      if (error.message.includes('popup')) {
        errorMessage = 'Mohon izinkan popup untuk situs ini dan coba lagi.';
      } else if (error.message.includes('network')) {
        errorMessage = 'Kesalahan jaringan. Periksa koneksi Anda dan coba lagi.';
      }
      setMessage({ type: 'error', message: errorMessage });
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {message && <FormMessage type={message.type} message={message.message} />}

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-gray-200 dark:border-gray-700" />
        </div>
        <div className="relative flex justify-center text-xs">
          <span className="bg-white px-2 text-gray-500 dark:bg-slate-800 dark:text-gray-400">
            Atau lanjutkan dengan
          </span>
        </div>
      </div>

      <button
        onClick={handleGoogleLogin}
        disabled={isLoading}
        className="flex w-full items-center justify-center gap-3 rounded-lg bg-white px-3 py-3 font-semibold text-gray-700 ring-1 ring-inset ring-gray-200 transition-all duration-150 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-slate-800 dark:text-slate-200 dark:ring-slate-700 dark:hover:bg-slate-700"
      >
        {isLoading ? (
          <div className="flex items-center gap-2">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-400 border-t-blue-600 dark:border-slate-500"></div>
            <span>Menghubungkan...</span>
          </div>
        ) : (
          <>
            <GoogleIcon />
            <span>Lanjutkan dengan Google</span>
          </>
        )}
      </button>
    </div>
  );
};