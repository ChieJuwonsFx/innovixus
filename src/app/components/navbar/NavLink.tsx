'use client';

import Link from "next/link";
import { useCallback } from "react";
import clsx from "clsx";

interface NavigationLinksProps {
  isMobile?: boolean;
  onLinkClick?: () => void;
  pathname: string;
}

const links = [
  { href: "/", label: "Beranda" },
  { href: "/info-lomba", label: "Info Lomba" },
  { href: "/info-magang", label: "Info Magang" },
  { href: "/info-loker", label: "Info Loker" },
  { href: "/partnerships", label: "Partnership" },
];

export function NavigationLinks({ 
  isMobile = false, 
  onLinkClick, 
  pathname 
}: NavigationLinksProps) {
  const isActive = useCallback(
    (path: string) => (path === '/' ? pathname === path : pathname.startsWith(path)),
    [pathname]
  );

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