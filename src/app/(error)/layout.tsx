'use client';

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useRouter } from 'next/navigation';
import {
  Code,
  Terminal,
  Database,
  Laptop,
  Briefcase,
  Rocket,
  Home, 
  ArrowLeft
} from "lucide-react";

type IconProp = {
  IconComponent: React.ElementType;
  className: string;
  left: string;
  delay: number;
  duration: number;
  scale: number;
};

const AnimatedIconsRain = () => {
  const [iconsProps, setIconsProps] = useState<IconProp[]>([]);

  useEffect(() => {
    const generatedIcons: IconProp[] = [];
    const numberOfIcons = 20;
    const icons = [Code, Terminal, Database, Laptop, Briefcase, Rocket];

    const colorClasses = [
      "text-sky-800 dark:text-sky-400",
      "text-cyan-800 dark:text-cyan-300",
      "text-blue-800 dark:text-blue-400",
      "text-teal-800 dark:text-teal-300",
    ];

    for (let i = 0; i < numberOfIcons; i++) {
      generatedIcons.push({
        IconComponent: icons[i % icons.length],
        className: colorClasses[i % colorClasses.length],
        left: `${Math.random() * 100}%`,
        delay: Math.random() * 5,
        duration: Math.random() * 8 + 6,
        scale: Math.random() * 0.5 + 0.5,
      });
    }
    setIconsProps(generatedIcons);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {iconsProps.map((props, i) => (
        <motion.div
          key={i}
          className={`absolute ${props.className}`}
          style={{
            left: props.left,
            fontSize: `${props.scale * 1.5}rem`,
          }}
          initial={{ y: "-10vh", scale: props.scale, opacity: 0 }}
          animate={{ y: "110vh", scale: props.scale, opacity: 0.8 }}
          transition={{
            delay: props.delay,
            duration: props.duration,
            ease: "linear",
            repeat: Infinity,
            repeatType: "loop",
          }}
        >
          <props.IconComponent />
        </motion.div>
      ))}
    </div>
  );
};

export default function ProtectedAreaLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4 overflow-hidden">
        <div className="absolute inset-0 z-10">
          <AnimatedIconsRain />

      </div>
      <div className="z-20 relative z-10 max-w-md w-full text-center">

        {children}

        <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">
          <button 
            onClick={() => router.back()}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-700 hover:bg-gray-800 dark:bg-gray-600 dark:hover:bg-gray-700 text-white font-medium rounded-lg transition-all duration-200 shadow hover:shadow-md"
          >
            <ArrowLeft className="w-5 h-5" />
            Kembali
          </button>
          
          <button 
            onClick={() => router.push('/')}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white font-medium rounded-lg transition-all duration-200 shadow hover:shadow-md"
          >
            <Home className="w-5 h-5" />
            Ke Beranda
          </button>
        </div>
      </div>

    </div>
  );
}