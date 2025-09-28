import { createClient } from '@/lib/supabase/server';
import { notFound } from 'next/navigation';
import PartnershipMultiStepForm from '../../../components/partnerships/submit/Form'; 

export default async function SubmitPartnershipPage({ params }: { params: { packageId: string } }) {
  const { packageId } = params;
  const supabase = await createClient();

  const { data: pkg } = await supabase.from('packages').select('*').eq('id', packageId).single();
  if (!pkg) notFound();

  const { data: organizers } = await supabase.from('organizers').select('id, name');
  const { data: levels } = await supabase.from('levels').select('*');
  const { data: fields } = await supabase.from('fields').select('*');

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-24 sm:py-32">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-5xl">
            Formulir Pengajuan Partnership
          </h1>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">
            Lengkapi detail event Anda dalam beberapa langkah mudah.
          </p>
        </div>
        <PartnershipMultiStepForm 
          selectedPackage={pkg}
          allOrganizers={organizers || []}
          allLevels={levels || []}
          allFields={fields || []}
        />
      </div>
    </div>
  );
}