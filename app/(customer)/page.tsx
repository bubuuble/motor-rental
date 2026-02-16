// app/(customer)/page.tsx
'use client';

import { useState, useEffect, useMemo } from 'react';
import Hero from '@/components/Hero';
import AlurSewa from '@/components/Process';
import MotorCard from '@/components/MotorCard';
import BookingModal from '@/components/BookingModal';
import { MOTORS_DATA, Motor } from '@/app/constants/motors';
import { createClient } from '@/utils/supabase/client';

export default function HomePage() {
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
  const [rentedMotorIds, setRentedMotorIds] = useState<string[]>([]);
  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchRented = async () => {
      const { data } = await supabase
        .from('bookings')
        .select('motor_id')
        .in('status', ['Disetujui', 'Motor Terkirim']);
      if (data) {
        setRentedMotorIds(data.map(d => d.motor_id));
      }
    };
    void fetchRented();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#FAF9F6] to-white">
      <Hero />
      <AlurSewa />

      <section id="motor" className="relative max-w-7xl mx-auto px-6 py-24 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-[#FF6B35]/5 to-transparent rounded-full blur-3xl -z-10"></div>
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tl from-[#00D9FF]/5 to-transparent rounded-full blur-3xl -z-10"></div>

        {/* Header */}
        <div className="mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#00D9FF]/10 border border-[#FF6B35]/20 px-4 py-2 rounded-full">
            <div className="w-1.5 h-1.5 rounded-full bg-[#FF6B35] animate-pulse"></div>
            <span className="text-xs font-bold tracking-wider uppercase text-[#1a1a1a]">Katalog Motor</span>
          </div>
          <h2 className="text-5xl md:text-6xl font-black text-[#1a1a1a] tracking-tight">
            Unit <span className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F5F] bg-clip-text text-transparent">Motor</span> Kami
          </h2>
          <p className="text-lg text-[#1a1a1a]/60 font-medium max-w-2xl">
            Pilih motor terbaik untuk perjalanan Anda. Semua unit terawat dan siap pakai.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {MOTORS_DATA.map((motor, index) => (
            <div 
              key={motor.id}
              className="animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <MotorCard 
                motor={motor}
                isRented={rentedMotorIds.includes(motor.id)}
                onDetail={() => setSelectedMotor(motor)} 
              />
            </div>
          ))}
        </div>
      </section>

      {selectedMotor && (
        <BookingModal 
          motor={selectedMotor} 
          onClose={() => setSelectedMotor(null)} 
        />
      )}
    </main>
  );
}