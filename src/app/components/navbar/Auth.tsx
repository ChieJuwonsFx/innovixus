'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { signOut } from 'next-auth/react';
import { UserAvatar } from './Avatar';
import { useAuth } from '@/lib/hooks/useAuth';
import { Profile } from '../../../types/profile';

interface AuthSectionProps {
  initialProfile?: Profile | null;
  isMobile?: boolean;
}


const menuVariants = {
  hidden: { opacity: 0, y: -10, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -10, scale: 0.95 }
};

const AuthSkeleton = () => (
  <div className="hidden lg:flex items-center gap-3">
    <div className="w-[60px] h-[36px] bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
    <div className="w-[74px] h-[36px] bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
  </div>
);

const MobileAuthSkeleton = () => (
  <div className="flex flex-col gap-3">
    <div className="w-full h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
    <div className="w-full h-10 bg-slate-200 dark:bg-slate-700 rounded-lg animate-pulse"></div>
  </div>
);

export function AuthSection({ isMobile = false }: AuthSectionProps) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const { user, loading, isAdmin } = useAuth();
  
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  useEffect(() => {
    setMounted(true);
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
  
  const isLoadingState = !mounted || loading;

  if (isMobile) {
    if (isLoadingState) return <MobileAuthSkeleton />;
    if (user) return null; 
    
    return (
      <div className="flex flex-col gap-3">
        <Link 
          href="/login" 
          className="w-full text-center text-blue-600 bg-white border border-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-lg text-sm px-4 py-2.5 transition-all duration-300 dark:text-blue-400 dark:bg-transparent dark:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-slate-900"
        >
          Login
        </Link>
        <Link 
          href="/register" 
          className="w-full text-center text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2.5 transition-all duration-300 dark:bg-blue-500 dark:border-blue-500 dark:hover:bg-blue-600"
        >
          Register
        </Link>
      </div>
    );
  }

  if (isLoadingState) {
    return <AuthSkeleton />;
  }

  if (user) {
    const ProfileIcon = isAdmin ? LayoutDashboard : User;
    const profile = {
      name: user.name || user.email.split('@')[0],
      email: user.email,
      avatar: user.avatar,
      role: user.role
    };

    return (
      <div className="relative" ref={profileMenuRef}>
        <button 
          onClick={() => setIsProfileMenuOpen(prev => !prev)}
          className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-900 focus:ring-blue-500 rounded-full"
          aria-label="User menu"
        >
          <UserAvatar profile={profile} />
        </button>
        
        <AnimatePresence>
          {isProfileMenuOpen && (
            <motion.div
              variants={menuVariants} 
              initial="hidden" 
              animate="visible" 
              exit="exit" 
              transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">
                  {profile.name}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {profile.email}
                </p>
              </div>
              
              <Link 
                href={isAdmin ? '/admin' : '/profile'} 
                onClick={() => setIsProfileMenuOpen(false)} 
                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <ProfileIcon className="w-4 h-4" />
                {isAdmin ? 'Dashboard' : 'Your Profile'}
              </Link>
              
              <div className="border-t border-slate-100 dark:border-slate-700"></div>
              
              <button 
                onClick={handleSignOut} 
                className="flex items-center gap-2 w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors"
              >
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
    <div className="hidden lg:flex items-center gap-3">
      <Link 
        href="/login" 
        className="text-center text-blue-600 bg-white border border-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-lg text-sm px-4 py-2 transition-all duration-300 dark:text-blue-400 dark:bg-transparent dark:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-slate-900"
      >
        Login
      </Link>
      <Link 
        href="/register" 
        className="text-center text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 transition-all duration-300 dark:bg-blue-500 dark:border-blue-500 dark:hover:bg-blue-600"
      >
        Register
      </Link>
    </div>
  );
}