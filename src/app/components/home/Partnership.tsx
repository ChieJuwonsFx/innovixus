"use client";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Handshake, Target, TrendingUp, ArrowRight } from 'lucide-react';

interface PartnershipCTAProps {
  router: AppRouterInstance;
}

export default function Partnership({ router }: PartnershipCTAProps) {
  return (
    <section className="relative py-20 px-4 bg-gradient-to-br from-blue-500 to-indigo-600 dark:from-gray-950 dark:to-blue-950 overflow-hidden">
      
      <div aria-hidden="true" className="absolute inset-0 z-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-400/40 dark:bg-cyan-400/20 rounded-full filter blur-3xl opacity-50 animate-blob"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-400/40 dark:bg-purple-400/20 rounded-full filter blur-3xl opacity-50 animate-blob animation-delay-4000"></div>
      </div>
      
      <div className="relative max-w-4xl mx-auto text-center z-10">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 tracking-tight">
          Ingin Bermitra dengan Kami?
        </h2>
        <p className="text-lg text-blue-100 dark:text-gray-300 mb-12 max-w-2xl mx-auto leading-relaxed">
          Bergabunglah dengan ratusan perusahaan yang telah mempercayai platform kami untuk menemukan talenta digital terbaik.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transition-all duration-300 hover:border-white/40 hover:bg-white/20 transform hover:-translate-y-2">
            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-white/10 rounded-xl">
              <Handshake className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Partnership Mudah</h3>
            <p className="text-blue-100 dark:text-gray-400 text-sm">Proses partnership yang simpel dan transparan.</p>
          </div>

          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transition-all duration-300 hover:border-white/40 hover:bg-white/20 transform hover:-translate-y-2">
            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-white/10 rounded-xl">
              <Target className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">Target Tepat</h3>
            <p className="text-blue-100 dark:text-gray-400 text-sm">Jangkau kandidat sesuai kriteria perusahaan Anda.</p>
          </div>
          
          <div className="bg-white/10 dark:bg-white/5 backdrop-blur-lg rounded-2xl p-6 border border-white/20 transition-all duration-300 hover:border-white/40 hover:bg-white/20 transform hover:-translate-y-2">
            <div className="mx-auto w-16 h-16 mb-4 flex items-center justify-center bg-white/10 rounded-xl">
              <TrendingUp className="w-8 h-8 text-white" />
            </div>
            <h3 className="font-semibold text-white text-lg mb-2">ROI Maksimal</h3>
            <p className="text-blue-100 dark:text-gray-400 text-sm">Dapatkan talenta berkualitas dengan efisien.</p>
          </div>
        </div>

        <button
          onClick={() => router.push("/partnership")}
          className="group inline-flex items-center px-8 py-4 bg-white text-blue-600 dark:bg-white/90 dark:text-blue-950 font-bold rounded-full transition-all duration-300 shadow-lg hover:shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1"
        >
          Ajukan Partnership
          <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
        </button>
      </div>
    </section>
  );
}