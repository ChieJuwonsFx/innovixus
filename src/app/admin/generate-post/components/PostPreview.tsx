import Image from 'next/image';

interface PostPreviewProps {
  imageUrl: string;
  pageNumber: number;
  onDownload: () => void;
}

export default function PostPreview({ imageUrl, pageNumber, onDownload }: PostPreviewProps) {
  return (
    <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-2 flex justify-between items-center">
        <span className="font-medium text-gray-700 dark:text-gray-300">
          Page {pageNumber} {pageNumber === 1 && '(Cover)'}
        </span>
        <button
          onClick={onDownload}
          className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors"
        >
          Download
        </button>
      </div>
      <div className="p-2 bg-white dark:bg-gray-800">
        <div className="relative w-full aspect-square">
          <Image
            src={imageUrl}
            alt={`Generated post page ${pageNumber}`}
            fill
            className="rounded border border-gray-200 dark:border-gray-700 object-contain"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          />
        </div>
      </div>
    </div>
  );
}