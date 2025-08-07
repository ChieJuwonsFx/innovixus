'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { AuthForm } from '@/components/auth/AuthForm';
import { Lock, Shield, CheckCircle, AlertTriangle, ChevronDown } from 'lucide-react';

export default function UpdatePasswordPage() {
  const [password, setPassword] = useState('');
  const [strength, setStrength] = useState(0);
  const [strengthColor, setStrengthColor] = useState('bg-gray-300');
  const [isAccordionOpen, setIsAccordionOpen] = useState(false);

  // Fungsi untuk menghitung kekuatan kata sandi
  const calculateStrength = (pass: string) => {
    let score = 0;
    if (pass.length > 7) score += 25;
    if (pass.match(/[A-Z]/)) score += 25;
    if (pass.match(/[0-9]/)) score += 25;
    if (pass.match(/[^A-Za-z0-9]/)) score += 25;
    return score;
  };

  // useEffect untuk memantau perubahan password
  useEffect(() => {
    const newStrength = calculateStrength(password);
    setStrength(newStrength);

    if (newStrength < 50) {
      setStrengthColor('bg-red-500');
    } else if (newStrength < 75) {
      setStrengthColor('bg-yellow-500');
    } else {
      setStrengthColor('bg-green-500');
    }
  }, [password]);

  // Callback untuk menerima password dari AuthForm
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPassword(e.target.value);
  };

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

      <div className="space-y-4">
        <AuthForm type="update-password" onPasswordChange={handlePasswordChange} />
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-xs font-medium text-gray-500 dark:text-gray-400">
            <span>Lemah</span>
            <span>Kuat</span>
          </div>
          <div className="h-2 w-full rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${strength > 0 ? strengthColor : 'bg-transparent'}`}
              style={{ width: `${strength}%` }}
            />
          </div>
        </div>
      </div>
      
      {/* Accordion untuk Informasi Tambahan */}
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
              <p className="text-sm text-yellow-800 dark:text-yellow-300">
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