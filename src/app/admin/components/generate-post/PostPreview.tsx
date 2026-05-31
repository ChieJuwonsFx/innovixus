import Image from 'next/image';

interface PostPreviewProps {
  imageUrl: string;
  pageNumber: number;
  onDownload: () => void;
}

export default function PostPreview({ imageUrl, pageNumber, onDownload }: PostPreviewProps) {
  return (
    <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-slate-800 dark:bg-slate-950">
        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
          Page {pageNumber} {pageNumber === 1 && '(Cover)'}
        </span>
        <button
          onClick={onDownload}
          className="rounded-full border border-slate-900 bg-slate-900 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-slate-800 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          Download
        </button>
      </div>
      <div className="bg-white p-3 dark:bg-slate-900">
        <div className="relative w-full aspect-square">
          <Image
            src={imageUrl}
            alt={`Generated post page ${pageNumber}`}
            fill
            className="rounded-2xl border border-slate-200 object-contain dark:border-slate-700"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
    </div>
  );
}