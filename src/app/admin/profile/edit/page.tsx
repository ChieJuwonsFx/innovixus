import { redirect } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, Save, Shield } from 'lucide-react'; 
import { Profile } from '@/types/profile'; 
import { createClient } from '@/lib/supabase/server';

const SubmitButton = ({ children }: { children: React.ReactNode }) => {
    return (
        <button 
            type="submit" 
            className="inline-flex w-full items-center justify-center gap-2 rounded-full border border-slate-900 bg-slate-900 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-[#003366] focus:ring-offset-2 dark:border-white dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
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

    redirect('/admin/profile'); 
}

export default async function AdminEditProfilePage() {
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
        redirect('/admin/profile'); 
    }

    const profile = profileData as Profile;

    return (
        <div className="min-h-screen px-4 py-8">
            <div className="mx-auto max-w-3xl overflow-hidden rounded-3xl border border-slate-200 bg-white p-8 dark:border-slate-800 dark:bg-slate-900">
                <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-4 dark:border-slate-800">
                    <div>
                        <h2 className="flex items-center gap-2 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
                            <Shield className="w-7 h-7 text-[#003366]" />
                            Edit Admin Profile
                        </h2>
                        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                            Update your administrator account information
                        </p>
                    </div>
                    <Link 
                        href="/admin/profile"
                        className="flex items-center gap-1 rounded-full border border-slate-200 px-4 py-2 font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-[#003366] dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800"
                    >
                        <ChevronLeft className="w-5 h-5" />
                        <span>Back</span>
                    </Link>
                </div>
                
                <div className="mb-8 flex flex-col items-center rounded-2xl border border-slate-200 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-950">
                    <div className="relative mb-4">
                        {profile.avatar ? (
                            <Image
                                src={profile.avatar}
                                alt="Admin Avatar"
                                width={128}
                                height={128}
                                className="h-32 w-32 rounded-full border-4 border-white object-cover shadow-sm dark:border-slate-900"
                            />
                        ) : (
                            <div className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-white bg-[#003366] shadow-sm dark:border-slate-900">
                                <span className="text-5xl font-semibold text-white">
                                    {profile.name?.charAt(0).toUpperCase() || profile.email?.charAt(0).toUpperCase()}
                                </span>
                            </div>
                        )}
                        <div className="absolute -bottom-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#003366] shadow-sm dark:border-slate-900">
                            <Shield className="w-5 h-5 text-white" />
                        </div>
                    </div>
                    <div className="text-center">
                        <p className="flex items-center justify-center gap-1 text-sm font-medium text-[#003366] dark:text-white">
                            <Shield className="w-4 h-4" />
                            Administrator
                        </p>
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            {profile.email}
                        </p>
                    </div>
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
                            className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 shadow-sm outline-none transition-colors focus:border-[#003366] focus:ring-2 focus:ring-[#003366]/20 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
                            placeholder="Enter your full name"
                        />
                        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                            This name will be displayed across the admin panel
                        </p>
                    </div>

                    <div className="pt-4">
                        <SubmitButton>
                            Save Changes
                        </SubmitButton>
                    </div>
                </form>

                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        <strong>Note:</strong> Email and role cannot be changed. Contact system administrator if you need to modify these fields.
                    </p>
                </div>
            </div>
        </div>
    );
}