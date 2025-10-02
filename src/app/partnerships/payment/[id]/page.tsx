import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PaymentForm from '@/app/components/payments/PaymentForm'; 
import { Database } from '@/types/database';
import { Wallet, CreditCard, Building2 } from 'lucide-react';

type PartnershipWithDetails = Database['public']['Tables']['partnerships']['Row'] & {
  packages: {
    name: string;
    price: number;
  } | null;
  events: {
    title: string;
  }[] | null;
};

interface PaymentPageProps {
  params: Promise<{ id: string }>;
}

export default async function PaymentPage({ params }: PaymentPageProps) {
  const { id } = await params;

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(id)) {
    console.error(`Invalid UUID format: ${id}`);
    notFound();
  }

  const supabase = await createClient();
  
  try {
    const { data: partnership, error: partnershipError } = await supabase
      .from('partnerships')
      .select(`
        *,
        packages (name, price)
      `)
      .eq('id', id)
      .single();

    if (partnershipError) {
      console.error(`Supabase error for partnership ${id}:`, partnershipError);
      notFound();
    }

    if (!partnership) {
      console.error(`Partnership not found: ${id}`);
      notFound();
    }

    const { data: eventData, error: eventsError } = await supabase
      .from('partnership_events')
      .select(`
        events (title)
      `)
      .eq('partnership_id', id);

    if (eventsError) {
      console.warn(`Error fetching events for partnership ${id}:`, eventsError);
    }

    const events = eventData?.map(item => item.events).filter(Boolean) || [];
    const typedPartnership: PartnershipWithDetails = {
      ...partnership,
      events
    };
    
    const paymentStatusIsPending = typedPartnership.payment_status === 'Unpaid';
    const packageHasPrice = (typedPartnership.packages?.price ?? 0) > 0;

    if (!paymentStatusIsPending || !packageHasPrice) {
      console.warn(`Payment page access denied for partnership ${id}. Status: ${typedPartnership.payment_status}, Price: ${typedPartnership.packages?.price}`);
      notFound();
    }
    
    return (
      <main className="min-h-screen py-24 px-4">
        <div className="container mx-auto max-w-6xl">
          
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 dark:text-white mb-3 mt-2">
              Selesaikan Pembayaran
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-400">
              Paket Sponsorship: 
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {' '}{typedPartnership.packages?.name || 'Paket Pilihan'}
              </span>
            </p>
            {typedPartnership.events && typedPartnership.events.length > 0 && (
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Event: {typedPartnership.events.map(e => e.title).join(', ')}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <div className="lg:col-span-1 space-y-4">
              
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-700 dark:to-blue-800 rounded-2xl p-6 text-white shadow-lg">
                <p className="text-sm opacity-90 mb-1">Total Pembayaran</p>
                <p className="text-3xl font-bold">
                  Rp {(typedPartnership.packages?.price ?? 0).toLocaleString('id-ID')}
                </p>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/50 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <Building2 size={20} />
                    Informasi Rekening
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                    Transfer ke salah satu rekening di bawah
                  </p>
                </div>
                
                <div className="p-6 space-y-5">
                  
                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                      <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Bank BCA</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-wide">
                        5034170698
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        a.n. Richie Olajuwon Santoso
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-cyan-100 dark:bg-cyan-900/30 flex items-center justify-center">
                      <Wallet className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">DANA</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-wide">
                        081238038207
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        a.n. Richie Olajuwon Santoso
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
                    <div className="flex-shrink-0 w-10 h-10 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">SeaBank</p>
                      <p className="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-wide">
                        901529695637
                      </p>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1">
                        a.n. Richie Olajuwon Santoso
                      </p>
                    </div>
                  </div>

                </div>

                <div className="px-6 py-4 bg-amber-50 dark:bg-amber-900/20 border-t border-amber-200 dark:border-amber-800">
                  <p className="text-xs text-amber-800 dark:text-amber-300 leading-relaxed">
                    <span className="font-semibold">⚠️ Penting:</span> Transfer sesuai nominal tepat dan upload bukti pembayaran di form sebelah kanan.
                  </p>
                </div>
              </div>

            </div>

            <div className="lg:col-span-2">
              <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 sm:p-8 h-full">
                <PaymentForm partnership={typedPartnership} />
              </div>
            </div>

          </div>

        </div>
      </main>
    );

  } catch (err) {
    console.error(`Unexpected error fetching partnership ${id}:`, err);
    notFound();
  }
}