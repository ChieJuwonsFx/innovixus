import './globals.css'
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import Navbar from './components/navbar/Navbar'
import FooterLayout from './components/footer/FooterLayout'
import { Toaster } from 'react-hot-toast';
import Script from 'next/script';
import { Providers } from './providers'

const montserrat = Montserrat({
  subsets: ['latin'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    template: '%s | Kraloka',
    default: 'Kraloka',
  },
  description: 'Knowledge that elevates your career..',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={montserrat.className}>
        <Script id="theme-init" strategy="afterInteractive">{`
          document.documentElement.classList.toggle('dark', localStorage.getItem('theme') === 'dark' || (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches));
        `}</Script>
        <Providers>
          <Toaster
            position="bottom-right"
            toastOptions={{
              duration: 4000,
              style: {
                fontSize: '14px',
                borderRadius: '12px',
                padding: '12px 16px',
                background: '#fff',
                color: '#1e293b',
                boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
              },
            }}
          />
        <Navbar />
        
        
        <div className='bg-slate-50 dark:bg-slate-950'>
          {children}
        </div>
        <FooterLayout />
        </Providers>
      </body>
    </html>
  )
}

