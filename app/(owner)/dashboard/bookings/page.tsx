'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, ClipboardList, Eye, RotateCcw } from 'lucide-react';
import Link from 'next/link';

interface BookingSummary {
  id: string;
  motor_name: string;
  status: string;
  created_at: string;
  start_date: string;
  end_date: string;
  total_price: number;
  profiles: { full_name: string } | null;
}

const STATUS_STYLES: Record<string, string> = {
  'Disetujui':           'bg-green-50 text-green-700 border-green-200',
  'Motor Terkirim':      'bg-blue-50 text-blue-700 border-blue-200',
  'Menunggu Konfirmasi': 'bg-amber-50 text-amber-700 border-amber-200',
  'Selesai':             'bg-slate-50 text-slate-600 border-slate-200',
  'Ditolak':             'bg-red-50 text-red-700 border-red-200',
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<string>('semua');
  const supabase = useMemo(() => createClient(), []);

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('bookings')
        .select('id, motor_name, status, created_at, start_date, end_date, total_price, profiles(full_name)')
        .order('created_at', { ascending: false });
      if (data) setBookings(data as unknown as BookingSummary[]);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    let isMounted = true;
    const load = async () => { if (isMounted) { await Promise.resolve(); await fetchBookings(); } };
    load();
    return () => { isMounted = false; };
  }, [fetchBookings]);

  const filtered = filter === 'semua' ? bookings : bookings.filter(b => b.status === filter);
  const FILTERS = ['semua', 'Menunggu Konfirmasi', 'Disetujui', 'Motor Terkirim', 'Selesai', 'Ditolak'];

  if (loading && bookings.length === 0) {
    return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Manajemen Pesanan</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Home &gt; Pesanan Masuk</p>
        </div>
        <button
          onClick={() => { void fetchBookings(); }}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200"
        >
          <RotateCcw size={14} strokeWidth={2.5} />
          Refresh
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
              filter === f
                ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200'
                : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'
            }`}
          >
            {f === 'semua' ? `Semua (${bookings.length})` : f}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-blue-100 flex justify-between items-center">
          <div>
            <h3 className="font-black text-slate-900 text-lg">Daftar Pesanan</h3>
            <p className="text-xs text-slate-400 font-semibold mt-1">Menampilkan {filtered.length} pesanan</p>
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="p-24 text-center text-slate-300 font-black">
            <ClipboardList size={56} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl">Belum ada pesanan</p>
            <p className="text-sm mt-2 font-medium">Pesanan baru akan muncul di sini</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-blue-50/60 border-b border-blue-100">
                <tr>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">No</th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Nama Penyewa</th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Motor</th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Tgl Pesan</th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Periode Sewa</th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Total</th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Status</th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((b, index) => (
                  <tr
                    key={b.id}
                    className="hover:bg-blue-50/40 transition-all group animate-in fade-in slide-in-from-bottom-2"
                    style={{ animationDelay: `${index * 40}ms` }}
                  >
                    <td className="p-4 text-slate-300 font-black text-xs">{index + 1}</td>
                    <td className="p-4"><p className="font-black text-slate-900">{b.profiles?.full_name || 'Guest'}</p></td>
                    <td className="p-4"><p className="font-bold text-slate-600 text-xs">{b.motor_name}</p></td>
                    <td className="p-4">
                      <p className="text-slate-400 font-mono text-xs">
                        {new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </p>
                    </td>
                    <td className="p-4">
                      <div className="text-xs font-bold text-slate-600 space-y-0.5">
                        <p>{b.start_date || '—'}</p>
                        {b.end_date && <p className="text-slate-400">s/d {b.end_date}</p>}
                      </div>
                    </td>
                    <td className="p-4">
                      <p className="font-black text-slate-900 text-xs">
                        {b.total_price ? `Rp ${b.total_price.toLocaleString('id-ID')}` : '—'}
                      </p>
                    </td>
                    <td className="p-4">
                      <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase border whitespace-nowrap ${STATUS_STYLES[b.status] ?? 'bg-gray-50 text-gray-600 border-gray-200'}`}>
                        {b.status}
                      </span>
                    </td>
                    <td className="p-4 text-center">
                      <Link
                        href={`/dashboard/bookings/${b.id}`}
                        className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all group-hover:scale-105"
                      >
                        <Eye size={14} strokeWidth={2.5} />
                        Detail
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}