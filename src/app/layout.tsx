import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Navbar from './components/navbar/Navbar'
import FooterLayout from './components/footer/FooterLayout'

export const dynamic = 'force-dynamic';

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: {
    template: '%s | InnoVixus',
    default: 'InnoVixus',
  },
  description: 'Platform terdepan untuk menemukan info lomba, magang, dan lowongan kerja terbaru di dunia teknologi.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme) {
                    if (theme === 'dark') {
                      document.documentElement.classList.add('dark');
                    } else {
                      document.documentElement.classList.remove('dark');
                    }
                  } else {
                    var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                    if (prefersDark) {
                      document.documentElement.classList.add('dark');
                    }
                  }
                } catch (e) {
                }
              })();
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <Navbar />
        <div className='bg-slate-50 dark:bg-slate-950'>
          {children}
        </div>
        <FooterLayout />
      </body>
    </html>
  )
}
