"use client";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-blue-50 to-white dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-4">
            Selamat Datang di InnoVixus
          </h1>
          <p className="text-lg text-gray-700 dark:text-gray-300 mb-6">
            Platform lengkap untuk menemukan informasi lomba, magang, dan lowongan kerja terbaru untuk mahasiswa dan fresh graduate.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-500 dark:text-blue-400 text-3xl mb-3">🏆</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">Info Lomba</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Temukan kompetisi terbaru untuk mengasah skill dan menambah portofolio.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-500 dark:text-blue-400 text-3xl mb-3">💼</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">Info Magang</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Peluang magang di perusahaan ternama untuk pengalaman profesional.
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-700 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
            <div className="text-blue-500 dark:text-blue-400 text-3xl mb-3">🔍</div>
            <h3 className="font-semibold text-lg mb-2 text-gray-800 dark:text-white">Info Loker</h3>
            <p className="text-gray-600 dark:text-gray-300">
              Lowongan pekerjaan untuk fresh graduate dan profesional muda.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={() => router.push("/login")}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200 shadow"
          >
            Masuk ke Akun
          </button>
          <button
            onClick={() => router.push("/register")}
            className="px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:border-blue-400 dark:hover:bg-blue-900/20 font-medium rounded-lg transition-colors duration-200"
          >
            Daftar Sekarang
          </button>
        </div>
      </div>
    </main>
  );
}