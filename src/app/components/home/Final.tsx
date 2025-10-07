"use client";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { ArrowRight, UserPlus } from 'lucide-react';

interface FinalCTAProps {
  router: AppRouterInstance;
}

export default function Final({ router }: FinalCTAProps) {
  return (
    <section className="relative py-20 px-4 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[url('/grid-light.svg')] bg-center [mask-image:radial-gradient(ellipse_at_center,white_20%,transparent_70%)] dark:bg-[url('/grid-dark.svg')]"></div>
      </div>
      <div className="relative max-w-5xl mx-auto z-10">
        <div className="bg-white/60 dark:bg-gray-900/60 backdrop-blur-lg border border-gray-200 dark:border-gray-800 rounded-3xl p-8 md:p-12 text-center shadow-2xl shadow-black/5">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900 dark:text-white mb-6">
            Siap Memulai Perjalanan Karir Anda?
          </h2>
          <p className="text-lg text-gray-600 dark:text-gray-400 mb-10 max-w-2xl mx-auto">
            Bergabunglah dengan ribuan mahasiswa dan fresh graduate yang telah menemukan peluang impian mereka.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => router.push("/register")}
              className="group inline-flex items-center justify-center px-7 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-full transition-all duration-300 shadow-lg shadow-blue-500/20 hover:shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1"
            >
              <UserPlus className="w-5 h-5 mr-2 -ml-1" />
              Daftar Gratis Sekarang
            </button>
            
            <button
              onClick={() => router.push("/login")}
              className="group inline-flex items-center justify-center px-7 py-3.5 bg-gray-500/10 hover:bg-gray-500/20 dark:bg-white/10 dark:hover:bg-white/20 text-gray-800 dark:text-gray-200 font-semibold rounded-full transition-all duration-300"
            >
              Sudah Punya Akun?
              <ArrowRight className="w-5 h-5 ml-2 transition-transform duration-300 group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}