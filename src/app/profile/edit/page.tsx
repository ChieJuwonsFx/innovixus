import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Save } from 'lucide-react'; 
import { Profile } from '@/types/profile'; 
import { createClient } from '@/lib/supabase/server';

const SubmitButton = ({ children }: { children: React.ReactNode }) => {
    return (
        <button 
            type="submit" 
            className="w-full flex justify-center items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50"
        >
            <Save className="w-5 h-5" />
            <span>{children}</span>
        </button>
    );
};

async function updateProfile(formData: FormData): Promise<void> { 
    'use server';
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const name = formData.get('name') as string;

    const updates = {
        id: user.id,
        name: name,
        updated_at: new Date().toISOString(),
    };

    const { error } = await supabase.from('users').update(updates).eq('id', user.id);

    if (error) {
        console.error("Error updating profile:", error.message);
    }

    redirect('/profile'); 
}

export default async function EditProfilePage() {
    const supabase = await createClient();

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/login');
    }

    const { data: profileData, error } = await supabase
        .from('users')
        .select(`id, name, email, avatar, role`)
        .eq('id', user.id)
        .single();

    if (error || !profileData) {
        console.error("Error fetching profile for edit:", error?.message);
        redirect('/profile'); 
    }

    const profile = profileData as Profile;

    return (
        <div className="min-h-screen pt-28 pb-12 px-4">
            <div className="max-w-3xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden p-8">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                            Edit Profile
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Update your account information
                        </p>
                    </div>
                    <Link 
                        href="/profile"
                        className="flex items-center gap-1 text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 transition-colors font-medium px-4 py-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back to Profile</span>
                    </Link>
                </div>
                
                <div className="flex flex-col items-center mb-8 p-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl">
                    <div className="relative mb-4">
                        {profile.avatar ? (
                            <Image
                                src={profile.avatar}
                                alt="User Avatar"
                                width={128}
                                height={128}
                                className="w-32 h-32 rounded-full object-cover border-4 border-blue-500/50 shadow-lg"
                            />
                        ) : (
                            <div className="w-32 h-32 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center border-4 border-blue-500/50 shadow-lg">
                                <span className="text-5xl font-bold text-blue-600 dark:text-blue-300">
                                    {profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 text-center">
                        {profile.email}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        {profile.role.charAt(0).toUpperCase() + profile.role.slice(1)}
                    </p>
                </div>

                <form action={updateProfile} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Full Name *
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            defaultValue={profile.name}
                            required
                            className="w-full px-4 py-3 border-2 border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-all"
                            placeholder="Enter your full name"
                        />
                        <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                            This is how your name will appear on the platform
                        </p>
                    </div>

                    <div className="pt-4">
                        <SubmitButton>
                            Save Changes
                        </SubmitButton>
                    </div>
                </form>

                <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                        <strong>Note:</strong> Email address cannot be changed. Please contact support if you need assistance.
                    </p>
                </div>
            </div>
        </div>
    );
}