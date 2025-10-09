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
        inline-flex items-center justify-center px-6 py-3 
        border border-transparent text-base font-medium rounded-lg 
        text-white bg-blue-600 hover:bg-blue-700 
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        transition-all duration-200 shadow-lg hover:shadow-xl
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-blue-600
        min-w-[200px]
      `}
    >
      {pending ? (
        <>
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          {loadingLabel}
        </>
      ) : (
        label
      )}
    </button>
  );
}