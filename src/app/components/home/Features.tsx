"use client";
import Link from 'next/link';
import { Trophy, Briefcase, SearchCode, CheckCircle2, ArrowRight } from 'lucide-react';

export default function Features() {
  return (
    <section className="bg-white dark:bg-slate-950 px-4 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
            Fitur
          </p>
          <h2 className="mt-3 text-3xl md:text-4xl font-semibold text-slate-900 dark:text-white">
            Tiga akses utama dalam satu tempat.
          </h2>
          <p className="mt-4 text-base md:text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
            Ringkas, fokus, dan langsung ke kebutuhan yang paling sering dipakai.
          </p>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <Link href="/info-lomba" className="block group">
            <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-slate-700">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                <Trophy className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Info Lomba Terlengkap
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Akses ribuan kompetisi dari berbagai bidang dengan filter pencarian canggih.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" />Update real-time</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" />Filter kategori</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" />Reminder deadline</li>
              </ul>
              <div className="mt-6 flex items-center text-sm font-medium text-slate-900 dark:text-white">
                Selengkapnya <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Link>

          <Link href="/info-magang" className="block group">
            <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-slate-700">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                <Briefcase className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Program Magang
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Koneksi langsung dengan perusahaan untuk pengalaman profesional yang berharga.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" />Perusahaan dan startup</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" />Mentorship program</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" />Sertifikat resmi</li>
              </ul>
              <div className="mt-6 flex items-center text-sm font-medium text-slate-900 dark:text-white">
                Selengkapnya <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Link>

          <Link href="/info-loker" className="block group">
            <div className="h-full rounded-2xl border border-slate-200 bg-white p-6 transition-all duration-300 group-hover:border-slate-300 group-hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:group-hover:border-slate-700">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950">
                <SearchCode className="h-5 w-5 text-slate-700 dark:text-slate-300" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white">
                Lowongan Kerja
              </h3>
              <p className="mt-3 text-sm leading-6 text-slate-600 dark:text-slate-400">
                Temukan lowongan kerja eksklusif dengan sistem matching cerdas berdasarkan skill Anda.
              </p>
              <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" />Matching cerdas</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" />Job transparency</li>
                <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-slate-400" />One-click apply</li>
              </ul>
              <div className="mt-6 flex items-center text-sm font-medium text-slate-900 dark:text-white">
                Selengkapnya <ArrowRight className="w-4 h-4 ml-2" />
              </div>
            </div>
          </Link>

        </div>
      </div>
    </section>
  );
}
