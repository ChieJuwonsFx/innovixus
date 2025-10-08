import { Clock, User as UserIcon } from 'lucide-react';
import type { Partnership, User } from '../../partnerships/[id]/page';

const InfoItem = ({ label, value, icon }: { label: string, value: string, icon?: React.ReactNode }) => (
    <div>
      <label className="block text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
        {label}
      </label>
      <div className="flex items-center gap-2">
        {icon}
        <p className="text-gray-900 dark:text-white font-medium">{value}</p>
      </div>
    </div>
);

interface Props {
  partnership: Partnership;
  user: User | null;
}

export default function InfoCard({ partnership, user }: Props) {
  return (
    <div className="bg-gray-50 dark:bg-slate-700/50 rounded-lg p-6 border dark:border-slate-700">
      <div className="flex items-center gap-3 mb-4">
        <UserIcon className="h-6 w-6 text-blue-600" />
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
          Informasi Pengajuan
        </h2>
      </div>
      
      <div className="grid md:grid-cols-2 gap-x-6 gap-y-4">
        <InfoItem label="Contact Person" value={partnership.contact_person} />
        <InfoItem 
          label="Tanggal Pengajuan" 
          value={new Date(partnership.created_at).toLocaleString('id-ID', {
            dateStyle: 'full',
            timeStyle: 'short'
          })} 
          icon={<Clock className="h-4 w-4 text-gray-400" />}
        />
      </div>

      {user && (
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">
            Informasi User
          </h3>
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg border dark:border-slate-600">
            <p className="font-semibold text-lg">{user.name}</p>
            <p className="text-gray-600 dark:text-gray-300">{user.email}</p>
          </div>
        </div>
      )}
    </div>
  );
}