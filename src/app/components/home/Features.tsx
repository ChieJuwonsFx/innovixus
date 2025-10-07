"use client";
import Link from 'next/link';
import { Trophy, Briefcase, SearchCode, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Features() {
  return (
    <section className="relative py-20 px-4 bg-white dark:bg-gray-900 overflow-hidden">
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))] -z-0"></div>
      
      <div className="max-w-6xl mx-auto z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Fitur Unggulan
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
            Temukan semua yang Anda butuhkan untuk mengembangkan karir dalam satu platform.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Link href="/info-lomba" className="block group">
            <div className="p-8 h-full bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-blue-500/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Info Lomba Terlengkap
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Akses ribuan kompetisi dari berbagai bidang dengan filter pencarian canggih.
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-8">
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-blue-500 mr-3" />Update real-time</li>
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-blue-500 mr-3" />Filter berdasarkan kategori</li>
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-blue-500 mr-3" />Reminder deadline</li>
              </ul>
              <div className="flex items-center font-semibold text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Selengkapnya <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Link>

          <Link href="/info-magang" className="block group">
            <div className="p-8 h-full bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 shadow-indigo-500/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Program Magang
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Koneksi langsung dengan perusahaan untuk pengalaman profesional yang berharga.
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-8">
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3" />Perusahaan dan Start Up</li>
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3" />Mentorship program</li>
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-indigo-500 mr-3" />Sertifikat resmi</li>
              </ul>
              <div className="flex items-center font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Selengkapnya <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Link>

          <Link href="/info-loker" className="block group">
            <div className="p-8 h-full bg-white dark:bg-gray-800/50 rounded-2xl border border-gray-200/80 dark:border-gray-700/50 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2">
              <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 shadow-purple-500/30 shadow-lg group-hover:scale-110 transition-transform duration-300">
                <SearchCode className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Lowongan Kerja
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Temukan lowongan kerja eksklusif dengan sistem matching cerdas berdasarkan skill Anda.
              </p>
              <ul className="space-y-3 text-gray-600 dark:text-gray-300 mb-8">
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-purple-500 mr-3" />AI-powered matching</li>
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-purple-500 mr-3" />Job transparency</li>
                <li className="flex items-center"><CheckCircle2 className="w-5 h-5 text-purple-500 mr-3" />One-click apply</li>
              </ul>
              <div className="flex items-center font-semibold text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                Selengkapnya <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
