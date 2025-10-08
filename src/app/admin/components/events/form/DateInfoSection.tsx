'use client';

import { useState, useEffect } from 'react';

interface DateInfoSectionProps {
  event?: {
    open_date?: string | null;
    close_date?: string | null;
    extend_date?: string | null;
  };
  onDateError: (error: string) => void;
  formInputStyle: string;
}

export default function DateInfoSection({ event, onDateError, formInputStyle }: DateInfoSectionProps) {
  const [openDate, setOpenDate] = useState(event?.open_date?.substring(0, 10) ?? '');
  const [closeDate, setCloseDate] = useState(event?.close_date?.substring(0, 10) ?? '');
  const [extendDate, setExtendDate] = useState(event?.extend_date?.substring(0, 10) ?? '');
  const [showExtendDate, setShowExtendDate] = useState(false);

  useEffect(() => {
    if (event?.extend_date) {
      setShowExtendDate(true);
    }
  }, [event]);

  const validateDates = (open: string, close: string) => {
    if (open && close && new Date(close) < new Date(open)) {
      onDateError('Tanggal tutup tidak boleh lebih awal dari tanggal buka');
    } else {
      onDateError('');
    }
  };

  const handleOpenDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpenDate(e.target.value);
    validateDates(e.target.value, closeDate);
  };

  const handleCloseDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setCloseDate(e.target.value);
    validateDates(openDate, e.target.value);
  };

  return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            Informasi Tanggal
          </h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="space-y-3">
              <label htmlFor="open_date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tanggal Buka <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="open_date"
                id="open_date"
                value={openDate}
                onChange={handleOpenDateChange}
                max={closeDate || undefined}
                required
                lang="id-ID"
                className={`${formInputStyle} px-4 py-3 text-base [color-scheme:light] dark:[color-scheme:dark] ${!openDate ? 'text-gray-400 dark:text-gray-500' : ''}`}
                placeholder="dd/mm/yyyy"
              />
            </div>
            
            <div className="space-y-3">
              <label htmlFor="close_date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                Tanggal Tutup <span className="text-gray-400 text-xs">(Opsional)</span>
              </label>
              <input
                type="date"
                name="close_date"
                id="close_date"
                value={closeDate}
                onChange={handleCloseDateChange}
                min={openDate || undefined}
                lang="id-ID"
                className={`${formInputStyle} px-4 py-3 text-base [color-scheme:light] dark:[color-scheme:dark] ${!closeDate ? 'text-gray-400 dark:text-gray-500' : ''}`}
                placeholder="dd/mm/yyyy"
              />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300">
                Perpanjangan Tanggal
              </h3>
              <button
                type="button"
                onClick={() => setShowExtendDate(!showExtendDate)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  showExtendDate 
                    ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/20 dark:text-red-400 dark:hover:bg-red-900/30' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30'
                }`}
              >
                {showExtendDate ? 'Tutup Extend' : 'Tambah Extend'}
              </button>
            </div>
            
            {showExtendDate && (
              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="space-y-3">
                  <label htmlFor="extend_date" className="block text-sm font-semibold text-blue-700 dark:text-blue-400">
                    Tanggal Perpanjangan
                  </label>
                  <input
                    type="date"
                    name="extend_date"
                    id="extend_date"
                    value={extendDate}
                    onChange={(e) => setExtendDate(e.target.value)}
                    min={closeDate || openDate || undefined}
                    lang="id-ID"
                    className={`${formInputStyle} px-4 py-3 text-base [color-scheme:light] dark:[color-scheme:dark] ${!extendDate ? 'text-gray-400 dark:text-gray-500' : ''}`}
                    placeholder="dd/mm/yyyy"
                  />
                  <p className="text-xs text-blue-600 dark:text-blue-400">
                    Tanggal perpanjangan harus setelah tanggal tutup atau tanggal buka. Kosongkan jika tidak ada.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
  );
}