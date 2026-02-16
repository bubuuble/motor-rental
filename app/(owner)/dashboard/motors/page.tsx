'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Plus, Eye, Loader2, Calendar, X, Save, AlertTriangle } from 'lucide-react';
import { MOTORS_DATA, Motor } from '@/app/constants/motors';

interface MotorWithStatus extends Motor {
  service_status: string;
  active_schedule?: {
    start: string;
    end: string;
    customer: string;
  };
}

interface BookingJoinResult {
  motor_id: string;
  start_date: string;
  end_date: string;
  status: string;
  profiles: { full_name: string } | null;
}

export default function MotorsManagement() {
  const [motors, setMotors] = useState<MotorWithStatus[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMotor, setSelectedMotor] = useState<MotorWithStatus | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const supabase = useMemo(() => createClient(), []);

  const fetchRealtimeStatus = useCallback(async () => {
    setLoading(true);
    try {
      const { data: serviceData } = await supabase.from('motor_status').select('*');
      const { data: bookingData } = await supabase
        .from('bookings')
        .select('motor_id, start_date, end_date, profiles(full_name), status')
        .in('status', ['Disetujui', 'Motor Terkirim']);

      const combined = MOTORS_DATA.map((m: Motor): MotorWithStatus => {
        const sStatus = serviceData?.find(s => s.motor_id === m.id)?.service_status || 'Baik';
        const activeBooking = (bookingData as unknown as BookingJoinResult[])?.find(b => b.motor_id === m.id);

        return {
          ...m,
          service_status: sStatus,
          active_schedule: activeBooking ? {
            start: activeBooking.start_date,
            end: activeBooking.end_date,
            customer: activeBooking.profiles?.full_name || 'Customer'
          } : undefined
        };
      });
      setMotors(combined);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    const load = async () => {
      await Promise.resolve();
      await fetchRealtimeStatus();
    };
    load();
  }, [fetchRealtimeStatus]);

  // FUNGSI UPDATE STATUS SERVIS
  const handleUpdateService = async (newStatus: string) => {
    if (!selectedMotor) return;
    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('motor_status')
        .upsert({ 
          motor_id: selectedMotor.id, 
          service_status: newStatus,
          updated_at: new Date().toISOString() 
        });

      if (error) throw error;
      await fetchRealtimeStatus();
      setSelectedMotor(null);
      alert("Status servis berhasil diperbarui!");
    } catch (err) {
      alert("Gagal update data");
    } finally {
      setIsUpdating(false);
    }
  };

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" size={40} /></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative">
        <div className="absolute -top-4 -right-4 w-32 h-32 bg-gradient-to-bl from-[#00D9FF]/20 to-[#FF6B35]/20 rounded-full blur-3xl"></div>
        <h2 className="text-4xl font-black text-[#1a1a1a] tracking-tight">Pengelolaan Data Motor</h2>
        <p className="text-xs text-[#1a1a1a]/40 font-bold uppercase tracking-widest mt-2">Kelola unit motor & status servis</p>
      </div>

      <div className="bg-white/80 backdrop-blur-sm border-2 border-[#1a1a1a] rounded-3xl overflow-hidden shadow-xl">
        <table className="w-full text-left text-sm">
          <thead className="bg-[#FAF9F6] border-b-2 border-[#1a1a1a]/10">
            <tr>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest">Unit Motor</th>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest">Status Servis</th>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest">Status</th>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest">Jadwal Sewa</th>
              <th className="p-5 font-black uppercase text-[10px] text-[#1a1a1a]/60 tracking-widest text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1a1a1a]/5">
            {motors.map((m, index) => (
              <tr key={m.id} className="hover:bg-[#FF6B35]/5 transition-all group animate-in fade-in slide-in-from-bottom-2" style={{ animationDelay: `${index * 50}ms` }}>
                <td className="p-5">
                   <p className="font-bold text-[#1a1a1a]">{m.name}</p>
                </td>
                <td className="p-5">
                  <div className="flex items-center gap-2">
                    <div className={`w-2.5 h-2.5 rounded-full ${
                      m.service_status === 'Baik' ? 'bg-green-500' : m.service_status === 'Perlu Servis' ? 'bg-amber-500' : 'bg-red-500'
                    }`}></div>
                    <span className={`px-4 py-1.5 rounded-xl border-2 text-[10px] font-black uppercase ${
                      m.service_status === 'Baik' ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200' 
                      : m.service_status === 'Perlu Servis' ? 'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200' 
                      : 'bg-gradient-to-r from-red-50 to-red-100 text-red-700 border-red-200'
                    }`}>
                      {m.service_status}
                    </span>
                  </div>
                </td>
                <td className="p-5">
                  <span className={`px-4 py-1.5 rounded-xl border-2 text-[10px] font-black uppercase ${
                    m.active_schedule 
                      ? 'bg-gradient-to-r from-[#FF6B35]/10 to-[#FF6B35]/20 text-[#FF6B35] border-[#FF6B35]/30' 
                      : 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200'
                  }`}>
                    {m.active_schedule ? 'Disewa' : 'Tersedia'}
                  </span>
                </td>
                <td className="p-5">
                  {m.active_schedule ? (
                    <div className="text-xs font-bold text-[#1a1a1a] bg-[#FAF9F6] p-3 rounded-xl space-y-1 border-2 border-[#1a1a1a]/10">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-[#00D9FF]" strokeWidth={2.5} />
                        <span>{m.active_schedule.start} - {m.active_schedule.end}</span>
                      </div>
                      <p className="text-[10px] font-black text-[#1a1a1a]/60 uppercase tracking-wider">Penyewa: <span className="text-[#00D9FF]">{m.active_schedule.customer}</span></p>
                    </div>
                  ) : <span className="text-[#1a1a1a]/20 font-bold">-</span>}
                </td>
                <td className="p-5 text-center">
                  <button 
                    onClick={() => setSelectedMotor(m)}
                    className="p-2.5 border-2 border-[#1a1a1a]/10 rounded-xl hover:bg-[#FF6B35]/10 hover:border-[#FF6B35] text-[#FF6B35] transition-all"
                  >
                    <Eye size={18} strokeWidth={2.5} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL EDIT STATUS SERVIS */}
      {selectedMotor && (
        <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm">
           <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl border-2 border-[#1a1a1a] shadow-2xl overflow-hidden animate-in zoom-in duration-200">
              <div className="p-6 border-b-2 border-[#1a1a1a]/10 bg-gradient-to-r from-[#FF6B35]/5 to-[#00D9FF]/5 flex justify-between items-center">
                <h3 className="font-black text-[#1a1a1a]">Detail & Kondisi Unit</h3>
                <button onClick={() => setSelectedMotor(null)} className="hover:bg-[#1a1a1a]/10 p-1.5 rounded-xl transition">
                  <X size={20} strokeWidth={2.5} />
                </button>
              </div>
              <div className="p-8 space-y-6">
                 <div>
                   <p className="text-[10px] font-black text-[#FF6B35] uppercase tracking-widest mb-2">Unit Terpilih</p>
                   <h4 className="text-2xl font-black text-[#1a1a1a]">{selectedMotor.name}</h4>
                 </div>

                 <div className="space-y-3">
                   <p className="text-[10px] font-black text-[#1a1a1a]/60 uppercase tracking-widest">Update Status Servis</p>
                   <div className="grid grid-cols-1 gap-3">
                      {['Baik', 'Perlu Servis', 'Dalam Perbaikan'].map((status) => (
                        <button
                          key={status}
                          onClick={() => handleUpdateService(status)}
                          disabled={isUpdating}
                          className={`w-full p-4 rounded-2xl text-sm font-black text-left border-2 transition-all flex justify-between items-center ${
                            selectedMotor.service_status === status 
                            ? 'border-[#00D9FF] bg-gradient-to-r from-[#00D9FF]/10 to-[#00D9FF]/20 text-[#00D9FF]' 
                            : 'border-[#1a1a1a]/10 hover:border-[#FF6B35]/30 hover:bg-[#FF6B35]/5 text-[#1a1a1a]/70'
                          }`}
                        >
                          {status}
                          {isUpdating && selectedMotor.service_status === status && <Loader2 size={16} className="animate-spin" strokeWidth={2.5} />}
                        </button>
                      ))}
                   </div>
                 </div>

                 <div className="p-4 bg-gradient-to-r from-amber-50 to-amber-100 rounded-2xl flex gap-3 border-2 border-amber-200">
                   <AlertTriangle className="text-amber-600 shrink-0" size={20} strokeWidth={2.5} />
                   <p className="text-xs text-amber-800 leading-relaxed font-bold">
                     Mengubah status menjadi <span className="text-amber-900">Perlu Servis</span> atau <span className="text-amber-900">Dalam Perbaikan</span> akan memberikan tanda peringatan pada dashboard overview.
                   </p>
                 </div>
              </div>
              <div className="p-6 bg-[#FAF9F6] border-t-2 border-[#1a1a1a]/10 flex justify-end">
                <button 
                  onClick={() => setSelectedMotor(null)}
                  className="px-6 py-2.5 text-sm font-bold text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition"
                >
                  Tutup
                </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}