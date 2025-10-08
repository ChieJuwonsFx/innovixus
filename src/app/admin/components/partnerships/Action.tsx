'use client';

import { useFormStatus } from 'react-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  BadgeCheck, 
  Rocket,
  Clock,
  CircleDollarSign,
  ThumbsUp,
  ShieldAlert
} from 'lucide-react';
import { Database } from '@/types/database';

function ActionButton({ label, loadingLabel, Icon, className, disabled }: { label: string, loadingLabel: string, Icon: React.ElementType, className: string, disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <button 
      type="submit" 
      disabled={pending || disabled} 
      className={`w-full px-6 py-2.5 font-bold rounded-lg border-1 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center ${className}`}
    >
      {pending ? (<><Loader2 className="mr-2 h-5 w-5 animate-spin" />{loadingLabel}</>) : (<><Icon className="mr-2 h-5 w-5" />{label}</>)}
    </button>
  );
}

type Partnership = Database['public']['Tables']['partnerships']['Row'];
type Event = Database['public']['Tables']['events']['Row'] | null;
type Package = Database['public']['Tables']['packages']['Row'] | null;

interface Props {
  partnership: Partnership;
  event: Event;
  packageData: Package; 
  approveAction: () => void;
  rejectAction: () => void;
  verifyPaymentAction: () => void;
  publishEventAction: () => void;
}

function StatusInfo({ statusInfo }: { statusInfo: { style: string; message: string; Icon: React.ElementType } | null }) {
  if (!statusInfo) return null;
  const { style, message, Icon } = statusInfo;
  return (
    <div className={`mt-4 p-3 border rounded-lg flex items-center justify-center gap-2 ${style}`}>
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="text-sm font-medium">{message}</p>
    </div>
  );
}

export default function Action({ partnership, event, packageData, approveAction, rejectAction, verifyPaymentAction, publishEventAction }: Props) {
  const isApproved = partnership.payment_status === 'Paid' && event?.status === 'Success';
  const isRejected = partnership.payment_status === 'Canceled';
  const isFree = packageData?.price === 0;

  const getStatusInfo = () => {
    if (isApproved) return { style: "bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-700 text-green-800 dark:text-green-200", message: "Partnership disetujui", Icon: ThumbsUp };
    if (isRejected) return { style: "bg-red-50 dark:bg-red-900/30 border-red-200 dark:border-red-700 text-red-800 dark:text-red-200", message: "Partnership ditolak", Icon: XCircle };
    if (partnership.payment_status === 'Unpaid') return { style: "bg-orange-50 dark:bg-orange-900/30 border-orange-200 dark:border-orange-700 text-orange-800 dark:text-orange-200", message: isFree ? "Menunggu persetujuan" : "Menunggu pembayaran", Icon: Clock };
    if (partnership.payment_status === 'Pending') return { style: "bg-yellow-50 dark:bg-yellow-900/30 border-yellow-200 dark:border-yellow-700 text-yellow-800 dark:text-yellow-200", message: "Menunggu konfirmasi", Icon: CircleDollarSign };
    if (partnership.payment_status === 'Paid') return { style: "bg-sky-50 dark:bg-sky-900/30 border-sky-200 dark:border-sky-700 text-sky-800 dark:text-sky-200", message: "Pembayaran terverifikasi", Icon: BadgeCheck };
    return null;
  };

  const statusInfo = getStatusInfo();

  const renderActionButtons = () => {
    if (isApproved || isRejected) return null;

    if (isFree) {
      return (
        <div className="space-y-3">
          <form action={approveAction}><ActionButton label="Setujui & Publikasikan" loadingLabel="Mempreds..." Icon={CheckCircle2} className="bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-600 hover:bg-green-100 dark:hover:bg-green-900" /></form>
          <form action={rejectAction}><ActionButton label="Tolak Partnership" loadingLabel="Menolak..." Icon={XCircle} className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-600 hover:bg-red-100 dark:hover:bg-red-900" /></form>
        </div>
      );
    }

    switch (partnership.payment_status) {
      case 'Pending':
        return (
          <div className="space-y-3">
            <form action={verifyPaymentAction}><ActionButton label="Verifikasi Pembayaran" loadingLabel="Memverifikasi..." Icon={BadgeCheck} className="bg-sky-50 dark:bg-sky-900/20 text-sky-700 dark:text-sky-300 border-sky-600 hover:bg-sky-100 dark:hover:bg-sky-900" /></form>
            <form action={rejectAction}><ActionButton label="Tolak Pembayaran" loadingLabel="Menolak..." Icon={XCircle} className="bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-600 hover:bg-red-100 dark:hover:bg-red-900" /></form>
          </div>
        );
      case 'Paid':
        return (
          <div className="space-y-3">
            <form action={publishEventAction}><ActionButton label="Publikasikan Event" loadingLabel="Mempublikasikan..." Icon={Rocket} className="bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 border-indigo-600 hover:bg-indigo-100 dark:hover:bg-indigo-900" /></form>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-200 dark:border-slate-700 sticky top-24">
      <div className="flex items-center gap-3 mb-4">
        <ShieldAlert className="h-6 w-6 text-slate-400"/>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Tindakan & Status</h2>
      </div>
      
      {renderActionButtons()}

      <StatusInfo statusInfo={statusInfo} />
    </div>
  );
}