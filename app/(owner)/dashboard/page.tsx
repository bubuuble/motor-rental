'use client';

import { Bike, Key, Wrench, ClipboardList, Loader2, TrendingUp, X, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useSweetAlert } from '@/utils/useSweetAlert';

interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
  description: string;
  color: string;
  delay: number;
}

interface DashboardStats {
  pendingOrders: number;
  availableMotors: number;
  rentedMotors: number;
  needService: number;
}

interface RentalSummary {
  dateStr: string;
  displayDate: string;
  rentalCount: number;
}

interface DetailedBooking {
  id: string;
  motor_name: string | null;
  profiles: { full_name: string } | { full_name: string }[] | null;
  status: string;
  created_at: string;
  start_date: string;
  end_date: string;
}

type SortBy = 'harian' | 'bulan' | 'tahun';
type ActiveFilter = 'today' | '7days' | 'month' | 'year' | 'custom';

const getTodayIso = () => {
  const date = new Date();
  const tzOffset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
};

const getProfileName = (profiles: DetailedBooking['profiles']) => {
  if (!profiles) return null;
  if (Array.isArray(profiles)) return profiles[0]?.full_name ?? null;
  return profiles.full_name;
};

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingOrders: 0,
    availableMotors: 0,
    rentedMotors: 0,
    needService: 0,
  });
  const [rentalSummary, setRentalSummary] = useState<RentalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<SortBy>('harian');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [detailBookings, setDetailBookings] = useState<DetailedBooking[]>([]);
  const [detailLoading, setDetailLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filteredBookings, setFilteredBookings] = useState<DetailedBooking[]>([]);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<ActiveFilter>('today');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [customDate, setCustomDate] = useState<string>(() => getTodayIso());
  const supabase = useMemo(() => createClient(), []);
  const swal = useSweetAlert();

  const filterBookingsByDate = useCallback((bookings: DetailedBooking[], dateStr: string) => {
    const filtered = bookings.filter((booking) => {
      if (!booking.start_date) return false;

      const startDate = new Date(booking.start_date);
      const pad = (n: number) => n.toString().padStart(2, '0');
      let bookingDateStr: string;

      if (customDate || sortBy === 'harian') {
        bookingDateStr = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}-${pad(startDate.getDate())}`;
      } else if (sortBy === 'bulan') {
        bookingDateStr = `${startDate.getFullYear()}-${pad(startDate.getMonth() + 1)}`;
      } else {
        bookingDateStr = `${startDate.getFullYear()}`;
      }

      return bookingDateStr === dateStr;
    });

    return filtered;
  }, [customDate, sortBy]);

  const handleOpenModal = useCallback(async (dateStr: string) => {
    setSelectedDate(dateStr);
    setIsModalOpen(true);
    setDetailLoading(true);

    try {
      const { data } = await supabase
        .from('bookings')
        .select('id, motor_name, profiles(full_name), status, created_at, start_date, end_date')
        .eq('status', 'Selesai')
        .order('created_at', { ascending: false });

      const bookings = (data ?? []) as unknown as DetailedBooking[];
      const filtered = filterBookingsByDate(bookings, dateStr);
      setFilteredBookings(filtered);
    } catch (error) {
      console.error('Error opening penyewa modal:', error);
      setFilteredBookings([]);
    } finally {
      setDetailLoading(false);
    }
  }, [filterBookingsByDate, supabase]);

  const toIsoDate = (date: Date) => {
    const tzOffset = date.getTimezoneOffset() * 60000;
    return new Date(date.getTime() - tzOffset).toISOString().slice(0, 10);
  };

  const handleFilterClick = (filter: Exclude<ActiveFilter, 'custom'>) => {
    setActiveFilter(filter);
    setIsDatePickerOpen(false);

    if (filter === 'today') {
      const today = toIsoDate(new Date());
      setSortBy('harian');
      setCustomDate(today);
      setStartDate('');
      setEndDate('');
      return;
    }

    if (filter === '7days') {
      const today = new Date();
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(today.getDate() - 6);

      setSortBy('harian');
      setCustomDate('');
      setStartDate(toIsoDate(sevenDaysAgo));
      setEndDate(toIsoDate(today));
      return;
    }

    if (filter === 'month') {
      setSortBy('bulan');
      setCustomDate('');
      setStartDate('');
      setEndDate('');
      return;
    }

    setSortBy('tahun');
    setCustomDate('');
    setStartDate('');
    setEndDate('');
  };

  const handleApplyDateRange = () => {
    if (!startDate || !endDate) return;
    if (new Date(endDate) < new Date(startDate)) {
      swal.warning('Rentang Tanggal Tidak Valid', 'Tanggal akhir tidak boleh lebih kecil dari tanggal mulai.');
      return;
    }

    setActiveFilter('custom');
    setSortBy('harian');
    setCustomDate('');
    setIsDatePickerOpen(false);
  };

  const handleResetDateRange = () => {
    setStartDate('');
    setEndDate('');
    handleFilterClick('today');
  };

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Stats
      const { count: pendingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Menunggu Konfirmasi');

      const { count: rentedCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .in('status', ['Disetujui', 'Motor Terkirim']);

      const { count: serviceCount } = await supabase
        .from('motors')
        .select('*', { count: 'exact', head: true })
        .in('service_status', ['Perlu Servis', 'Dalam Perbaikan']);

      const { count: totalMotors } = await supabase
        .from('motors')
        .select('*', { count: 'exact', head: true });

      const availableCount = (totalMotors || 0) - (rentedCount || 0);

      setStats({
        pendingOrders: pendingCount || 0,
        availableMotors: availableCount > 0 ? availableCount : 0,
        rentedMotors: rentedCount || 0,
        needService: serviceCount || 0,
      });

      // Daily rental summary - hanya bookings dengan status Selesai
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('created_at')
        .eq('status', 'Selesai')
        .order('created_at', { ascending: false });

      if (allBookings) {
        const dateMap = new Map<string, { count: number; dateValue: Date }>();
        allBookings.forEach(b => {
          const d = new Date(b.created_at);
          const pad = (n: number) => n.toString().padStart(2, '0');
          let key: string;
          
          const hasDateRange = Boolean(startDate && endDate);

          if (hasDateRange) {
            const bookingDate = new Date(d.getFullYear(), d.getMonth(), d.getDate());
            const rangeStart = new Date(startDate);
            const rangeEnd = new Date(endDate);
            rangeStart.setHours(0, 0, 0, 0);
            rangeEnd.setHours(23, 59, 59, 999);

            if (bookingDate < rangeStart || bookingDate > rangeEnd) return;
            key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          } else if (customDate) {
            const [year, month, day] = customDate.split('-');
            const dateStr = `${year}-${month}-${day}`;
            const bookingDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
            if (bookingDateStr !== dateStr) return;
            key = dateStr;
          } else if (sortBy === 'harian') {
            key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          } else if (sortBy === 'bulan') {
            key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
          } else {
            key = `${d.getFullYear()}`;
          }
          
          if (!dateMap.has(key)) {
            dateMap.set(key, { count: 0, dateValue: d });
          }
          dateMap.get(key)!.count += 1;
        });

        const summary: RentalSummary[] = Array.from(dateMap.entries())
          .map(([dateStr, data]) => {
            let displayDate: string;
            
            const hasDateRange = Boolean(startDate && endDate);

            if (hasDateRange || customDate || sortBy === 'harian') {
              displayDate = data.dateValue.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
            } else if (sortBy === 'bulan') {
              displayDate = data.dateValue.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
            } else {
              displayDate = data.dateValue.getFullYear().toString();
            }
            
            return {
              dateStr,
              displayDate,
              rentalCount: data.count
            };
          })
          .sort((a, b) => b.dateStr.localeCompare(a.dateStr));
        
        setRentalSummary(summary);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase, sortBy, customDate, startDate, endDate]);

  const fetchDetailBookings = useCallback(async (dateStr: string) => {
    setDetailLoading(true);
    try {
      const { data } = await supabase
        .from('bookings')
        .select('id, motor_name, profiles(full_name), status, created_at, start_date, end_date')
        .in('status', ['Disetujui', 'Selesai'])
        .order('created_at', { ascending: false });

      if (data) {
        const filtered = data.filter(b => {
          const d = new Date(b.created_at);
          const pad = (n: number) => n.toString().padStart(2, '0');
          let bookingDateStr: string;
          
          if (customDate || sortBy === 'harian') {
            bookingDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
          } else if (sortBy === 'bulan') {
            bookingDateStr = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
          } else {
            bookingDateStr = `${d.getFullYear()}`;
          }
          
          return bookingDateStr === dateStr;
        });
        setDetailBookings(filtered as unknown as DetailedBooking[]);
      }
    } catch (error) {
      console.error('Error fetching detail bookings:', error);
    } finally {
      setDetailLoading(false);
    }
  }, [supabase, sortBy, customDate]);

  useEffect(() => {
    fetchDashboardData();

    // Subscribe to real-time changes on bookings table
    const bookingsChannel = supabase
      .channel('dashboard-bookings-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'bookings' },
        () => {
          // Trigger refetch when any booking changes
          fetchDashboardData();
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(bookingsChannel);
    };
  }, [fetchDashboardData, supabase]);

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  const getSortTitle = () => {
    if (activeFilter === 'today') {
      return 'Rekap Rental Harian';
    }
    if (startDate && endDate) {
      return `Rekap Rental ${new Date(startDate).toLocaleDateString('id-ID')} - ${new Date(endDate).toLocaleDateString('id-ID')}`;
    }
    if (customDate) {
      const date = new Date(customDate);
      return `Rekap Rental - ${date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }
    if (sortBy === 'harian') return 'Rekap Rental Harian';
    if (sortBy === 'bulan') return 'Rekap Rental Bulanan';
    return 'Rekap Rental Tahunan';
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-40 h-40 bg-blue-100 rounded-full blur-3xl opacity-60" />
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight relative z-10">Dashboard Pemilik</h1>
        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Home &gt; Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={<ClipboardList size={24} strokeWidth={2.5} />}
          value={stats.pendingOrders.toString()}
          label="Pesanan Masuk"
          description="Pesanan yang menunggu konfirmasi dari pelanggan"
          color="blue"
          delay={0}
        />
        <StatCard
          icon={<Bike size={24} strokeWidth={2.5} />}
          value={stats.availableMotors.toString()}
          label="Unit Motor Siap Di Sewa"
          description="Unit motor yang siap disewa saat ini"
          color="green"
          delay={100}
        />
        <StatCard
          icon={<Key size={24} strokeWidth={2.5} />}
          value={stats.rentedMotors.toString()}
          label="Motor Disewa"
          description="Unit motor yang sedang aktif disewa pelanggan"
          color="indigo"
          delay={200}
        />
        <StatCard
          icon={<Wrench size={24} strokeWidth={2.5} />}
          value={stats.needService.toString()}
          label="Motor Perlu Servis"
          description="Unit motor yang membutuhkan perhatian servis"
          color="amber"
          delay={300}
        />
      </div>

      {/* Rental Summary Table */}
      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-4 sm:p-6 border-b border-blue-100 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} className="text-white" strokeWidth={2.5} />
            </div>
            <div className="min-w-0">
              <h2 className="font-black text-slate-900 text-base sm:text-lg leading-tight break-words">{getSortTitle()}</h2>
              <p className="text-[11px] sm:text-xs text-slate-400 font-semibold mt-0.5">Total jumlah penyewa</p>
            </div>
          </div>
          
          <div className="relative w-full sm:w-auto flex flex-wrap items-center gap-1.5 sm:gap-2 sm:justify-end">
            <button
              type="button"
              onClick={() => setIsDatePickerOpen((prev) => !prev)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all cursor-pointer"
              aria-label="Buka filter tanggal"
            >
              <SlidersHorizontal size={16} className="sm:w-[18px] sm:h-[18px]" />
            </button>

            <button
              type="button"
              onClick={() => handleFilterClick('today')}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                activeFilter === 'today' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Hari Ini
            </button>

            <button
              type="button"
              onClick={() => handleFilterClick('7days')}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                activeFilter === '7days' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              7 Hari
            </button>

            <button
              type="button"
              onClick={() => handleFilterClick('month')}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                activeFilter === 'month' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Bulan
            </button>

            <button
              type="button"
              onClick={() => handleFilterClick('year')}
              className={`px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-lg text-[10px] sm:text-xs font-bold transition-all ${
                activeFilter === 'year' ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Tahun
            </button>

            {isDatePickerOpen && (
              <div className="absolute right-0 top-full mt-2 w-[min(18rem,calc(100vw-3rem))] sm:w-72 bg-white rounded-lg shadow-lg border border-slate-200 p-4 z-20">
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">Start Date</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-600 mb-1">End Date</label>
                    <input
                      type="date"
                      value={endDate}
                      min={startDate || undefined}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleApplyDateRange}
                      className="flex-1 px-3 py-2 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-all"
                    >
                      Terapkan
                    </button>
                    <button
                      type="button"
                      onClick={handleResetDateRange}
                      className="flex-1 px-3 py-2 rounded-lg bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200 transition-all"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-blue-50/60 border-b border-blue-100">
              <tr>
                <th className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest">Tanggal</th>
                <th className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest">Total Rental</th>
                <th className="p-3 sm:p-4 text-[9px] sm:text-[10px] font-black text-blue-600 uppercase tracking-widest">Data Sewa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rentalSummary.map((row, index) => (
                <tr key={row.dateStr} className="hover:bg-blue-50/40 transition-all" style={{ animationDelay: `${index * 60}ms` }}>
                  <td className="p-3 sm:p-4 font-black text-slate-900 text-xs sm:text-sm">{row.displayDate}</td>
                  <td className="p-3 sm:p-4">
                    <span className="inline-flex items-center gap-2">
                      <span className="text-xl sm:text-2xl font-black text-blue-600">{row.rentalCount}</span>
                      <span className="text-[10px] sm:text-xs text-slate-400 font-bold">penyewa</span>
                    </span>
                  </td>
                  <td className="p-3 sm:p-4">
                    <button
                      onClick={() => {
                        void handleOpenModal(row.dateStr);
                      }}
                      className="px-2.5 sm:px-3 py-1.5 bg-blue-600 text-white text-[10px] sm:text-xs font-bold rounded-lg hover:bg-blue-700 transition-all"
                    >
                      Lihat Penyewa
                    </button>
                  </td>
                </tr>
              ))}
              {rentalSummary.length === 0 && (
                <tr>
                  <td colSpan={3} className="p-8 text-center text-slate-400 font-bold">
                    Belum ada data rental.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[80vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-lg font-black text-slate-900">
                Detail Penyewaan - {selectedDate && rentalSummary.find(r => r.dateStr === selectedDate)?.displayDate}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-slate-100 rounded-lg transition-all"
              >
                <X size={20} className="text-slate-600" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(80vh-120px)]">
              {detailLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="animate-spin text-blue-600" size={32} />
                </div>
              ) : filteredBookings.length > 0 ? (
                <div className="space-y-3">
                  {filteredBookings.map((booking) => (
                    <div key={booking.id} className="p-4 border border-slate-200 rounded-xl hover:bg-blue-50/30 hover:border-blue-300 transition-all">
                      <p className="text-sm font-black text-slate-900 mb-2">
                        {getProfileName(booking.profiles) || 'Data Tidak Tersedia'}
                      </p>
                      <div className="text-xs space-y-1 text-slate-600">
                        <p>
                          <span className="font-bold">Motor:</span> {booking.motor_name || '-'}
                        </p>
                        <p>
                          <span className="font-bold">Periode:</span> {new Date(booking.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })} - {new Date(booking.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-slate-400 font-semibold py-8">Tidak ada data penyewaan pada tanggal ini.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({ icon, value, label, description, color, delay }: StatCardProps) {
  const colors = {
    blue:   { bg: 'bg-blue-600',   light: 'bg-blue-50',   text: 'text-blue-600',   border: 'border-blue-100' },
    green:  { bg: 'bg-green-600',  light: 'bg-green-50',  text: 'text-green-600',  border: 'border-green-100' },
    indigo: { bg: 'bg-indigo-600', light: 'bg-indigo-50', text: 'text-indigo-600', border: 'border-indigo-100' },
    amber:  { bg: 'bg-amber-500',  light: 'bg-amber-50',  text: 'text-amber-600',  border: 'border-amber-100' },
  }[color] ?? { bg: 'bg-blue-600', light: 'bg-blue-50', text: 'text-blue-600', border: 'border-blue-100' };

  return (
    <div
      className={`bg-white border ${colors.border} p-6 rounded-2xl shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all animate-in fade-in slide-in-from-bottom-4`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className={`w-12 h-12 ${colors.bg} rounded-xl flex items-center justify-center text-white mb-4`}>
        {icon}
      </div>
      <div className={`text-3xl font-black ${colors.text} leading-none mb-1`}>{value}</div>
      <div className="text-sm font-black text-slate-800 mb-1">{label}</div>
      <div className="text-xs text-slate-400 font-medium leading-relaxed">{description}</div>
    </div>
  );
}