import Image from "next/image";
import clsx from "clsx";

interface UserProfile {
  name?: string | null;
  avatar?: string | null;
  role?: string;
}

interface UserAvatarProps {
  profile: UserProfile;
  size?: 'sm' | 'md';
}

export function UserAvatar({ profile, size = 'md' }: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-8 h-8 text-xs",
    md: "w-9 h-9 text-sm",
  };

  const name = profile.name || 'User';
  const isAdmin = profile.role === 'Admin';

  return (
    <>
      {profile.avatar ? (
        <Image
          src={profile.avatar}
          alt="User Avatar"
          width={size === 'sm' ? 32 : 36}
          height={size === 'sm' ? 32 : 36}
          className={clsx(
            "rounded-full border-2 border-slate-200 dark:border-slate-700 object-cover shadow-sm",
            sizeClasses[size]
          )}
          priority
        />
      ) : (
        <div 
          className={clsx(
            "rounded-full flex items-center justify-center text-white font-bold border-2 border-slate-200 dark:border-slate-700 shadow-sm",
            sizeClasses[size],
            isAdmin ? "bg-purple-600" : "bg-blue-600"
          )}
        >
          {name.charAt(0).toUpperCase()}
        </div>
      )}
    </>
  );
}