'use client';

import { motion, AnimatePresence, Variants } from 'framer-motion'; 
import { HelpCircle } from 'lucide-react';

interface ConfirmationModalProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmationModal({ 
  message, 
  onConfirm, 
  onCancel 
}: ConfirmationModalProps) {
  
  const backdropVariants: Variants = {
    visible: { opacity: 1 },
    hidden: { opacity: 0 },
  };

  const modalVariants: Variants = {
    hidden: { y: 30, opacity: 0, scale: 0.95 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        ease: 'easeOut',
        duration: 0.25,
      },
    },
    exit: {
      y: 30,
      opacity: 0,
      scale: 0.95,
      transition: {
        ease: 'easeIn',
        duration: 0.2,
      },
    },
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        variants={backdropVariants}
        initial="hidden"
        animate="visible"
        exit="hidden"
        onClick={onCancel}
      >
        <motion.div
          className="relative bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-2xl shadow-xl max-w-sm w-full"
          variants={modalVariants}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/50 mb-4">
            <HelpCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>

          <div className="text-center">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
              Konfirmasi Pilihan
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              {message}
            </p>
          </div>
          
          <div className="flex justify-center gap-4 mt-8">
            <button 
              onClick={onCancel} 
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold h-10 px-5 bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50 active:scale-[0.98]"
            >
              Tidak, Isi Ulang
            </button>
            <button 
              onClick={onConfirm} 
              className="inline-flex items-center justify-center rounded-lg text-sm font-semibold h-10 px-5 bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50 active:scale-[0.98]"
            >
              Ya, Benar
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}