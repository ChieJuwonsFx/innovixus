'use client';

import { ReactNode, useState, useEffect, useCallback, ElementType } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  Menu,
} from 'lucide-react';
import ThemeToggle from "@/components/ThemeToggle";
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';

function UserNav() {
  const [isOpen, setIsOpen] = useState(false);
  const user = { name: 'Admin', email: 'admin@innovixus.com', role: 'Administrator', image: 'https://i.pravatar.cc/100' };
  
  return (
    <div className="relative">
      <button onClick={() => setIsOpen(!isOpen)} className="flex items-center gap-3 focus:outline-none group">
        {/* <Image 
            className="w-9 h-9 rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover shadow-sm"
            src={user.image} alt="User profile" width={36} height={36}
        /> */}
        <div className="hidden md:block text-left">
          <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-tight">{user.name}</p>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-tight">{user.role}</p>
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 10 }} transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 rounded-lg shadow-xl z-50 border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-700"><p className="text-sm font-semibold text-slate-900 dark:text-slate-50">{user.name}</p><p className="text-xs text-slate-500 dark:text-slate-400">{user.email}</p></div>
            <Link href="/admin/profile" className="block px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">Your Profile</Link>
            <div className="border-t border-slate-100 dark:border-slate-700"></div>
            <button className="block w-full text-left px-4 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 transition-colors">Sign out</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

type NavItemProps = { href: string; icon: ElementType; children: ReactNode; onLinkClick: () => void; };

function NavItem({ href, icon: Icon, children, onLinkClick }: NavItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href;

  return (
    <li className="relative px-3">
      <Link href={href} onClick={onLinkClick} className={clsx(
        "flex items-center gap-3 rounded-lg p-3 text-sm transition-colors duration-200",
        isActive
          ? "bg-blue-50 text-blue-600 dark:bg-blue-900/50 dark:text-slate-50 font-semibold"
          : "text-slate-600 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 font-medium"
      )}>
        {isActive && <motion.div layoutId="active-pill" className="absolute left-0 top-2 bottom-2 w-1 bg-blue-600 rounded-r-full" />}
        <Icon className={clsx("w-5 h-5", isActive ? "text-blue-600 dark:text-blue-400" : "text-slate-500 dark:text-slate-500")} />
        <span>{children}</span>
      </Link>
    </li>
  );
}

export default function AdminLayout({ children }: { children: ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const savedState = localStorage.getItem('sidebarState');
    if (savedState) {
      setIsSidebarOpen(savedState === 'open');
    } else {
      setIsSidebarOpen(window.innerWidth >= 1024);
    }
  }, []);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen(prevState => {
      const newState = !prevState;
      localStorage.setItem('sidebarState', newState ? 'open' : 'closed');
      return newState;
    });
  }, []);

  const closeSidebarOnMobile = useCallback(() => {
    if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
        localStorage.setItem('sidebarState', 'closed');
    }
  }, []);

  return (
    <div className="bg-slate-100 dark:bg-slate-950 min-h-screen">
      
      <header className="fixed top-4 left-4 right-4 h-[72px] z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg rounded-2xl shadow-xl shadow-blue-600/5 dark:shadow-blue-600/10 border border-slate-200/80 dark:border-slate-800/80">
          <div className="px-6 h-full flex items-center justify-between">
            <div className="flex items-center">
                <Link href="/admin" className="flex items-center gap-3">
                    <div className="w-9 h-9 flex items-center justify-center">
                        <Image src="/logo/logo-dark.png" alt="Logo" width={32} height={32} className="dark:hidden" />
                        <Image src="/logo/logo-white.png" alt="Logo" width={32} height={32} className="hidden dark:block" />
                    </div>
                    <span className="hidden sm:block text-xl font-bold text-slate-800 dark:text-white">InnoVixus</span>
                </Link>
            </div>
            <div className="flex items-center gap-4">
              <ThemeToggle />
              <div className="h-8 w-px bg-slate-200 dark:bg-slate-700/50"></div>
              <UserNav />
              <button onClick={toggleSidebar} className="p-2 -mr-2 rounded-full text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700">
                <Menu className="w-6 h-6" />
              </button>
            </div>
          </div>
      </header>

      <aside className={clsx(
        "fixed top-0 left-0 h-full w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 z-30 transform transition-transform duration-300 ease-in-out shadow-xl shadow-blue-600/5 dark:shadow-blue-500/10",
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="pt-32 h-full flex flex-col">
            <nav className="flex-1">
                <ul className="list-none p-0 m-0 space-y-2">
                    <NavItem href="/admin" icon={LayoutDashboard} onLinkClick={closeSidebarOnMobile}>Dashboard</NavItem>
                    <NavItem href="/admin/users" icon={Users} onLinkClick={closeSidebarOnMobile}>User Management</NavItem>
                    <NavItem href="/admin/settings" icon={Settings} onLinkClick={closeSidebarOnMobile}>System Settings</NavItem>
                </ul>
            </nav>
            <div className="p-4 border-t border-slate-200 dark:border-slate-800">
                <button className="flex items-center gap-3 w-full p-3 rounded-lg text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                    <LogOut className="w-5 h-5"/>
                    <span className="font-medium">Logout</span>
                </button>
            </div>
        </div>
      </aside>

      <AnimatePresence>
        {isSidebarOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={toggleSidebar} className="fixed inset-0 bg-black/30 z-20 lg:hidden" />}
      </AnimatePresence>
      
      <main className={clsx(
        "transition-all duration-300 ease-in-out pt-[104px] pb-10",
        isSidebarOpen ? "lg:pl-72" : "lg:pl-0"
      )}>
        <div className="px-4 sm:px-6 lg:px-8">
            <motion.div key={pathname} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: "easeOut" }}>
                {children}
            </motion.div>
        </div>
      </main>
    </div>
  );
}