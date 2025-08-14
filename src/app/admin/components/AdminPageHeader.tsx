import Link from "next/link";
import type { ElementType } from "react"; 

interface AdminPageHeaderProps {
  title: string;
  description: string;
  buttonLabel: string;
  buttonHref: string;
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
    <div className="flex items-center justify-between py-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {title}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">{description}</p>
      </div>

      <Link
        href={buttonHref}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
      >
        {Icon && <Icon className="w-5 h-5" />}

        <span>{buttonLabel}</span>
      </Link>
    </div>
  );
}