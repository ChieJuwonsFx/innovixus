export default function About() {
  return (
    <section className="py-20 px-4 bg-gradient-to-r from-gray-50 to-blue-50 dark:from-gray-800 dark:to-gray-900">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-6">
              Tentang Kraloka
            </h2>
            <div className="space-y-6 text-lg text-gray-700 dark:text-gray-300 leading-relaxed">
              <p>
                Kraloka hadir sebagai jembatan antara potensi mahasiswa dan
                kesempatan yang ada di industri. Kami memahami bahwa setiap
                mahasiswa memiliki mimpi dan aspirasi yang unik.
              </p>
              <p>
                Platform kami menggabungkan teknologi AI terdepan dengan
                jaringan industri yang luas untuk memberikan rekomendasi yang
                personal dan relevan untuk setiap pengguna.
              </p>
              <p>
                Dengan lebih dari 10,000 pengguna aktif dan ratusan partnership
                dengan perusahaan terkemuka, Kraloka telah membantu ribuan
                mahasiswa menemukan jalur karir mereka.
              </p>
            </div>
            <div className="flex flex-wrap gap-4 mt-8">
              <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-full">
                <span className="w-3 h-3 bg-green-500 rounded-full mr-2"></span>
                <span className="text-gray-700 dark:text-gray-300">
                  Terpercaya
                </span>
              </div>
              <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-full">
                <span className="w-3 h-3 bg-blue-500 rounded-full mr-2"></span>
                <span className="text-gray-700 dark:text-gray-300">
                  Terbaru
                </span>
              </div>
              <div className="flex items-center bg-white dark:bg-gray-800 px-4 py-2 rounded-full">
                <span className="w-3 h-3 bg-purple-500 rounded-full mr-2"></span>
                <span className="text-gray-700 dark:text-gray-300">
                  Dukungan Penuh
                </span>
              </div>{" "}
            </div>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-br from-blue-400 to-indigo-600 rounded-3xl p-8 transform rotate-3 hover:rotate-0 transition-transform duration-300">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 transform -rotate-3">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">IV</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-900 dark:text-white">
                        Kraloka
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        Your Career Partner
                      </div>
                    </div>
                  </div>
                  <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                    <div className="h-2 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full w-4/5"></div>
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
                    Platform yang mengubah cara saya mencari peluang karir!
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
