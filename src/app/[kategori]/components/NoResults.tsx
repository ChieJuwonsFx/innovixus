import { Search } from 'lucide-react';
import Link from 'next/link';

type NoResultsProps = {
  isFiltered: boolean;
  kategori: string;
};

const categoryNounMap: { [key: string]: string } = {
  'info-lomba': 'lomba',
  'info-magang': 'magang',
  'info-loker': 'lowongan',
};

export default function NoResults({ isFiltered, kategori }: NoResultsProps) {
  return (
    <div className="text-center py-16 md:py-24 bg-slate-100/50 dark:bg-slate-900 rounded-2xl">
      <div className="inline-flex justify-center items-center h-20 w-20 rounded-full bg-white dark:bg-slate-800/50 mb-6 shadow-sm ring-1 ring-inset ring-slate-200 dark:ring-slate-700">
        <Search className="h-10 w-10 text-blue-500" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
        {isFiltered ? 'Hasil Tidak Ditemukan' : 'Belum Ada Konten'}
      </h3>
      <p className="text-slate-600 dark:text-slate-400 max-w-md mx-auto mb-8 px-4">
        {isFiltered 
          ? "Coba ubah kata kunci atau hapus beberapa filter untuk menemukan apa yang Anda cari."
          : `Saat ini belum ada informasi ${categoryNounMap[kategori]} yang tersedia. Silakan cek kembali nanti.`
        }
      </p>
      {isFiltered && (
        <Link
          href={`/${kategori}`}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Hapus Semua Filter
        </Link>
      )}
    </div>
  );
}