"use client";

import { useEffect, useState } from "react";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Loader2,
  Clock,
  CheckCircle2,
  XCircle,
  CreditCard,
  Files,
  ArrowRight,
  Package,
  Tag,
  Calendar,
} from "lucide-react";

type PackageType = {
  id: string;
  name: string;
  price: number;
};

type EventType = {
  id: string;
  title: string;
  status: string;
};

type Submission = {
  id: string;
  package_id: string;
  event_id: string;
  payment_status: string;
  created_at: string;
  packages: Pick<PackageType, "name" | "price"> | null;
  events: Pick<EventType, "title" | "status"> | null;
};

const StatusBadge = ({
  status,
  type,
}: {
  status: string;
  type: "payment" | "event";
}) => {
  const getPaymentBadge = (status: string) => {
    switch (status) {
      case "Paid":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300">
            <CheckCircle2 size={14} />
            Lunas
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
            <Clock size={14} />
            Verifikasi
          </span>
        );
      case "Canceled":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300">
            <XCircle size={14} />
            Batal
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-slate-100 text-slate-800 dark:bg-slate-700 dark:text-slate-300">
            <Clock size={14} />
            {status}
          </span>
        );
    }
  };

  const getEventBadge = (status: string) => {
    switch (status) {
      case "Success":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-green-200 text-green-800 dark:bg-green-900/50 dark:text-green-300">
            <CheckCircle2 size={14} />
            Disetujui
          </span>
        );
      case "Pending":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300">
            <Clock size={14} />
            Direview
          </span>
        );
      case "Waiting":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-700 dark:text-yellow-300">
            <CreditCard size={14} />
            Tunggu Bayar
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800 dark:bg-red-700 dark:text-red-300">
            <Clock size={14} />
            {status}
          </span>
        );
    }
  };

  return type === "payment" ? getPaymentBadge(status) : getEventBadge(status);
};

const SubmissionCard = ({ submission }: { submission: Submission }) => {
  const event = submission.events;
  const pkg = submission.packages;
  const eventStatus =
    submission.payment_status === "Unpaid" && (pkg?.price || 0) > 0
      ? "Waiting"
      : event?.status || "Pending";

  const shouldShowSingleStatus =
    submission.payment_status === "Unpaid" ||
    submission.payment_status === "Canceled" ||
    (submission.payment_status === "Paid" && eventStatus === "Pending");

  return (
    <div className="border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="p-6">
        <h2 className="font-bold text-xl mb-2 text-slate-900 dark:text-white">
          {event?.title || "Informasi Event Tidak Tersedia"}
        </h2>
        <div className="flex items-center gap-x-4 gap-y-1 flex-wrap text-sm text-slate-500 dark:text-slate-400">
          <div className="inline-flex items-center gap-1.5">
            <Package size={14} />
            <span className="font-medium">{pkg?.name || "N/A"}</span>
          </div>
          <span className="hidden sm:inline">·</span>
          <div className="inline-flex items-center gap-1.5">
            <Tag size={14} />
            <span className="font-medium">
              {pkg?.price
                ? `Rp ${pkg.price.toLocaleString("id-ID")}`
                : "Gratis"}
            </span>
          </div>
          <span className="hidden sm:inline">·</span>
          <div className="inline-flex items-center gap-1.5">
            <Calendar size={14} />
            <span className="font-medium">
              {new Date(submission.created_at).toLocaleDateString("id-ID")}
            </span>
          </div>
        </div>
      </div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-6 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 rounded-b-2xl">
        <div className="flex items-center gap-2 flex-wrap">
          {shouldShowSingleStatus ? (
            submission.payment_status === "Canceled" ? (
              <StatusBadge status="Canceled" type="payment" />
            ) : submission.payment_status === "Unpaid" ? (
              <StatusBadge status="Waiting" type="event" />
            ) : (
              <StatusBadge status={eventStatus} type="event" />
            )
          ) : (
            <>
              <StatusBadge status={submission.payment_status} type="payment" />
              <StatusBadge status={eventStatus} type="event" />
            </>
          )}
        </div>
        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            href={`/partnerships/my-submissions/${submission.id}`}
            className="flex-1 sm:flex-none text-center inline-flex items-center justify-center rounded-lg text-xs font-semibold h-9 px-4 py-2 bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 transition-all duration-300"
          >
            Lihat Detail
          </Link>
          {submission.payment_status === "Unpaid" && (pkg?.price || 0) > 0 && (
            <Link
              href={`/partnerships/payment/${submission.id}`}
              className="flex-1 sm:flex-none text-center inline-flex items-center justify-center rounded-lg text-xs font-semibold h-9 px-4 py-2 bg-green-600 text-white shadow-sm hover:bg-green-700 transition-all duration-300"
            >
              Bayar <ArrowRight size={14} className="ml-1.5" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
};

export default function MySubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const supabase = createClientComponentClient<any>();

  useEffect(() => {
    const getSubmissionsData = async () => {
      setLoading(true);
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (!user) {
          router.push("/login");
          return;
        }
        const { data: partnerships, error: pError } = await supabase
          .from("partnerships")
          .select("*")
          .eq("user_id", user.id);
        if (pError) throw pError;
        if (!partnerships || partnerships.length === 0) {
          setSubmissions([]);
          setLoading(false);
          return;
        }
        const packageIds = [
          ...new Set(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            partnerships.map((p: any) => p.package_id).filter(Boolean) as string[]
          ),
        ];
        const eventIds = [
          ...new Set(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            partnerships.map((p: any) => p.event_id).filter(Boolean) as string[]
          ),
        ];
        const { data: packagesData, error: packagesError } = await supabase
          .from("packages")
          .select("id, name, price")
          .in("id", packageIds);
        const { data: eventsData, error: eventsError } = await supabase
          .from("events")
          .select("id, title, status")
          .in("id", eventIds);
        if (packagesError) throw packagesError;
        if (eventsError) throw eventsError;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const combinedData = partnerships.map((p: any) => {
          const relatedPackage =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            packagesData?.find((pkg: any) => pkg.id === p.package_id) || null;
          const relatedEvent =
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            eventsData?.find((evt: any) => evt.id === p.event_id) || null;
          return { ...p, packages: relatedPackage, events: relatedEvent };
        });
        setSubmissions(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          combinedData.sort((a: any, b: any) =>
            new Date(b.created_at).getTime() -
            new Date(a.created_at).getTime()
          )
        );
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setSubmissions([]);
      } finally {
        setLoading(false);
      }
    };
    getSubmissionsData();
  }, [supabase, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin text-blue-600 mx-auto mb-4 h-12 w-12" />
          <p className="text-slate-600 dark:text-slate-400">
            Memuat pengajuan Anda...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-28">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
              Pengajuan Partnership Saya
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              Lacak status semua pengajuan partnership Anda di sini.
            </p>
          </div>
          <Link
            href="/partnerships"
            className="inline-flex items-center justify-center rounded-lg text-sm font-semibold h-11 px-6 py-3 bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50 active:scale-[0.98]"
          >
            Buat Partnership Baru
          </Link>
        </div>
        <div className="space-y-6">
          {submissions.length > 0 ? (
            submissions.map((sub) => (
              <SubmissionCard key={sub.id} submission={sub} />
            ))
          ) : (
            <div className="text-center py-20 px-6 bg-white dark:bg-slate-900 border-2 border-dashed border-slate-300 dark:border-slate-800 rounded-2xl">
              <Files className="mx-auto h-16 w-16 text-slate-400 dark:text-slate-600 mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100 mb-2">
                Belum Ada Pengajuan
              </h3>
              <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto mb-6">
                Semua pengajuan partnership yang Anda buat akan muncul di sini.
              </p>
              <Link
                href="/partnerships"
                className="inline-flex items-center justify-center rounded-lg text-sm font-semibold h-11 px-6 py-3 bg-blue-600 text-white shadow-sm hover:bg-blue-700 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-400 disabled:opacity-50 active:scale-[0.98]"
              >
                Lihat Paket Partnership
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}