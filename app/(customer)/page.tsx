// app/(customer)/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Hero from "@/components/Hero";
import AlurSewa from "@/components/Process";
import MotorCard from "@/components/MotorCard";
import BookingModal from "@/components/BookingModal";
import ChatModal from "@/components/ChatModal";
import { createClient } from "@/utils/supabase/client";

export interface Motor {
  id: string;
  name: string;
  description: string;
  daily_price: number;
  weekly_price: number;
  monthly_price: number;
  weekend_price: number;
  transmission: string;
  fuel: string;
  rating: number;
  image_url: string | null;
  year: string;
  cc: string;
  brand: string;
  status: string;
}

export default function HomePage() {
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
  const [motors, setMotors] = useState<Motor[]>([]);
  const [rentedMotorIds, setRentedMotorIds] = useState<string[]>([]);
  const [showChat, setShowChat] = useState(false);
  const [loadingMotors, setLoadingMotors] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchMotors = async () => {
      const { data } = await supabase
        .from("motors")
        .select("*")
        .eq("status", "Tersedia")
        .order("name");
      if (data) setMotors(data as Motor[]);
      setLoadingMotors(false);
    };
    void fetchMotors();
  }, [supabase]);

  useEffect(() => {
    const fetchRented = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("motor_id")
        .in("status", ["Disetujui", "Motor Terkirim"]);
      if (data) setRentedMotorIds(data.map((d) => d.motor_id));
    };
    void fetchRented();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#FAF9F6] to-white">
      <Hero />
      <AlurSewa />

      <section id="motor" className="relative max-w-7xl mx-auto px-6 py-24 overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-[#2563EB]/5 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tl from-[#DC2626]/5 to-transparent rounded-full blur-3xl -z-10" />

        <div className="mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB]/10 to-[#DC2626]/10 border border-[#2563EB]/20 px-4 py-2 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] animate-pulse" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#1a1a1a]">Katalog Motor</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#1a1a1a] tracking-tight">
            Unit{" "}
            <span className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">Motor</span>{" "}
            Kami
          </h2>
          <p className="text-lg text-[#1a1a1a]/60 font-medium max-w-2xl">
            Pilih motor terbaik untuk perjalanan Anda. Semua unit terawat dan siap pakai.
          </p>
        </div>

        {loadingMotors ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {motors.map((motor, index) => (
              <div key={motor.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                <MotorCard
                  motor={{
                    id: motor.id,
                    name: motor.name,
                    description: motor.description,
                    dailyPrice: motor.daily_price,
                    weeklyPrice: motor.weekly_price,
                    monthlyPrice: motor.monthly_price,
                    weekendPrice: motor.weekend_price,
                    transmission: motor.transmission,
                    fuel: motor.fuel,
                    rating: motor.rating,
                    image: motor.image_url || '/motors/default.jpg',
                    year: motor.year,
                    cc: motor.cc,
                    brand: motor.brand,
                  }}
                  isRented={rentedMotorIds.includes(motor.id)}
                  onDetail={() => setSelectedMotor(motor)}
                />
              </div>
            ))}
          </div>
        )}
      </section>

      {selectedMotor && (
        <BookingModal
          motor={{
            id: selectedMotor.id,
            name: selectedMotor.name,
            description: selectedMotor.description,
            dailyPrice: selectedMotor.daily_price,
            weeklyPrice: selectedMotor.weekly_price,
            monthlyPrice: selectedMotor.monthly_price,
            weekendPrice: selectedMotor.weekend_price,
            transmission: selectedMotor.transmission,
            fuel: selectedMotor.fuel,
            rating: selectedMotor.rating,
            image: selectedMotor.image_url || '/motors/default.jpg',
            year: selectedMotor.year,
            cc: selectedMotor.cc,
            brand: selectedMotor.brand,
          }}
          onClose={() => setSelectedMotor(null)}
        />
      )}

      {/* Floating Chat Button */}
      <button
        onClick={() => setShowChat(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 text-white rounded-full shadow-xl hover:bg-blue-700 hover:shadow-2xl hover:shadow-blue-300 hover:scale-110 transition-all flex items-center justify-center"
        title="Chat dengan Owner"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>

      {showChat && <ChatModal onClose={() => setShowChat(false)} />}
    </main>
  );
}
