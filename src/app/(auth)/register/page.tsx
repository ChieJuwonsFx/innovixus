'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuthForm } from '@/components/auth/AuthForm';
import { SocialAuth } from '@/components/auth/SocialAuth';

export default function RegisterPage() {
  return (
    <motion.div
      className="w-full max-w-md mt-36 space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
          Bergabung Bersama Kami
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Buat akun untuk memulai pengalaman terbaik Anda.
        </p>
      </div>

      <AuthForm type="register" />
      <SocialAuth />

      <div className="space-y-4 pt-2 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
          Dengan mendaftar, Anda menyetujui{' '}
          <Link href="/terms" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            Syarat Ketentuan
          </Link>{' '}
          &{' '}
          <Link href="/privacy" className="font-medium text-blue-600 hover:underline dark:text-blue-400">
            Kebijakan Privasi
          </Link>
          {' '}kami.
        </p>
        
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Sudah punya akun?{' '}
          <Link
            href="/login"
            className="inline-flex items-center gap-1 font-semibold text-blue-600 transition-colors hover:underline dark:text-blue-400"
          >
            Masuk di sini
          </Link>
        </p>
      </div>
    </motion.div>
  );
}