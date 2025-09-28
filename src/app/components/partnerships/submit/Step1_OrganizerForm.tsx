'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

type OrganizerData = { name: string; instagram: string; };

interface Step1Props {
  onSubmit: (data: OrganizerData) => void;
  initialData: OrganizerData;
  isLoading: boolean;
}

export default function Step1_OrganizerForm({ onSubmit, initialData, isLoading }: Step1Props) {
  const [name, setName] = useState(initialData.name);
  const [instagram, setInstagram] = useState(initialData.instagram);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (name && instagram) {
      onSubmit({ name, instagram });
    } else {
      alert('Nama dan Instagram penyelenggara wajib diisi.');
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-1 text-slate-900 dark:text-white">Informasi Penyelenggara</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-8">Siapa yang akan menyelenggarakan event ini?</p>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="organizer_name" className="block font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
            Nama Penyelenggara <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            id="organizer_name" 
            value={name} 
            onChange={e => setName(e.target.value)} 
            required
            className="w-full p-2.5 rounded-lg bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors autofill:shadow-[inset_0_0_0px_1000px_theme(colors.white)] dark:autofill:shadow-[inset_0_0_0px_1000px_theme(colors.slate.900)]"
          />
        </div>
        <div>
          <label htmlFor="organizer_instagram" className="block font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
            Instagram Penyelenggara <span className="text-red-500">*</span>
          </label>
          <input 
            type="text" 
            id="organizer_instagram" 
            value={instagram} 
            onChange={e => setInstagram(e.target.value)} 
            required 
            placeholder="@username"
            className="w-full p-2.5 rounded-lg bg-transparent border border-slate-300 dark:border-slate-700 text-slate-900 dark:text-slate-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors autofill:shadow-[inset_0_0_0px_1000px_theme(colors.white)] dark:autofill:shadow-[inset_0_0_0px_1000px_theme(colors.slate.900)]"
          />
        </div>
        <button 
          type="submit" 
          disabled={isLoading} 
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 flex items-center justify-center disabled:opacity-50 transition-colors"
        >
          {isLoading ? <Loader2 className="animate-spin"/> : 'Lanjut ke Detail Event'}
        </button>
      </form>
    </div>
  );
}