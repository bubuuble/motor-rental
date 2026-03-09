'use client';

import { Bike, Key, Wrench, ClipboardList, Loader2, TrendingUp } from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';

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

interface YearlyRentalSummary {
  year: string;
  rentalCount: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingOrders: 0,
    availableMotors: 0,
    rentedMotors: 0,
    needService: 0,
  });
  const [yearlySummary, setYearlySummary] = useState<YearlyRentalSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

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

      // Yearly rental summary
      const { data: allBookings } = await supabase
        .from('bookings')
        .select('created_at')
        .order('created_at', { ascending: true });

      if (allBookings) {
        const yearMap = new Map<string, number>();
        allBookings.forEach(b => {
          const year = new Date(b.created_at).getFullYear().toString();
          yearMap.set(year, (yearMap.get(year) || 0) + 1);
        });
        const summary: YearlyRentalSummary[] = Array.from(yearMap.entries())
          .map(([year, rentalCount]) => ({ year, rentalCount }))
          .sort((a, b) => b.year.localeCompare(a.year));
        setYearlySummary(summary);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

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

      {/* Yearly Rental Summary Table */}
      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-blue-100 flex items-center gap-4">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
            <TrendingUp size={20} className="text-white" strokeWidth={2.5} />
          </div>
          <div>
            <h2 className="font-black text-slate-900 text-lg">Rekap Rental Per Tahun</h2>
            <p className="text-xs text-slate-400 font-semibold mt-0.5">Total jumlah penyewa setiap tahunnya</p>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-blue-50/60 border-b border-blue-100">
              <tr>
                <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Tahun</th>
                <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Total Rental</th>
                <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Visualisasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {yearlySummary.map((row, index) => {
                const max = Math.max(...yearlySummary.map(r => r.rentalCount), 1);
                const pct = Math.round((row.rentalCount / max) * 100);
                return (
                  <tr key={row.year} className="hover:bg-blue-50/40 transition-all" style={{ animationDelay: `${index * 60}ms` }}>
                    <td className="p-4 font-black text-slate-900 text-base">{row.year}</td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-2xl font-black text-blue-600">{row.rentalCount}</span>
                        <span className="text-xs text-slate-400 font-bold">penyewa</span>
                      </span>
                    </td>
                    <td className="p-4 w-64">
                      <div className="w-full bg-blue-100 rounded-full h-2.5">
                        <div
                          className="bg-blue-600 h-2.5 rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
              {yearlySummary.length === 0 && (
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