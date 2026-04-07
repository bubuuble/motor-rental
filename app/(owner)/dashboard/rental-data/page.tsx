'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, CalendarClock, AlertTriangle, X, Send, RefreshCcw, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSweetAlert } from '@/utils/useSweetAlert';

interface ActiveRental {
  id: string;
  motor_name: string;
  status: string;
  start_date: string;
  end_date: string;
  total_price: number;
  profiles: { full_name: string; phone: string } | null;
}

function daysRemaining(endDate: string): number {
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const end = new Date(endDate); end.setHours(0, 0, 0, 0);
  return Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export default function RentalDataPage() {
  const [rentals, setRentals] = useState<ActiveRental[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRental, setSelectedRental] = useState<ActiveRental | null>(null);
  const [extendDays, setExtendDays] = useState('7');
  const [isExtending, setIsExtending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [filter, setFilter] = useState<'aktif' | 'semua'>('aktif');
  const supabase = useMemo(() => createClient(), []);
  const swal = useSweetAlert();

  const fetchRentals = useCallback(async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('bookings')
        .select('id, motor_name, status, start_date, end_date, total_price, profiles(full_name, phone)')
        .order('end_date', { ascending: true });
      if (filter === 'aktif') query = query.in('status', ['Disetujui', 'Motor Terkirim']);
      const { data } = await query;
      if (data) setRentals(data as unknown as ActiveRental[]);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  }, [supabase, filter]);

  useEffect(() => { fetchRentals(); }, [fetchRentals]);

  const handleExtend = async () => {
    if (!selectedRental || !extendDays) return;
    const days = parseInt(extendDays);
    if (isNaN(days) || days <= 0) { 
      swal.warning('Input Tidak Valid', 'Masukkan jumlah hari yang valid'); 
      return; 
    }
    setIsExtending(true);
    try {
      const currentEnd = new Date(selectedRental.end_date);
      currentEnd.setDate(currentEnd.getDate() + days);
      const newEndDate = currentEnd.toISOString().split('T')[0];
      const { error } = await supabase.from('bookings').update({ end_date: newEndDate }).eq('id', selectedRental.id);
      if (error) throw error;
      const customerName = selectedRental.profiles?.full_name || 'Pelanggan';
      const phone = selectedRental.profiles?.phone?.replace(/^0/, '62') || '';
      const msg = `Halo ${customerName}! 👋%0A%0ASewa motor *${selectedRental.motor_name}* Anda telah diperpanjang selama *${days} hari*.%0A%0ATanggal berakhir baru: *${newEndDate}*%0A%0ATerima kasih! 🙏`;
      if (phone) window.open(`https://wa.me/${phone}?text=${msg}`, '_blank');
      setSelectedRental(null); setExtendDays('7');
      swal.success('Perpanjangan Berhasil', `Masa sewa hingga ${newEndDate}`);
      await fetchRentals();
    } catch { 
      swal.error('Gagal Memperpanjang', 'Gagal memperpanjang sewa. Coba lagi.');
    } finally { 
      setIsExtending(false); 
    }
  };

  const almostExpired = rentals.filter(r => { const d = daysRemaining(r.end_date); return d <= 3 && d >= 0 && (r.status === 'Disetujui' || r.status === 'Motor Terkirim'); });

  if (loading && rentals.length === 0) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Kelola Data Sewa</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Home &gt; Kelola Data Sewa</p>
        </div>
        <button onClick={() => void fetchRentals()}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200">
          <RefreshCcw size={14} strokeWidth={2.5} /> Refresh
        </button>
      </div>

      {successMsg && (
        <div className="flex items-center gap-3 p-4 bg-green-50 border border-green-200 rounded-xl animate-in fade-in duration-300">
          <CheckCircle size={20} className="text-green-600 shrink-0" strokeWidth={2.5} />
          <p className="text-sm font-black text-green-800">{successMsg}</p>
        </div>
      )}

      {almostExpired.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-amber-500 rounded-lg flex items-center justify-center">
              <AlertTriangle size={18} className="text-white" strokeWidth={2.5} />
            </div>
            <div>
              <h3 className="font-black text-amber-900">{almostExpired.length} Sewa Hampir Berakhir</h3>
              <p className="text-xs text-amber-700 font-bold">Masa sewa berikut akan berakhir dalam ≤3 hari</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {almostExpired.map(r => (
              <button key={r.id} onClick={() => setSelectedRental(r)}
                className="flex items-center gap-2 px-3 py-2 bg-white border border-amber-300 rounded-lg text-xs font-black text-amber-800 hover:bg-amber-100 transition-all">
                <CalendarClock size={13} strokeWidth={2.5} />
                {r.profiles?.full_name || 'Guest'} — {r.motor_name} ({daysRemaining(r.end_date)} hari)
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex gap-2">
        {(['aktif', 'semua'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all ${
              filter === f ? 'bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200' : 'bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-600'
            }`}>
            {f === 'aktif' ? 'Sewa Aktif' : 'Semua Sewa'}
          </button>
        ))}
      </div>

      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-blue-100">
          <h3 className="font-black text-slate-900 text-lg">Data Sewa</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">{rentals.length} data ditemukan</p>
        </div>
        {rentals.length === 0 ? (
          <div className="p-24 text-center text-slate-300 font-black">
            <CalendarClock size={56} className="mx-auto mb-4 opacity-30" />
            <p className="text-xl">Tidak ada data sewa aktif</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-blue-50/60 border-b border-blue-100">
                <tr>
                  {['No', 'Penyewa', 'Motor', 'Mulai', 'Selesai', 'Sisa Hari', 'Status', 'Detail'].map(h => (
                    <th key={h} className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rentals.map((r, i) => {
                  const days = daysRemaining(r.end_date);
                  const isAlmostDone = days <= 3 && days >= 0 && (r.status === 'Disetujui' || r.status === 'Motor Terkirim');
                  const isOverdue = days < 0;
                  return (
                    <tr key={r.id} className={`transition-all animate-in fade-in ${isOverdue ? 'bg-red-50/50' : isAlmostDone ? 'bg-amber-50/50' : 'hover:bg-blue-50/30'}`} style={{ animationDelay: `${i * 40}ms` }}>
                      <td className="p-4 text-slate-300 font-black text-xs">{i + 1}</td>
                      <td className="p-4">
                        <p className="font-black text-slate-900">{r.profiles?.full_name || 'Guest'}</p>
                        <p className="text-[10px] text-slate-400 font-bold">{r.profiles?.phone || ''}</p>
                      </td>
                      <td className="p-4"><p className="font-bold text-slate-600 text-xs">{r.motor_name}</p></td>
                      <td className="p-4 font-mono text-xs text-slate-500">{r.start_date || '—'}</td>
                      <td className="p-4 font-mono text-xs text-slate-500">{r.end_date || '—'}</td>
                      <td className="p-4">
                        {r.end_date ? (
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black border ${isOverdue ? 'bg-red-100 text-red-700 border-red-200' : isAlmostDone ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-50 text-green-700 border-green-200'}`}>
                            {isOverdue ? `Lewat ${Math.abs(days)} hr` : `${days} hari`}
                          </span>
                        ) : <span className="text-slate-300 font-bold">—</span>}
                      </td>
                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase border ${
                          r.status === 'Disetujui' ? 'bg-green-50 text-green-700 border-green-200' :
                          r.status === 'Motor Terkirim' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                          r.status === 'Selesai' ? 'bg-slate-50 text-slate-600 border-slate-200' :
                          'bg-amber-50 text-amber-700 border-amber-200'
                        }`}>{r.status}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/bookings/${r.id}`} className="px-3 py-2 rounded-xl border border-blue-200 text-blue-600 text-[10px] font-black hover:bg-blue-600 hover:text-white transition-all">Detail</Link>
                          {(r.status === 'Disetujui' || r.status === 'Motor Terkirim') && (
                            <button onClick={() => { setSelectedRental(r); setExtendDays('7'); }}
                              className={`px-3 py-2 rounded-xl border text-[10px] font-black transition-all ${isAlmostDone ? 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600' : 'border-slate-200 text-slate-600 hover:border-blue-400 hover:text-blue-600'}`}>
                              Perpanjang
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedRental && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-2xl border border-slate-200 shadow-2xl overflow-hidden animate-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center">
              <div>
                <h3 className="font-black text-slate-900">Perpanjang Masa Sewa</h3>
                <p className="text-xs text-slate-400 font-bold mt-0.5">{selectedRental.profiles?.full_name} · {selectedRental.motor_name}</p>
              </div>
              <button onClick={() => setSelectedRental(null)} className="hover:bg-slate-100 p-1.5 rounded-lg transition"><X size={20} strokeWidth={2.5} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2 text-xs font-bold text-slate-600">
                <div className="flex justify-between"><span>Mulai:</span><span>{selectedRental.start_date}</span></div>
                <div className="flex justify-between"><span>Selesai saat ini:</span><span className="text-blue-600">{selectedRental.end_date}</span></div>
                <div className="flex justify-between"><span>Sisa:</span><span className="text-amber-600">{daysRemaining(selectedRental.end_date)} hari</span></div>
              </div>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Tambah Berapa Hari?</label>
                <div className="flex gap-2">
                  {['3', '7', '14', '30'].map(d => (
                    <button key={d} onClick={() => setExtendDays(d)}
                      className={`flex-1 py-3 rounded-xl text-sm font-black border-2 transition-all ${extendDays === d ? 'bg-blue-600 text-white border-blue-600' : 'border-slate-200 text-slate-600 hover:border-blue-400'}`}>{d}</button>
                  ))}
                </div>
                <input type="number" value={extendDays} min="1" onChange={e => setExtendDays(e.target.value)} placeholder="Atau masukkan jumlah hari"
                  className="w-full border border-slate-200 bg-slate-50 p-3 rounded-xl outline-none focus:border-blue-500 font-bold text-slate-900 text-sm transition-all" />
              </div>
            </div>
            <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3">
              <button onClick={() => setSelectedRental(null)} className="flex-1 py-3 text-sm font-bold text-slate-400 border border-slate-200 rounded-xl hover:text-slate-700 transition">Batal</button>
              <button onClick={() => void handleExtend()} disabled={isExtending}
                className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200 disabled:opacity-50">
                {isExtending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} strokeWidth={2.5} />}
                Simpan & Kirim WA
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
