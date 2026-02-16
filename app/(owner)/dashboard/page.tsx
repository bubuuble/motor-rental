'use client';

import { Bike, Key, Wrench, Eye, Check, X, ClipboardList, Loader2 } from 'lucide-react';
import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { MOTORS_DATA } from '@/app/constants/motors';

// 1. Definisikan Interface untuk Props dan Data
interface StatCardProps {
  icon: React.ReactNode;
  value: string;
  label: string;
}

interface OrderSummary {
  id: string;
  motor_name: string;
  start_date: string;
  status: string;
  profiles: {
    full_name: string;
  } | null;
}

interface DashboardStats {
  pendingOrders: number;
  availableMotors: number;
  rentedMotors: number;
  needService: number;
}

export default function DashboardOverview() {
  const [stats, setStats] = useState<DashboardStats>({
    pendingOrders: 0,
    availableMotors: 0,
    rentedMotors: 0,
    needService: 0,
  });
  const [recentOrders, setRecentOrders] = useState<OrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch Pesanan Terbaru
      const { data: orders } = await supabase
        .from('bookings')
        .select('id, motor_name, start_date, status, profiles(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      // Fetch Count untuk Stats - Menunggu Konfirmasi
      const { count: pendingCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Menunggu Konfirmasi');

      // Fetch count of currently rented motors (Disetujui status)
      const { count: rentedCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Disetujui');

      // Fetch count of motors in maintenance/service
      const { count: serviceCount } = await supabase
        .from('bookings')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Dalam Perbaikan');

      // Calculate available motors
      const totalMotors = MOTORS_DATA.length;
      const availableCount = totalMotors - (rentedCount || 0);

      if (orders) setRecentOrders(orders as unknown as OrderSummary[]);
      
      // Update stats with real data
      setStats({
        pendingOrders: pendingCount || 0,
        availableMotors: availableCount > 0 ? availableCount : 0,
        rentedMotors: rentedCount || 0,
        needService: serviceCount || 0,
      });
      
      console.log('Dashboard Stats:', {
        pending: pendingCount,
        available: availableCount,
        rented: rentedCount,
        service: serviceCount,
      });
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      await fetchDashboardData();
    };
    load();
  }, [fetchDashboardData]);

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-[#FF6B35]/20 to-[#00D9FF]/20 rounded-full blur-3xl"></div>
        <h1 className="text-4xl font-black text-[#1a1a1a] tracking-tight">Dashboard Pemilik</h1>
        <p className="text-xs text-[#1a1a1a]/40 font-bold uppercase tracking-widest mt-2">Home &gt; Dashboard</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<ClipboardList size={24} strokeWidth={2.5} />} value={stats.pendingOrders.toString()} label="Pesanan Masuk" color="coral" delay={0} />
        <StatCard icon={<Bike size={24} strokeWidth={2.5} />} value={stats.availableMotors.toString()} label="Motor Tersedia" color="green" delay={100} />
        <StatCard icon={<Key size={24} strokeWidth={2.5} />} value={stats.rentedMotors.toString()} label="Motor Disewa" color="purple" delay={200} />
        <StatCard icon={<Wrench size={24} strokeWidth={2.5} />} value={stats.needService.toString()} label="Motor Perlu Servis" color="red" delay={300} />
      </div>

      {/* Recent Orders Table */}
      <div className="bg-white/80 backdrop-blur-sm border-2 border-[#1a1a1a] rounded-3xl shadow-xl overflow-hidden">
        <div className="p-6 border-b-2 border-[#1a1a1a]/10 bg-gradient-to-r from-[#FF6B35]/5 to-[#00D9FF]/5">
          <h2 className="font-black text-[#1a1a1a] text-xl">Pesanan Masuk Terbaru</h2>
          <p className="text-xs text-[#1a1a1a]/50 font-bold mt-1">Kelola pesanan rental terbaru Anda</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-[#FAF9F6] border-b-2 border-[#1a1a1a]/10">
              <tr>
                <th className="p-4 text-[10px] font-black text-[#1a1a1a]/60 uppercase tracking-widest">Nama Penyewa</th>
                <th className="p-4 text-[10px] font-black text-[#1a1a1a]/60 uppercase tracking-widest">Motor</th>
                <th className="p-4 text-[10px] font-black text-[#1a1a1a]/60 uppercase tracking-widest">Tanggal Sewa</th>
                <th className="p-4 text-[10px] font-black text-[#1a1a1a]/60 uppercase tracking-widest">Status</th>
                <th className="p-4 text-[10px] font-black text-[#1a1a1a]/60 uppercase tracking-widest">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1a1a]/5">
              {recentOrders.map((order, index) => (
                <tr key={order.id} className="hover:bg-[#FF6B35]/5 transition-all" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="p-4 font-bold text-[#1a1a1a]">{order.profiles?.full_name || 'Guest'}</td>
                  <td className="p-4 text-[#1a1a1a]/70 font-medium">{order.motor_name}</td>
                  <td className="p-4 text-[#1a1a1a]/50 font-mono text-xs">{order.start_date}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1.5 rounded-xl text-[9px] font-black uppercase border-2 ${
                      order.status === 'Disetujui' 
                        ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200' 
                        : 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30'
                    }`}>
                      {order.status}
                    </span>
                  </td>
                  <td className="p-4 flex gap-2">
                    <button className="p-2.5 border-2 border-[#1a1a1a]/10 rounded-xl hover:bg-[#00D9FF]/10 hover:border-[#00D9FF] text-[#00D9FF] transition-all">
                      <Eye size={16} strokeWidth={2.5} />
                    </button>
                    {order.status === "Menunggu Konfirmasi" && (
                      <>
                        <button className="p-2.5 border-2 border-[#1a1a1a]/10 rounded-xl hover:bg-green-50 hover:border-green-500 text-green-600 transition-all">
                          <Check size={16} strokeWidth={2.5} />
                        </button>
                        <button className="p-2.5 border-2 border-[#1a1a1a]/10 rounded-xl hover:bg-red-50 hover:border-red-500 text-red-600 transition-all">
                          <X size={16} strokeWidth={2.5} />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// 2. Gunakan Interface pada Komponen Statis
function StatCard({ icon, value, label, color, delay }: StatCardProps & { color: string; delay: number }) {
  const colorClasses = {
    coral: 'from-[#FF6B35] to-[#FF8F5F]',
    green: 'from-green-500 to-green-600',
    purple: 'from-purple-500 to-purple-600',
    red: 'from-red-500 to-red-600',
  }[color];

  return (
    <div 
      className={`bg-white/80 backdrop-blur-sm border-2 border-[#1a1a1a] p-6 rounded-2xl flex gap-4 items-center shadow-lg hover:shadow-xl hover:scale-105 transition-all relative overflow-hidden animate-in fade-in slide-in-from-bottom-4`}
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Diagonal Accent */}
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${colorClasses} opacity-10 -rotate-12 translate-x-8 -translate-y-8`}></div>
      
      <div className={`w-16 h-16 bg-gradient-to-br ${colorClasses} rounded-2xl flex items-center justify-center text-white relative z-10`}>
        {icon}
      </div>
      <div className="relative z-10">
        <div className="text-3xl font-black text-[#1a1a1a] leading-none mb-2">{value}</div>
        <div className="text-[10px] text-[#1a1a1a]/60 uppercase font-black tracking-widest">{label}</div>
      </div>
    </div>
  );
}