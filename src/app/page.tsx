"use client";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  const supabase = createClientComponentClient();
  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
    router.refresh(); 
  };
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 text-center">
      <h1 className="text-4xl font-bold text-primary mb-4">
        Selamat Datang di Web Generator Post
      </h1>
      <p className="text-lg max-w-xl text-gray-900 dark:text-white">
        Ini adalah halaman landing utama. Silakan login sebagai admin untuk
        mengakses fitur generate post Instagram di{" "}
        <code className="font-mono">/admin/generate-post</code>.
      </p>
      <button
        onClick={handleLogout}
        className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
      >
        Logout
      </button>
    </main>
  );
}
