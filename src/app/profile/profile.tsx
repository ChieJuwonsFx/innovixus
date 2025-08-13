"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";

type Profile = {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  role: string;
};

export default function UserProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const getProfileData = async () => {
      const { data: { user } } = await supabase.auth.getUser();

      if (user) {
        const { data: userProfile, error } = await supabase
          .from('users')
          .select(`*`)
          .eq('id', user.id)
          .single();

        if (userProfile) {
          setProfile(userProfile);
        } else if (error) {
          console.error("Error fetching profile:", error.message);
        }
      } else {
        router.push('/login');
      }
      setLoading(false);
    };

    getProfileData();
  }, [supabase, router]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh(); 
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Loading profile...</p>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-600 dark:text-gray-300">Could not load profile. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-28 pb-12 px-4">
      <div className="max-w-md mx-auto bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex flex-col items-center">
            <div className="relative mb-4">
              {profile.avatar ? (
                <Image
                  src={profile.avatar}
                  alt="User Avatar"
                  width={128}
                  height={128}
                  className="w-32 h-32 rounded-full object-cover ring-4 ring-primary/50"
                />
              ) : (
                <div className="w-32 h-32 rounded-full bg-primary/20 dark:bg-primary/30 flex items-center justify-center ring-4 ring-primary/50">
                  <span className="text-5xl font-bold text-primary dark:text-gray-100">
                    {profile.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
              )}
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {profile.name}
            </h1>
            <p className="text-md text-gray-500 dark:text-gray-400 mt-1">
              {profile.email}
            </p>
            <span className="mt-3 px-3 py-1 text-xs font-semibold text-green-800 bg-green-200 dark:bg-green-700 dark:text-green-100 rounded-full">
              {profile.role}
            </span>
          </div>

          <div className="mt-8 border-t border-gray-200 dark:border-gray-700 pt-6">
            <button
              onClick={handleLogout}
              className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}