import Image from 'next/image';

interface Props {
  proofUrl: string;
}

export default function PaymentProof({ proofUrl }: Props) {
  return (
    <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-6 border dark:border-slate-700">
      <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-4">
        Bukti Pembayaran
      </h2>
      <div className="relative w-full aspect-[3/4] max-w-sm mx-auto bg-white dark:bg-slate-800 rounded-lg overflow-hidden border shadow-sm">
        <Image 
          src={proofUrl} 
          alt="Bukti Pembayaran" 
          fill
          style={{ objectFit: 'contain' }}
          className="p-2"
          priority
        />
      </div>
      <p className="text-xs text-center text-slate-500 dark:text-slate-400 mt-3">
        Ini adalah bukti yang diunggah oleh user.
      </p>
    </div>
  );
}