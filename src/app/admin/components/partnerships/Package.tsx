import { DollarSign, Package as PackageIcon } from 'lucide-react';
import type { Package } from '../../partnerships/[id]/page';

interface Props {
  packageData: Package;
}

export default function Package({ packageData }: Props) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 rounded-lg p-6 border border-green-200 dark:border-green-800">
      <div className="flex items-center gap-3 mb-4">
        <PackageIcon className="h-6 w-6 text-green-600" />
        <h2 className="text-xl font-semibold text-green-900 dark:text-green-100">
          Paket Dipilih
        </h2>
      </div>
      
      <div className="space-y-3">
        <div>
          <h3 className="font-bold text-2xl text-green-900 dark:text-green-100">
            {packageData.name}
          </h3>
          <p className="text-green-700 dark:text-green-300 text-sm mt-1">
            {packageData.description}
          </p>
        </div>
        
        <div className="flex items-center gap-2 pt-2">
          <DollarSign className="h-6 w-6 text-green-600" />
          <span className="text-3xl font-bold text-green-900 dark:text-green-100">
            Rp {packageData.price.toLocaleString('id-ID')}
          </span>
        </div>
      </div>
    </div>
  );
}