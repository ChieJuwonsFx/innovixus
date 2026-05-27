"use client";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";
import Image from "next/image";
import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { motion } from "framer-motion";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

interface HeroSectionProps {
  router: AppRouterInstance;
}

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
    <motion.div
      key={displayValue}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className="text-3xl font-bold mb-2"
    >
      {displayValue}
    </motion.div>
  );
};

interface StatsCardProps {
  value: string;
  label: string;
  sublabel: string;
  color: string;
  loading: boolean;
}

const StatsCard = ({ value, label, sublabel, color, loading }: StatsCardProps) => {
  if (loading) {
    return (
      <div className="text-center p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
        <div className="h-9 w-16 bg-gray-300 dark:bg-gray-600 rounded animate-pulse mx-auto mb-2"></div>
        <div className="h-6 w-32 bg-gray-200 dark:bg-gray-700 rounded animate-pulse mx-auto"></div>
      </div>
    );
  }

  return (
    <div className="text-center p-6 bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50">
      <div className={color}>
        <AnimatedCounter value={value} />
      </div>
      <div className="text-gray-700 dark:text-gray-300">
        {label}{" "}
        {value === "0" && (
          <span className="text-sm text-gray-500">{sublabel}</span>
        )}
      </div>
    </div>
  );
};

export default function Hero({}: HeroSectionProps) {
  const [stats, setStats] = useState({
    lomba: "0",
    magang: "0",
    loker: "0",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [lombaResult, magangResult, lokerResult] = await Promise.all([
          supabase
            .from("events")
            .select("*", { count: "exact", head: true })
            .eq("kategori", "Info Lomba"),
          supabase
            .from("events")
            .select("*", { count: "exact", head: true })
            .eq("kategori", "Info Magang"),
          supabase
            .from("events")
            .select("*", { count: "exact", head: true })
            .eq("kategori", "Info Loker"),
        ]);

        setStats({
          lomba: roundStats(lombaResult.count || 0),
          magang: roundStats(magangResult.count || 0),
          loker: roundStats(lokerResult.count || 0),
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();

    const subscription = supabase
      .channel("hero-stats-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "events" },
        () => fetchStats()
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  return (
    <section className="min-h-screen flex items-center justify-center pt-32 pb-16 md:py-16 px-4 bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-blue-900">
      <div className="max-w-6xl mx-auto w-full">
        <div className="text-center mb-4">
          <div className="flex justify-center mb-5">
            <Image
              src="/logo/logo.png"
              alt="Kraloka Logo"
              width={100}
              height={100}
              priority
            />
          </div>

          <div className="text-2xl md:text-4xl lg:text-5xl font-bold bg-blue-900 dark:bg-blue-500 bg-clip-text text-transparent mb-6">
            Kraloka
          </div>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Platform terdepan untuk mahasiswa dan fresh graduate dalam menemukan
            peluang lomba, magang, dan karir impian.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-6">
          <StatsCard
            value={stats.lomba}
            label="Peluang Lomba"
            sublabel="(sedang bertambah)"
            color="text-blue-600 dark:text-blue-400"
            loading={loading}
          />
          <StatsCard
            value={stats.magang}
            label="Program Magang"
            sublabel="(coming soon)"
            color="text-indigo-600 dark:text-indigo-400"
            loading={loading}
          />
          <StatsCard
            value={stats.loker}
            label="Lowongan Kerja"
            sublabel="(akan tersedia)"
            color="text-purple-600 dark:text-purple-400"
            loading={loading}
          />
        </div>
      </div>
    </section>
  );
}