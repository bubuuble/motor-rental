"use client";

import { useState, useEffect, useMemo } from "react";
import MotorCard from "@/components/MotorCard";
import BookingModal from "@/components/BookingModal";
import { MOTORS_DATA, Motor } from "@/app/constants/motors";
import { createClient } from "@/utils/supabase/client";
import { Bike, Filter, ChevronDown } from "lucide-react";

export default function MotorsPage() {
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
  const [rentedMotorIds, setRentedMotorIds] = useState<string[]>([]);
  const [selectedBrand, setSelectedBrand] = useState("all");
  const [selectedSort, setSelectedSort] = useState("price-asc");

  const supabase = useMemo(() => createClient(), []);

  useEffect(() => {
    const fetchRented = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("motor_id")
        .in("status", ["Disetujui", "Motor Terkirim"]);

      if (data) {
        setRentedMotorIds(data.map((d) => String(d.motor_id)));
      }
    };

    void fetchRented();
  }, [supabase]);

  // Get unique brands
  const brands = useMemo(() => {
    const brandSet = new Set(MOTORS_DATA.map((motor) => motor.brand));
    return ["all", ...Array.from(brandSet)];
  }, []);

  // Filter and sort motors
  const filteredMotors = useMemo(() => {
    let result = [...MOTORS_DATA];

    // Filter by brand
    if (selectedBrand !== "all") {
      result = result.filter((motor) => motor.brand === selectedBrand);
    }

    // Sort
    switch (selectedSort) {
      case "price-asc":
        result.sort((a, b) => a.dailyPrice - b.dailyPrice);
        break;
      case "price-desc":
        result.sort((a, b) => b.dailyPrice - a.dailyPrice);
        break;
      case "name-asc":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "year-desc":
        result.sort((a, b) => parseInt(b.year) - parseInt(a.year));
        break;
      default:
        break;
    }

    return result;
  }, [selectedBrand, selectedSort]);

  return (
    <div className="min-h-screen bg-[#FAF9F6]">
      {/* Header Section */}
      <div className="relative bg-gradient-to-br from-[#2563EB] via-[#1d4ed8] to-[#1e40af] text-white overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          {/* Breadcrumb */}
          <div className="text-sm text-white/80 mb-6 font-medium">
            Beranda / Daftar Motor
          </div>

          {/* Title */}
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-black mb-4 leading-tight">
              Katalog Lengkap
            </h1>
            <p className="text-2xl md:text-3xl font-bold mb-6">
              Pilihan{" "}
              <span className="text-yellow-300">Motor</span>{" "}
              Terbaik
            </p>
            <p className="text-lg text-white/90 leading-relaxed">
              Temukan motor yang sesuai dengan kebutuhan Anda. Semua unit
              terawat dengan performa prima dan harga bersaing.
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 mb-12">
        <div className="bg-white rounded-3xl shadow-xl shadow-black/5 p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Brand Filter */}
            <div className="relative">
              <Filter
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40"
                size={20}
              />
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="w-full pl-11 pr-10 py-3.5 bg-[#FAF9F6] border border-[#1a1a1a]/10 rounded-2xl text-sm font-medium text-[#1a1a1a] appearance-none focus:outline-none focus:border-[#2563EB]/30 focus:ring-2 focus:ring-[#2563EB]/10 transition-all cursor-pointer"
              >
                <option value="all">Semua Merek</option>
                {brands
                  .filter((b) => b !== "all")
                  .map((brand) => (
                    <option key={brand} value={brand}>
                      {brand}
                    </option>
                  ))}
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40 pointer-events-none"
                size={20}
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={selectedSort}
                onChange={(e) => setSelectedSort(e.target.value)}
                className="w-full pl-4 pr-10 py-3.5 bg-[#FAF9F6] border border-[#1a1a1a]/10 rounded-2xl text-sm font-medium text-[#1a1a1a] appearance-none focus:outline-none focus:border-[#2563EB]/30 focus:ring-2 focus:ring-[#2563EB]/10 transition-all cursor-pointer"
              >
                <option value="price-asc">Harga: Rendah - Tinggi</option>
                <option value="price-desc">Harga: Tinggi - Rendah</option>
                <option value="name-asc">Nama: A - Z</option>
                <option value="year-desc">Tahun: Terbaru</option>
              </select>
              <ChevronDown
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40 pointer-events-none"
                size={20}
              />
            </div>
          </div>

          {/* Results Count */}
          <div className="mt-4 pt-4 border-t border-[#1a1a1a]/5">
            <p className="text-sm text-[#1a1a1a]/60 font-medium">
              Menampilkan{" "}
              <span className="text-[#2563EB] font-bold">
                {filteredMotors.length}
              </span>{" "}
              motor
            </p>
          </div>
        </div>
      </div>

      {/* Motors Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        {filteredMotors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredMotors.map((motor, index) => (
              <div
                key={motor.id}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
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
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">
              Tidak ada motor ditemukan
            </h3>
            <p className="text-[#1a1a1a]/60">Coba ubah filter Anda</p>
          </div>
        )}
      </div>

      {selectedMotor && (
        <BookingModal
          motor={selectedMotor}
          onClose={() => setSelectedMotor(null)}
        />
      )}
    </div>
  );
}