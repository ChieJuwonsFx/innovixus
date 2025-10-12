'use client';

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation"; 
import { useEffect, useState, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { 
    LogOut, Edit, Mail, Calendar, UserCheck, ArrowRight, Shield
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
                            alt="Admin Avatar"
                            width={112}
                            height={112}
                            className="w-28 h-28 rounded-full object-cover border-4 border-blue-500 shadow-xl"
                        />
                    ) : (
                        <div className="w-28 h-28 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center border-4 border-blue-500 shadow-xl">
                            <span className="text-5xl font-bold text-white">
                                {profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase()}
                            </span>
                        </div>
                    )}
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-800">
                        <Shield className="w-4 h-4 text-white" />
                    </div>
                </div>
                <div className="text-center md:text-left mt-2">
                    <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {profile.name || "Admin User"}
                    </h1>
                    <p className="mt-1 text-base font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2 justify-center md:justify-start">
                        <Shield className="w-4 h-4" />
                        Administrator
                    </p>
                </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 rounded-xl shadow-lg border border-blue-200 dark:border-blue-700">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 border-b border-blue-300 dark:border-blue-600 pb-2">
                    Account Details
                </h2>
                
                <div className="grid grid-cols-1 gap-4">
                    <div className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Email Address</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{profile.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4 p-3 bg-white dark:bg-gray-800 rounded-lg">
                        <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-medium text-gray-500 dark:text-gray-400">Admin Since</p>
                            <p className="text-sm font-semibold text-gray-900 dark:text-white">{joinDate}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default function AdminProfilePage() {
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
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 dark:text-gray-300">Loading admin dashboard...</p>
                </div>
            </div>
        );
    }

    if (!profile) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen p-4">
                <Shield className="w-16 h-16 text-red-500 mb-4" />
                <p className="text-xl text-red-500 dark:text-red-400 font-semibold mb-4">
                    Access Denied
                </p>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                    You dont have permission to access this page.
                </p>
                <Link 
                    href="/" 
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-md"
                >
                    Go to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen py-8 px-4">
            <div className="max-w-5xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden p-6 sm:p-8">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                        <UserCheck className="w-6 h-6 text-blue-600"/>
                        <span>Admin Dashboard</span>
                    </h2>
                    <button
                        onClick={handleLogout}
                        className="flex items-center space-x-1.5 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors duration-200 font-medium py-2 px-4 rounded-lg border border-red-500/30 hover:border-red-700/50 text-sm"
                        aria-label="Logout"
                    >
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="lg:col-span-1">
                        <ProfileDetailsSection profile={profile} />
                    </div>
                    <div className="lg:col-span-1 lg:border-l lg:border-gray-200 dark:lg:border-gray-700 lg:pl-8">
                        <div className="space-y-4">
                            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                                <Edit className="w-5 h-5 text-blue-600" />
                                Quick Actions
                            </h3>
                            <Link
                                href="/admin/profile/edit"
                                className="w-full flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl shadow-lg hover:shadow-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 group"
                            >
                                <span className="flex items-center space-x-3">
                                    <Edit className="w-5 h-5" />
                                    <span className="font-semibold">Edit Account Information</span>
                                </span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </Link>
                            
                            <Link
                                href="/admin"
                                className="w-full flex items-center justify-between px-5 py-4 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-xl shadow-md hover:shadow-lg border-2 border-gray-200 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-200 group"
                            >
                                <span className="flex items-center space-x-3">
                                    <Shield className="w-5 h-5 text-blue-600" />
                                    <span className="font-semibold">Back to Admin Panel</span>
                                </span>
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-gray-400" />
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}