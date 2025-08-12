"use client";

import { motion, useMotionValue, useSpring, type Variants, useTransform } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';

// --- PALET WARNA YANG DIPERBAHARUI ---
const colorMap = {
  'info-lomba': {
    gradients: ['#ff6b35', '#f7931e', '#ffd23f'],
    accent: '#ff8c42',
    glow: '#ffab73',
    particles: '#fff3e0',
  },
  'info-magang': {
    gradients: ['#667eea', '#764ba2', '#f093fb'],
    accent: '#8b5cf6',
    glow: '#c4b5fd',
    particles: '#ede9fe',
  },
  'info-loker': {
    gradients: ['#4facfe', '#00f2fe', '#43e97b'],
    accent: '#06d6a0',
    glow: '#7dd3fc',
    particles: '#ecfdf5',
  },
};

// Konstanta Teks
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

const categoryNounMap: { [key:string]: string } = {
  'info-lomba': 'kompetisi',
  'info-magang': 'kesempatan magang',
  'info-loker': 'lowongan kerja',
};

// Static particles untuk menghindari hydration error
const STATIC_PARTICLES = [
  { id: 0, size: 8, x: 20, y: 30, duration: 20, delay: 0 },
  { id: 1, size: 6, x: 80, y: 15, duration: 25, delay: 2 },
  { id: 2, size: 10, x: 60, y: 70, duration: 18, delay: 4 },
  { id: 3, size: 7, x: 15, y: 80, duration: 22, delay: 1 },
  { id: 4, size: 9, x: 90, y: 40, duration: 19, delay: 3 },
  { id: 5, size: 5, x: 40, y: 20, duration: 24, delay: 5 },
  { id: 6, size: 11, x: 70, y: 85, duration: 21, delay: 2.5 },
  { id: 7, size: 6, x: 25, y: 50, duration: 23, delay: 1.5 },
  { id: 8, size: 8, x: 85, y: 65, duration: 17, delay: 4.5 },
  { id: 9, size: 9, x: 50, y: 10, duration: 26, delay: 3.5 },
];

// Varian Animasi yang Diperbaharui
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
    y: 30, 
    opacity: 0,
    filter: 'blur(10px)',
  },
  show: {
    y: 0,
    opacity: 1,
    filter: 'blur(0px)',
    transition: { 
      type: 'spring', 
      duration: 1,
      bounce: 0.3,
    },
  },
};

const particleVariants: Variants = {
  hidden: { scale: 0, opacity: 0 },
  show: {
    scale: 1,
    opacity: 0.6,
    transition: {
      duration: 2,
      ease: "easeOut",
    },
  },
};

// --- Hook untuk Mouse Trail yang Hanya Bekerja di Header ---
const useHeaderMouseTrail = (headerRef: React.RefObject<HTMLElement>) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const [isInHeader, setIsInHeader] = useState(false);
  
  // Smooth spring animations
  const springConfig = { damping: 25, stiffness: 400, mass: 0.5 };
  const x = useSpring(mouseX, springConfig);
  const y = useSpring(mouseY, springConfig);

  useEffect(() => {
    const handleMouseMove = (e: globalThis.MouseEvent) => {
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

// Floating Particles Component - Fixed untuk SSR
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
          className="absolute rounded-full opacity-20"
          style={{
            backgroundColor: color,
            width: particle.size,
            height: particle.size,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
          }}
          animate={{
            y: [-20, 20, -20],
            x: [-15, 15, -15],
            scale: [1, 1.2, 1],
            opacity: [0.2, 0.5, 0.2],
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

type KategoriHeaderProps = {
  kategori: string;
  totalEvents: number;
};

export default function Header({ kategori, totalEvents }: KategoriHeaderProps) {
  const headerRef = useRef<HTMLElement>(null);
  const { x: trailX, y: trailY, isInHeader } = useHeaderMouseTrail(headerRef);
  const currentPalette = colorMap[kategori as keyof typeof colorMap] || colorMap['info-loker'];

  // Advanced mouse transformations dengan efek yang dikurangi
  const rotateX = useTransform(trailY, [0, 1000], [3, -3]); // Dikurangi dari 10 ke 3
  const rotateY = useTransform(trailX, [0, 1000], [-3, 3]); // Dikurangi dari 10 ke 3

  const backgroundImage = `
    linear-gradient(135deg, ${currentPalette.gradients[0]}15 0%, transparent 50%),
    linear-gradient(45deg, ${currentPalette.gradients[1]}10 25%, transparent 75%),
    radial-gradient(ellipse at center, ${currentPalette.gradients[2]}08 0%, transparent 70%)
  `;

  return (
    <div className="relative">
      {/* Enhanced Cursor Trail - Hanya Muncul Saat di Header */}
      {isInHeader && (
        <motion.div
          className="pointer-events-none fixed left-0 top-0 z-50"
          style={{ x: trailX, y: trailY }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="relative">
            {/* Outer glow */}
            <motion.div
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                width: 40,
                height: 40,
                backgroundColor: currentPalette.glow,
                filter: 'blur(15px)',
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            
            {/* Inner core */}
            <motion.div
              className="absolute rounded-full -translate-x-1/2 -translate-y-1/2"
              style={{
                width: 12,
                height: 12,
                backgroundColor: currentPalette.accent,
                boxShadow: `0 0 20px ${currentPalette.glow}`,
              }}
              animate={{
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
          </div>
        </motion.div>
      )}

      {/* Main Header Component */}
      <motion.header
        ref={headerRef}
        className="relative flex flex-col items-center justify-center text-center p-12 mb-20 overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-3xl border border-white/10"
        variants={containerVariants}
        initial="hidden"
        animate="show"
        style={{
          rotateX,
          rotateY,
          transformPerspective: 1000,
        }}
      >
        {/* Animated Background */}
        <motion.div
          className="absolute inset-0 z-0"
          style={{ backgroundImage }}
          animate={{
            scale: [1, 1.05, 1],
            rotate: [0, 2, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'mirror',
            ease: 'easeInOut',
          }}
        />

        {/* Floating Particles */}
        <FloatingParticles color={currentPalette.particles} />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-black/80 via-transparent to-black/20" />

        {/* Glowing Border Effect */}
        <motion.div
          className="absolute inset-0 z-5 rounded-3xl"
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear",
          }}
        >
          <div
            className="w-full h-full rounded-3xl"
            style={{
              background: `linear-gradient(45deg, ${currentPalette.accent}20, transparent, ${currentPalette.accent}20)`,
              filter: 'blur(2px)',
            }}
          />
        </motion.div>

        {/* Content */}
        <div className="relative z-20 flex flex-col items-center">
          <motion.div
            className="mb-6"
            variants={textVariants}
          >
            <div 
              className="w-24 h-1 rounded-full mb-8"
              style={{
                background: `linear-gradient(90deg, ${currentPalette.gradients.join(', ')})`,
                boxShadow: `0 0 20px ${currentPalette.accent}50`,
              }}
            />
          </motion.div>

          <motion.h1
            className="text-5xl md:text-7xl font-black tracking-tighter text-transparent bg-clip-text mb-6"
            style={{
              backgroundImage: `linear-gradient(135deg, ${currentPalette.gradients[0]}, ${currentPalette.gradients[1]}, ${currentPalette.gradients[2]})`,
              textShadow: `0 0 30px ${currentPalette.glow}50`,
            }}
            variants={textVariants}
            whileHover={{
              scale: 1.05,
              transition: { duration: 0.3 }
            }}
          >
            {titleMap[kategori]}
          </motion.h1>

          <motion.p
            className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto mb-10 leading-relaxed"
            variants={textVariants}
            style={{
              textShadow: '0 2px 10px rgba(0,0,0,0.5)',
            }}
          >
            {descriptionMap[kategori]}
          </motion.p>

          <motion.div variants={textVariants}>
            <motion.div 
              className="inline-flex items-center px-8 py-4 rounded-full ring-2 ring-white/20 backdrop-blur-xl shadow-2xl"
              style={{
                background: `linear-gradient(135deg, ${currentPalette.accent}20, ${currentPalette.glow}10)`,
                boxShadow: `0 8px 32px ${currentPalette.accent}30`,
              }}
              whileHover={{
                scale: 1.05,
                boxShadow: `0 12px 40px ${currentPalette.accent}40`,
              }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span 
                className="text-3xl font-bold text-white mr-3"
                animate={{
                  scale: [1, 1.1, 1],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                {totalEvents}
              </motion.span>
              <span className="text-slate-200 text-lg font-medium">
                {categoryNounMap[kategori]} tersedia
              </span>
            </motion.div>
          </motion.div>
        </div>
      </motion.header>
    </div>
  );
}