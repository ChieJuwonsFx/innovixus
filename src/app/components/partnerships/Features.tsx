'use client';

import { useState } from 'react';
import { Users, Target, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const features = [
  {
    icon: Users,
    theme: 'blue',
    title: 'Audiens Relevan',
    description: 'Akses ke komunitas mahasiswa dan profesional muda yang aktif mencari peluang.',
  },
  {
    icon: Target,
    theme: 'emerald',
    title: 'Visibilitas Tertarget',
    description: 'Event Anda akan kami tampilkan kepada pengguna yang paling relevan berdasarkan minat.',
  },
  {
    icon: TrendingUp,
    theme: 'purple',
    title: 'Tingkatkan Partisipan',
    description: 'Maksimalkan jumlah pendaftar dengan jangkauan promosi luas di platform kami.',
  },
];

const themeClasses = {
  blue: {
    bg: 'bg-blue-500/10',
    text: 'text-blue-500',
    highlight: 'from-blue-500/50 to-blue-500/10',
    iconBg: 'bg-blue-500/10',
  },
  emerald: {
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-500',
    highlight: 'from-emerald-500/50 to-emerald-500/10',
    iconBg: 'bg-emerald-500/10',
  },
  purple: {
    bg: 'bg-purple-500/10',
    text: 'text-purple-500',
    highlight: 'from-purple-500/50 to-purple-500/10',
    iconBg: 'bg-purple-500/10',
  },
};

export function FeaturesSection() {
  const [activeFeature, setActiveFeature] = useState(features[0]);

  const theme = themeClasses[activeFeature.theme as keyof typeof themeClasses];

  return (
    <section className="relative max-w-7xl mx-auto">
      <div 
        aria-hidden="true" 
        className="absolute inset-0 -z-10 h-full w-full bg-slate-50 dark:bg-slate-900 bg-[radial-gradient(#e2e8f0_1px,transparent_1px)] dark:bg-[radial-gradient(#ffffff1a_1px,transparent_1px)] [background-size:20px_20px]"
      />

      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-4xl">
            Mengapa Bermitra dengan Kami?
          </h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Platform kami dirancang untuk memberikan visibilitas dan jangkauan maksimal bagi setiap event organizer yang ingin sukses.
          </p>
        </div>

        <div className="mt-16 grid items-center gap-12 lg:grid-cols-2 lg:gap-20">
          
          <div className="flex flex-col gap-4">
            {features.map((feature) => (
              <button
                key={feature.title}
                onMouseEnter={() => setActiveFeature(feature)}
                className={clsx(
                  'flex items-start gap-4 rounded-xl p-4 text-left transition-colors duration-300',
                  activeFeature.title === feature.title
                    ? 'bg-white dark:bg-slate-800/60 shadow-sm'
                    : 'hover:bg-white/60 dark:hover:bg-slate-800/30'
                )}
              >
                <div className={clsx(
                  "mt-1 flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg",
                  themeClasses[feature.theme as keyof typeof themeClasses].iconBg
                )}>
                  <feature.icon className={clsx("h-6 w-6", themeClasses[feature.theme as keyof typeof themeClasses].text)} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-800 dark:text-white">
                    {feature.title}
                  </h3>
                  <p className="mt-1 text-slate-600 dark:text-slate-400">
                    {feature.description}
                  </p>
                </div>
              </button>
            ))}
          </div>
          
          <div className="relative flex h-80 items-center justify-center lg:h-96">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeFeature.title}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={clsx(
                  "absolute inset-0 flex items-center justify-center rounded-2xl p-8",
                  "bg-gradient-to-br",
                  theme.highlight
                )}
              >
                <div className="relative flex h-48 w-48 items-center justify-center rounded-full bg-white/70 dark:bg-slate-800/50 backdrop-blur-lg shadow-inner">
                   <activeFeature.icon className={clsx("h-20 w-20", theme.text)} />
                </div>
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}