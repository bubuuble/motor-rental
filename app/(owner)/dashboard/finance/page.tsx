'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { DollarSign, TrendingUp, FileText, Download, RefreshCw, Filter } from 'lucide-react';
import { subDays, isAfter, startOfDay } from 'date-fns';
import * as XLSX from 'xlsx';

interface Transaction {
  id: string;
  created_at: string;
  motor_name: string;
  total_price: number;
  payment_status: 'Lunas' | 'Belum Lunas';
  profiles: { full_name: string } | null;
}

type FilterRange = 'today' | '7days' | '30days' | 'all';

export default function FinancePage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterRange>('all');
  const supabase = useMemo(() => createClient(), []);

  const fetchFinance = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('bookings')
      .select('id, created_at, motor_name, total_price, payment_status, profiles(full_name)')
      .order('created_at', { ascending: false });
    
    if (data) setTransactions(data as unknown as Transaction[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      await fetchFinance();
    };
    load();
  }, [fetchFinance]);

  const togglePayment = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'Lunas' ? 'Belum Lunas' : 'Lunas';
    await supabase.from('bookings').update({ payment_status: nextStatus }).eq('id', id);
    void fetchFinance();
  };

  const filteredTransactions = useMemo(() => {
    const now = new Date();
    return transactions.filter(t => {
      const date = new Date(t.created_at);
      switch (filter) {
        case 'today': return isAfter(date, startOfDay(now));
        case '7days': return isAfter(date, subDays(now, 7));
        case '30days': return isAfter(date, subDays(now, 30));
        default: return true;
      }
    });
  }, [transactions, filter]);

  const totalPendapatan = useMemo(() => {
    return filteredTransactions
      .filter(t => t.payment_status === 'Lunas')
      .reduce((sum, t) => sum + t.total_price, 0);
  }, [filteredTransactions]);

  const pendapatanHarian = useMemo(() => {
    const today = new Date().toLocaleDateString();
    return filteredTransactions
      .filter(t => t.payment_status === 'Lunas' && new Date(t.created_at).toLocaleDateString() === today)
      .reduce((sum, t) => sum + t.total_price, 0);
  }, [filteredTransactions]);

  const totalLunas = useMemo(() => {
    return filteredTransactions.filter(t => t.payment_status === 'Lunas').length;
  }, [filteredTransactions]);

  const handleDownloadExcel = () => {
    const data = filteredTransactions.map(t => ({
      'Tanggal': new Date(t.created_at).toLocaleDateString('id-ID'),
      'Penyewa': t.profiles?.full_name || 'Guest',
      'Unit Motor': t.motor_name,
      'Total Harga': t.total_price,
      'Status Pembayaran': t.payment_status,
    }));

    const filterLabel = filter === 'today' ? 'Hari_Ini' : filter === '7days' ? '7_Hari' : filter === '30days' ? '30_Hari' : 'Semua';
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Laporan Keuangan');
    XLSX.writeFile(wb, `Laporan_Keuangan_${filterLabel}_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div className="relative">
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-[#2563EB]/20 to-[#EF4444]/20 rounded-full blur-3xl"></div>
          <h2 className="text-2xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight relative z-10">Pengelolaan Keuangan</h2>
          <p className="text-xs text-[#1a1a1a]/40 font-bold uppercase tracking-widest mt-2 relative z-10">Laporan revenue & transaksi</p>
        </div>
        <button 
          onClick={handleDownloadExcel}
          className="bg-red-600 text-white px-6 py-3 sm:px-8 sm:py-4 rounded-2xl font-black text-sm flex items-center gap-3 shadow-xl hover:shadow-2xl hover:scale-105 transition-all uppercase tracking-wide w-full sm:w-auto justify-center"
        >
          <Download size={20} strokeWidth={2.5} /> Unduh Excel
        </button>
      </div>

      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
          <Filter size={18} className="text-white" strokeWidth={2.5} />
        </div>
        {[
          { key: 'today' as FilterRange, label: 'Hari Ini' },
          { key: '7days' as FilterRange, label: '7 Hari' },
          { key: '30days' as FilterRange, label: '30 Hari' },
          { key: 'all' as FilterRange, label: 'Semua' },
        ].map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wider transition-all ${
              filter === f.key
                ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white shadow-xl shadow-[#2563EB]/30 scale-105'
                : 'bg-white border-2 border-[#1a1a1a]/10 text-[#1a1a1a]/60 hover:border-[#2563EB]/30 hover:text-[#1a1a1a]'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-4 gap-6">
         <FinanceCard title="Total Pendapatan" value={`Rp ${totalPendapatan.toLocaleString('id-ID')}`} icon={<DollarSign className="text-green-300"/>} />
         <FinanceCard title="Harian" value={`Rp ${pendapatanHarian.toLocaleString('id-ID')}`} icon={<TrendingUp className="text-red-600"/>} />
         <FinanceCard title="Transaksi Lunas" value={`${totalLunas} / ${filteredTransactions.length}`} icon={<FileText className="text-red-600"/>} />
      </div>

      <div className="bg-white/80 backdrop-blur-sm border-2 border-[#1a1a1a] rounded-3xl overflow-hidden shadow-xl">
        <div className="p-6 border-b-2 border-[#1a1a1a]/10 bg-gradient-to-r from-[#2563EB]/5 to-[#EF4444]/5">
          <h3 className="font-black text-[#1a1a1a] text-xl">Riwayat Transaksi</h3>
          <p className="text-xs text-[#1a1a1a]/50 font-bold mt-1">Semua transaksi rental motor</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAF9F6] border-b-2 border-[#1a1a1a]/10">
            <tr>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest">Tanggal</th>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest">Penyewa</th>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest">Unit</th>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest">Total</th>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest">Status</th>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]/5">
            {filteredTransactions.map((t, index) => (
              <tr key={t.id} className="hover:bg-[#2563EB]/5 transition-all animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${index * 50}ms` }}>
                <td className="p-5 text-[#1a1a1a]/60 font-mono text-xs font-bold">{new Date(t.created_at).toLocaleDateString()}</td>
                <td className="p-5 font-black text-[#1a1a1a]">{t.profiles?.full_name || 'Guest'}</td>
                <td className="p-5 text-[#1a1a1a]/70 font-bold">{t.motor_name}</td>
                <td className="p-5 font-black text-green-600">Rp {t.total_price.toLocaleString()}</td>
                <td className="p-5">
                  <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border-2 ${
                    t.payment_status === 'Lunas' ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200' : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200'
                  }`}>
                    {t.payment_status}
                  </span>
                </td>
                <td className="p-5">
                  <button 
                    onClick={() => void togglePayment(t.id, t.payment_status)}
                    className="flex items-center gap-2 text-xs font-black text-[#EF4444] hover:bg-[#EF4444]/10 px-4 py-2 rounded-xl transition-all border-2 border-[#EF4444]/20 hover:border-[#EF4444]"
                  >
                    <RefreshCw size={14} strokeWidth={2.5} /> SET LUNAS
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FinanceCard({ title, value, icon }: { title: string, value: string, icon: React.ReactNode }) {
  return (
    <div className="bg-white/80 backdrop-blur-sm border-2 border-[#1a1a1a] p-6 rounded-2xl flex gap-4 items-center shadow-lg hover:shadow-2xl transition-all hover:scale-105 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-br from-[#2563EB]/10 to-[#EF4444]/10 opacity-50 -rotate-12 translate-x-8 -translate-y-8"></div>
      <div className="w-14 h-14 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] border-2 border-[#2563EB] rounded-2xl flex items-center justify-center relative z-10">{icon}</div>
      <div className="relative z-10">
        <p className="text-[10px] text-[#1a1a1a]/60 font-black uppercase mb-2 tracking-widest">{title}</p>
        <p className="text-2xl font-black text-[#1a1a1a] leading-none">{value}</p>
      </div>
    </div>
  );
}