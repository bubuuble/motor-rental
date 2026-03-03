"use client";

import { useState, useEffect, useMemo } from "react";
import MotorCard, { Motor } from "@/components/MotorCard";
import BookingModal from "@/components/BookingModal";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import { ArrowLeft, Bike, Loader2 } from "lucide-react";

export default function MotorsPage() {
  const router = useRouter();
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
  const [motors, setMotors] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentedMotorIds, setRentedMotorIds] = useState<string[]>([]);
  const supabase = useMemo(() => createClient(), []);

  // Fetch motors from DB
  useEffect(() => {
    let isMounted = true;

    const fetchMotors = async () => {
      try {
        const { data } = await supabase
          .from("motors")
          .select("*")
          .order("name");

        if (!isMounted) return;

        if (data) {
          setMotors(data.map(m => ({
            id: m.id,
            name: m.name,
            description: m.description || '',
            dailyPrice: m.daily_price || 0,
            weeklyPrice: m.weekly_price || 0,
            monthlyPrice: m.monthly_price || 0,
            weekendPrice: m.weekend_price || 0,
            transmission: m.transmission || 'Matic',
            fuel: m.fuel || 'Bensin',
            rating: m.rating || 5.0,
            image: m.image_url || '/motors/default.jpg',
            year: m.year || '',
            cc: m.cc || '',
            brand: m.brand || '',
          })));
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch motors:", error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    void fetchMotors();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;

    const fetchRented = async () => {
      try {
        const { data } = await supabase
          .from("bookings")
          .select("motor_id")
          .in("status", ["Disetujui", "Motor Terkirim"]);

        if (!isMounted) return;
        if (data) setRentedMotorIds(data.map((d) => String(d.motor_id)));
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to fetch rented motors:", error);
      }
    };

    void fetchRented();

    return () => {
      isMounted = false;
    };
  }, [supabase]);

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
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Kembali ke Beranda"
            className="inline-flex items-center justify-center rounded-full border border-[#1a1a1a]/15 bg-white w-9 h-9 text-[#1a1a1a] shadow-sm hover:border-[#2563EB]/30 hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

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
        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : motors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {motors.map((motor, index) => (
              <div key={motor.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 60}ms` }}>
                <MotorCard
                  motor={motor}
                  isRented={rentedMotorIds.includes(String(motor.id))}
                  onDetail={() => setSelectedMotor(motor)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Bike className="w-16 h-16 text-[#1a1a1a]/20 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Tidak ada motor ditemukan</h3>
            <p className="text-[#1a1a1a]/60">Motor belum tersedia saat ini</p>
          </div>
        )}
      </div>

      {selectedMotor && (
        <BookingModal motor={selectedMotor} onClose={() => setSelectedMotor(null)} />
      )}
    </div>
  );}