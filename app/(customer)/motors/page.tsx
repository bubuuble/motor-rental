"use client";

import { useState, useEffect, useMemo } from "react";
import MotorCard, { Motor } from "@/components/MotorCard";
import BookingModal from "@/components/BookingModal";
import { createClient } from "@/utils/supabase/client";
import { Bike, Filter, ChevronDown, Loader2 } from "lucide-react";

export default function MotorsPage() {
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
  const [motors, setMotors] = useState<Motor[]>([]);
  const [loading, setLoading] = useState(true);
  const [rentedMotorIds, setRentedMotorIds] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedSort, setSelectedSort] = useState("price-asc");
  const supabase = useMemo(() => createClient(), []);

  // Fetch motors from DB
  useEffect(() => {
    const fetchMotors = async () => {
      const { data } = await supabase
        .from("motors")
        .select("*")
        .order("name");
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
      setLoading(false);
    };
    void fetchMotors();
  }, [supabase]);

  useEffect(() => {
    const fetchRented = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("motor_id")
        .in("status", ["Disetujui", "Motor Terkirim"]);
      if (data) setRentedMotorIds(data.map((d) => String(d.motor_id)));
    };
    void fetchRented();
  }, [supabase]);

  const brands = useMemo(() => {
    const brandSet = new Set(motors.map((motor) => motor.brand).filter(Boolean));
    return ["all", ...Array.from(brandSet)];
  }, [motors]);

  const filteredMotors = useMemo(() => {
    let result = [...motors];
    if (selectedBrand !== "all") result = result.filter((m) => m.brand === selectedBrand);
    switch (selectedSort) {
      case "price-asc": result.sort((a, b) => a.dailyPrice - b.dailyPrice); break;
      case "price-desc": result.sort((a, b) => b.dailyPrice - a.dailyPrice); break;
      case "name-asc": result.sort((a, b) => a.name.localeCompare(b.name)); break;
      case "year-desc": result.sort((a, b) => parseInt(b.year || '0') - parseInt(a.year || '0')); break;
    }
    return result;
  }, [motors, selectedBrand, selectedSort]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header */}
      <div className="relative bg-gradient-to-br from-[#2563EB] via-[#1d4ed8] to-[#1e40af] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-sm text-white/80 mb-6 font-medium">Beranda / Daftar Motor</div>
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">Katalog Lengkap</h1>
            <p className="text-2xl md:text-3xl font-bold mb-6">Pilihan <span className="text-yellow-300">Motor</span> Terbaik</p>
            <p className="text-lg text-white/90 leading-relaxed">Temukan motor yang sesuai dengan kebutuhan Anda. Semua unit terawat dengan performa prima.</p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Filter className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40" size={20} />
              <select value={selectedBrand} onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 bg-[#FAF9F6] border border-[#1a1a1a]/10 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:border-[#2563EB]/30 focus:ring-2 focus:ring-[#2563EB]/10 transition-all cursor-pointer">
                <option value="all">Semua Merek</option>
                {brands.filter(b => b !== "all").map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40 pointer-events-none" size={20} />
            </div>
            <div className="relative">
              <select value={selectedSort} onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full pl-4 pr-10 py-3.5 bg-[#FAF9F6] border border-[#1a1a1a]/10 rounded-2xl text-sm font-medium appearance-none focus:outline-none focus:border-[#2563EB]/30 focus:ring-2 focus:ring-[#2563EB]/10 transition-all cursor-pointer">
                <option value="price-asc">Harga: Rendah - Tinggi</option>
                <option value="price-desc">Harga: Tinggi - Rendah</option>
                <option value="name-asc">Nama: A - Z</option>
                <option value="year-desc">Tahun: Terbaru</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40 pointer-events-none" size={20} />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-[#1a1a1a]/5">
            <p className="text-sm text-[#1a1a1a]/60 font-medium">
              Menampilkan <span className="text-[#2563EB] font-bold">{filteredMotors.length}</span> motor
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {loading ? (
          <div className="flex justify-center py-24"><Loader2 className="animate-spin text-blue-600" size={40} /></div>
        ) : filteredMotors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMotors.map((motor, index) => (
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
            <p className="text-[#1a1a1a]/60">Coba ubah filter Anda</p>
          </div>
        )}
      </div>

      {selectedMotor && (
        <BookingModal motor={selectedMotor} onClose={() => setSelectedMotor(null)} />
      )}
    </div>
  );
}