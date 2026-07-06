import type { Partnership, Event } from '../../partnerships/[id]/page';

const StatusBadge = ({ type, status }: { type: 'payment' | 'event', status: string | null }) => {
    const paymentStyles: { [key: string]: string } = {
        'Paid': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'Unpaid': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
        'Canceled': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        'default': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    };

    const eventStyles: { [key: string]: string } = {
        'Success': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
        'Pending': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
        'Canceled': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
        'default': 'bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-200',
    };
    
    const styles = type === 'payment' ? paymentStyles : eventStyles;
    const style = styles[status || 'default'] || styles['default'];

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${style}`}>
            {status}
        </span>
    );
};


interface Props {
  partnership: Partnership;
  event: Event | null;
}

export default function Header({ partnership, event }: Props) {
  return (
    <div className="bg-whitedark:bg-slate-900 p-6 md:p-8 border-b border-slate-200 dark:border-slate-700">
      <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
        <div className="flex-grow">
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2 leading-tight">
            {event?.title || 'Detail Partnership'}
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-lg max-w-2xl">
            {event?.caption || 'Detail pengajuan partnership dan informasi event terkait.'}
          </p>
          <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-4 text-slate-400 dark:text-slate-500">
            <span className="text-xs font-mono">ID: {partnership.id}</span>
            <span className="text-xs">
              Diajukan: {new Date(partnership.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}
            </span>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-3 flex-shrink-0 pt-2">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Pembayaran:</p>
            <StatusBadge type="payment" status={partnership.payment_status} />
          </div>
          {event && (
            <div className="flex items-center gap-2">
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Event:</p>
                <StatusBadge type="event" status={event.status} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}