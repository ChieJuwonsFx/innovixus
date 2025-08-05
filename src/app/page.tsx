export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-primary mb-4">Selamat Datang di Web Generator Post</h1>
      <p className="text-lg max-w-xl text-gray-900 dark:text-white">
        Ini adalah halaman landing utama. Silakan login sebagai admin untuk mengakses fitur generate post Instagram di <code className="font-mono">/admin/generate-post</code>.
      </p>
    </main>
  );
}