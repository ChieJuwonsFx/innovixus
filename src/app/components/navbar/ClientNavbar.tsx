'use client';

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

import { Profile } from "../../../types/profile";
import ThemeToggle from "../ThemeToggle";
import { NavigationLinks } from "./NavLink";
import { AuthSection } from "./Auth"; 

interface PublicNavbarProps {
  initialProfile?: Profile | null;
}

const menuVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

const iconVariants = {
  hidden: { rotate: -45, opacity: 0 },
  visible: { rotate: 0, opacity: 1 },
  exit: { rotate: 45, opacity: 0 }
};

export default function PublicNavbar({ initialProfile = null }: PublicNavbarProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  const pathname = usePathname();
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const publicPaths = ['/', '/info-lomba', '/info-magang', '/info-loker', '/blog', '/profile', '/partnerships'];
  const isPublicPage = publicPaths.some(path => path === '/' ? pathname === path : pathname.startsWith(path));

  const handleScroll = useCallback(() => {
    if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    scrollTimeoutRef.current = setTimeout(() => {
      setIsScrolled(window.scrollY > 10);
    }, 50);
  }, []);
  
  const closeAllMenus = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (scrollTimeoutRef.current) clearTimeout(scrollTimeoutRef.current);
    };
  }, [handleScroll]);

  useEffect(() => {
    closeAllMenus();
  }, [pathname, closeAllMenus]);

  if (!isPublicPage) return null;

  return (
    <header 
      className={clsx(
        "fixed top-4 left-4 right-4 h-[72px] z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-2xl border border-slate-200/80 dark:border-slate-800/80 transition-shadow duration-300",
        isScrolled && "shadow-lg dark:shadow-black/20"
      )}
    >
      <div className="px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" onClick={closeAllMenus}>
          <Image src="/logo/logo.png" alt="InnoVixus Logo" width={32} height={32} className="dark:hidden" priority />
          <Image src="/logo/logo-white.png" alt="InnoVixus Logo" width={32} height={32} className="hidden dark:block" priority />
          <span className="hidden sm:block text-xl font-bold text-slate-800 dark:text-white">InnoVixus</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <NavigationLinks pathname={pathname} />
        </nav>

        <div className="flex items-center gap-4">
          <ThemeToggle />
          <AuthSection initialProfile={initialProfile} />

          <button
            onClick={() => setIsMenuOpen(prev => !prev)}
            className="lg:hidden p-2 -mr-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div key={isMenuOpen ? 'x' : 'menu'} variants={iconVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.15 }}>
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            variants={menuVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.2 }}
            className="lg:hidden absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <nav className="flex flex-col p-2">
              <NavigationLinks isMobile onLinkClick={closeAllMenus} pathname={pathname} />
            </nav>
            <div className="border-t border-slate-200 dark:border-slate-700 p-4">
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}