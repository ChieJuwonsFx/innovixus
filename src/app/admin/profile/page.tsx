'use client';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation"; 
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
    LogOut, Edit, Layers, ArrowRight, Mail, Calendar, UserCheck 
} from "lucide-react";

import { Profile } from "@/types/profile"; 
import { Database } from '@/types/database'; 

type SupabaseClient = ReturnType<typeof createClientComponentClient<Database>>;
type NextRouter = ReturnType<typeof useRouter>; 
async function fetchProfileData(supabase: SupabaseClient, router: NextRouter): Promise<Profile | null> {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        router.push('/login');
        return null;
    }

    const { data: userProfile, error } = await supabase
        .from('users')
        .select(`id, name, email, avatar, role, created_at`)
        .eq('id', user.id)
        .single();

    if (error) {
        console.error("Error fetching profile:", error.message);
        return null;
    }

    return userProfile as Profile; 
}

const ProfileDetailsSection = ({ profile }: { profile: Profile }) => {
    const joinDate = profile.created_at 
        ? new Date(profile.created_at).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })
        : 'N/A';
        
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-start items-center space-x-0 md:space-x-6 p-4 md:p-0">
                <div className="relative mb-4 flex-shrink-0">
                    {profile.avatar ? (
                        <Image
                            src={profile.avatar}
                            alt="User Avatar"
                            width={112}
                            height={112}
                            className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow-xl"
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center border-4 border-blue-500 shadow-xl">
                            <span className="text-5xl font-bold text-blue-600 dark:text-blue-300">
                                {profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                </div>
                <div className="text-center md:text-left mt-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {profile.name || "User Name"}
                    </h1>
                    <p className="mt-1 text-base font-semibold text-blue-600 dark:text-blue-400">
                        {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </p>
                </div>
            </div>

            <div className="p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b border-gray-300 dark:border-gray-600 pb-2">Account Details</h2>
                
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-4 p-2">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                            <p className="text-sm font-normal text-gray-900 dark:text-white">{profile.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-2">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Join Date</p>
                            <p className="text-sm font-normal text-gray-900 dark:text-white">{joinDate}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};


export default function UserProfilePage() {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const supabase = createClientComponentClient<Database>(); 

    const loadProfile = useCallback(async () => {
        setLoading(true);
        const data = await fetchProfileData(supabase, router as NextRouter); 
        setProfile(data);
        setLoading(false);
    }, [supabase, router]);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push('/');
        router.refresh(); 
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50 dark:bg-gray-900">
                <p className="text-gray-600 dark:text-gray-300 animate-pulse">Loading dashboard...</p>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen p-4">
                <p className="text-xl text-red-500 dark:text-red-400 font-semibold mb-4">
                    Authentication Required or Profile Not Found 😔
                </p>
                <Link 
                    href="/login" 
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                    Go to Login
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4">
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <UserCheck className="w-6 h-6 text-blue-600"/>
                        <span>User Dashboard</span>
                    </h2>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 font-medium py-1 px-3 rounded-lg border border-red-500/30 hover:border-red-700/50 text-sm"
                        aria-label="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="md:col-span-1">
                        <ProfileDetailsSection profile={profile} />
                    </div>
                    <div className="md:col-span-1 md:border-l md:border-gray-200 dark:md:border-gray-700 md:pl-8">
                        <div className="space-y-4 pt-4 md:pt-0">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">Quick Actions</h3>
                            <Link
                                href="profile/edit"
                                className="w-full flex items-center justify-between px-4 py-3 bg-blue-600 text-white rounded-xl shadow-md hover:bg-blue-700 transition-colors duration-200"
                            >
                                <span className="flex items-center space-x-3">
                                    <Edit className="w-5 h-5" />
                                    <span className="font-semibold">Edit Account Information</span>
                                </span>
                                <ArrowRight className="w-5 h-5" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}