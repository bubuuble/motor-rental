'use client';

import { useEffect, useState, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { Clock, Loader2, Calendar, CreditCard, Info, CheckCircle2, XCircle, ChevronRight, Package, Flag, Bike } from 'lucide-react';

// 1. Interface Lengkap sesuai tabel bookings di Supabase
interface Booking {
  id: string;
  motor_name: string;
  motor_id: string;
  start_date: string;
  end_date: string;
  start_time: string;
  end_time: string;
  total_price: number;
  status: string;
  is_delivery: boolean;
  notes: string | null;
  rejection_reason: string | null;
  created_at: string;
  approved_at?: string;
  delivered_at?: string;
  completed_at?: string;
}

export default function StatusPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null); // State untuk dropdown
  
  const formatDate = (dateString?: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).replace(' pukul', ',');
  };
  
  const supabase = useMemo(() => createClient(), []);

  const submitAppeal = async (bookingId: string, appealReason: string) => {
    const { error } = await supabase
      .from('bookings')
      .update({ 
        status: 'Banding',
        appeal_reason: appealReason 
      })
      .eq('id', bookingId);
    
    if (!error) {
      alert('Banding berhasil diajukan. Menunggu tinjauan owner.');
      // Refresh data
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .order('created_at', { ascending: false });
        setBookings((data as Booking[]) || []);
      }
    } else {
      alert('Gagal mengajukan banding. Silakan coba lagi.');
    }
  };

  useEffect(() => {
    const fetchBookings = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        const { data } = await supabase
          .from('bookings')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false });
        
        setBookings((data as Booking[]) || []);
      }
      setLoading(false);
    };
    fetchBookings();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAF9F6] to-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB]/10 to-[#00D9FF]/10 border border-[#FF6B35]/20 px-4 py-2 rounded-full">
            <Clock size={14} className="text-[#2563EB]" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#1a1a1a]">Tracking</span>
          </div>
          <h1 className="text-5xl font-black text-[#1a1a1a] tracking-tight">Status Pemesanan</h1>
          <p className="text-lg text-[#1a1a1a]/60 font-medium">Pantau progress booking motor Anda secara realtime.</p>
        </div>

        <div className="space-y-6">
        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-28 bg-white border-2 border-[#1a1a1a]/10 rounded-3xl shadow-sm animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-32 border-2 border-dashed border-[#1a1a1a]/10 rounded-3xl text-[#1a1a1a]/30 bg-gradient-to-br from-[#FAF9F6] to-white">
            <Clock size={60} className="mx-auto mb-4 opacity-20" />
            <p className="font-black text-lg">Belum ada riwayat pemesanan</p>
            <p className="text-sm mt-2">Booking motor pertama Anda sekarang!</p>
          </div>
        ) : (
          bookings.map((item, index) => (
            <div 
              key={item.id} 
              className="bg-white border-2 border-[#1a1a1a]/10 rounded-3xl shadow-lg overflow-hidden hover:shadow-2xl hover:shadow-[#2563EB]/10 transition-all animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <button 
                onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
                className="w-full p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:bg-[#FAF9F6] transition text-left group"
              >
                <div className="flex gap-4 items-start md:items-center flex-1">
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all ${
                    item.status === 'Disetujui' || item.status === 'Motor Terkirim' || item.status === 'Selesai'
                      ? 'bg-gradient-to-br from-green-500 to-green-600 text-white group-hover:scale-110'
                      : item.status === 'Ditolak'
                      ? 'bg-gradient-to-br from-red-500 to-red-600 text-white group-hover:scale-110'
                      : 'bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white group-hover:scale-110'
                  }`}>
                    <Clock size={28} />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-black text-xl text-[#1a1a1a] tracking-tight">{item.motor_name}</h3>
                    <p className="text-sm text-[#1a1a1a]/50 mt-1 font-medium flex items-center gap-2">
                      <Calendar size={14} />
                      {item.start_date} → {item.end_date}
                    </p>
                  </div>
                </div>
                
                <div className={`px-5 py-2 rounded-full text-xs font-black border-2 uppercase tracking-wider shadow-sm ${
                  item.status === 'Disetujui' 
                    ? 'bg-green-50 text-green-700 border-green-200' 
                    : item.status === 'Motor Terkirim'
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : item.status === 'Selesai'
                    ? 'bg-purple-50 text-purple-700 border-purple-200'
                    : item.status === 'Ditolak' 
                    ? 'bg-red-50 text-red-700 border-red-200' 
                    : 'bg-blue-50 text-blue-700 border-blue-200'
                }`}>
                  {item.status}
                </div>
              </button>

              {/* Dropdown Detail */}
              {expandedId === item.id && (
                <div className="border-t bg-gray-50 p-6 space-y-6 animate-in slide-in-from-top-2 duration-200">
                  {/* Status Timeline / Steps */}
                  <div className="bg-white p-5 rounded-2xl border border-[#1a1a1a]/10">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Alur Pesanan</h4>
                    
                    <div className="relative flex justify-between items-center">
                      {/* Background Line */}
                      <div className="absolute top-1/2 left-0 w-full h-1 bg-slate-100 -translate-y-1/2 rounded-full z-0"></div>
                      
                      {/* Progress Line */}
                      <div className={`absolute top-1/2 left-0 h-1 -translate-y-1/2 rounded-full z-0 transition-all duration-500 ${
                        item.status === 'Selesai' ? 'w-full bg-green-500' :
                        item.status === 'Motor Terkirim' ? 'w-[66%] bg-blue-500' :
                        item.status === 'Disetujui' ? 'w-[33%] bg-blue-500' :
                        item.status === 'Ditolak' ? 'w-[33%] bg-red-500' :
                        'w-0 bg-blue-500'
                      }`}></div>

                      {/* Step 1: Pengajuan (Selalu aktif pertama kali disubmit) */}
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors bg-white ${
                            ['Menunggu Konfirmasi', 'Banding', 'Disetujui', 'Motor Terkirim', 'Selesai', 'Ditolak'].includes(item.status)
                              ? 'border-blue-500 text-blue-500 shadow-sm'
                              : 'border-slate-300 text-slate-400'
                        }`}>
                          <Package size={14} className={['Menunggu Konfirmasi', 'Banding', 'Disetujui', 'Motor Terkirim', 'Selesai', 'Ditolak'].includes(item.status) ? "text-blue-500" : ""} />
                        </div>
                        <div className="text-center">
                          <span className="text-[10px] sm:text-xs font-bold text-slate-600 block">
                             {item.status === 'Banding' ? 'Banding' : 'Diterima'}
                          </span>
                          <span className="text-[9px] text-slate-400 mt-0.5 block whitespace-nowrap">{formatDate(item.created_at)}</span>
                        </div>
                      </div>

                      {/* Step 2: Verifikasi (Disetujui / Ditolak) */}
                      <div className="relative z-10 flex flex-col items-center gap-2">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors bg-white ${
                            item.status === 'Ditolak'
                              ? 'border-red-500 text-red-500 shadow-sm'
                              : ['Disetujui', 'Motor Terkirim', 'Selesai'].includes(item.status)
                              ? 'border-blue-500 text-blue-500 shadow-sm'
                              : 'border-slate-200 text-slate-300'
                        }`}>
                          {item.status === 'Ditolak' ? <XCircle size={14} /> : 
                           ['Disetujui', 'Motor Terkirim', 'Selesai'].includes(item.status) ? <CheckCircle2 size={14} /> : 
                           <Clock size={14} />}
                        </div>
                        <div className="text-center">
                          <span className={`text-[10px] sm:text-xs font-bold whitespace-nowrap block ${item.status === 'Ditolak' ? 'text-red-600' : ['Disetujui', 'Motor Terkirim', 'Selesai'].includes(item.status) ? 'text-blue-600' : 'text-slate-400'}`}>
                            {item.status === 'Ditolak' ? 'Ditolak' : 
                             ['Disetujui', 'Motor Terkirim', 'Selesai'].includes(item.status) ? 'Disetujui' : 'Verifikasi'}
                          </span>
                        </div>
                      </div>

                      {/* Step 3: Penyerahan / Motor Terkirim */}
                      <div className="relative z-10 flex flex-col items-center gap-2">
                         <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors bg-white ${
                            ['Motor Terkirim', 'Selesai'].includes(item.status)
                              ? 'border-blue-500 text-blue-500 shadow-sm'
                              : 'border-slate-200 text-slate-300'
                        }`}>
                          <Bike size={14} className={['Motor Terkirim', 'Selesai'].includes(item.status) ? "text-blue-500" : ""} />
                        </div>
                        <div className="text-center">
                          <span className={`text-[10px] sm:text-xs font-bold whitespace-nowrap block ${['Motor Terkirim', 'Selesai'].includes(item.status) ? 'text-blue-600' : 'text-slate-400'}`}>
                            Diserahkan
                          </span>
                        </div>
                      </div>

                      {/* Step 4: Selesai */}
                      <div className="relative z-10 flex flex-col items-center gap-2">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors bg-white ${
                            item.status === 'Selesai'
                              ? 'border-green-500 text-green-500 shadow-sm'
                              : 'border-slate-200 text-slate-300'
                        }`}>
                          <Flag size={14} className={item.status === 'Selesai' ? "text-green-500" : ""} />
                        </div>
                        <div className="text-center">
                          <span className={`text-[10px] sm:text-xs font-bold whitespace-nowrap block ${item.status === 'Selesai' ? 'text-green-600' : 'text-slate-400'}`}>Selesai</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Motor Info */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Unit Motor</h4>
                    <p className="font-bold text-lg text-slate-900">{item.motor_name}</p>
                    <p className="text-[10px] text-slate-400 font-mono uppercase">ID: {item.id.split('-')[0]}</p>
                  </div>

                  {/* Schedule */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                    <div className="space-y-3 bg-white p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={14} /> Pengambilan
                      </h4>
                      <p className="text-sm font-semibold">{item.start_date}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12}/> {item.start_time}</p>
                    </div>
                    <div className="space-y-3 bg-white p-4 rounded-xl">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                        <Calendar size={14} /> Pengembalian
                      </h4>
                      <p className="text-sm font-semibold">{item.end_date}</p>
                      <p className="text-xs text-slate-500 flex items-center gap-1"><Clock size={12}/> {item.end_time}</p>
                    </div>
                  </div>

                  {/* Delivery & Notes */}
                  <div className="space-y-4 pt-2">
                    <div className="flex justify-between items-center p-3 bg-white rounded-xl">
                      <span className="text-xs font-bold text-slate-500 uppercase">Antar Jemput</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-md ${item.is_delivery ? 'bg-blue-600 text-white' : 'bg-slate-200 text-slate-500'}`}>
                        {item.is_delivery ? 'YA' : 'TIDAK'}
                      </span>
                    </div>
                    
                    {item.notes && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Catatan</h4>
                        <p className="text-sm text-slate-600 bg-white p-3 rounded-xl italic">&quot;{item.notes}&quot;</p>
                      </div>
                    )}
                  </div>

                  {/* Rejection Reason & Appeal */}
                  {item.status === 'Ditolak' && item.rejection_reason && (
                    <div className="p-4 bg-red-50 rounded-xl border border-red-100 space-y-3">
                      <p className="text-xs text-red-700 font-bold uppercase tracking-widest">Alasan Penolakan Owner:</p>
                      <p className="text-sm italic text-red-600">&quot;{item.rejection_reason}&quot;</p>
                      
                      <button 
                        onClick={() => {
                          const appeal = prompt('Masukkan alasan banding Anda:');
                          if(appeal) submitAppeal(item.id, appeal);
                        }}
                        className="text-xs bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition"
                      >
                        Ajukan Banding
                      </button>
                    </div>
                  )}

                  {/* Payment Summary */}
                  <div className="border-t border-slate-200 pt-6">
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-slate-900 flex items-center gap-2">
                        <CreditCard size={18} className="text-blue-600" /> Total Pembayaran
                      </h4>
                      <p className="text-2xl font-black text-blue-600">Rp {item.total_price.toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        </div>
      </div>
    </div>
  );
}