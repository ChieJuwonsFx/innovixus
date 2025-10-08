import Link from 'next/link';
import { EnrichedPartnership } from '../../partnerships/page';
import StatusBadge from '@/app/admin/components/partnerships/StatusBadge';
import { ChevronRight } from 'lucide-react';

interface Props {
  partnerships: EnrichedPartnership[];
}

export default function PartnershipsList({ partnerships }: Props) {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md border border-gray-200 dark:border-slate-700">
      <div className="p-4 border-b border-gray-200 dark:border-slate-700">
        <h3 className="font-semibold text-gray-800 dark:text-gray-200">
          Total Pengajuan: {partnerships.length}
        </h3>
      </div>

      <div className="overflow-x-auto hidden md:block">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-50 dark:bg-slate-700/50">
            <tr>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 dark:text-gray-300">User & Kontak</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 dark:text-gray-300">Event</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 dark:text-gray-300">Status Event</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 dark:text-gray-300">Paket</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 dark:text-gray-300">Status Bayar</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 dark:text-gray-300">Tanggal</th>
              <th className="py-3 px-4 text-left font-semibold text-gray-600 dark:text-gray-300">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-slate-700">
            {partnerships.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50 dark:hover:bg-slate-700/40">
                <td className="p-4">
                  <div className="font-semibold text-gray-900 dark:text-white">{p.user_name}</div>
                  <div className="text-gray-500 dark:text-gray-400">{p.contact_person}</div>
                </td>
                <td className="p-4">
                  <div className="font-semibold text-gray-900 dark:text-white max-w-xs truncate">{p.event_title}</div>
                </td>
                <td className="p-4">
                    <StatusBadge type="event" status={p.event_status} />
                </td>
                <td className="p-4 font-semibold text-gray-700 dark:text-gray-300">{p.package_name}</td>
                <td className="p-4">
                  <StatusBadge type="payment" status={p.payment_status} />
                </td>
                <td className="p-4 text-gray-500 dark:text-gray-400">
                  {new Date(p.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                </td>
                <td className="p-4">
                  <Link href={`/admin/partnerships/${p.id}`} className="font-semibold text-blue-600 hover:underline">
                    Lihat Detail
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden divide-y divide-gray-200 dark:divide-slate-700">
        {partnerships.map((p) => (
          <Link key={p.id} href={`/admin/partnerships/${p.id}`} className="block p-4 hover:bg-gray-50 dark:hover:bg-slate-700/40">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-gray-900 dark:text-white">{p.event_title}</div>
                <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{p.user_name}</div>
              </div>
              <ChevronRight className="h-5 w-5 text-gray-400" />
            </div>
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-slate-700 flex justify-between items-center text-sm">
                <StatusBadge type="payment" status={p.payment_status} />
                <div className="text-gray-500">
                  {new Date(p.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}