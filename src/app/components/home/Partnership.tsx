"use client";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import { Handshake, Target, TrendingUp, ArrowRight } from 'lucide-react';

interface PartnershipCTAProps {
  router: AppRouterInstance;
}

export default function Partnership({ router }: PartnershipCTAProps) {
  return (
    <section className="px-4 py-20 bg-slate-50 dark:bg-slate-950">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-10 dark:border-slate-800 dark:bg-slate-900 sm:px-10 lg:px-12">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-sm font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
              Partnership
            </p>
            <h2 className="mt-3 text-3xl md:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
              Satu jalur sederhana untuk bermitra.
            </h2>
            <p className="mt-4 text-base md:text-lg leading-relaxed text-slate-600 dark:text-slate-400">
              Fokus pada hasil, bukan keramaian visual. Kami bantu perusahaan menjangkau talenta yang tepat dengan alur yang jelas.
            </p>
          </div>

          <div className="mt-8 flex flex-wrap justify-center gap-3 text-sm text-slate-600 dark:text-slate-400">
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 dark:border-slate-800">
              <Handshake className="h-4 w-4" /> Proses ringkas
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 dark:border-slate-800">
              <Target className="h-4 w-4" /> Target jelas
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 dark:border-slate-800">
              <TrendingUp className="h-4 w-4" /> Dampak terukur
            </span>
          </div>

          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <button
              onClick={() => router.push("/partnership")}
              className="inline-flex items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
            >
              Ajukan Partnership
            </button>
            <button
              onClick={() => router.push("/partnerships")}
              className="inline-flex items-center justify-center rounded-full border border-slate-200 px-6 py-3 text-sm font-medium text-slate-700 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-700 dark:text-slate-300 dark:hover:border-slate-600 dark:hover:bg-slate-800"
            >
              Lihat detail
              <ArrowRight className="ml-2 h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}