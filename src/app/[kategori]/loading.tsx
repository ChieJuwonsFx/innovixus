export default function Loading() {
  const SkeletonCard = () => (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden animate-pulse">
      <div className="w-full h-48 bg-gray-300 dark:bg-gray-700"></div>
      <div className="p-4">
        <div className="h-6 w-3/4 bg-gray-300 dark:bg-gray-700 rounded"></div>
        <div className="h-4 w-1/2 bg-gray-200 dark:bg-gray-600 rounded mt-2"></div>
        <div className="mt-4 space-y-2">
          <div className="h-4 w-full bg-gray-200 dark:bg-gray-600 rounded"></div>
          <div className="h-4 w-5/6 bg-gray-200 dark:bg-gray-600 rounded"></div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8 pt-28">
      <header className="text-center mb-12 animate-pulse">
        <div className="h-12 w-1/2 bg-gray-300 dark:bg-gray-700 mx-auto rounded-lg"></div>
        <div className="h-6 w-3/4 bg-gray-200 dark:bg-gray-600 mx-auto rounded-lg mt-4"></div>
      </header>
      
      <div className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-md space-y-4 animate-pulse">
        <div className="h-10 w-full bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
          <div className="h-10 bg-gray-300 dark:bg-gray-700 rounded-lg"></div>
        </div>
      </div>
      
      <main className="mt-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} />
          ))}
        </div>
      </main>
    </div>
  );
}