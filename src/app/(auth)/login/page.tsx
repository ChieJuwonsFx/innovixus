'use client';

import Link from 'next/link';
import { AuthForm } from '@/app/components/auth/AuthForm';
import { SocialAuth } from '../../components/auth/SocialAuth';
import { KeyRound } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <motion.div
      className="w-full max-w-md space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Selamat Datang Kembali
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Masuk ke akun Anda untuk melanjutkan
        </p>
      </div>

      <AuthForm type="login" />

      <SocialAuth />

      <div className="pt-2 text-center space-y-3">
        <Link
          href="/forgot-password"
          className="inline-flex items-center text-sm font-medium text-blue-600 transition-colors hover:underline dark:text-blue-400"
        >
          <KeyRound className="mr-1.5 h-4 w-4" />
          Lupa kata sandi?
        </Link>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Belum punya akun?{' '}
          <Link
            href="/register"
            className="font-medium text-blue-600 transition-colors hover:underline dark:text-blue-400"
          >
            Daftar sekarang
          </Link>
        </p>
      </div>
    </motion.div>
  );
}