import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import { 
  approveFreePartnership, 
  rejectPartnership, 
  verifyPayment, 
  publishEvent 
} from '../actions';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { Database } from '@/types/database';

import Header from '../../components/partnerships/Header';
import InfoCard from '../../components/partnerships/InfoCard';
import EventDetails from '../../components/partnerships/DetailCard';
import PaymentProof from '../../components/partnerships/PaymentProof';
import Package from '../../components/partnerships/Package';
import Action from '../../components/partnerships/Action';

export type Partnership = Database['public']['Tables']['partnerships']['Row'];
export type Package = Database['public']['Tables']['packages']['Row'];
export type Event = Database['public']['Tables']['events']['Row'];
export type User = Pick<Database['public']['Tables']['users']['Row'], 'id' | 'name' | 'email'>;

export default async function PartnershipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params; 
  const supabase = await createClient();
  
  try {
    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .select('*')
      .eq('id', id) 
      .single();

    if (partnershipError || !partnership) {
      console.error('Partnership not found:', partnershipError);
      notFound();
    }

    const [packageResult, eventResult, userResult] = await Promise.all([
      supabase
        .from('packages')
        .select('*')
        .eq('id', partnership.package_id)
        .single(),
      
      partnership.event_id 
        ? supabase
            .from('events')
            .select('*')
            .eq('id', partnership.event_id)
            .single()
        : Promise.resolve({ data: null, error: null }),
      
      partnership.user_id 
        ? supabase
            .from('users')
            .select('id, name, email')
            .eq('id', partnership.user_id)
            .single()
        : Promise.resolve({ data: null, error: null })
    ]);

    const packageData = packageResult.data;
    const eventData = eventResult.data;
    const userData = userResult.data;

    const approveAction = approveFreePartnership.bind(null, partnership.id, eventData?.id || null);
    const rejectAction = rejectPartnership.bind(null, partnership.id, eventData?.id || null);
    const verifyPaymentAction = verifyPayment.bind(null, partnership.id);
    const publishEventAction = publishEvent.bind(null, eventData?.id || null);


    return (
      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        <div>
          <Link 
            href="/admin/partnerships"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium transition-colors"
          >
            <ArrowLeft size={20} />
            Kembali ke Daftar Partnership
          </Link>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-lg overflow-hidden">
          <Header partnership={partnership} event={eventData} />

          <div className="p-6 md:p-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <InfoCard partnership={partnership} user={userData} />
                {eventData && <EventDetails event={eventData} />}
                {partnership.payment_proof && <PaymentProof proofUrl={partnership.payment_proof} />}
              </div>

              <div className="space-y-6">
                {packageData && <Package packageData={packageData} />}
                <Action 
                  partnership={partnership}
                  event={eventData}
                  packageData={packageData}
                  approveAction={approveAction}
                  rejectAction={rejectAction}
                  verifyPaymentAction={verifyPaymentAction}
                  publishEventAction={publishEventAction}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );

  } catch (error) {
    console.error('Fatal error in partnership detail page:', error);
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 text-center">
          <h1 className="text-xl font-semibold text-red-800 dark:text-red-200 mb-2">
            Gagal Memuat Detail Partnership
          </h1>
          <p className="text-red-700 dark:text-red-300 mb-4">
            {error instanceof Error ? error.message : 'Terjadi kesalahan yang tidak diketahui.'}
          </p>
          <Link 
            href="/admin/partnerships"
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft size={20} />
            Kembali ke Daftar
          </Link>
        </div>
      </div>
    );
  }
}