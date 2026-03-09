'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Check, X, Loader2, History } from 'lucide-react';

interface AppealBooking {
  id: string;
  motor_name: string;
  appeal_reason: string;
  status: string;
  created_at: string;
  profiles: { full_name: string } | null;
}

export default function AppealsPage() {
  const [appeals, setAppeals] = useState<AppealBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchAppeals = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('bookings')
        .select('id, motor_name, appeal_reason, status, created_at, profiles(full_name)')
        .not('appeal_reason', 'is', null)
        .order('created_at', { ascending: false });
      
      if (data) setAppeals(data as unknown as AppealBooking[]);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      await fetchAppeals();
    };
    load();
  }, [fetchAppeals]);

  const handleAction = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ status: newStatus })
      .eq('id', id);
    if (!error) {
      alert(`Banding telah ${newStatus === 'Disetujui' ? 'Diterima' : 'Ditolak Permanent'}`);
      void fetchAppeals();
    }
  };

  if (loading && appeals.length === 0) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="relative">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-bl from-red-500/20 to-[#FF6B35]/20 rounded-full blur-3xl"></div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight flex items-center gap-3 sm:gap-4 relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
            <History className="text-white" size={24} strokeWidth={2.5} />
          </div>
          Riwayat & Banding Pemesanan
        </h2>
        <p className="text-xs text-[#1a1a1a]/40 font-bold uppercase tracking-widest mt-2 relative z-10">Kelola banding dari customer</p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm border-2 border-[#1a1a1a] rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAF9F6] border-b-2 border-[#1a1a1a]/10">
            <tr>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest">Penyewa</th>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest">Unit</th>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest">Alasan Banding</th>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest text-center">Status Saat Ini</th>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]/5">
            {appeals.length === 0 ? (
                <tr>
                    <td colSpan={5} className="p-32 text-center text-[#1a1a1a]/20 font-black text-xl">Belum ada riwayat banding</td>
                </tr>
            ) : (
              appeals.map((item, index) => (
                <tr key={item.id} className="hover:bg-[#FF6B35]/5 transition-all animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${index * 50}ms` }}>
                  <td className="p-5 font-black text-[#1a1a1a]">{item.profiles?.full_name}</td>
                  <td className="p-5 text-[#1a1a1a]/70 font-bold">{item.motor_name}</td>
                  <td className="p-5 max-w-xs">
                    <div className="bg-gradient-to-r from-red-50 to-red-100 text-red-700 p-3 rounded-2xl text-xs font-bold border-2 border-red-200 shadow-sm">
                      &ldquo;{item.appeal_reason}&rdquo;
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    {(() => {
                      const displayStatus = (item.status === 'Motor Terkirim' || item.status === 'Selesai') ? 'Disetujui' : item.status;
                      return (
                        <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase border-2 ${
                            displayStatus === 'Disetujui' ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200' : 
                            displayStatus === 'Ditolak Permanent' ? 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200' : 
                            'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200'
                        }`}>
                            {displayStatus}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-5 text-right">
                    {item.status !== 'Disetujui' && item.status !== 'Ditolak Permanent' && item.status !== 'Motor Terkirim' && item.status !== 'Selesai' ? (
                      <div className="flex justify-end gap-2">
                        <button 
                            onClick={() => void handleAction(item.id, 'Disetujui')} 
                            className="p-2.5 border-2 border-[#1a1a1a]/10 rounded-xl hover:bg-green-500 hover:border-green-500 hover:text-white text-green-600 transition-all shadow-sm"
                            title="Terima Banding"
                        >
                            <Check size={18} strokeWidth={2.5} />
                        </button>
                        <button 
                            onClick={() => void handleAction(item.id, 'Ditolak Permanent')} 
                            className="p-2.5 border-2 border-[#1a1a1a]/10 rounded-xl hover:bg-red-500 hover:border-red-500 hover:text-white text-red-600 transition-all shadow-sm"
                            title="Tolak Permanent"
                        >
                            <X size={18} strokeWidth={2.5} />
                        </button>
                      </div>
                    ) : (
                        <span className="text-xs font-black text-[#1a1a1a]/20 uppercase">Selesai</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}