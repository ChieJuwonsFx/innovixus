'use client'

import { useState, useEffect } from 'react'
import { SunIcon, MoonIcon } from './ThemeIcons' 

export default function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme) {
      setTheme(savedTheme);
    } else if (prefersDark) {
      setTheme('dark');
    }
  }, []);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <label htmlFor="theme-toggle" className="relative inline-flex items-center cursor-pointer">
      <input 
        type="checkbox" 
        id="theme-toggle" 
        className="sr-only peer" 
        checked={theme === 'dark'}
        onChange={toggleTheme}
      />
      <div className="w-[70px] h-9 bg-gray-200 rounded-full dark:bg-gray-700 peer-focus:outline-none transition-colors flex items-center justify-between px-2">
         <SunIcon className="h-5 w-5 text-yellow-500" />
         <MoonIcon className="h-5 w-5 text-blue-400" />
      </div>
      <div className="absolute top-1 left-1 bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 border rounded-full h-7 w-7 transition-all duration-300 ease-out peer-checked:translate-x-[34px] shadow-md flex items-center justify-center">
        {theme === 'light' ? (
          <SunIcon className="h-5 w-5 text-yellow-500" />
        ) : (
          <MoonIcon className="h-5 w-5 text-blue-400" />
        )}
      </div>
    </label>
  )
}