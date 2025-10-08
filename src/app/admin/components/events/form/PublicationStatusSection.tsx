'use client';

interface PublicationStatusSectionProps {
  event?: {
    status?: 'Pending' | 'Success' | 'Canceled' | null;
  };
  formInputStyle: string;
}

export default function PublicationStatusSection({ event, formInputStyle }: PublicationStatusSectionProps) {
  return (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3">
            Status Publikasi
          </h2>
          
          <div className="space-y-3 max-w-md">
            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
              Status <span className="text-red-500">*</span>
            </label>
            <select
              name="status"
              id="status"
              defaultValue={event?.status ?? 'Success'}
              required
              className={`${formInputStyle} pl-4 pr-12 py-3 text-base appearance-none dark:[background-image:url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23FFFFFF' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6,9 12,15 18,9'%3e%3c/polyline%3e%3c/svg%3e")]`}
            >
              <option value="Success">Publikasikan (Success)</option>
              <option value="Pending">Simpan sebagai Draft (Pending)</option>
              <option value="Canceled">Batalkan (Canceled)</option>
            </select>
          </div>
        </div>
  );
}