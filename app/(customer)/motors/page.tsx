import { createClient } from "@/utils/supabase/server";
import { ArrowLeft, Bike } from "lucide-react";
import Link from "next/link";
import MotorsContent from "./MotorsContent";
import type { Motor } from "@/components/MotorCard";
import type { UserProfile } from "@/components/BookingModal";

export const revalidate = 60; // revalidate cache every 60 seconds

export default async function MotorsPage() {
  const supabase = await createClient();

  // Fetch user profile + motors + rented status in parallel on the server
  const { data: { user } } = await supabase.auth.getUser();

  const [motorsRes, rentedRes, profileRes] = await Promise.all([
    supabase
      .from("motors")
      .select("id, name, description, daily_price, weekly_price, monthly_price, weekend_price, transmission, fuel, rating, image_url, year, cc, brand")
      .order("name"),
    supabase
      .from("bookings")
      .select("motor_id")
      .in("status", ["Disetujui", "Motor Terkirim"]),
    user
      ? supabase.from("profiles").select("*").eq("id", user.id).single()
      : Promise.resolve({ data: null, error: null }),
  ]);

  const motors: Motor[] = (motorsRes.data ?? []).map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description || "",
    dailyPrice: m.daily_price || 0,
    weeklyPrice: m.weekly_price || 0,
    monthlyPrice: m.monthly_price || 0,
    weekendPrice: m.weekend_price || 0,
    transmission: m.transmission || "Matic",
    fuel: m.fuel || "Bensin",
    rating: m.rating || 5.0,
    image: m.image_url || "/motors/default.jpg",
    year: m.year || "",
    cc: m.cc || "",
    brand: m.brand || "",
  }));

  const rentedMotorIds = (rentedRes.data ?? []).map((d) => String(d.motor_id));

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAF9F6] to-white">
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.02]">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle at 1px 1px, rgba(15, 23, 42, 0.14) 1px, transparent 0)",
              backgroundSize: "28px 28px",
            }}
          />
        </div>

        <div className="relative max-w-6xl mx-auto px-6 pt-10 pb-8">
          <Link
            href="/"
            aria-label="Kembali ke Beranda"
            className="inline-flex items-center justify-center rounded-full border border-[#1a1a1a]/15 bg-white w-9 h-9 text-[#1a1a1a] shadow-sm hover:border-[#2563EB]/30 hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          <div className="text-xs md:text-sm text-[#1a1a1a]/40 mb-8 font-medium text-left">
            Beranda <span className="mx-1">/</span>
            <span className="text-[#2563EB] font-bold">Daftar Motor</span>
          </div>

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB]/10 to-[#2563EB]/5 border border-[#2563EB]/20 px-4 py-2 rounded-full">
              <Bike className="w-3.5 h-3.5 text-[#2563EB]" />
              <span className="text-[10px] md:text-xs font-bold tracking-wider uppercase text-[#1a1a1a]">
                Katalog Lengkap
              </span>
            </div>

            <h1 className="mt-5 text-5xl md:text-6xl font-black text-[#1a1a1a] tracking-tight leading-tight">
              Pilihan{" "}
              <span className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
                Motor
              </span>{" "}
              Terbaik
            </h1>

            <p className="mt-4 text-sm md:text-base text-[#1a1a1a]/60 font-medium leading-relaxed">
              Temukan motor yang sesuai dengan kebutuhan Anda. Semua unit
              terawat dengan performa prima dan harga bersaing.
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-6xl mx-auto px-6 pb-16">
        <MotorsContent motors={motors} rentedMotorIds={rentedMotorIds} initialProfile={profileRes.data as UserProfile | null} />
      </div>
    </div>
  );
}