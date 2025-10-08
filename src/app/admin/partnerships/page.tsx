import { createClient } from '@/lib/supabase/server';
import AdminPageHeader from '../components/AdminPageHeader';
import List from '../components/partnerships/List'; 
import { Database } from '@/types/database'; 

type Partnership = Database['public']['Tables']['partnerships']['Row'];

export type EnrichedPartnership = Partnership & {
  package_name: string;
  event_title: string | null;
  event_status: string | null;
  user_email: string | null;
  user_name: string | null;
};

export default async function AdminPartnershipsPage() {
  const supabase = await createClient();
  
  try {
    const { data: partnerships, error } = await supabase
      .from('partnerships')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    if (!partnerships || partnerships.length === 0) {
      return (
        <div className="space-y-6">
          <AdminPageHeader 
            title="Manajemen Partnership"
            description="Lihat dan kelola semua pengajuan partnership dari user."
          />
          <div className="text-center py-16 px-6 bg-white dark:bg-slate-800 rounded-lg shadow-md border border-slate-200 dark:border-slate-700">
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200">Belum Ada Partnership</h3>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Saat ini belum ada pengajuan partnership yang masuk. ✨
            </p>
          </div>
        </div>
      );
    }

    const packageIds = [...new Set(partnerships.map(p => p.package_id))];
    const eventIds = [...new Set(partnerships.filter(p => p.event_id).map(p => p.event_id!))];
    const userIds = [...new Set(partnerships.filter(p => p.user_id).map(p => p.user_id!))];

    const [packagesResult, eventsResult, usersResult] = await Promise.all([
      supabase.from('packages').select('id, name').in('id', packageIds),
      eventIds.length > 0 ? supabase.from('events').select('id, title, status').in('id', eventIds) : { data: [], error: null },
      userIds.length > 0 ? supabase.from('users').select('id, email, name').in('id', userIds) : { data: [], error: null }
    ]);

    const packagesMap = new Map(packagesResult.data?.map(p => [p.id, p.name]) || []);
    const eventsMap = new Map(eventsResult.data?.map(e => [e.id, { title: e.title, status: e.status }]) || []);
    const usersMap = new Map(usersResult.data?.map(u => [u.id, { name: u.name, email: u.email }]) || []);

    const enrichedPartnerships: EnrichedPartnership[] = partnerships.map(partnership => {
      const pkg_name = packagesMap.get(partnership.package_id) || 'N/A';
      const event = partnership.event_id ? eventsMap.get(partnership.event_id) : null;
      const user = partnership.user_id ? usersMap.get(partnership.user_id) : null;

      return {
        ...partnership,
        package_name: pkg_name,
        event_title: event?.title || null,
        event_status: event?.status || null,
        user_email: user?.email || null,
        user_name: user?.name || null
      };
    });

    return (
      <div className="space-y-6">
        <AdminPageHeader 
          title="Manajemen Partnership"
          description="Lihat dan kelola semua pengajuan partnership dari user."
        />
        
        <List partnerships={enrichedPartnerships} />
      </div>
    );
  } catch (error) {
    console.error('Fatal error in partnerships page:', error);
    return (
      <div className="space-y-6">
        <AdminPageHeader 
          title="Manajemen Partnership"
          description="Gagal memuat data partnership."
        />
        <div className="p-4 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-700">
          <p className="font-bold">Terjadi Kesalahan</p>
          <p>{error instanceof Error ? error.message : String(error)}</p>
        </div>
      </div>
    );
  }
}