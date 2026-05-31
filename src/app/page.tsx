"use client";
import { useRouter } from "next/navigation";
import type { AppRouterInstance } from "next/dist/shared/lib/app-router-context.shared-runtime";

import Hero from "./components/home/Hero";
import Features from "./components/home/Features";
import About from "./components/home/About";
import Partnership from "./components/home/Partnership";
import Final from "./components/home/Final";

export default function Home() {
  const router: AppRouterInstance = useRouter();

  return (
    <main className="min-h-screen">
      <Hero router={router} />
      <Features />
      <About />
      <Partnership router={router} />
    </main>
  );
}