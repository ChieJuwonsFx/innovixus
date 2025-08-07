"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import {
  Code,
  Terminal,
  Database,
  Laptop,
  Briefcase,
  Rocket,
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
        duration: Math.random() * 7 + 6,
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

interface AuthLayoutProps {
  children: ReactNode;
  scrollable?: boolean;
}

export default function AuthLayout({
  children,
  scrollable = true,
}: AuthLayoutProps) {
  return (
    <div
      className={`flex h-screen bg-white dark:bg-slate-800 ${
        scrollable ? "overflow-y-auto" : "overflow-hidden"
      }`}
    >
      <div className="hidden md:flex md:w-1/2 relative items-center justify-center p-12 overflow-hidden">
        <div className="absolute inset-0 z-20">
          <AnimatedIconsRain />
        </div>
        <div className="absolute inset-0 bg-blue-50/95 dark:bg-slate-900 z-10 backdrop-blur-sm"></div>
        <div className="relative z-30 w-full h-full flex flex-col items-center justify-center text-center">
          <div>
            <motion.div
              className="mb-16"
              initial={{ y: -10 }}
              animate={{ y: 10 }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                repeat: Infinity,
                repeatType: "mirror",
              }}
            >
              <Image
                src="/logo/logo.png"
                alt="Logo"
                width={110}
                height={110}
                className="dark:hidden relative object-contain drop-shadow-lg mx-auto"
                priority
              />
              <Image
                src="/logo/logo-white.png"
                alt="Logo"
                width={110}
                height={110}
                className="hidden dark:block relative object-contain drop-shadow-lg mx-auto"
                priority
              />
            </motion.div>
            <h2 className="text-3xl font-bold text-black dark:text-white">
              Innovixus
            </h2>

            <p className="text-slate-600 dark:text-slate-300 mt-4 text-md max-w-md mx-auto">
              Platform terdepan untuk menemukan info lomba, magang, dan lowongan
              kerja terbaru di dunia teknologi.
            </p>
          </div>

          <div className="mt-10 flex gap-x-8 text-center">
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                1k+
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Info Lomba
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                500+
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Perusahaan
              </p>
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800 dark:text-white">
                10k+
              </p>
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Pengguna Aktif
              </p>
            </div>
          </div>
        </div>
      </div>
      <div
        className={`w-full md:w-1/2 flex items-start justify-center p-6 sm:p-8 py-12 ${
          scrollable ? "overflow-y-auto" : ""
        }`}
      >
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
