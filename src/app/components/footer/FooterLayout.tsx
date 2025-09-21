'use client';

import { usePathname } from 'next/navigation';
import Footer from '@/app/components/footer/Footer';

const FooterLayout = () => {
  const pathname = usePathname();
  
  const allowedPrefixes = [
    '/info-lomba',
    '/info-magang', 
    '/info-loker',
    '/partnerships',
    '/profile'
  ];
  
  const shouldShowFooter = 
    pathname === '/' || 
    allowedPrefixes.some(prefix => pathname.startsWith(prefix));
  
  if (!shouldShowFooter) {
    return null;
  }
  
  return <Footer />;
};

export default FooterLayout;