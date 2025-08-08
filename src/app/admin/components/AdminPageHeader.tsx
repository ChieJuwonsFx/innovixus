import Link from 'next/link';
import { PlusCircle } from 'lucide-react';

interface AdminPageHeaderProps {
  title: string;
  buttonLabel: string;
  buttonHref: string;
}

export default function AdminPageHeader({ title, buttonLabel, buttonHref }: AdminPageHeaderProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">{title}</h1>
      <Link href={buttonHref} className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition-colors">
        <PlusCircle className="w-5 h-5" />
        {buttonLabel}
      </Link>
    </div>
  );
}