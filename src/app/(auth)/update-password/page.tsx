'use client';

import { useState } from 'react'; 
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuthForm } from '@/components/auth/AuthForm';
import { Shield, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';

export default function UpdatePasswordPage() {
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  return (
    <motion.div
      className="w-full max-w-md space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Buat Kata Sandi Baru
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Pastikan kata sandi Anda kuat dan mudah diingat.
        </p>
      </div>

        <AuthForm type="update-password" />
      
      <div className="rounded-xl border border-gray-200 bg-slate-50 dark:border-gray-700 dark:bg-slate-800/50">
        <button
          onClick={() => setIsAccordionOpen(!isAccordionOpen)}
          className="flex w-full items-center justify-between p-4 text-left font-semibold text-gray-800 dark:text-gray-200"
        >
          <span>Informasi Tambahan</span>
          <ChevronDown
            size={20}
            className={`transform transition-transform duration-300 ${isAccordionOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {isAccordionOpen && (
          <div className="space-y-4 border-t border-gray-200 p-4 dark:border-gray-700">
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                <Shield size={16} className="text-purple-500" />
                Tips Kata Sandi Aman
              </h3>
              <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                <li className="flex items-start gap-2">
                  <CheckCircle size={14} className="mt-1 flex-shrink-0 text-green-500" />
                  <span>Minimal 8 karakter, kombinasi huruf & angka.</span>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="mb-2 flex items-center gap-2 text-sm font-medium text-yellow-700 dark:text-yellow-400">
                <AlertTriangle size={16} />
                Pemberitahuan
              </h3>
              <p className="text-sm text-yellow-800 dark:text-yellow-30ou0">
                Setelah berhasil, Anda akan keluar dari perangkat lain.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="pt-2 text-center text-sm">
        <p className="text-gray-600 dark:text-gray-400">
          Butuh bantuan?{' '}
          <Link href="/contact" className="font-semibold text-blue-600 hover:underline dark:text-blue-400">
            Hubungi kami
          </Link>
        </p>
      </div>
    </motion.div>
  );
}