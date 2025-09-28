'use client';

import Link from 'next/link';
import { CheckCircle2 } from 'lucide-react';
import { Database } from '@/types/database';
import { motion, Variants } from 'framer-motion';

type Package = Database['public']['Tables']['packages']['Row'];
type Organizer = Database['public']['Tables']['organizers']['Row'];
type EventData = Omit<Database['public']['Tables']['events']['Insert'], 'id' | 'organizer_id' | 'user_id' | 'status' | 'partnership_id'>;


interface SuccessProps {
  selectedPackage: Package;
  organizer: Organizer;
  event: EventData; 
}

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      ease: 'easeOut',
      duration: 0.5,
    },
  },
};

export default function Step4_Success({}: SuccessProps) {
  return (
    <motion.div 
      className="relative flex flex-col items-center justify-center text-center p-8 overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <div 
        aria-hidden="true" 
        className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-green-100/50 via-transparent to-transparent dark:from-green-900/20"
      ></div>

      <motion.div variants={itemVariants}>
        <CheckCircle2 className="w-24 h-24 text-green-500 mb-6" />
      </motion.div>

      <motion.h2 
        className="text-3xl font-bold text-slate-900 dark:text-white"
        variants={itemVariants}
      >
        Pengajuan Berhasil!
      </motion.h2>

      <motion.p 
        className="mt-3 max-w-md text-slate-600 dark:text-slate-400"
        variants={itemVariants}
      >
        Terima kasih! Data partnership Anda telah kami terima dan akan segera kami proses.
      </motion.p>

      <motion.div 
        className="mt-10 flex flex-col sm:flex-row items-center gap-4"
        variants={itemVariants}
      >
        <Link
          href="/partnerships/my-submissions"
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white shadow-sm transition-colors hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Lihat Pengajuan Saya
        </Link>
        <Link
          href="/"
          className="w-full sm:w-auto inline-flex items-center justify-center rounded-lg bg-transparent px-6 py-3 font-semibold text-blue-600 dark:text-white shadow-sm transition-colors hover:bg-blue-700 dark:hover:bg-white border border-blue-600 dark:border-white hover:text-white dark:hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          Kembali ke Beranda
        </Link>
      </motion.div>
    </motion.div>
  );
}