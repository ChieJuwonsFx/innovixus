// app/admin/components/events/form/SubmitButton.tsx
'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

export interface SubmitButtonProps {
  label: string;
  loadingLabel: string;
  disabled?: boolean;
}

export default function SubmitButton({ label, loadingLabel, disabled = false }: SubmitButtonProps) {
  const { pending } = useFormStatus();
  const isDisabled = pending || disabled;

  return (
    <button
      type="submit"
      disabled={isDisabled}
      className={`
        inline-flex min-w-[200px] items-center justify-center rounded-full border border-slate-900 bg-slate-900 px-6 py-3 text-base font-medium text-white transition-colors duration-200
        hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2
        disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-slate-900
        dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200
      `}
    >
      {pending ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}