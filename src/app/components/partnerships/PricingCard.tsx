import { CheckCircle2, Sparkles, Users } from 'lucide-react';
import Link from 'next/link';
import clsx from 'clsx';

interface PackageInfo {
  id: string | number;
  name: string;
  description: string;
  price: number;
  features?: string[];
}

interface PricingCardProps {
  packageInfo: PackageInfo;
  isFeatured?: boolean;
  subscriberCount?: number;
}

export function PricingCard({ 
  packageInfo, 
  isFeatured = false, 
  subscriberCount = 0 
}: PricingCardProps) {
  
  const formatTitle = (title: string) => {
    const words = title.split(' ');
    if (words.length >= 2 && words.length <= 4) {
      const firstLine = words.slice(0, -1).join(' ');
      const lastWord = words[words.length - 1];
      return `${firstLine}<br />${lastWord}`;
    }
    return `${title}<br />&nbsp;`;
  };

  const formatDescription = (description: string) => {
    return description
      .replace(/\\n/g, '<br />')
      .replace(/\n/g, '<br />') 
      .trim();
  };

  return (
    <div className={clsx(
      "h-full w-full max-w-sm relative pricing-card-container",
      isFeatured && "order-first lg:order-none" 
    )}>
      
      {isFeatured && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-sky-500 rounded-full shadow-lg">
            <Sparkles className="w-4 h-4" />
            PALING POPULER
          </div>
        </div>
      )}

      <div 
        className={clsx(
          "h-full min-h-[500px] rounded-xl transition-all duration-300 overflow-hidden flex flex-col pricing-card-content",
          isFeatured 
            ? 'bg-white dark:bg-slate-900 border-2 border-blue-500 shadow-2xl shadow-blue-500/20 hover:scale-[1.03] hover:shadow-blue-500/30' 
            : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-lg hover:shadow-xl hover:-translate-y-1'
        )}
      >
        {<div className="h-1.5 w-full bg-blue-600 flex-shrink-0" />}
        
        <div className="p-8 flex flex-col flex-grow h-full">
          
          <div className="flex-shrink-0">
            <h3 
              className={clsx(
                "text-2xl font-bold pt-4 leading-tight",
                isFeatured ? 'text-slate-900 dark:text-white' : 'text-slate-800 dark:text-slate-100'
              )}
              dangerouslySetInnerHTML={{ 
                __html: formatTitle(packageInfo.name) 
              }}
            />
          </div>
          
          <div className="flex-shrink-0 mt-3">
            <div 
              className={clsx(
                "leading-relaxed text-left prose prose-sm max-w-none",
                isFeatured ? 'text-slate-600 dark:text-slate-400' : 'text-slate-500 dark:text-slate-400'
              )}
              dangerouslySetInnerHTML={{ 
                __html: formatDescription(packageInfo.description) 
              }}
              style={{ 
                listStyle: 'none', 
                padding: 0,
                margin: 0 
              }}
            />
          </div>

          <div className="flex-shrink-0 mt-4">
            {subscriberCount > 0 && !isFeatured && (
              <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-medium rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                <Users className="w-3.5 h-3.5" />
                {subscriberCount} Pendaftar
              </div>
            )}
          </div>
          
          <div className="flex items-baseline gap-2 my-2 flex-shrink-0">
            <p className={clsx(
              "text-4xl font-extrabold",
              isFeatured ? 'text-slate-900 dark:text-white' : 'text-slate-900 dark:text-white'
            )}>
              {packageInfo.price === 0 ? 'Gratis' : `Rp ${packageInfo.price.toLocaleString('id-ID')}`}
            </p>
          </div>
          
          <div className="flex-grow flex flex-col justify-between">
            <ul className="space-y-4 list-none p-0 m-0">
              {packageInfo.features?.map((feature, index) => (
                <li key={index} className="flex items-start gap-3 list-none">
                  <CheckCircle2 className={clsx(
                    "w-5 h-5 flex-shrink-0 mt-0.5",
                    isFeatured ? "text-blue-500" : "text-blue-600"
                  )} />
                  <div 
                    className={clsx(
                      "leading-relaxed text-left",
                      isFeatured ? 'text-slate-600 dark:text-slate-300' : 'text-slate-600 dark:text-slate-300'
                    )}
                    dangerouslySetInnerHTML={{ 
                      __html: formatDescription(feature) 
                    }}
                    style={{ 
                      listStyle: 'none',
                      padding: 0,
                      margin: 0
                    }}
                  />
                </li>
              ))}
            </ul>
            <div className="mt-8">
              <Link 
                href={`/partnerships/submit/${packageInfo.id}`} 
                className={clsx(
                  "w-full text-center font-bold py-3 rounded-lg transition-all duration-300 block",
                  isFeatured 
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-xl hover:shadow-blue-500/30' 
                    : 'bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-300 dark:hover:bg-blue-900'
                )}
              >
                Pilih Paket
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}