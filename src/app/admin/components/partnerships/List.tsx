import Link from 'next/link';
import { EnrichedPartnership } from '../../partnerships/page';
import StatusBadge from '@/app/admin/components/partnerships/StatusBadge';
import { ChevronRight, User, Calendar, Package, FileText, TrendingUp } from 'lucide-react';

interface Props {
  partnerships: EnrichedPartnership[];
}

function PartnershipCard({ partnership }: { partnership: EnrichedPartnership }) {
  return (
    <Link 
      href={`/admin/partnerships/${partnership.id}`}
      className="block bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-xl border border-slate-200 dark:border-slate-700 p-5 transition-all duration-200 hover:scale-[1.02]"
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-lg text-slate-900 dark:text-white truncate mb-1">
            {partnership.event_title || 'Event Tidak Tersedia'}
          </h3>
          <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
            <User size={14} />
            <span className="truncate">{partnership.user_name || 'User Tidak Diketahui'}</span>
          </div>
        </div>
        <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0 ml-2" />
      </div>

      <div className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
            <Package size={16} className="text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">Paket</p>
            <p className="font-semibold text-slate-900 dark:text-white truncate">
              {partnership.package_name}
            </p>
          </div>
        </div>

        {partnership.contact_person && (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center flex-shrink-0">
              <User size={16} className="text-purple-600 dark:text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-slate-500 dark:text-slate-400">Kontak</p>
              <p className="font-medium text-slate-900 dark:text-white truncate text-sm">
                {partnership.contact_person}
              </p>
            </div>
          </div>
        )}

        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center flex-shrink-0">
            <Calendar size={16} className="text-orange-600 dark:text-orange-400" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-slate-500 dark:text-slate-400">Tanggal Pengajuan</p>
            <p className="font-medium text-slate-900 dark:text-white text-sm">
              {new Date(partnership.created_at).toLocaleDateString('id-ID', { 
                day: '2-digit', 
                month: 'long', 
                year: 'numeric' 
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex flex-wrap gap-2">
        <StatusBadge type="payment" status={partnership.payment_status} />
        {partnership.event_status && (
          <StatusBadge type="event" status={partnership.event_status} />
        )}
      </div>
    </Link>
  );
}

function PartnershipTableRow({ partnership }: { partnership: EnrichedPartnership }) {
  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors">
      <td className="p-4">
        <div className="font-semibold text-slate-900 dark:text-white">
          {partnership.user_name || 'User Tidak Diketahui'}
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {partnership.contact_person}
        </div>
      </td>
      <td className="p-4">
        <div className="font-semibold text-slate-900 dark:text-white max-w-xs truncate">
          {partnership.event_title || 'Event Tidak Tersedia'}
        </div>
      </td>
      <td className="p-4">
        {partnership.event_status && (
          <StatusBadge type="event" status={partnership.event_status} />
        )}
      </td>
      <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">
        {partnership.package_name}
      </td>
      <td className="p-4">
        <StatusBadge type="payment" status={partnership.payment_status} />
      </td>
      <td className="p-4 text-slate-600 dark:text-slate-400 whitespace-nowrap">
        {new Date(partnership.created_at).toLocaleDateString('id-ID', { 
          day: '2-digit', 
          month: 'short', 
          year: 'numeric' 
        })}
      </td>
      <td className="p-4">
        <Link 
          href={`/admin/partnerships/${partnership.id}`} 
          className="inline-flex items-center gap-1 font-semibold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
        >
          Lihat Detail
          <ChevronRight size={16} />
        </Link>
      </td>
    </tr>
  );
}

export default function PartnershipsList({ partnerships }: Props) {
  if (!partnerships || partnerships.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 p-12 text-center">
        <div className="max-w-sm mx-auto">
          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={32} className="text-slate-400" />
          </div>
          <h3 className="text-xl font-semibold text-slate-800 dark:text-slate-200 mb-2">
            Belum Ada Partnership
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Saat ini belum ada pengajuan partnership yang masuk.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 rounded-2xl shadow-xl p-6 text-white mb-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-blue-100 text-sm font-medium mb-1">Total Pengajuan</p>
            <p className="text-4xl font-bold">{partnerships.length}</p>
          </div>
          <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
            <TrendingUp size={28} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
        {partnerships.map((partnership) => (
          <PartnershipCard key={partnership.id} partnership={partnership} />
        ))}
      </div>

      <div className="hidden lg:block bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-100 dark:bg-slate-700/50">
              <tr>
                <th className="py-4 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                  User & Kontak
                </th>
                <th className="py-4 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Event
                </th>
                <th className="py-4 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Status Event
                </th>
                <th className="py-4 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Paket
                </th>
                <th className="py-4 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Status Bayar
                </th>
                <th className="py-4 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Tanggal
                </th>
                <th className="py-4 px-4 text-left font-semibold text-slate-700 dark:text-slate-300">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {partnerships.map((partnership) => (
                <PartnershipTableRow key={partnership.id} partnership={partnership} />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}