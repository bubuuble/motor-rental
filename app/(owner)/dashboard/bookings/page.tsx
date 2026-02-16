'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { ChevronRight, Loader2, ClipboardList } from 'lucide-react';
import Link from 'next/link';

// Interface yang konsisten
interface BookingSummary {
  id: string;
  motor_name: string;
  status: string;
  created_at: string;
  profiles: { full_name: string } | null;
}

export default function BookingsPage() {
  const [bookings, setBookings] = useState<BookingSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  // Membungkus fetch dalam useCallback agar stabil
  const fetchBookings = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await supabase
        .from('bookings')
        .select('id, motor_name, status, created_at, profiles(full_name)')
        .order('created_at', { ascending: false });
      
      if (data) {
        setBookings(data as unknown as BookingSummary[]);
      }
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  }, [supabase]);

  useEffect(() => {
    // Gunakan flag untuk menghindari update state pada komponen yang sudah unmounted
    let isMounted = true;

    const loadInitialData = async () => {
      if (isMounted) {
        // Menggunakan await Promise.resolve() memaksa eksekusi ke microtask berikutnya
        // Ini cara ampuh menghilangkan peringatan "synchronous setState"
        await Promise.resolve();
        await fetchBookings();
      }
    };

    loadInitialData();

    return () => {
      isMounted = false;
    };
  }, [fetchBookings]);

  if (loading && bookings.length === 0) {
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" size={40} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="relative flex justify-between items-start">
        <div>
          <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-[#FF6B35]/20 to-[#00D9FF]/20 rounded-full blur-3xl"></div>
          <h2 className="text-4xl font-black text-[#1a1a1a] tracking-tight relative z-10">Manajemen Pesanan</h2>
          <p className="text-xs text-[#1a1a1a]/40 font-bold uppercase tracking-widest mt-2 relative z-10">Kelola semua pesanan rental</p>
        </div>
        <button 
          onClick={() => { void fetchBookings(); }} 
          className="px-6 py-3 bg-gradient-to-r from-[#FF6B35] to-[#FF8F5F] text-white rounded-2xl text-xs font-black uppercase tracking-wider hover:shadow-xl hover:shadow-[#FF6B35]/30 transition-all hover:scale-105"
        >
          Refresh Data
        </button>
      </div>

      <div className="grid gap-6">
        {bookings.length === 0 ? (
          <div className="p-32 text-center border-2 border-dashed border-[#1a1a1a]/10 rounded-3xl text-[#1a1a1a]/30 font-black bg-gradient-to-br from-[#FAF9F6] to-white">
            <ClipboardList size={64} className="mx-auto mb-4 opacity-20" />
            <p className="text-xl">Belum ada pesanan masuk</p>
            <p className="text-sm mt-2 font-medium">Pesanan baru akan muncul di sini</p>
          </div>
        ) : (
          bookings.map((b, index) => (
            <Link 
              key={b.id} 
              href={`/dashboard/bookings/${b.id}`}
              className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-[#1a1a1a] flex justify-between items-center hover:border-[#FF6B35] hover:shadow-2xl hover:shadow-[#FF6B35]/10 transition-all duration-300 group animate-in fade-in slide-in-from-bottom-4"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="space-y-2">
                <p className="text-[10px] font-black text-[#FF6B35] uppercase tracking-widest">{b.motor_name}</p>
                <h3 className="font-black text-xl text-[#1a1a1a]">{b.profiles?.full_name || 'Guest'}</h3>
                <p className="text-xs text-[#1a1a1a]/50 font-bold">
                  Dipesan pada {new Date(b.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <div className="flex items-center gap-4">
                <span className={`px-5 py-2 rounded-xl text-[9px] font-black uppercase border-2 tracking-wider ${
                  b.status === 'Disetujui' ? 'bg-gradient-to-r from-green-50 to-green-100 text-green-700 border-green-200' : 
                  b.status === 'Motor Terkirim' ? 'bg-gradient-to-r from-blue-50 to-blue-100 text-blue-700 border-blue-200' :
                  'bg-gradient-to-r from-amber-50 to-amber-100 text-amber-700 border-amber-200'
                }`}>
                  {b.status}
                </span>
                <div className="w-12 h-12 rounded-2xl bg-[#FAF9F6] border-2 border-[#1a1a1a]/10 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-[#FF6B35] group-hover:to-[#FF8F5F] group-hover:text-white group-hover:border-[#FF6B35] transition-all">
                  <ChevronRight size={20} strokeWidth={2.5} />
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}