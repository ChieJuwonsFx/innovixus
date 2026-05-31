import './globals.css'
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import Navbar from './components/navbar/Navbar'
import FooterLayout from './components/footer/FooterLayout'
import { Toaster } from 'react-hot-toast';
import { Providers } from './providers'

export const dynamic = 'force-dynamic';

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
  icons: {
    icon: '/logo/logo.png',
    shortcut: '/logo/logo.png',
    apple: '/logo/logo.png',
  },
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
      <body className={montserrat.className}>
        <Providers>
          <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 5000,
            style: {
              fontSize: '16px',
              borderRadius: '10px',
              padding: '16px 24px',
              border: '2px solid #e5e7eb', 
              color: '#1f2937', 
            },
            
            success: {
              style: {
                background: '#f0fdf4',
                color: '#15803d',
                border: '2px solid #22c55e',
              },
              iconTheme: {
                primary: '#22c55e',
                secondary: '#f0fdf4',
              },
            },

            error: {
              style: {
                background: '#fef2f2',
                color: '#b91c1c',
                border: '2px solid #ef4444',
              },
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fef2f2',
              },
            },

            loading: {
              style: {
                background: '#eff6ff', 
                color: '#1d4ed8', 
                border: '2px solid #3b82f6', 
              },
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

