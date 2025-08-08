'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuthForm } from '@/app/components/auth/AuthForm';
import { ArrowLeft, Shield, Mail, AlertTriangle } from 'lucide-react';

export default function ForgotPasswordPage() {
  return (
    <motion.div
      className="w-full max-w-md space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-3 text-center">
        <div className="mt-6 space-y-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
            Lupa Kata Sandi?
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Jangan khawatir! Masukkan email Anda di bawah ini.
          </p>
        </div>
      </div>

      <AuthForm type="forgot-password" />

      <div className="text-center">
        <Link
          href="/login"
          className="group inline-flex items-center gap-1.5 text-sm font-semibold text-blue-600 transition-colors hover:underline dark:text-blue-400"
        >
          <ArrowLeft size={16} className="transition-transform group-hover:-translate-x-1" />
          <span>Kembali ke halaman masuk</span>
        </Link>
      </div>

      <div className="space-y-4 rounded-xl border border-gray-200 bg-slate-50 p-5 dark:border-gray-700 dark:bg-slate-800/50">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-200">
          <Shield size={16} className="text-purple-600 dark:text-purple-400" />
          Proses Aman & Mudah
        </h3>
        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
          <li className="flex items-start gap-2.5">
            <Mail size={16} className="mt-0.5 flex-shrink-0 text-blue-500" />
            <span>Tautan reset akan dikirim ke email yang terdaftar dan hanya berlaku selama 24 jam.</span>
          </li>
          <li className="flex items-start gap-2.5">
            <AlertTriangle size={16} className="mt-0.5 flex-shrink-0 text-yellow-500" />
            <span>Jika tidak ada, periksa folder spam atau coba lagi dalam 5 menit.</span>
          </li>
        </ul>
      </div>

      <div className="pt-2 text-center text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          Butuh bantuan lebih lanjut?{' '}
          <Link
            href="/contact"
            className="font-semibold text-blue-600 hover:underline dark:text-blue-400"
          >
            Hubungi kami
          </Link>
        </p>
      </div>
    </motion.div>
  );
}
