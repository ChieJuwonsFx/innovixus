'use client';

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

const faqs = [
  {
    question: "Bagaimana cara kerja proses pendaftaran partnership?",
    answer: "Setelah Anda memilih paket dan mengisi formulir, tim kami akan meninjau pengajuan Anda dalam 1x24 jam. Jika disetujui, event Anda akan langsung dipublikasikan."
  },
  {
    question: "Apa saja metode pembayaran yang diterima?",
    answer: "Kami menerima pembayaran melalui transfer bank, kartu kredit, dan e-wallet (GoPay, OVO, Dana) melalui payment gateway yang aman."
  },
  {
    question: "Berapa lama event saya akan ditampilkan di platform?",
    answer: "Durasi penayangan event tergantung pada paket yang Anda pilih. Paket gratis biasanya ditampilkan hingga tanggal event berakhir, sementara paket berbayar mendapatkan durasi promosi yang lebih lama."
  },
  {
    question: "Bisakah saya mengubah detail event setelah dipublikasikan?",
    answer: "Tentu. Anda dapat mengubah detail event Anda kapan saja melalui dashboard partnership Anda. Perubahan akan langsung terlihat setelah disimpan."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
} as const; 

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section>
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center text-slate-900 dark:text-white sm:text-4xl">
          Pertanyaan Umum (FAQ)
        </h2>
        <p className="mt-4 max-w-2xl mx-auto text-center text-lg text-slate-600 dark:text-slate-400">
          Tidak menemukan jawaban yang Anda cari? Hubungi kami langsung.
        </p>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="mt-12 max-w-7xl mx-auto flex flex-col gap-3"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={itemVariants} 
              className={clsx(
                'rounded-xl border transition-all duration-300',
                openIndex === index 
                  ? 'bg-white dark:bg-slate-800/50 border-blue-500/50' 
                  : 'bg-white/50 dark:bg-slate-800/20 border-slate-200 dark:border-slate-700/50 hover:bg-white dark:hover:bg-slate-800/40'
              )}
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex justify-between items-center text-left p-5"
              >
                <span className="text-base font-medium text-slate-800 dark:text-slate-100">{faq.question}</span>
                <div className="flex-shrink-0 ml-4 p-1 rounded-full bg-slate-100 dark:bg-slate-700/50">
                  <ChevronDown className={clsx(
                    'w-5 h-5 text-slate-500 dark:text-slate-400 transition-transform duration-300',
                    openIndex === index && 'rotate-180 text-blue-600 dark:text-blue-400'
                  )} />
                </div>
              </button>
              
              <AnimatePresence initial={false}>
                {openIndex === index && (
                  <motion.div
                    initial="collapsed"
                    animate="open"
                    exit="collapsed"
                    variants={{
                      open: { opacity: 1, height: 'auto' },
                      collapsed: { opacity: 0, height: 0 }
                    }}
                    transition={{ duration: 0.3, ease: 'easeInOut' }}
                    className="overflow-hidden"
                  >
                    <p className="px-5 pb-5 text-slate-600 dark:text-slate-400">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}