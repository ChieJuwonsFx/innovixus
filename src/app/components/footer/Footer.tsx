import Link from 'next/link';
import Image from "next/image";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-slate-50 px-4 py-10 dark:bg-slate-950">
      <div className="mx-auto w-full rounded-3xl border border-slate-200 bg-white px-6 py-8 dark:border-slate-800 dark:bg-slate-900 sm:px-8">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-md">
            <div className="flex items-center gap-3">
              <Image
                src="/logo/logo.png"
                alt="Kraloka Logo"
                width={32}
                height={32}
                className="dark:hidden"
                priority
              />
              <Image
                src="/logo/logo-white.png"
                alt="Kraloka Logo"
                width={32}
                height={32}
                className="hidden dark:block"
                priority
              />
              <span className="text-base font-semibold text-slate-900 dark:text-white">
                Kraloka
              </span>
            </div>
            <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
              Platform informasi lomba, magang, dan lowongan kerja yang ringkas dan mudah dipakai.
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-3 lg:min-w-[420px]">
            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Jelajah
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/info-lomba" className="transition-colors hover:text-slate-900 dark:hover:text-white">Info Lomba</Link></li>
                <li><Link href="/info-magang" className="transition-colors hover:text-slate-900 dark:hover:text-white">Info Magang</Link></li>
                <li><Link href="/info-loker" className="transition-colors hover:text-slate-900 dark:hover:text-white">Info Loker</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Partnership
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li><Link href="/partnerships" className="transition-colors hover:text-slate-900 dark:hover:text-white">Lihat detail</Link></li>
                <li><Link href="/partnerships" className="transition-colors hover:text-slate-900 dark:hover:text-white">Ajukan kerja sama</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Sosial
              </h3>
              <ul className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-400">
                <li><a href="https://instagram.com/kraloka.id" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-900 dark:hover:text-white">Instagram</a></li>
                <li><a href="https://tiktok.com/@innovixus" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-900 dark:hover:text-white">TikTok</a></li>
                <li><a href="https://innovixus.my.id" target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-slate-900 dark:hover:text-white">Website</a></li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-4 text-sm text-slate-500 dark:border-slate-800 dark:text-slate-400">
          <p>&copy; {currentYear} Kraloka. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;