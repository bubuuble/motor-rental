'use client';

import { useState, useEffect, useMemo } from 'react';
import MotorCard from '@/components/MotorCard';
import BookingModal from '@/components/BookingModal';
import { MOTORS_DATA, Motor } from '@/app/constants/motors';
import { createClient } from '@/utils/supabase/client';
import { Bike, Search, Filter, ChevronDown } from 'lucide-react';

export default function MotorsPage() {
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
  const [rentedMotorIds, setRentedMotorIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<string>('all');
  const [selectedSort, setSelectedSort] = useState<string>('price-asc');
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

  // Get unique brands
  const brands = useMemo(() => {
    const brandSet = new Set(MOTORS_DATA.map(motor => motor.brand));
    return ['all', ...Array.from(brandSet)];
  }, []);

  // Filter and sort motors
  const filteredMotors = useMemo(() => {
    let result = [...MOTORS_DATA];

    // Filter by search
    if (searchQuery) {
      result = result.filter(motor =>
        motor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        motor.description.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by brand
    if (selectedBrand !== 'all') {
      result = result.filter(motor => motor.brand === selectedBrand);
    }

    // Sort
    switch (selectedSort) {
      case 'price-asc':
        result.sort((a, b) => a.dailyPrice - b.dailyPrice);
        break;
      case 'price-desc':
        result.sort((a, b) => b.dailyPrice - a.dailyPrice);
        break;
      case 'name-asc':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'year-desc':
        result.sort((a, b) => parseInt(b.year) - parseInt(a.year));
        break;
      default:
        break;
    }

    return result;
  }, [searchQuery, selectedBrand, selectedSort]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#FAF9F6] to-white">
      {/* Header Section */}
      <section className="relative pt-12 pb-8 overflow-hidden">
        {/* Background Decoration */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-7xl">
          <div className="absolute top-10 right-20 w-72 h-72 bg-gradient-to-br from-[#FF6B35]/10 to-transparent rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-20 w-96 h-96 bg-gradient-to-tl from-[#00D9FF]/10 to-transparent rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          {/* Breadcrumb */}
          <div className="flex items-center gap-2 text-sm text-[#1a1a1a]/50 mb-6">
            <span>Beranda</span>
            <span>/</span>
            <span className="text-[#FF6B35] font-bold">Daftar Motor</span>
          </div>

          {/* Title */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#00D9FF]/10 border border-[#FF6B35]/20 px-4 py-2 rounded-full mb-6">
              <Bike className="w-4 h-4 text-[#FF6B35]" />
              <span className="text-xs font-bold tracking-wider uppercase text-[#1a1a1a]">Katalog Lengkap</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a1a] tracking-tight mb-4">
              Pilihan <span className="bg-gradient-to-r from-[#FF6B35] to-[#FF8F5F] bg-clip-text text-transparent">Motor</span> Terbaik
            </h1>
            <p className="text-lg text-[#1a1a1a]/60 font-medium max-w-2xl mx-auto">
              Temukan motor yang sesuai dengan kebutuhan Anda. Semua unit terawat dengan performa prima dan harga bersaing.
            </p>
          </div>

          {/* Filters */}
          <div className="bg-white rounded-3xl shadow-xl shadow-[#1a1a1a]/5 border border-[#1a1a1a]/5 p-6 mb-8">
            <div className="flex flex-col md:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#1a1a1a]/30" />
                <input
                  type="text"
                  placeholder="Cari motor..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-[#FAF9F6] border border-[#1a1a1a]/10 rounded-2xl text-sm font-medium text-[#1a1a1a] placeholder:text-[#1a1a1a]/40 focus:outline-none focus:border-[#FF6B35]/30 focus:ring-2 focus:ring-[#FF6B35]/10 transition-all"
                />
              </div>

              {/* Brand Filter */}
              <div className="relative md:w-48">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/30" />
                <select
                  value={selectedBrand}
                  onChange={(e) => setSelectedBrand(e.target.value)}
                  className="w-full pl-11 pr-10 py-3.5 bg-[#FAF9F6] border border-[#1a1a1a]/10 rounded-2xl text-sm font-medium text-[#1a1a1a] appearance-none focus:outline-none focus:border-[#FF6B35]/30 focus:ring-2 focus:ring-[#FF6B35]/10 transition-all cursor-pointer"
                >
                  <option value="all">Semua Merek</option>
                  {brands.filter(b => b !== 'all').map(brand => (
                    <option key={brand} value={brand}>{brand}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/40 pointer-events-none" />
              </div>

              {/* Sort */}
              <div className="relative md:w-48">
                <select
                  value={selectedSort}
                  onChange={(e) => setSelectedSort(e.target.value)}
                  className="w-full pl-4 pr-10 py-3.5 bg-[#FAF9F6] border border-[#1a1a1a]/10 rounded-2xl text-sm font-medium text-[#1a1a1a] appearance-none focus:outline-none focus:border-[#FF6B35]/30 focus:ring-2 focus:ring-[#FF6B35]/10 transition-all cursor-pointer"
                >
                  <option value="price-asc">Harga: Rendah - Tinggi</option>
                  <option value="price-desc">Harga: Tinggi - Rendah</option>
                  <option value="name-asc">Nama: A - Z</option>
                  <option value="year-desc">Tahun: Terbaru</option>
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#1a1a1a]/40 pointer-events-none" />
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 pt-4 border-t border-[#1a1a1a]/5">
              <p className="text-sm text-[#1a1a1a]/50 font-medium">
                Menampilkan <span className="text-[#FF6B35] font-bold">{filteredMotors.length}</span> motor
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Motors Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-24">
        {filteredMotors.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMotors.map((motor, index) => (
              <div
                key={motor.id}
                className="animate-in fade-in slide-in-from-bottom-4 duration-700"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <MotorCard
                  motor={motor}
                  isRented={rentedMotorIds.includes(motor.id)}
                  onDetail={() => setSelectedMotor(motor)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-[#FAF9F6] rounded-full mb-6">
              <Search className="w-8 h-8 text-[#1a1a1a]/30" />
            </div>
            <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">Tidak ada motor ditemukan</h3>
            <p className="text-[#1a1a1a]/50">Coba ubah kata kunci pencarian atau filter Anda</p>
          </div>
        )}
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
