import React from "react";

export function HeroSection() {
  const animationStyles = `
    @keyframes blob {
      0% { transform: translate(0px, 0px) scale(1); }
      33% { transform: translate(30px, -50px) scale(1.1); }
      66% { transform: translate(-20px, 20px) scale(0.9); }
      100% { transform: translate(0px, 0px) scale(1); }
    }
  `;

  return (<>
      <style>{animationStyles}</style>
      <section className="relative py-28 sm:py-32 lg:py-0 lg:flex md:items-center lg:min-h-screen overflow-hidden">
        <div className="absolute inset-0 z-0 block dark:hidden">
          <div className="absolute inset-0 bg-slate-50/50"></div>
          <div
            className="absolute top-0 -left-48 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70"
            style={{ animation: "blob 10s infinite" }}>
          </div>
          <div 
            className="absolute top-0 -right-48 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-70" 
            style={{ animation: "blob 12s infinite 3s" }}>
          </div>
        </div>
        <div className="absolute inset-0 z-0 hidden dark:block">
          <div className="absolute inset-0"></div>
          <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb20_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
        </div>

        <div className="relative z-10 container mx-auto px-6 text-center flex flex-col items-center">
            <div className="mb-6 inline-flex items-center justify-center px-4 py-1.5 text-sm font-semibold text-blue-800 bg-blue-100/60 dark:text-blue-200 dark:bg-blue-900/30 rounded-full border border-blue-200 dark:border-blue-500/30 backdrop-blur-sm">
                Terhubung Dengan Talenta Muda
            </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-7xl max-w-4xl">
            Jangkau Audiens yang Tepat
          </h1>

          <p className="mt-6 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-300">
            Publikasikan acara, kompetisi, atau lowongan Anda di Kraloka dan
            terhubung dengan ribuan talenta muda Indonesia.
          </p>

        <a href="#pricing"
          className="mt-10 inline-block bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-all duration-300 transform hover:scale-105">
          Lihat Paket Partnership
        </a>
        </div>
      </section>
    </>
  );
}
