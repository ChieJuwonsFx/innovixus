'use client';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useEffect, useState } from 'react';
import { Database, Json } from '@/types/database';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Clock, CreditCard, XCircle, User, Instagram, Ticket, Tag, DollarSign, Globe, MapPin, Calendar, ExternalLink, ImageIcon, Loader2, AlertTriangle } from 'lucide-react';
import Image from 'next/image';
import clsx from 'clsx';
import React from 'react';
import { cancelSubmission } from '../actions';

const CancelModal = ({ 
  isOpen, 
  onClose, 
  partnershipId, 
  eventId 
}: { 
  isOpen: boolean; 
  onClose: () => void; 
  partnershipId: string;
  eventId: string | null;
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleConfirm = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await cancelSubmission(partnershipId, eventId);
      
      if (!result.success) {
        setError(result.message);
        setIsLoading(false);
      }
      // If success, the action will redirect automatically
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-shrink-0 w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Batalkan Pengajuan</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">Tindakan ini tidak dapat dibatalkan</p>
          </div>
        </div>
        
        <p className="text-sm text-slate-600 dark:text-slate-300 mb-6">
          Apakah Anda yakin ingin membatalkan pengajuan partnership ini? Status pengajuan dan event akan diubah menjadi Dibatalkan.
        </p>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Batal
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Membatalkan...
              </>
            ) : (
              'Ya, Batalkan'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const InfoRow = ({ label, icon, children }: { label: string; icon: React.ReactNode; children: React.ReactNode }) => (
    <div className="flex items-start justify-between py-4">
      <dt className="flex items-center gap-3 text-sm font-medium text-slate-600 dark:text-slate-400">
        {icon}<span>{label}</span>
      </dt>
      <dd className="text-sm text-slate-800 dark:text-slate-200 text-right font-medium">{children}</dd>
    </div>
);

const Badge = ({ text, color }: { text: string; color: 'green' | 'blue' | 'purple' }) => (
    <span className={clsx('px-2.5 py-1 text-xs font-semibold rounded-full', {
      'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': color === 'green',
      'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300': color === 'blue',
      'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300': color === 'purple',
    })}>{text}</span>
);

const StatusBadge = ({ status, type }: { status: string, type: 'payment' | 'event' }) => {
    const statusConfig = {
        payment: { Paid: { text: 'Lunas', icon: CheckCircle2, color: 'green' }, Pending: { text: 'Verifikasi', icon: Clock, color: 'yellow' }, Unpaid: { text: 'Belum Bayar', icon: CreditCard, color: 'red' }, Canceled: { text: 'Batal', icon: XCircle, color: 'slate' },},
        event: { Success: { text: 'Disetujui', icon: CheckCircle2, color: 'green' }, Pending: { text: 'Direview', icon: Clock, color: 'yellow' }, Canceled: { text: 'Ditolak', icon: XCircle, color: 'red' }, Waiting: { text: 'Tunggu Bayar', icon: CreditCard, color: 'slate' }, }
    };
    const typeConfig = statusConfig[type];
    const config = typeConfig[status as keyof typeof typeConfig] || { text: status, icon: Clock, color: 'slate' };
    const Icon = config.icon;
    return (
        <span className={clsx('inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full w-full justify-center', {
            'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300': config.color === 'green', 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300': config.color === 'yellow', 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300': config.color === 'red', 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300': config.color === 'slate',
        })}> <Icon size={14} />{config.text}</span>
    );
};

const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return <span className="text-slate-400 dark:text-slate-500">Tidak Ditentukan</span>;
    return new Date(dateString).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', });
};

const getPosterUrl = (posterData: Json): string | null => {
    if (Array.isArray(posterData) && posterData.length > 0 && posterData[0] && typeof posterData[0] === 'object' && 'url' in posterData[0] && typeof posterData[0].url === 'string') {
      return posterData[0].url;
    } return null;
};

type SubmissionData = Database['public']['Tables']['partnerships']['Row'] & {
  packages?: Database['public']['Tables']['packages']['Row'];
  events?: Database['public']['Tables']['events']['Row'] & {
    organizers?: Database['public']['Tables']['organizers']['Row'];
  };
};

export default function SubmissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const [submission, setSubmission] = useState<SubmissionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const supabase = createClientComponentClient<Database>();

  useEffect(() => {
    const fetchData = async () => {
      const { id } = await params;
      
      const { data, error: fetchError } = await supabase.from('partnerships')
        .select(`*, packages ( * ), events!partnerships_event_id_fkey ( *, organizers ( * ) )`)
        .eq('id', id)
        .single();

      if (fetchError) {
        setError(fetchError as Error);
      } else {
        setSubmission(data as SubmissionData);
      }
      setLoading(false);
    };

    fetchData();
  }, [params, supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4 h-12 w-12" />
          <p className="text-slate-600 dark:text-slate-400">Memuat detail pengajuan...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-red-200 dark:border-red-800 max-w-2xl w-full">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Error Memuat Data</h1>
          <div className="space-y-2 text-sm">
            <p><strong>Error Message:</strong> {error.message}</p>
          </div>
          <Link 
            href="/partnerships/my-submissions" 
            className="mt-6 inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} /> Kembali
          </Link>
        </div>
      </div>
    );
  }

  if (!submission) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-yellow-200 dark:border-yellow-800 max-w-2xl w-full text-center">
          <h1 className="text-2xl font-bold text-yellow-600 mb-4">Data Tidak Ditemukan</h1>
          <p className="text-slate-600 dark:text-slate-400 mb-4">
            Pengajuan tidak ditemukan di database.
          </p>
          <Link 
            href="/partnerships/my-submissions" 
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:underline"
          >
            <ArrowLeft size={16} /> Kembali ke Daftar Pengajuan
          </Link>
        </div>
      </div>
    );
  }
  
  const isCancellable = submission.payment_status === 'Unpaid' || submission.payment_status === 'Pending';
  const { events, packages, ...partnershipDetails } = submission;
  const posterUrl = events ? getPosterUrl(events.poster) : null;
  const eventStatus = partnershipDetails.payment_status === 'Unpaid' && (packages?.price || 0) > 0 ? 'Waiting' : events?.status || 'Pending';
  
  // Tentukan apakah perlu menampilkan dua badge atau satu saja
  const shouldShowSingleStatus = partnershipDetails.payment_status === 'Unpaid' || 
                                   partnershipDetails.payment_status === 'Canceled' ||
                                   (partnershipDetails.payment_status === 'Paid' && eventStatus === 'Pending');

  return (
    <>
      <CancelModal 
        isOpen={showCancelModal} 
        onClose={() => setShowCancelModal(false)} 
        partnershipId={submission?.id}
        eventId={submission?.event_id || null}
      />
      
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <div className="container mx-auto px-4 py-20 sm:py-24">
        <Link href="/partnerships/my-submissions" className="inline-flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 mb-6">
          <ArrowLeft size={16} /> Kembali ke Daftar Pengajuan
        </Link>
        <div className="mb-8">
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Detail Pengajuan</h1>
            <p className="mt-1 text-slate-500 dark:text-slate-400 font-mono text-xs">ID: {submission.id}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="space-y-8">
              {events && (
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Detail Event</h3>
                  <dl className="divide-y divide-slate-200 dark:divide-slate-700">
                    <InfoRow icon={<Ticket size={16} />} label="Judul Event">{events.title}</InfoRow>
                    <InfoRow icon={<Tag size={16} />} label="Kategori"><Badge text={events.kategori} color="purple" /></InfoRow>
                    <InfoRow icon={<DollarSign size={16} />} label="Biaya">{events.is_free ? <Badge text="Gratis" color="green" /> : 'Berbayar'}</InfoRow>
                    <InfoRow icon={<Globe size={16} />} label="Platform"><Badge text={events.is_online} color="blue" /></InfoRow>
                    <InfoRow icon={<MapPin size={16} />} label="Lokasi">{events.location || '-'}</InfoRow>
                    <InfoRow icon={<Calendar size={16} />} label="Buka Pendaftaran">{formatDate(events.open_date)}</InfoRow>
                    <InfoRow icon={<Clock size={16} />} label="Tutup Pendaftaran">{formatDate(events.close_date)}</InfoRow>
                    <InfoRow icon={<ExternalLink size={16} />} label="Link Pendaftaran"><a href={events.registerlink} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Lihat Link</a></InfoRow>
                    <InfoRow icon={<ImageIcon size={16} />} label="Poster">{posterUrl ? (<Image src={posterUrl} alt="Poster" width={80} height={120} className="rounded-md object-cover shadow-md" />) : 'Tidak ada'}</InfoRow>
                  </dl>
                </div>
              )}
              {events?.organizers && (
                <div>
                  <h3 className="text-lg font-semibold border-b pb-2 mb-2 border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200">Informasi Penyelenggara</h3>
                  <dl className="divide-y divide-slate-200 dark:divide-slate-700">
                    <InfoRow icon={<User size={16} />} label="Nama Penyelenggara">{events.organizers.name}</InfoRow>
                    <InfoRow icon={<Instagram size={16} />} label="Instagram">@{events.organizers.instagram}</InfoRow>
                  </dl>
                </div>
              )}
            </div>
          </div>

          <aside className="lg:col-span-1 space-y-6 sticky top-24">
            <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">Status Pengajuan</h3>
                <div className="space-y-3">
                    {shouldShowSingleStatus ? (
                      // Tampilkan hanya satu status jika Unpaid, Canceled, atau keduanya sama
                      partnershipDetails.payment_status === 'Canceled' ? (
                        <StatusBadge status="Canceled" type="payment" />
                      ) : partnershipDetails.payment_status === 'Unpaid' ? (
                        <StatusBadge status="Waiting" type="event" />
                      ) : (
                        <StatusBadge status={eventStatus} type="event" />
                      )
                    ) : (
                      // Tampilkan kedua status jika berbeda (Pending payment tapi Success event, atau Paid dengan berbagai status event)
                      <>
                        <StatusBadge status={partnershipDetails.payment_status} type="payment" />
                        <StatusBadge status={eventStatus} type="event" />
                      </>
                    )}
                </div>
            </div>
             {packages && (
                <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                    <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">Paket Dipilih</h3>
                    <p className="font-bold text-blue-600 dark:text-blue-400">{packages.name}</p>
                    <p className="text-sm mt-1 text-slate-500 dark:text-slate-400">{packages.price > 0 ? `Rp ${packages.price.toLocaleString('id-ID')}` : 'Gratis'}</p>
                </div>
             )}
             {isCancellable && (
                <button
                  onClick={() => setShowCancelModal(true)}
                  className="w-full px-4 py-2.5 text-sm font-semibold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-offset-2 active:scale-[0.98]"
                >
                  Batalkan Pengajuan
                </button>
             )}
          </aside>
        </div>
      </div>
    </div>
    </>
  );
}