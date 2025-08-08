'use client';

import { useState } from 'react';
import { CheckCircle2, XCircle, X } from 'lucide-react';

export interface FormMessageProps {
  type: 'success' | 'error';
  message: string;
}

const typeStyles = {
  success: {
    container: 'bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800',
    icon: 'text-green-500 dark:text-green-300',
    message: 'text-green-800 dark:text-green-200',
    closeButtonIcon: 'text-green-800 dark:text-green-200',
  },
  error: {
    container: 'bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800',
    icon: 'text-red-500 dark:text-red-400',
    message: 'text-red-800 dark:text-red-200',
    closeButtonIcon: 'text-red-800 dark:text-red-200',
  },
};


export const FormMessage = ({ type, message }: FormMessageProps) => {
  const [isVisible, setIsVisible] = useState(!!message); 

  if (!message || !isVisible) return null;

  const styles = typeStyles[type];

  return (
    <div
      className={`flex items-start justify-between gap-x-4 p-4 rounded-lg border shadow-sm animate-fade-in-down ${styles.container}`}
      role="alert" 
    >
      <div className="flex items-start gap-x-3">
        {type === 'success' ? (
          <CheckCircle2 className={`h-5 w-5 flex-shrink-0 ${styles.icon}`} />
        ) : (
          <XCircle className={`h-5 w-5 flex-shrink-0 ${styles.icon}`} />
        )}

        <p className={`text-sm font-medium ${styles.message}`}>
          {message}
        </p>
      </div>

      <button
        type="button"
        onClick={() => setIsVisible(false)}
        className={`-mt-1 -mr-1 p-1 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors`}
        aria-label="Tutup pesan"
      >
        <X className={`h-4 w-4 ${styles.closeButtonIcon}`} />
      </button>
    </div>
  );
};