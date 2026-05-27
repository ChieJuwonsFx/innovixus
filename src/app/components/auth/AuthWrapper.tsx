"use client";

import { ReactNode, useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";
import { createClient } from "@supabase/supabase-js";
import {
  Code,
  Terminal,
  Database,
  Laptop,
  Briefcase,
  Rocket,
} from "lucide-react";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

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

const roundStats = (count: number): string => {
  if (count >= 10000) return "10k+";
  if (count >= 5000) return "5k+";
  if (count >= 2000) return "2k+";
  if (count >= 1000) return "1k+";
  if (count >= 500) return "500+";
  if (count >= 200) return "200+";
  if (count >= 100) return "100+";
  if (count >= 50) return "50+";
  if (count >= 20) return "20+";
  if (count >= 10) return "10+";
  if (count >= 5) return "5+";
  if (count >= 1) return "1+";
  return "0";
};

const AnimatedCounter = ({ value }: { value: string }) => {
  const [displayValue, setDisplayValue] = useState("0");

  useEffect(() => {
    setDisplayValue(value);
  }, [value]);

  return (
    <motion.p
      key={displayValue}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="text-2xl font-bold text-slate-800 dark:text-white"
    >
      {displayValue}
    </motion.p>
  );
};

const StatsCounter = () => {
  const [stats, setStats] = useState({
    events: "0",
    organizers: "0",
    users: "0",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { count: eventsCount } = await supabase
          .from("events")
          .select("*", { count: "exact", head: true });

        const { count: organizersCount } = await supabase
          .from("organizers")
          .select("*", { count: "exact", head: true });

        const { count: usersCount } = await supabase
          .from("users")
          .select("*", { count: "exact", head: true });

        setStats({
          events: roundStats(eventsCount || 0),
          organizers: roundStats(organizersCount || 0),
          users: roundStats(usersCount || 0),
        });
      } catch {
        setStats({
          events: "100+",
          organizers: "50+",
          users: "500+",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const eventsSubscription = supabase
      .channel("stats-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => fetchStats()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "organizers" },
        () => fetchStats()
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "users" },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      eventsSubscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <div className="mt-10 flex gap-x-8 text-center">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-8 w-16 bg-slate-300 dark:bg-slate-600 rounded mb-2"></div>
            <div className="h-4 w-20 bg-slate-200 dark:bg-slate-700 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="mt-10 flex gap-x-8 text-center">
      <div>
        <AnimatedCounter value={stats.events} />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Info Peluang
        </p>
      </div>
      <div>
        <AnimatedCounter value={stats.organizers} />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Penyelenggara
        </p>
      </div>
      <div>
        <AnimatedCounter value={stats.users} />
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Pengguna Aktif
        </p>
      </div>
    </div>
  );
};

interface AuthWrapperProps {
  children: ReactNode;
  scrollable?: boolean;
}

export default function AuthWrapper({
  children,
  scrollable = true,
}: AuthWrapperProps) {
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
              Kraloka
            </h2>

            <p className="text-slate-600 dark:text-slate-300 mt-4 text-md max-w-md mx-auto">
              Platform terdepan untuk menemukan info lomba, magang, dan lowongan
              kerja terbaru di dunia teknologi.
            </p>
          </div>

          <StatsCounter />
        </div>
      </div>
      <div
        className={`w-full md:w-1/2 flex items-start md:items-center lg:items-center justify-center p-6 sm:p-8 py-12 ${
          scrollable ? "overflow-y-auto" : ""
        }`}
      >
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}