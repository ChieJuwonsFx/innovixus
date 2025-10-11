"use client";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";

interface HeroSectionProps {
  router: AppRouterInstance;
}

export default function Hero({}: HeroSectionProps) {
  return (
    // PENYESUAIAN KRITIS:
    // 1. Tambahkan `pt-32` (padding atas sangat besar) untuk mobile
    // 2. Turunkan kembali padding di layar medium (`md:pt-0`)
    // 3. Tambahkan `py-16` untuk padding vertical yang aman di layar besar
    <section className="min-h-screen flex items-center justify-center pt-32 pb-16 md:py-16 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-4">
          <div className="flex justify-center mb-5">
            <Image
              src="/logo/logo.png"
              alt="InnoVixus Logo"
              width={100}
              height={100}
              priority
            />
          </div>

          <div className="text-2xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent mb-6">
            InnoVixus
          </div>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Platform terdepan untuk mahasiswa dan fresh graduate dalam menemukan
            peluang lomba, magang, dan karir impian.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          <div className="text-center p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
              0
            </div>
            <div className="text-gray-700 dark:text-gray-300">
              Peluang Lomba{" "}
              <span className="text-sm text-gray-500">
                (sedang bertambah)
              </span>
            </div>
          </div>
          <div className="text-center p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-3xl font-bold text-indigo-600 dark:text-indigo-400 mb-2">
              0
            </div>
            <div className="text-gray-700 dark:text-gray-300">
              Program Magang{" "}
              <span className="text-sm text-gray-500">(coming soon)</span>
            </div>
          </div>
          <div className="text-center p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
            <div className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-2">
              0
            </div>
            <div className="text-gray-700 dark:text-gray-300">
              Lowongan Kerja{" "}
              <span className="text-sm text-gray-500">(akan tersedia)</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}