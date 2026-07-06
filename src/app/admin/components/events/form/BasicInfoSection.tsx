'use client';

interface BasicInfoSectionProps {
  event?: {
    title?: string | null;
    caption?: string | null;
    guidelink?: string | null;
    registerlink?: string | null;
  };
  selectedKategori: string;
  onKategoriChange: (kategori: string) => void;
  formInputStyle: string;
  onAutofill?: (caption: string) => Promise<void>;
  isAiLoading?: boolean;
}

export default function BasicInfoSection({
  event,
  selectedKategori,
  onKategoriChange,
  formInputStyle,
  onAutofill,
  isAiLoading,
}: BasicInfoSectionProps) {
  return (
    <div className="space-y-6">
      <h2 className="text-sm font-semibold text-brand">
        Informasi Dasar
      </h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Judul Event <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            id="title"
            defaultValue={event?.title ?? ''}
            required
            className={formInputStyle}
            placeholder="Masukkan judul event"
          />
        </div>
        
        <div>
          <label htmlFor="kategori" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Kategori <span className="text-red-500">*</span>
          </label>
          <select
            name="kategori"
            id="kategori"
            value={selectedKategori}
            onChange={(e) => onKategoriChange(e.target.value)}
            required
            className={`${formInputStyle} pl-4 pr-12 py-3 text-base appearance-none dark:[background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")]`}
          >
            <option value="" disabled>Pilih Kategori</option>
            <option value="Info Lomba">Info Lomba</option>
            <option value="Info Magang">Info Magang</option>
            <option value="Info Loker">Info Loker</option>
          </select>
        </div>
      </div>
      
      <div>
        <label htmlFor="caption" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
          Deskripsi/Caption <span className="text-red-500">*</span>
        </label>
        <textarea
          name="caption"
          id="caption"
          rows={6}
          defaultValue={event?.caption ?? ''}
          required
          className={`${formInputStyle} px-4 py-3 resize-y text-base`}
          placeholder="Deskripsikan event secara detail..."
        />
        {onAutofill && (
          <button
            type="button"
            onClick={() => {
              const captionEl = document.getElementById('caption') as HTMLTextAreaElement;
              if (captionEl?.value) onAutofill(captionEl.value);
            }}
            disabled={isAiLoading}
            className="mt-2 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            {isAiLoading ? (
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-300 border-t-blue-600" />
            ) : (
              <span>✨</span>
            )}
            {isAiLoading ? 'Memproses...' : 'Auto-fill AI'}
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label htmlFor="guidelink" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Link Panduan
          </label>
          <input
            type="url"
            name="guidelink"
            id="guidelink"
            defaultValue={event?.guidelink ?? ''}
            className={formInputStyle}
            placeholder="https://... (kosongkan jika tidak ada)"
          />
        </div>
        
        <div>
          <label htmlFor="registerlink" className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Link Pendaftaran
          </label>
          <input
            type="url"
            name="registerlink"
            id="registerlink"
            defaultValue={event?.registerlink ?? ''}
            className={formInputStyle}
            placeholder="https://... (kosongkan jika tidak ada)"
          />
        </div>
      </div>
    </div>
  );
}
