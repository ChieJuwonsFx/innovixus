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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition-colors hover:border-slate-300 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            {title}
          </p>
          <p className="mt-3 text-3xl font-semibold text-slate-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p className={`mt-2 flex items-center gap-1 text-sm ${
              trendUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'
            }`}>
              <TrendingUp size={14} className={trendUp ? '' : 'rotate-180'} />
              {trend}
            </p>
          )}
        </div>
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 text-slate-700 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-300">
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
  const colorClasses = {
    green: 'border-emerald-200 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-300',
    yellow: 'border-amber-200 text-amber-700 dark:border-amber-900/60 dark:text-amber-300',
    red: 'border-rose-200 text-rose-700 dark:border-rose-900/60 dark:text-rose-300',
    blue: 'border-sky-200 text-sky-700 dark:border-sky-900/60 dark:text-sky-300',
  };

  return (
    <div className={`rounded-2xl border p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">{count}</p>
        </div>
        <div className="text-current opacity-70">{icon}</div>
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
      case 'Success': return 'border-emerald-200 text-emerald-700 dark:border-emerald-900/60 dark:text-emerald-300';
      case 'Pending': return 'border-amber-200 text-amber-700 dark:border-amber-900/60 dark:text-amber-300';
      case 'Canceled': return 'border-rose-200 text-rose-700 dark:border-rose-900/60 dark:text-rose-300';
      default: return 'border-slate-200 text-slate-600 dark:border-slate-700 dark:text-slate-400';
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
      <h3 className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
        <Activity className="w-4 h-4" />
        Recent Events
      </h3>
      <div className="space-y-3">
        {events.length > 0 ? (
          events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/events/${event.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 p-3 transition-colors hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:hover:border-slate-700 dark:hover:bg-slate-950"
            >
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium text-slate-900 dark:text-white">
                  {event.title}
                </p>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {event.kategori} • {new Date(event.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
              <span className={`ml-3 whitespace-nowrap rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
            </Link>
          ))
        ) : (
          <p className="py-8 text-center text-slate-500 dark:text-slate-400">
            No recent events
          </p>
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
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white px-6 py-8 dark:border-slate-800 dark:bg-slate-900 sm:px-8">
        <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-500 dark:text-slate-400">
          Admin dashboard
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 dark:text-white">
          Ringkasan singkat aktivitas platform.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-400">
          Semua angka penting ditampilkan secara padat agar halaman tetap fokus dan mudah dibaca.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatsCard
          title="Total Events"
          value={totalEvents || 0}
          icon={<Calendar className="w-7 h-7 text-blue-600 dark:text-blue-400" />}
          link="/admin/events"
        />
        <StatsCard
          title="Total Users"
          value={totalUsers || 0}
          icon={<Users className="w-7 h-7 text-green-600 dark:text-green-400" />}
        />
        <StatsCard
          title="Partnerships"
          value={totalPartnerships || 0}
          icon={<Briefcase className="w-7 h-7 text-purple-600 dark:text-purple-400" />}
          link="/admin/partnerships"
        />
        <StatsCard
          title="Blog Posts"
          value={totalBlogs || 0}
          icon={<FileText className="w-7 h-7 text-orange-600 dark:text-orange-400" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            <Award className="w-4 h-4" />
            Event status
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <StatusCard
              label="Success"
              count={successEvents || 0}
              color="green"
              icon={<CheckCircle size={24} />}
            />
            <StatusCard
              label="Pending Review"
              count={pendingEvents || 0}
              color="yellow"
              icon={<Clock size={24} />}
            />
            <StatusCard
              label="Canceled"
              count={canceledEvents || 0}
              color="red"
              icon={<XCircle size={24} />}
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            <DollarSign className="w-4 h-4" />
            Partnership payment
          </h3>
          <div className="grid grid-cols-1 gap-4">
            <StatusCard
              label="Paid"
              count={paidPartnerships || 0}
              color="green"
              icon={<CheckCircle size={24} />}
            />
            <StatusCard
              label="Pending Payment"
              count={pendingPartnerships || 0}
              color="yellow"
              icon={<AlertCircle size={24} />}
            />
            <StatusCard
              label="Unpaid"
              count={unpaidPartnerships || 0}
              color="red"
              icon={<XCircle size={24} />}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900">
          <h3 className="mb-4 flex items-center gap-2 text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            <Package className="w-4 h-4" />
            Package overview
          </h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Total packages</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  {packages?.length || 0}
                </p>
              </div>
              <Package className="w-8 h-8 text-slate-500" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Active packages</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  {activePackages}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-slate-500" />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-slate-200 p-4 dark:border-slate-800">
              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">Revenue potential</p>
                <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-white">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-slate-500" />
            </div>
          </div>
        </div>

        <RecentEventsList events={recentEvents || []} />
      </div>
    </div>
  );
}