'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Loader2, Bike, Calendar, RefreshCcw, User, CheckCircle } from 'lucide-react';
import Link from 'next/link';

interface ActiveRentalMotor {
  motorId: string;
  motorName: string;
  brand: string;
  year: string;
  motorStatus: string;   // from motors.status field
  bookingId: string | null;
  bookingStatus: string | null;
  renterName: string | null;
  renterPhone: string | null;
  startDate: string | null;
  endDate: string | null;
}

const STATUS_STYLES: Record<string, string> = {
  'Disetujui':           'bg-green-50 text-green-700 border-green-200',
  'Motor Terkirim':      'bg-blue-50 text-blue-700 border-blue-200',
  'Menunggu Konfirmasi': 'bg-amber-50 text-amber-700 border-amber-200',
  'Selesai':             'bg-slate-50 text-slate-600 border-slate-200',
  'Ditolak':             'bg-red-50 text-red-700 border-red-200',
};

const BOOKING_STATUSES = [
  'Menunggu Konfirmasi',
  'Disetujui',
  'Motor Terkirim',
  'Selesai',
  'Ditolak',
];

export default function PengelolaanSewMotor() {
  const [motorList, setMotorList] = useState<ActiveRentalMotor[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingMotorId, setUpdatingMotorId] = useState<string | null>(null);
  const [updatingBookingId, setUpdatingBookingId] = useState<string | null>(null);
  const [savedBookingId, setSavedBookingId] = useState<string | null>(null);
  const supabase = useMemo(() => createClient(), []);

  const MOTOR_STATUSES = ['Tersedia', 'Disewa', 'Perbaikan'];

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all motors from DB
      const { data: motors } = await supabase
        .from('motors')
        .select('id, name, brand, year, status')
        .order('name');

      // Fetch active bookings (Disetujui or Motor Terkirim)
      const { data: activeBookings } = await supabase
        .from('bookings')
        .select('id, motor_id, motor_name, status, start_date, end_date, profiles(full_name, phone)')
        .in('status', ['Disetujui', 'Motor Terkirim', 'Menunggu Konfirmasi']);

      const combined: ActiveRentalMotor[] = (motors ?? []).map((m) => {
        const booking = (activeBookings ?? []).find(b => b.motor_id === m.id);
        return {
          motorId: m.id,
          motorName: m.name,
          brand: m.brand || '',
          year: m.year || '',
          motorStatus: (m as { status?: string }).status ?? 'Tersedia',
          bookingId: booking?.id ?? null,
          bookingStatus: booking?.status ?? null,
          renterName: (booking?.profiles as unknown as { full_name: string; phone: string } | null)?.full_name ?? null,
          renterPhone: (booking?.profiles as unknown as { full_name: string; phone: string } | null)?.phone ?? null,
          startDate: booking?.start_date ?? null,
          endDate: booking?.end_date ?? null,
        };
      });

      setMotorList(combined);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  const handleMotorStatusChange = async (motorId: string, newStatus: string) => {
    setUpdatingMotorId(motorId);
    const { error } = await supabase
      .from('motors')
      .update({ status: newStatus })
      .eq('id', motorId);
    if (!error) {
      setMotorList(prev => prev.map(m =>
        m.motorId === motorId ? { ...m, motorStatus: newStatus } : m
      ));
    } else {
      console.error('Gagal update status motor:', error);
      alert(`Gagal: ${error.message} (code: ${error.code})`);
    }
    setUpdatingMotorId(null);
  };

  const handleBookingStatusChange = async (bookingId: string, newStatus: string) => {
    setUpdatingBookingId(bookingId);
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', bookingId);
    if (!error) {
      setMotorList(prev => prev.map(m =>
        m.bookingId === bookingId ? { ...m, bookingStatus: newStatus } : m
      ));
      setSavedBookingId(bookingId);
      setTimeout(() => setSavedBookingId(null), 2000);
    }
    setUpdatingBookingId(null);
  };

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  const rented = motorList.filter(m => m.motorStatus === 'Disewa');
  const available = motorList.filter(m => m.motorStatus === 'Tersedia');

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div>
          <h2 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">Pengelolaan Sewa Motor</h2>
          <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-2">Home &gt; Pengelolaan Sewa Motor</p>
        </div>
        <button
          onClick={() => void fetchData()}
          className="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-200"
        >
          <RefreshCcw size={14} strokeWidth={2.5} />
          Refresh
        </button>
      </div>

      {/* Summary Chips */}
      <div className="flex gap-3">
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-black">
          <Bike size={16} strokeWidth={2.5} />
          {rented.length} Sedang Disewa
        </div>
        <div className="flex items-center gap-2 px-4 py-2 bg-white border border-green-200 text-green-700 rounded-xl text-sm font-black">
          <Bike size={16} strokeWidth={2.5} />
          {available.length} Tersedia
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-blue-100 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-blue-100">
          <h3 className="font-black text-slate-900 text-lg">Status Semua Unit Motor</h3>
          <p className="text-xs text-slate-400 font-semibold mt-1">{motorList.length} unit terdaftar</p>
        </div>
        {motorList.length === 0 ? (
          <div className="p-24 text-center text-slate-300 font-black">
            <Bike size={56} className="mx-auto mb-4 opacity-30" />
            <p>Belum ada data motor</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-blue-50/60 border-b border-blue-100">
                <tr>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">No</th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Unit Motor</th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Status Sewa</th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Penyewa</th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Periode Sewa</th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest">Status Booking</th>
                  <th className="p-4 text-[10px] font-black text-blue-600 uppercase tracking-widest text-center">Detail</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {motorList.map((m, i) => (
                  <tr key={m.motorId} className={`transition-all animate-in fade-in slide-in-from-bottom-2 ${m.motorStatus === 'Disewa' ? 'bg-blue-50/30' : ''} hover:bg-blue-50/50`} style={{ animationDelay: `${i * 40}ms` }}>
                    <td className="p-4 text-slate-400 font-black text-xs">{i + 1}</td>
                    <td className="p-4">
                      <p className="font-black text-slate-900">{m.motorName}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{m.brand} · {m.year}</p>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-1.5">
                        {updatingMotorId === m.motorId && (
                          <Loader2 size={12} className="animate-spin text-blue-500 shrink-0" />
                        )}
                        <select
                          value={m.motorStatus}
                          onChange={e => void handleMotorStatusChange(m.motorId, e.target.value)}
                          disabled={updatingMotorId === m.motorId}
                          className={`pl-2.5 pr-7 py-1.5 rounded-lg border text-[9px] font-black uppercase appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60 ${
                            m.motorStatus === 'Disewa' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                            m.motorStatus === 'Perbaikan' ? 'bg-red-50 text-red-700 border-red-200' :
                            'bg-green-50 text-green-700 border-green-200'
                          }`}
                        >
                          {MOTOR_STATUSES.map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>
                    </td>
                    <td className="p-4">
                      {m.renterName ? (
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 bg-blue-100 rounded-full flex items-center justify-center">
                            <User size={13} className="text-blue-600" strokeWidth={2.5} />
                          </div>
                          <div>
                            <p className="font-black text-slate-900 text-xs">{m.renterName}</p>
                            {m.renterPhone && <p className="text-[10px] text-slate-400 font-bold">{m.renterPhone}</p>}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {m.startDate ? (
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600">
                          <Calendar size={13} className="text-blue-500" strokeWidth={2.5} />
                          <span>{m.startDate}</span>
                          <span className="text-slate-300">→</span>
                          <span>{m.endDate}</span>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>
                    <td className="p-4">
                      {m.bookingId && m.bookingStatus ? (
                        <div className="flex items-center gap-1.5">
                          {updatingBookingId === m.bookingId && (
                            <Loader2 size={12} className="animate-spin text-blue-500 shrink-0" />
                          )}
                          {savedBookingId === m.bookingId && (
                            <CheckCircle size={12} className="text-green-500 shrink-0" />
                          )}
                          <select
                            value={m.bookingStatus}
                            onChange={e => void handleBookingStatusChange(m.bookingId!, e.target.value)}
                            disabled={updatingBookingId === m.bookingId}
                            className={`pl-2.5 pr-7 py-1.5 rounded-lg border text-[9px] font-black uppercase appearance-none cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-blue-300 disabled:opacity-60 ${
                              STATUS_STYLES[m.bookingStatus] ?? 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}
                          >
                            {BOOKING_STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>
                      ) : (
                        <span className="text-slate-300 font-bold">—</span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {m.bookingId ? (
                        <Link
                          href={`/dashboard/bookings/${m.bookingId}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-blue-200 text-blue-600 text-[10px] font-black uppercase tracking-wider hover:bg-blue-600 hover:text-white transition-all"
                        >
                          Detail
                        </Link>
                      ) : (
                        <span className="text-slate-300 font-bold text-xs">—</span>
                      )}
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