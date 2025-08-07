"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import Image from "next/image";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, User, LogOut, LayoutDashboard } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

type Profile = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: 'User' | 'Admin';
};

let profileCache: Profile | null = null;
let authStateInitialized = false;

function NavigationLinks({ isMobile = false, onLinkClick }: { isMobile?: boolean; onLinkClick?: () => void }) {
  const pathname = usePathname();
  const isActive = (path: string) => (path === '/' ? pathname === path : pathname.startsWith(path));

  const links = [
    { href: "/", label: "Beranda" },
    { href: "/info-lomba", label: "Info Lomba" },
    { href: "/info-magang", label: "Info Magang" },
    { href: "/info-loker", label: "Info Loker" },
    { href: "/partnership", label: "Partnership" },
  ];

  const linkClass = isMobile
    ? "block px-4 py-3 rounded-md text-sm font-medium transition-colors duration-200"
    : "relative px-1 py-2 text-sm font-medium transition-colors duration-200 group";

  const activeLinkClass = isMobile
    ? "bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400"
    : "text-blue-600 dark:text-blue-400";

  const inactiveLinkClass = isMobile
    ? "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700"
    : "text-gray-600 hover:text-blue-600 dark:text-gray-300 dark:hover:text-blue-400";

  return (
    <>
      {links.map((link) => (
        <Link
          key={link.href}
          href={link.href}
          onClick={onLinkClick}
          className={clsx(linkClass, isActive(link.href) ? activeLinkClass : inactiveLinkClass)}
        >
          {link.label}
          {!isMobile && (
            <span className={clsx(
              "absolute bottom-0 left-0 h-0.5 bg-blue-600 dark:bg-blue-400 transition-all duration-300",
              isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
            )}></span>
          )}
        </Link>
      ))}
    </>
  );
}

function UserAvatar({ profile, size = 'md' }: { profile: Profile; size?: 'sm' | 'md' }) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-sm",
  };

  return (
    <>
      {profile.avatar ? (
        <Image
          src={profile.avatar}
          alt="User Avatar"
          width={size === 'sm' ? 32 : 36}
          height={size === 'sm' ? 32 : 36}
          className={clsx("rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover shadow-sm", size === 'sm' ? "w-8 h-8" : "w-9 h-9")}
        />
      ) : (
        <div className={clsx(
          "rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-200 dark:border-slate-700 shadow-sm",
          sizeClasses[size],
          profile.role === 'Admin' ? "bg-purple-600" : "bg-blue-600"
        )}>
          {profile.name?.charAt(0).toUpperCase()}
        </div>
      )}
    </>
  );
}

export default function PublicNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(profileCache);
  const [isInitializing, setIsInitializing] = useState(!authStateInitialized);
  const pathname = usePathname();
  const supabase = createClientComponentClient();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const publicPaths = ['/', '/info-lomba', '/info-magang', '/info-loker', '/partnership', '/profile'];
  const isPublicPage = publicPaths.some(path => path === '/' ? pathname === path : pathname.startsWith(path));

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const getProfileData = async () => {
      if (!authStateInitialized) {
        setIsInitializing(true);
      }
      
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userProfile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        if (userProfile) {
          profileCache = { ...userProfile, email: session.user.email! };
          setProfile(profileCache);
        } else {
          profileCache = { id: session.user.id, name: session.user.email!, email: session.user.email!, avatar: null, role: 'User' };
          setProfile(profileCache);
        }
      } else {
        profileCache = null;
        setProfile(null);
      }
      
      if (!authStateInitialized) {
        authStateInitialized = true;
        setIsInitializing(false);
      }
    };

    getProfileData();
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        profileCache = null;
        setProfile(null);
      } else if (event === 'SIGNED_IN') {
        getProfileData();
      }
    });
    
    return () => authListener.subscription.unsubscribe();
  }, [supabase]);

  if (!isPublicPage) return null;

  const closeAllMenus = () => {
    setIsMenuOpen(false);
    setIsProfileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    profileCache = null;
    setProfile(null);
    window.location.href = '/';
  };

  const ProfileIcon = profile?.role === 'Admin' ? LayoutDashboard : User;

  const renderAuthSection = () => {
    if (isInitializing) {
      return (
        <div className="w-[140px] h-9 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
      );
    }
    
    if (profile) {
      return (
        <div className="relative" ref={profileMenuRef}>
          <button onClick={() => setIsProfileMenuOpen(p => !p)} className="flex items-center gap-2 focus:outline-none">
            <UserAvatar profile={profile} />
          </button>
          <AnimatePresence>
            {isProfileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 border border-slate-200 dark:border-slate-700 overflow-hidden"
              >
                <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                  <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{profile.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.email}</p>
                </div>
                <Link href={profile.role === 'Admin' ? '/admin' : '/profile'} onClick={closeAllMenus} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  <ProfileIcon className="w-4 h-4" />
                  {profile.role === 'Admin' ? 'Dashboard' : 'Your Profile'}
                </Link>
                <div className="border-t border-slate-100 dark:border-slate-700"></div>
                <button onClick={handleSignOut} className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      );
    }
    
    return (
      <>
        <Link href="/login" className="text-blue-600 bg-white border border-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-lg text-sm px-4 py-2 transition-all duration-300">
          Login
        </Link>
        <Link href="/register" className="text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 transition-all duration-300">
          Register
        </Link>
      </>
    );
  };

  const renderMobileAuthSection = () => {
    if (isInitializing) {
      return (
        <div className="flex gap-3">
          <div className="flex-1 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
          <div className="flex-1 h-9 rounded-lg bg-slate-200 dark:bg-slate-700 animate-pulse" />
        </div>
      );
    }
    
    if (profile) {
      return (
        <div>
          <div className="flex items-center gap-3 mb-3">
            <UserAvatar profile={profile} size="md" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{profile.name}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.email}</p>
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <Link href={profile.role === 'Admin' ? '/admin' : '/profile'} onClick={closeAllMenus} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md transition-colors">
              <ProfileIcon className="w-4 h-4" />
              {profile.role === 'Admin' ? 'Dashboard' : 'Your Profile'}
            </Link>
            <button onClick={handleSignOut} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 rounded-md transition-colors text-left">
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      );
    }
    
    return (
      <div className="flex gap-3">
        <Link href="/login" onClick={closeAllMenus} className="flex-1 text-center text-blue-600 bg-white border border-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-lg text-sm px-4 py-2 transition-all duration-300">
          Login
        </Link>
        <Link href="/register" onClick={closeAllMenus} className="flex-1 text-center text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 transition-all duration-300">
          Register
        </Link>
      </div>
    );
  };

  return (
    <header className={clsx(
      "fixed top-4 left-4 right-4 h-[72px] z-50 bg-white dark:bg-slate-900 backdrop-blur-lg rounded-2xl border border-slate-200/80 dark:border-slate-800/80 transition-shadow duration-300",
      isScrolled && "shadow-lg dark:shadow-black/20"
    )}>
      <div className="px-6 h-full flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3" onClick={closeAllMenus}>
          <div className="w-9 h-9 flex items-center justify-center">
            <Image src="/logo/logo-dark.png" alt="Logo" width={32} height={32} className="dark:hidden" />
            <Image src="/logo/logo-white.png" alt="Logo" width={32} height={32} className="hidden dark:block" />
          </div>
          <span className="hidden sm:block text-xl font-bold text-slate-800 dark:text-white">InnoVixus</span>
        </Link>

        <nav className="hidden lg:flex items-center gap-8">
          <NavigationLinks />
        </nav>

        <div className="flex items-center gap-4 min-w-[120px] justify-end">
          <ThemeToggle />
          
          <div className="hidden lg:flex items-center gap-3">
            {renderAuthSection()}
          </div>

          <button
            onClick={() => setIsMenuOpen(p => !p)}
            className="lg:hidden p-2 -mr-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
            aria-label="Toggle menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isMenuOpen ? 'x' : 'menu'}
                initial={{ rotate: -45, opacity: 0 }} 
                animate={{ rotate: 0, opacity: 1 }} 
                exit={{ rotate: 45, opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </motion.div>
            </AnimatePresence>
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            exit={{ opacity: 0, y: -20 }}
            className="lg:hidden absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <nav className="flex flex-col p-2">
              <NavigationLinks isMobile onLinkClick={closeAllMenus} />
            </nav>
            <div className="border-t border-slate-200 dark:border-slate-700 p-4">
              {renderMobileAuthSection()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}