import { createClient } from '@/lib/supabase/server';
import { 
  Calendar, 
  Users, 
  Briefcase, 
  TrendingUp, 
  DollarSign,
  FileText,
  Package,
  Award,
  Activity,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle
} from 'lucide-react';
import Link from 'next/link';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
  link?: string;
}

function StatsCard({ title, value, icon, trend, trendUp, link }: StatsCardProps) {
  const content = (
    <div className="rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p className={`mt-1 flex items-center gap-1 text-xs ${
              trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <TrendingUp size={12} className={trendUp ? '' : 'rotate-180'} />
              {trend}
            </p>
          )}
        </div>
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-700 dark:bg-slate-950">
          {icon}
        </div>
      </div>
    </div>
  );

  if (link) {
    return <Link href={link}>{content}</Link>;
  }

  return content;
}

interface StatusCardProps {
  label: string;
  count: number;
  color: 'green' | 'yellow' | 'red' | 'blue';
  icon: React.ReactNode;
}

function StatusCard({ label, count, color, icon }: StatusCardProps) {
  const accentClasses = {
    green: 'border-l-green-500',
    yellow: 'border-l-yellow-500',
    red: 'border-l-red-500',
    blue: 'border-l-blue-500',
  };
  const iconClasses = {
    green: 'text-green-600 dark:text-green-400',
    yellow: 'text-yellow-600 dark:text-yellow-400',
    red: 'text-red-600 dark:text-red-400',
    blue: 'text-blue-600 dark:text-blue-400',
  };

  return (
    <div className="flex items-center justify-between rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded-lg ${iconClasses[color]}`}>
          {icon}
        </span>
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">{label}</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{count}</p>
        </div>
      </div>
    </div>
  );
}

interface RecentEvent {
  id: string;
  title: string;
  kategori: string;
  status: string;
  created_at: string;
}

function RecentEventsList({ events }: { events: RecentEvent[] }) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Success': return 'text-green-600 dark:text-green-400';
      case 'Pending': return 'text-yellow-600 dark:text-yellow-400';
      case 'Canceled': return 'text-red-600 dark:text-red-400';
      default: return 'text-slate-500 dark:text-slate-400';
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        <Activity className="h-3.5 w-3.5" />
        Event Terbaru
      </h3>
      <div className="space-y-1">
        {events.length > 0 ? (
          events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/events/${event.id}`}
              className="flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors hover:bg-slate-50 dark:hover:bg-slate-800"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-slate-900 dark:text-white">
                  {event.title}
                </p>
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  {event.kategori} • {new Date(event.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
              <span className={`ml-3 whitespace-nowrap text-xs font-semibold ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
            </Link>
          ))
        ) : (
          <p className="py-6 text-center text-xs text-slate-400">Belum ada event.</p>
        )}
      </div>
    </div>
  );
}

export default async function AdminDashboard() {
  const supabase = await createClient();

  const [
    { count: totalEvents },
    { count: totalUsers },
    { count: totalPartnerships },
    { count: totalBlogs },
    { count: pendingEvents },
    { count: successEvents },
    { count: canceledEvents },
    { count: paidPartnerships },
    { count: pendingPartnerships },
    { count: unpaidPartnerships },
    { data: recentEvents },
    { data: packages },
  ] = await Promise.all([
    supabase.from('events').select('*', { count: 'exact', head: true }),
    supabase.from('users').select('*', { count: 'exact', head: true }),
    supabase.from('partnerships').select('*', { count: 'exact', head: true }),
    supabase.from('blogs').select('*', { count: 'exact', head: true }),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'Pending'),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'Success'),
    supabase.from('events').select('*', { count: 'exact', head: true }).eq('status', 'Canceled'),
    supabase.from('partnerships').select('*', { count: 'exact', head: true }).eq('payment_status', 'Paid'),
    supabase.from('partnerships').select('*', { count: 'exact', head: true }).eq('payment_status', 'Pending'),
    supabase.from('partnerships').select('*', { count: 'exact', head: true }).eq('payment_status', 'Unpaid'),
    supabase.from('events').select('id, title, kategori, status, created_at').order('created_at', { ascending: false }).limit(5),
    supabase.from('packages').select('*'),
  ]);

  const totalRevenue = packages?.reduce((sum, pkg) => sum + pkg.price, 0) || 0;
  const activePackages = packages?.filter(p => p.is_active).length || 0;

  return (
    <div className="space-y-5">
      <div className="rounded-xl border border-slate-200 bg-white px-6 py-5 dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-lg font-semibold text-slate-900 dark:text-white">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ringkasan aktivitas platform.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard title="Total Event" value={totalEvents || 0} icon={<Calendar className="h-5 w-5" />} link="/admin/events" />
        <StatsCard title="Total Users" value={totalUsers || 0} icon={<Users className="h-5 w-5" />} />
        <StatsCard title="Partnerships" value={totalPartnerships || 0} icon={<Briefcase className="h-5 w-5" />} link="/admin/partnerships" />
        <StatsCard title="Blog Posts" value={totalBlogs || 0} icon={<FileText className="h-5 w-5" />} />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Award className="h-3.5 w-3.5" />
            Status Event
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <StatusCard label="Sukses" count={successEvents || 0} color="green" icon={<CheckCircle size={20} />} />
            <StatusCard label="Menunggu" count={pendingEvents || 0} color="yellow" icon={<Clock size={20} />} />
            <StatusCard label="Dibatalkan" count={canceledEvents || 0} color="red" icon={<XCircle size={20} />} />
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <DollarSign className="h-3.5 w-3.5" />
            Pembayaran Partnership
          </h3>
          <div className="grid grid-cols-1 gap-3">
            <StatusCard label="Lunas" count={paidPartnerships || 0} color="green" icon={<CheckCircle size={20} />} />
            <StatusCard label="Menunggu" count={pendingPartnerships || 0} color="yellow" icon={<AlertCircle size={20} />} />
            <StatusCard label="Belum Dibayar" count={unpaidPartnerships || 0} color="red" icon={<XCircle size={20} />} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            <Package className="h-3.5 w-3.5" />
            Package
          </h3>
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">Total package</span>
              <span className="text-lg font-semibold text-slate-900 dark:text-white">{packages?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">Aktif</span>
              <span className="text-lg font-semibold text-slate-900 dark:text-white">{activePackages}</span>
            </div>
            <div className="flex items-center justify-between py-3">
              <span className="text-sm text-slate-500 dark:text-slate-400">Total nilai package</span>
              <span className="text-lg font-semibold text-slate-900 dark:text-white">Rp {totalRevenue.toLocaleString('id-ID')}</span>
            </div>
          </div>
        </div>

        <RecentEventsList events={recentEvents || []} />
      </div>
    </div>
  );
}