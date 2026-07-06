import Link from "next/link";
import type { ElementType } from "react"; 

interface AdminPageHeaderProps {
  title: string;
  description: string;
  buttonLabel?: string;
  buttonHref?: string;
  icon?: ElementType; 
}

export default function AdminPageHeader({
  title,
  description,
  buttonLabel,
  buttonHref,
  icon: Icon,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 pt-2 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800">
      <div className="text-center sm:text-left">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          {title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      {buttonHref && buttonLabel && (
        <Link
          href={buttonHref}
          className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-brand focus:ring-offset-2 sm:w-auto dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          {Icon && <Icon className="w-5 h-5" />}
          <span>{buttonLabel}</span>
        </Link>
      )}
    </div>
  );
}
