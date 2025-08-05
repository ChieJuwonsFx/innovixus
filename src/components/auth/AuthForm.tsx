'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link'; 
import { signInWithEmail, signUpWithEmail, resetPassword } from '@/lib/supabase/auth';

interface FormMessageProps {
  type: 'success' | 'error';
  message: string;
}

const FormMessage = ({ type, message }: FormMessageProps) => {
  if (!message) return null;

  const baseClasses = "p-3 rounded-md text-sm text-center";
  const typeClasses = type === 'success' 
    ? "bg-green-100 text-green-800" 
    : "bg-red-100 text-red-800";
  
  return (
    <div className={`${baseClasses} ${typeClasses}`} role="alert">
      {message}
    </div>
  );
};

const SpinnerIcon = () => (
  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
  </svg>
);


interface AuthFormProps {
  type: 'login' | 'register' | 'forgot-password';
}

export const AuthForm = ({ type }: AuthFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [message, setMessage] = useState<FormMessageProps | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const formDetails = {
    login: {
      title: 'Masuk ke Akun Anda',
      buttonText: 'Masuk',
      linkText: 'Belum punya akun?',
      linkActionText: 'Daftar di sini',
      linkHref: '/auth/register',
    },
    register: {
      title: 'Buat Akun Baru',
      buttonText: 'Buat Akun',
      linkText: 'Sudah punya akun?',
      linkActionText: 'Masuk di sini',
      linkHref: '/auth/login',
    },
    'forgot-password': {
      title: 'Lupa Kata Sandi',
      buttonText: 'Kirim Tautan Reset',
      linkText: 'Ingat kata sandi Anda?',
      linkActionText: 'Kembali untuk Masuk',
      linkHref: '/auth/login',
    }
  };

  const currentForm = formDetails[type];

  /**
   * Validasi input form sebelum dikirim ke server.
   * @returns {boolean} - True jika valid, false jika tidak.
   */
  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      setMessage({ type: 'error', message: 'Silakan masukkan alamat email yang valid.' });
      return false;
    }

    if (type === 'register') {
      if (!name.trim()) {
        setMessage({ type: 'error', message: 'Nama lengkap wajib diisi.' });
        return false;
      }
      if (password.length < 6) {
        setMessage({ type: 'error', message: 'Kata sandi minimal harus 6 karakter.' });
        return false;
      }
      if (password !== confirmPassword) {
        setMessage({ type: 'error', message: 'Konfirmasi kata sandi tidak cocok.' });
        return false;
      }
    }
    
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading || !validateForm()) return;

    setIsLoading(true);
    setMessage(null);

    try {
      let result;
      if (type === 'login') {
        result = await signInWithEmail(email, password);
        if (!result.error) {
          router.push('/');
          router.refresh();
          return; 
        }
      } else if (type === 'register') {
        result = await signUpWithEmail(email, password, name);
        if (!result.error) {
          setMessage({ type: 'success', message: 'Pendaftaran berhasil! Silakan periksa email Anda untuk konfirmasi.' });
          setName('');
          setEmail('');
          setPassword('');
          setConfirmPassword('');
        }
      } else if (type === 'forgot-password') {
        result = await resetPassword(email);
        if (!result.error) {
          setMessage({ type: 'success', message: 'Tautan reset kata sandi telah dikirim! Silakan periksa email Anda.' });
          setEmail('');
        }
      }

      if (result?.error) {
        const error = result.error as Error;
        let displayMessage = 'Terjadi kesalahan. Silakan coba lagi.';
        if (error.message.includes('Invalid login credentials')) {
          displayMessage = 'Email atau kata sandi salah. Silakan coba lagi.';
        } else if (error.message.includes('Email not confirmed')) {
          displayMessage = 'Email belum dikonfirmasi. Silakan periksa kotak masuk Anda.';
        } else if (error.message.includes('User already registered')) {
          displayMessage = 'Akun dengan email ini sudah ada. Silakan masuk.';
        }
        setMessage({ type: 'error', message: displayMessage });
      }
    } catch (error) {
      setMessage({ type: 'error', message: 'Terjadi kesalahan yang tidak terduga.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white p-8 rounded-lg shadow-lg border border-gray-200">
        <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">{currentForm.title}</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          {message && <FormMessage type={message.type} message={message.message} />}
          
          {type === 'register' && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Nama Lengkap
              </label>
              <input
                id="name" type="text" value={name}
                onChange={(e) => setName(e.target.value)}
                required disabled={isLoading}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                placeholder="Masukkan nama lengkap Anda"
              />
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Alamat Email
            </label>
            <input
              id="email" type="email" value={email}
              onChange={(e) => setEmail(e.target.value)}
              required disabled={isLoading}
              className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
              placeholder="contoh@email.com"
            />
          </div>

          {(type === 'login' || type === 'register') && (
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Kata Sandi
              </label>
              <input
                id="password" type="password" value={password}
                onChange={(e) => setPassword(e.target.value)}
                required minLength={6} disabled={isLoading}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                placeholder="••••••••"
              />
            </div>
          )}

          {type === 'register' && (
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Konfirmasi Kata Sandi
              </label>
              <input
                id="confirmPassword" type="password" value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required minLength={6} disabled={isLoading}
                className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition disabled:bg-gray-100"
                placeholder="••••••••"
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full flex justify-center items-center bg-blue-600 text-white font-semibold p-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200"
          >
            {isLoading && <SpinnerIcon />}
            {isLoading ? 'Memproses...' : currentForm.buttonText}
          </button>
        </form>

        {type === 'login' && (
          <div className="mt-4 text-center">
            <Link href="/auth/forgot-password" className="text-sm text-blue-600 hover:underline">
              Lupa kata sandi?
            </Link>
          </div>
        )}

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            {currentForm.linkText}{' '}
            <Link href={currentForm.linkHref} className="font-semibold text-blue-600 hover:underline">
              {currentForm.linkActionText}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
