'use client';

import { useState } from 'react';
import PaymentProofUploader from './PaymentProofUploader';
import { uploadPaymentProof } from '@/app/partnerships/payment/action';
import { Upload, AlertCircle, CheckCircle2, Loader2, FileText } from 'lucide-react';

interface PaymentFormProps {
  partnership: {
    id: string;
    packages: { name: string; price: number } | null;
  };
}

export default function PaymentForm({ partnership }: PaymentFormProps) {
  const [proofUrl, setProofUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!proofUrl) {
      setSubmitStatus('error');
      setErrorMessage('Harap upload bukti pembayaran terlebih dahulu!');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      const result = await uploadPaymentProof(partnership.id, proofUrl);
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      setSubmitStatus('success');
      
      // Redirect after 2 seconds
      setTimeout(() => {
        window.location.href = '/partnerships/my-submissions';
      }, 2000);
      
    } catch (err) {
      console.error(err);
      setSubmitStatus('error');
      setErrorMessage(err instanceof Error ? err.message : 'Terjadi kesalahan. Coba lagi.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="border-b border-slate-200 dark:border-slate-700 pb-6">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <FileText className="w-6 h-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              Upload Bukti Pembayaran
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Paket: <span className="font-semibold text-slate-900 dark:text-white">{partnership.packages?.name}</span>
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div>
          <PaymentProofUploader onUploadSuccess={(url) => {
            setProofUrl(url);
            setSubmitStatus('idle');
            setErrorMessage('');
          }} />
          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
            Format yang didukung: JPG, PNG, PDF (Max 5MB)
          </p>
        </div>

        {submitStatus === 'success' && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-green-800 dark:text-green-300">
                Bukti pembayaran berhasil dikirim!
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                Anda akan diarahkan ke halaman pengajuan...
              </p>
            </div>
          </div>
        )}

        {submitStatus === 'error' && errorMessage && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                Gagal mengirim bukti pembayaran
              </p>
              <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        <div className="p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
          <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-300 mb-2 flex items-center gap-2">
            <Upload size={16} />
            Petunjuk Upload
          </h4>
          <ul className="space-y-1.5 text-xs text-blue-800 dark:text-blue-400">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">•</span>
              <span>Pastikan bukti transfer menampilkan nominal, tanggal, dan nama penerima dengan jelas</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 mt-0.5">•</span>
              <span>Upload screenshot atau foto bukti pembayaran yang tidak blur</span>
            </li>
          </ul>
        </div>

        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting || !proofUrl || submitStatus === 'success'}
            className="w-full inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-lg text-sm font-semibold bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Mengirim Bukti Pembayaran...
              </>
            ) : submitStatus === 'success' ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                Berhasil Terkirim
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Kirim Bukti Pembayaran
              </>
            )}
          </button>
          
          {!proofUrl && (
            <p className="mt-3 text-xs text-center text-slate-500 dark:text-slate-400">
              Upload bukti pembayaran terlebih dahulu untuk melanjutkan
            </p>
          )}
        </div>

      </form>

    </div>
  );
}