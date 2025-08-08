'use client';

import { Loader2, Trash2 } from 'lucide-react';
import { useFormStatus } from 'react-dom';

type ActionResponse = void | { error: string } | undefined;

export default function DeleteButton({ action, itemLabel }: { action: () => Promise<ActionResponse>, itemLabel: string }) {
  const { pending } = useFormStatus();

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm(`Apakah Anda yakin ingin menghapus "${itemLabel}"?`)) {
      action();
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={pending}
      className="flex items-center gap-2 w-full text-left px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors disabled:opacity-50"
    >
      {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
      Hapus
    </button>
  );
}