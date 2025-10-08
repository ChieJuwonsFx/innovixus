'use client';

import { useFormStatus } from 'react-dom';
import { Loader2 } from 'lucide-react';

interface SubmitButtonProps {
  label: string;
  loadingLabel: string;
}

export default function SubmitButton({ label, loadingLabel }: SubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-200"
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