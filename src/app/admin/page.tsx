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
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6 hover:shadow-xl transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white">
            {value}
          </p>
          {trend && (
            <p className={`text-sm mt-2 flex items-center gap-1 ${
              trendUp ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
            }`}>
              <TrendingUp size={14} className={trendUp ? '' : 'rotate-180'} />
              {trend}
            </p>
          )}
        </div>
        <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
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
    green: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
    yellow: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300',
    red: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300',
  };

  return (
    <div className={`rounded-lg p-4 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium opacity-80">{label}</p>
          <p className="text-2xl font-bold mt-1">{count}</p>
        </div>
        <div className="opacity-60">{icon}</div>
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
      case 'Success': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300';
      case 'Pending': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300';
      case 'Canceled': return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-900/30 dark:text-gray-300';
    }
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Activity className="w-5 h-5 text-blue-600" />
        Recent Events
      </h3>
      <div className="space-y-3">
        {events.length > 0 ? (
          events.map((event) => (
            <Link
              key={event.id}
              href={`/admin/events/${event.id}`}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors border border-slate-200 dark:border-slate-700"
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-slate-900 dark:text-white truncate">
                  {event.title}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {event.kategori} • {new Date(event.created_at).toLocaleDateString('id-ID')}
                </p>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ml-3 ${getStatusColor(event.status)}`}>
                {event.status}
              </span>
            </Link>
          ))
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
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
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-600 to-blue-900 rounded-2xl shadow-xl p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-blue-100">
          Welcome back!!.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Award className="w-5 h-5 text-blue-600" />
            Event Status Overview
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

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-blue-600" />
            Partnership Payment Status
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 p-6">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <Package className="w-5 h-5 text-blue-600" />
            Package Overview
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Packages</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {packages?.length || 0}
                </p>
              </div>
              <Package className="w-10 h-10 text-blue-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Active Packages</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  {activePackages}
                </p>
              </div>
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-900/20 dark:to-yellow-900/20 rounded-lg">
              <div>
                <p className="text-sm text-slate-600 dark:text-slate-400">Total Revenue Potential</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white">
                  Rp {totalRevenue.toLocaleString('id-ID')}
                </p>
              </div>
              <DollarSign className="w-10 h-10 text-orange-600" />
            </div>
          </div>
        </div>

        <RecentEventsList events={recentEvents || []} />
      </div>
    </div>
  );
}