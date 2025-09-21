'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { User, LogOut, LayoutDashboard } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserAvatar } from './Avatar';
import { Profile } from '../../../types/profile';

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


export function AuthSection({ initialProfile }: { initialProfile: Profile | null }) {
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(initialProfile);
  const [isLoading, setIsLoading] = useState<boolean>(!initialProfile);
  const [mounted, setMounted] = useState(false);

  const supabase = createClientComponentClient();
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setProfile(null);
    window.location.href = '/';
  };

  useEffect(() => {
      setMounted(true);
  }, []);

  useEffect(() => {
    const getProfileData = async () => {
      setIsLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        const { data: userProfile } = await supabase.from('users').select('*').eq('id', session.user.id).single();
        setProfile(userProfile ? { ...userProfile, email: session.user.email! } : { id: session.user.id, name: session.user.email!, email: session.user.email!, avatar: null, role: 'User' });
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    };

    if (!initialProfile) {
      getProfileData();
    }

    const { data: authListener } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') getProfileData();
      if (event === 'SIGNED_OUT') setProfile(null);
    });

    return () => authListener.subscription.unsubscribe();
  }, [supabase, initialProfile]);


  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  
  if (!mounted || isLoading) {
    return <AuthSkeleton />;
  }

  if (profile) {
    const ProfileIcon = profile.role === 'Admin' ? LayoutDashboard : User;
    return (
      <div className="relative" ref={profileMenuRef}>
        <button 
            onClick={() => setIsProfileMenuOpen(prev => !prev)}
            className="flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-full"
            aria-label="User menu"
        >
          <UserAvatar profile={profile} />
        </button>
        <AnimatePresence>
          {isProfileMenuOpen && (
            <motion.div
              variants={menuVariants} initial="hidden" animate="visible" exit="exit" transition={{ duration: 0.15 }}
              className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                <p className="text-sm font-semibold text-slate-900 dark:text-slate-50 truncate">{profile.name}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{profile.email}</p>
              </div>
              <Link href={profile.role === 'Admin' ? '/admin' : '/profile'} onClick={() => setIsProfileMenuOpen(false)} className="flex items-center gap-2 w-full px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
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
    <div className="hidden lg:flex items-center gap-3">
        <Link href="/login" className="text-center text-blue-600 bg-white border border-blue-600 hover:bg-blue-600 hover:text-white font-medium rounded-lg text-sm px-4 py-2 transition-all duration-300 dark:text-blue-400 dark:bg-transparent dark:border-blue-400 dark:hover:bg-blue-400 dark:hover:text-slate-900">
            Login
        </Link>
        <Link href="/register" className="text-center text-white bg-blue-600 border border-blue-600 hover:bg-blue-700 font-medium rounded-lg text-sm px-4 py-2 transition-all duration-300 dark:bg-blue-500 dark:border-blue-500 dark:hover:bg-blue-600">
            Register
        </Link>
    </div>
  );
}
