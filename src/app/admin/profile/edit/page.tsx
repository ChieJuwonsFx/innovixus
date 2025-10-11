import { redirect } from 'next/navigation';
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Save} from 'lucide-react'; 
import { Profile } from '@/types/profile'; 


const SubmitButton = ({ children }: { children: React.ReactNode }) => {
    return (
        <button type="submit" className="w-full flex justify-center items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors duration-300 focus:outline-none focus:ring-4 focus:ring-blue-500/50">
            <Save className="w-5 h-5" />
            <span>{children}</span>
        </button>
    );
};

async function updateProfile(formData: FormData): Promise<void> { 
    'use server';
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

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

    redirect('admin/profile'); 
}

export default async function EditProfilePage() {
    const cookieStore = cookies();
    const supabase = createServerComponentClient({ cookies: () => cookieStore });

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
        redirect('admin/profile'); 
    }

    const profile = profileData as Profile;

    return (
        <div className="min-h-screen pt-28 pb-12 px-4">
            <div className="max-w-5xl mx-auto rounded-xl shadow-2xl overflow-hidden p-8">
                <div className="border-b border-gray-200 dark:border-gray-700 pb-4 mb-6 flex justify-between items-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white">
                        Edit Profile
                    </h2>
                    <Link 
                        href="admin/profile"
                        className="flex items-center text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
                    >
                        <ChevronLeft className="w-5 h-5 mr-1" />
                        Back to Profile
                    </Link>
                </div>
                
                <div className="flex flex-col items-center mb-8">
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
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        {profile.email} ({profile.role})
                    </p>
                </div>

                <form action={updateProfile} className="space-y-6">
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                            Full Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            name="name"
                            defaultValue={profile.name}
                            required
                            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg shadow-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                        />
                    </div>

                    <SubmitButton>
                        Save Changes
                    </SubmitButton>
                </form>

            </div>
        </div>
    );
}