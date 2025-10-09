"use client";

import { motion, useMotionValue, useSpring, type Variants, useTransform } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

const colorMap = {
  'info-lomba': {
    lightGradients: ['#FF5E1A', '#FF8C42', '#FFB347'],
    darkGradients: ['#FF6B35', '#F7931E', '#FFD23F'],
    accent: '#FF5E1A',
    glow: '#FF8C42',
    particles: '#FFE4C4',
    cardBg: 'bg-gradient-to-br from-orange-50 to-amber-50',
    lightShadow: 'shadow-orange-200/60',
    lightBorder: 'border-orange-200/80',
  },
  'info-magang': {
    lightGradients: ['#5B6DF0', '#7B4BFA', '#A05CF6'],
    darkGradients: ['#667EEA', '#764BA2', '#F093FB'],
    accent: '#7B4BFA',
    glow: '#A05CF6',
    particles: '#E6E6FA',
    cardBg: 'bg-gradient-to-br from-violet-50 to-purple-50',
    lightShadow: 'shadow-purple-200/60',
    lightBorder: 'border-purple-200/80',
  },
  'info-loker': {
    lightGradients: ['#00B4D8', '#00D6A0', '#43E97B'],
    darkGradients: ['#4FACFE', '#00F2FE', '#43E97B'],
    accent: '#00D6A0',
    glow: '#7DD3FC',
    particles: '#E0F7FA',
    cardBg: 'bg-gradient-to-br from-cyan-50 to-teal-50',
    lightShadow: 'shadow-cyan-200/60',
    lightBorder: 'border-cyan-200/80',
  },
};

const titleMap: { [key: string]: string } = {
  'info-lomba': 'Arena Kompetisi Digital',
  'info-magang': 'Gerbang Karir Profesional',
  'info-loker': 'Ekosistem Peluang Kerja',
};

const descriptionMap: { [key: string]: string } = {
  'info-lomba': 'Jelajahi, taklukkan, dan raih prestasi di berbagai kompetisi bergengsi.',
  'info-magang': 'Bangun fondasi karir yang kokoh melalui pengalaman magang transformatif.',
  'info-loker': 'Temukan jalur karir ideal Anda di antara ribuan lowongan dari industri terdepan.',
};

const categoryNounMap: { [key: string]: string } = {
  'info-lomba': 'kompetisi',
  'info-magang': 'kesempatan magang',
  'info-loker': 'lowongan kerja',
};

const STATIC_PARTICLES = [
  { id: 0, size: 6, x: 20, y: 30, duration: 20, delay: 0 },
  { id: 1, size: 4, x: 80, y: 15, duration: 25, delay: 2 },
  { id: 2, size: 7, x: 60, y: 70, duration: 18, delay: 4 },
  { id: 3, size: 5, x: 15, y: 80, duration: 22, delay: 1 },
  { id: 4, size: 6, x: 90, y: 40, duration: 19, delay: 3 },
  { id: 5, size: 3, x: 40, y: 20, duration: 24, delay: 5 },
  { id: 6, size: 8, x: 70, y: 85, duration: 21, delay: 2.5 },
  { id: 7, size: 4, x: 25, y: 50, duration: 23, delay: 1.5 },
  { id: 8, size: 5, x: 85, y: 65, duration: 17, delay: 4.5 },
  { id: 9, size: 6, x: 50, y: 10, duration: 26, delay: 3.5 },
];

const LIGHT_CIRCLES = [
  { id: 10, size: 6, x: 10, y: 20, duration: 18, delay: 0, opacity: 0.5 },
  { id: 11, size: 7, x: 85, y: 30, duration: 22, delay: 3, opacity: 0.6 },
  { id: 12, size: 8, x: 70, y: 75, duration: 20, delay: 1, opacity: 0.5 },
  { id: 13, size: 6, x: 25, y: 70, duration: 24, delay: 4, opacity: 0.4 },
  { id: 14, size: 9, x: 90, y: 60, duration: 19, delay: 2, opacity: 0.3 },
  { id: 15, size: 6, x: 18, y: 40, duration: 18, delay: 0, opacity: 0.4 },
  { id: 16, size: 7, x: 65, y: 30, duration: 22, delay: 3, opacity: 0.6 },
  { id: 17, size: 8, x: 40, y: 15, duration: 20, delay: 1, opacity: 0.5 },
  { id: 18, size: 6, x: 20, y: 80, duration: 24, delay: 4, opacity: 0.3 },
  { id: 19, size: 9, x: 14, y: 50, duration: 19, delay: 2, opacity: 0.4 },
];

const containerVariants: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.8,
      ease: [0.04, 0.62, 0.23, 0.98],
      staggerChildren: 0.15,
    },
  },
};

const textVariants: Variants = {
  hidden: {
    y: 20,
    opacity: 0,
    filter: 'blur(5px)',
  },
  show: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: {
      type: 'spring',
      duration: 0.8,
      bounce: 0.2,
    },
  },
};

const particleVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 0.4,
    transition: {
      duration: 1.5,
      ease: "easeOut",
    },
  },
};

const useHeaderMouseTrail = (headerRef: React.RefObject<HTMLElement | null>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isInHeader, setIsInHeader] = useState(false);

  const springConfig = { damping: 25, stiffness: 300, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (headerRef.current) {
        const rect = headerRef.current.getBoundingClientRect();
        const isInside = e.clientX >= rect.left &&
                         e.clientX <= rect.right &&
                         e.clientY >= rect.top &&
                         e.clientY <= rect.bottom;
       
        setIsInHeader(isInside);
       
        if (isInside) {
          mouseX.set(e.clientX);
          mouseY.set(e.clientY);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [mouseX, mouseY, headerRef]);

  return { x, y, isInHeader };
};

const FloatingParticles = ({ color }: { color: string }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden">
      {STATIC_PARTICLES.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: color,
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            opacity: 0.3,
          }}
          animate={{
            y: [-10, 10, -10],
            x: [-8, 8, -8],
            scale: [1, 1.1, 1],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            delay: particle.delay,
            ease: "easeInOut",
          }}
          variants={particleVariants}
          initial="hidden"
        />
      ))}
    </div>
  );
};

const LightModeCircles = ({ color }: { color: string }) => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return null;
  }

  return (
    <div className="absolute inset-0 overflow-hidden block dark:hidden">
      {LIGHT_CIRCLES.map((circle) => (
        <motion.div
          key={circle.id}
          className="absolute rounded-full"
          style={{
            backgroundColor: color,
            width: circle.size,
            height: circle.size,
            left: `${circle.x}%`,
            top: `${circle.y}%`,
            opacity: circle.opacity,
            filter: 'blur(1px)',
          }}
          animate={{
            y: [-15, 15, -15],
            x: [-10, 10, -10],
            scale: [1, 1.05, 1],
            opacity: [circle.opacity * 0.6, circle.opacity, circle.opacity * 0.6],
          }}
          transition={{
            duration: circle.duration,
            repeat: Infinity,
            delay: circle.delay,
            ease: "easeInOut",
          }}
          variants={particleVariants}
          initial="hidden"
        />
      ))}
    </div>
  );
};

type KategoriHeaderProps = {
  kategori: string;
  totalEvents: number;
};

export default function Header({ kategori, totalEvents }: KategoriHeaderProps) {
  const headerRef = useRef<HTMLElement | null>(null);
  const { x: trailX, y: trailY, isInHeader } = useHeaderMouseTrail(headerRef);
  const currentPalette = colorMap[kategori as keyof typeof colorMap] || colorMap['info-loker'];

  const rotateX = useTransform(trailY, [0, 1000], [1, -1]);
  const rotateY = useTransform(trailX, [0, 1000], [-1, 1]);

  return (
    <div className="relative">
      {isInHeader && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-50"
          style={{ x: trailX, y: trailY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative">
            <motion.div
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                width: 30,
                height: 30,
                backgroundColor: currentPalette.glow,
                filter: 'blur(12px)',
              }}
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.2, 0.4, 0.2],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                width: 8,
                height: 8,
                backgroundColor: currentPalette.accent,
                boxShadow: `0 0 15px ${currentPalette.glow}`,
              }}
              animate={{
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 1,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      )}

      <motion.header
        ref={headerRef}
        className={`relative flex flex-col items-center justify-center text-center px-4 py-8 md:px-8 md:py-12 mb-8 md:mb-12 overflow-hidden rounded-2xl md:rounded-3xl
          ${currentPalette.cardBg} dark:bg-gradient-to-br dark:from-slate-900 dark:via-slate-800 dark:to-slate-900
          border ${currentPalette.lightBorder} dark:border-slate-600/30 shadow-xl ${currentPalette.lightShadow} dark:shadow-none`}
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          rotateX,
          rotateY,
          transformPerspective: 800,
        }}
      >
        <motion.div
          className="absolute inset-0 z-0 opacity-20 dark:opacity-30"
          style={{
            backgroundImage: `
              linear-gradient(135deg, ${currentPalette.lightGradients[0]}20, transparent 60%),
              linear-gradient(45deg, ${currentPalette.lightGradients[1]}15, transparent 80%),
              radial-gradient(ellipse at center, ${currentPalette.lightGradients[2]}10, transparent 80%)
            `,
          }}
          animate={{
            scale: [1, 1.03, 1],
            rotate: [0, 1, 0],
          }}
          transition={{
            duration: 15,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />

        <div className="hidden dark:block">
          <FloatingParticles color={currentPalette.particles} />
        </div>

        <LightModeCircles color={currentPalette.accent} />

        <motion.div
          className="absolute inset-0 z-5 rounded-2xl md:rounded-3xl overflow-hidden pointer-events-none"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div className="relative w-full h-full">
            <motion.div
              className="absolute top-0 left-0 w-full h-full"
              style={{
                background: `linear-gradient(90deg, transparent, ${currentPalette.accent}20, transparent)`,
                filter: 'blur(8px)',
              }}
            />
          </div>
        </motion.div>

        <div className="absolute inset-0 z-10 bg-gradient-to-t from-white/50 via-transparent to-white/30 dark:from-black/70 dark:via-transparent dark:to-black/40" />

        <div className="relative z-20 flex flex-col items-center w-full px-2">
          <motion.div
            className="mb-3 md:mb-4"
            variants={textVariants}
          >
            <motion.div
              className="w-12 md:w-16 h-0.5 rounded-full mb-3 md:mb-4"
              style={{
                background: `linear-gradient(90deg, ${currentPalette.lightGradients.join(', ')})`,
                boxShadow: `0 0 10px ${currentPalette.accent}40`,
              }}
              animate={{
                opacity: [0.6, 1, 0.6],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </motion.div>

          <motion.h1
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-transparent bg-clip-text mb-3 md:mb-4"
            style={{
              backgroundImage: `linear-gradient(135deg, ${currentPalette.lightGradients.join(', ')})`,
              lineHeight: '1.2',
            }}
            variants={textVariants}
          >
            {titleMap[kategori]}
          </motion.h1>

          <motion.p
            className="text-sm sm:text-base text-slate-700 dark:text-slate-300 max-w-xs sm:max-w-md md:max-w-lg mx-auto mb-4 md:mb-6 font-medium"
            variants={textVariants}
          >
            {descriptionMap[kategori]}
          </motion.p>

          <motion.div variants={textVariants}>
            <motion.div
              className="inline-flex items-center px-4 py-2 md:px-5 md:py-3 rounded-full backdrop-blur-sm border-2"
              style={{
                background: `linear-gradient(135deg, ${currentPalette.accent}12, ${currentPalette.glow}06)`,
                borderColor: `${currentPalette.accent}40`,
                boxShadow: `0 8px 32px ${currentPalette.accent}25, inset 0 1px 0 rgba(255,255,255,0.1)`,
              }}
              whileHover={{
                scale: 1.03,
                boxShadow: `0 12px 40px ${currentPalette.accent}35, inset 0 1px 0 rgba(255,255,255,0.2)`,
                borderColor: `${currentPalette.accent}60`,
              }}
              whileTap={{ scale: 0.98 }}
            >
              <motion.span
                className="text-xl md:text-2xl font-bold mr-2"
                style={{
                  color: currentPalette.accent,
                  textShadow: `0 0 10px ${currentPalette.accent}30`,
                }}
                animate={{
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {totalEvents}
              </motion.span>
              <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-semibold">
                {categoryNounMap[kategori]} tersedia
              </span>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>
    </div>
  );
}