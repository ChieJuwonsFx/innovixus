import { createClient } from '@/lib/supabase/server';
import { HeroSection } from '../components/partnerships/Hero';
import { FeaturesSection } from '../components/partnerships/Features';
import { PricingCard } from '../components/partnerships/PricingCard';
import { FaqSection } from '../components/partnerships/Faq';

export default async function PartnershipPage() {
  const supabase = createClient();
  const [packagesResult, partnershipsResult] = await Promise.all([
    supabase
      .from('packages')
      .select('*')
      .eq('is_active', true)
      .order('price', { ascending: true }),
    supabase.from('partnerships').select('package_id')
  ]);
  const { data: packages, error: packagesError } = packagesResult;
  const { data: partnerships, error: partnershipsError } = partnershipsResult;
  
  if (packagesError || partnershipsError || !packages) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-center text-red-500 dark:text-red-400 font-medium">
          Gagal memuat data partnership. Silakan coba lagi nanti.
        </p>
      </div>
    );
  }
  
  const counts = partnerships?.reduce((acc, partnership) => {
    if (partnership.package_id) {
      const id = String(partnership.package_id);
      acc[id] = (acc[id] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>) || {};
  
  let mostPopularId: string | null = null;
  if (Object.keys(counts).length > 0) {
      const mostPopularEntry = Object.entries(counts).reduce(
        (a, b) => (a[1] > b[1] ? a : b)
      );
      mostPopularId = mostPopularEntry[0];
  }
  
  return (
    <div>
      <HeroSection />
      <main className="space-y-12 sm:space-y-16 lg:space-y-20 xl:space-y-24">
       
        <div className="container mx-auto px-4">
          <FeaturesSection />
        </div>
        
        <section id="pricing" className="w-full py-12 sm:py-14 lg:py-16 xl:py-20 bg-slate-50 dark:bg-slate-900/90">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl text-slate-900 dark:text-white">
              Paket yang Tepat untuk Anda
            </h2>
            <p className="mt-4 max-w-2xl mx-auto text-lg text-slate-600 dark:text-slate-400">
              Mulai dari opsi gratis hingga paket premium untuk jangkauan maksimal.
            </p>
           
            <div className="mt-12 max-w-7xl mx-auto">
              <div className="grid grid-cols-1 gap-8 md:hidden place-items-center">
                {packages.map((pkg) => (
                  <PricingCard
                    key={pkg.id}
                    packageInfo={pkg}
                    isFeatured={pkg.id === mostPopularId}
                    subscriberCount={counts[pkg.id] || 0}
                  />
                ))}
              </div>
              
              <div className="hidden md:block lg:hidden">
                <div className="grid grid-cols-2 gap-8 place-items-center">
                  {packages.slice(0, Math.floor(packages.length / 2) * 2).map((pkg) => (
                    <PricingCard
                      key={pkg.id}
                      packageInfo={pkg}
                      isFeatured={pkg.id === mostPopularId}
                      subscriberCount={counts[pkg.id] || 0}
                    />
                  ))}
                </div>
                {packages.length % 2 === 1 && (
                  <div className="flex justify-center mt-8">
                    <PricingCard
                      packageInfo={packages[packages.length - 1]}
                      isFeatured={packages[packages.length - 1].id === mostPopularId}
                      subscriberCount={counts[packages[packages.length - 1].id] || 0}
                    />
                  </div>
                )}
              </div>
              
              <div className="hidden lg:grid lg:grid-cols-3 gap-8 place-items-center">
                {packages.map((pkg) => (
                  <PricingCard
                    key={pkg.id}
                    packageInfo={pkg}
                    isFeatured={pkg.id === mostPopularId}
                    subscriberCount={counts[pkg.id] || 0}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
        
        <FaqSection />
      </main>
    </div>
  );
}