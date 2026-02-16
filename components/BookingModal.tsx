'use client';

import { useState, useEffect, useMemo } from 'react';
import { X, ArrowLeft, Info, Loader2, ExternalLink } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Definisikan Interface untuk Profile
interface UserProfile {
  full_name: string | null;
  phone: string | null;
  address: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  city: string | null;
  province: string | null;
  ktp_url: string | null;
  sim_url: string | null;
}

// 1. Define the Interface to replace 'any'
export interface Motor {
  id: string;
  name: string;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  weekendPrice: number;
  transmission: string;
  fuel: string;
  rating: number;
  image?: string;
}

interface BookingModalProps {
  motor: Motor;
  onClose: () => void;
}

export default function BookingModal({ motor, onClose }: BookingModalProps) {
  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [isDelivery, setIsDelivery] = useState(false);
  const [bookingNotes, setBookingNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const deliveryFee = 15000;

  // Hitung jumlah hari sewa
  const rentalDays = useMemo(() => {
    if (!startDate || !endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 0 ? 1 : diffDays;
  }, [startDate, endDate]);

  // Hitung total harga berdasarkan hari dengan sistem pricing yang optimal
  const rentalPrice = useMemo(() => {
    if (rentalDays >= 30) {
      // Untuk sewa bulanan
      const months = Math.floor(rentalDays / 30);
      const remainingDays = rentalDays % 30;
      return (months * motor.monthlyPrice) + (remainingDays * motor.dailyPrice);
    } else if (rentalDays >= 7) {
      // Untuk sewa mingguan
      const weeks = Math.floor(rentalDays / 7);
      const remainingDays = rentalDays % 7;
      return (weeks * motor.weeklyPrice) + (remainingDays * motor.dailyPrice);
    } else if (rentalDays === 1 && startDate) {
      // Untuk sewa 1 hari, cek apakah weekend
      const date = new Date(startDate);
      const dayOfWeek = date.getDay();
      // Jika Sabtu (6) atau Minggu (0), gunakan harga weekend
      if (dayOfWeek === 0 || dayOfWeek === 6) {
        return motor.weekendPrice;
      }
      return motor.dailyPrice;
    } else {
      // Untuk sewa harian (2-6 hari)
      return motor.dailyPrice * rentalDays;
    }
  }, [rentalDays, startDate, motor.dailyPrice, motor.weeklyPrice, motor.monthlyPrice, motor.weekendPrice]);

  const totalPrice = rentalPrice + (isDelivery ? deliveryFee : 0);

  // Cek apakah ada hari weekend
  const isWeekendIncluded = useMemo(() => {
    if (!startDate || !endDate) return false;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start);
    while (current <= end) {
      const day = current.getDay();
      if (day === 0 || day === 6) return true; // 0 = Sunday, 6 = Saturday
      current.setDate(current.getDate() + 1);
    }
    return false;
  }, [startDate, endDate]);

  // Fetch data profil saat modal dibuka
  useEffect(() => {
    const getProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      
      // Redirect to login if not authenticated
      if (!user) {
        alert('Silakan login terlebih dahulu untuk melakukan pemesanan');
        router.push('/login');
        onClose();
        return;
      }
      
      if (user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (data) setProfile(data as UserProfile);
      }
    };
    getProfile();
  }, [supabase, router, onClose]);

  const handleBooking = async () => {
    // Validasi sederhana sebelum kirim
    if (!startDate || !endDate || !startTime || !endTime) {
      alert("Mohon lengkapi tanggal dan jam sewa di langkah pertama.");
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        alert("Silakan login terlebih dahulu");
        router.push('/login');
        return;
      }

      // 1. Cek apakah user sudah punya data KTP/SIM di profil
      const { data: profile } = await supabase
        .from('profiles')
        .select('ktp_url, sim_url')
        .eq('id', user.id)
        .single();

      if (!profile?.ktp_url || !profile?.sim_url) {
        alert("Mohon lengkapi foto KTP dan SIM di halaman Profil sebelum memesan.");
        router.push('/profile');
        return;
      }

      // 2. Insert ke tabel bookings (Gunakan data dari state modal)
      const { error } = await supabase.from('bookings').insert({
        user_id: user.id,
        motor_id: motor.id,
        motor_name: motor.name,
        start_date: startDate,
        end_date: endDate,
        start_time: startTime,
        end_time: endTime,
        total_price: totalPrice,
        is_delivery: isDelivery,
        notes: bookingNotes,
        status: 'Menunggu Konfirmasi'
      });

      if (error) throw error;

      alert("Pemesanan Berhasil dikirim! Tim kami akan segera menghubungi Anda.");
      onClose();
      router.push('/status');
    } catch (err: unknown) {
      // Type guard untuk mengecek error
      if (err instanceof Error) {
        alert(err.message);
      } else {
        alert("Terjadi kesalahan yang tidak diketahui");
      }
    } finally {
      setSubmitting(false);
    }
  };

  // Logic tombol "Lanjutkan ke Data Pribadi"
  const handleNextStep = () => {
    if (!profile?.ktp_url || !profile?.sim_url || !profile?.address) {
      alert("Data profil Anda belum lengkap (KTP/SIM/Alamat). Silakan lengkapi terlebih dahulu di halaman profil.");
      router.push('/profile');
      return;
    }
    setStep(2);
  };

  return (
    <div className="fixed inset-0 bg-[#1a1a1a]/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4 overflow-y-auto animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl relative my-8 max-h-[90vh] flex flex-col animate-in zoom-in-95 slide-in-from-bottom-4 duration-300">
        
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-br from-white to-[#FAF9F6] p-6 border-b border-[#1a1a1a]/10 z-10 rounded-t-3xl flex justify-between items-center gap-3">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="hover:bg-[#FF6B35]/10 p-2 rounded-xl transition flex-shrink-0 group">
                <ArrowLeft size={20} className="text-[#1a1a1a] group-hover:text-[#FF6B35] transition-colors" />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black text-[#1a1a1a] tracking-tight truncate">
                {step === 1 ? 'Booking Motor' : 'Data Pemesan'}
              </h2>
              {step === 1 && <p className="text-sm text-[#FF6B35] font-bold mt-0.5 truncate">{motor.name}</p>}
            </div>
          </div>
          <button onClick={onClose} className="text-[#1a1a1a]/40 hover:text-[#FF6B35] transition p-2 hover:bg-[#FF6B35]/10 rounded-xl flex-shrink-0">
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Product Info Card */}
              <div className="flex gap-4 p-5 bg-gradient-to-br from-[#FF6B35]/5 via-[#FAF9F6] to-[#00D9FF]/5 rounded-3xl border border-[#FF6B35]/20">
                <div className="relative w-24 h-24 bg-white rounded-2xl flex-shrink-0 overflow-hidden shadow-lg">
                  <Image 
                    src={motor.image || '/next.svg'} 
                    alt={motor.name} 
                    fill 
                    className="object-contain p-2"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-[#1a1a1a] text-lg tracking-tight">{motor.name}</h3>
                  <p className="text-sm text-[#1a1a1a]/60 mt-1 font-medium">{motor.transmission} • {motor.fuel}</p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-black text-[#FF6B35] text-2xl">Rp{motor.dailyPrice.toLocaleString()}</span>
                    <span className="text-[#1a1a1a]/40 text-xs font-bold">/hari</span>
                  </div>
                </div>
              </div>

              {/* Date & Time Selection */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1a1a1a]">Tanggal Mulai *</label>
                    <input 
                      type="date" 
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border-2 border-[#1a1a1a]/10 p-3 rounded-2xl text-sm outline-none focus:border-[#FF6B35] focus:bg-[#FF6B35]/5 transition font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1a1a1a]">Tanggal Selesai *</label>
                    <input 
                      type="date" 
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full border-2 border-[#1a1a1a]/10 p-3 rounded-2xl text-sm outline-none focus:border-[#FF6B35] focus:bg-[#FF6B35]/5 transition font-medium" 
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1a1a1a]">Waktu Mulai *</label>
                    <input 
                      type="time" 
                      value={startTime}
                      onChange={(e) => setStartTime(e.target.value)}
                      className="w-full border-2 border-[#1a1a1a]/10 p-3 rounded-2xl text-sm outline-none focus:border-[#FF6B35] focus:bg-[#FF6B35]/5 transition font-medium" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1a1a1a]">Waktu Selesai *</label>
                    <input 
                      type="time" 
                      value={endTime}
                      onChange={(e) => setEndTime(e.target.value)}
                      className="w-full border-2 border-[#1a1a1a]/10 p-3 rounded-2xl text-sm outline-none focus:border-[#FF6B35] focus:bg-[#FF6B35]/5 transition font-medium" 
                    />
                  </div>
                </div>
              </div>

              {/* Delivery Option */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-[#1a1a1a]/10 cursor-pointer hover:border-[#FF6B35] hover:bg-[#FF6B35]/5 transition">
                  <input 
                    type="checkbox" 
                    checked={isDelivery}
                    onChange={(e) => setIsDelivery(e.target.checked)}
                    className="w-5 h-5 accent-[#FF6B35] cursor-pointer" 
                  />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-[#1a1a1a] block">Butuh Antar Jemput Motor</span>
                    <span className="text-xs text-[#00D9FF] font-bold">Rp 15.000</span>
                  </div>
                </label>
              </div>

              {/* Booking Notes */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a1a1a]">
                  Catatan Pemesanan
                </label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="Tambahkan catatan atau permintaan khusus untuk pemesanan Anda (opsional)"
                  className="w-full border-2 border-[#1a1a1a]/10 p-3 rounded-2xl text-sm outline-none focus:border-[#FF6B35] focus:bg-[#FF6B35]/5 transition resize-none font-medium"
                  rows={3}
                />
              </div>

              {/* Terms and Conditions Agreement */}
              <div className="space-y-3">
                <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-amber-200 p-4">
                  <label className="flex items-start gap-3 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={agreedToTerms}
                      onChange={(e) => setAgreedToTerms(e.target.checked)}
                      className="w-5 h-5 accent-[#FF6B35] cursor-pointer mt-0.5 shrink-0" 
                    />
                    <div className="flex-1">
                      <span className="text-sm font-bold text-[#1a1a1a] block leading-relaxed">
                        Saya telah membaca, memahami, dan menyetujui{' '}
                        <a 
                          href="/syarat-ketentuan" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-[#FF6B35] hover:text-[#FF8F5F] underline inline-flex items-center gap-1 font-black"
                          onClick={(e) => e.stopPropagation()}
                        >
                          Syarat & Ketentuan Sewa Motor
                          <ExternalLink size={14} />
                        </a>
                      </span>
                    </div>
                  </label>
                </div>
                {!agreedToTerms && (
                  <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-2xl border border-amber-200">
                    <Info size={14} />
                    <span className="font-bold">Anda harus menyetujui Syarat & Ketentuan untuk melanjutkan pemesanan</span>
                  </div>
                )}
              </div>

              {/* Price Summary */}
              <div className="bg-gradient-to-br from-[#FAF9F6] to-[#FFE8DD]/30 p-6 rounded-3xl space-y-4 border border-[#FF6B35]/20">
                <h3 className="font-black text-[#1a1a1a] text-sm uppercase tracking-wider">Ringkasan Pembayaran</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-[#1a1a1a]/70 font-medium">
                    <span>
                      Sewa Motor ({rentalDays} hari)
                      {rentalDays >= 30 && ' (Bulanan)'}
                      {rentalDays >= 7 && rentalDays < 30 && ' (Mingguan)'}
                      {rentalDays === 1 && startDate && (() => {
                        const date = new Date(startDate);
                        const dayOfWeek = date.getDay();
                        return (dayOfWeek === 0 || dayOfWeek === 6) ? ' (Weekend)' : '';
                      })()}
                    </span>
                    <span className="font-bold text-[#1a1a1a]">Rp{rentalPrice.toLocaleString()}</span>
                  </div>
                  
                  {/* Weekend Info */}
                  {isWeekendIncluded && rentalDays > 1 && (
                    <div className="flex items-center gap-2 text-xs text-amber-700 bg-amber-50 p-3 rounded-2xl border border-amber-200">
                      <Info size={14} />
                      <span className="font-bold">Termasuk hari weekend dalam periode sewa</span>
                    </div>
                  )}
                  
                  {isDelivery && (
                    <div className="flex justify-between text-sm text-[#1a1a1a]/70 font-medium">
                      <span>Layanan Antar Jemput</span>
                      <span className="text-[#00D9FF] font-bold">Rp 15.000</span>
                    </div>
                  )}
                  <div className="border-t-2 border-[#1a1a1a]/10 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-[#1a1a1a]">Total Pembayaran</span>
                      <span className="text-3xl font-black text-[#FF6B35]">
                        Rp{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  {/* Pricing Info */}
                  <div className="border-t border-[#1a1a1a]/10 pt-4 mt-4 space-y-1.5">
                    <p className="text-[10px] text-[#1a1a1a]/40 font-black uppercase tracking-widest">Referensi Harga</p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#1a1a1a]/60 font-medium">
                      <div>Harian: Rp{motor.dailyPrice.toLocaleString()}</div>
                      <div>Weekend: Rp{motor.weekendPrice.toLocaleString()}</div>
                      <div>Mingguan: Rp{motor.weeklyPrice.toLocaleString()}</div>
                      <div>Bulanan: Rp{motor.monthlyPrice.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Continue Button */}
              <button 
                onClick={handleNextStep}
                disabled={!agreedToTerms}
                className="group relative w-full bg-[#1a1a1a] text-white font-black py-4 rounded-2xl overflow-hidden transition-all shadow-lg hover:shadow-2xl hover:shadow-[#1a1a1a]/30 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] to-[#FF8F5F] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative uppercase tracking-wide text-sm">Lanjutkan ke Data Pribadi</span>
              </button>
            </div>
          ) : (
            /* Step 2: Personal Data Form */
            <form className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="font-black text-[#1a1a1a] tracking-tight">Informasi Pribadi</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Nama Lengkap *" 
                    defaultValue={profile?.full_name ?? ''} 
                    name="full_name"
                    placeholder="Contoh: John Doe"
                    readOnly={true}
                  />
                  <InputField 
                    label="No WhatsApp *" 
                    defaultValue={profile?.phone ?? ''} 
                    name="phone"
                    placeholder="08123456789"
                    readOnly={true}
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="font-black text-[#1a1a1a] tracking-tight">Alamat Domisili</h3>
                <InputField 
                  label="Alamat Tempat Tinggal *" 
                  defaultValue={profile?.address ?? ''} 
                  name="address"
                  placeholder="Jalan, nomor rumah, RT/RW"
                  readOnly={true}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Kelurahan *" 
                    defaultValue={profile?.kelurahan ?? ''} 
                    name="kelurahan"
                    placeholder="Contoh: Jebres"
                    readOnly={true}
                  />
                  <InputField 
                    label="Kecamatan *" 
                    defaultValue={profile?.kecamatan ?? ''} 
                    name="kecamatan"
                    placeholder="Contoh: Jebres"
                    readOnly={true}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField 
                    label="Kota/Kabupaten *" 
                    defaultValue={profile?.city ?? ''} 
                    name="city"
                    placeholder="Contoh: Surakarta"
                    readOnly={true}
                  />
                  <InputField 
                    label="Provinsi *" 
                    defaultValue={profile?.province ?? ''} 
                    name="province"
                    placeholder="Contoh: Jawa Tengah"
                    readOnly={true}
                  />
                </div>
              </div>

              {/* Document Status */}
              {profile?.ktp_url && profile?.sim_url && (
                <div className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl border-2 border-green-200 flex items-center gap-3">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg">
                    ✓
                  </div>
                  <div>
                    <p className="text-sm font-black text-green-800">Dokumen Terverifikasi</p>
                    <p className="text-xs text-green-600 font-bold">Foto KTP & SIM C sudah tersedia di profil Anda.</p>
                  </div>
                </div>
              )}

              {/* Info Notice */}
              <div className="bg-gradient-to-br from-[#00D9FF]/10 to-[#00D9FF]/5 p-5 rounded-3xl flex gap-3 border-2 border-[#00D9FF]/20">
                <Info size={20} className="text-[#00D9FF] shrink-0 mt-0.5" />
                <p className="text-xs text-[#1a1a1a]/70 leading-relaxed font-medium">
                  Dengan menekan tombol <b className="text-[#1a1a1a]">Kirim Pemesanan</b>, Anda menyetujui syarat & ketentuan sewa motor kami. 
                  Data Anda akan dijaga kerahasiaannya.
                </p>
              </div>

              {/* Submit Button */}
              <button 
                type="button"
                onClick={handleBooking}
                disabled={submitting}
                className="group relative w-full bg-gradient-to-r from-green-600 to-emerald-600 text-white font-black py-4 rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg shadow-green-200 hover:shadow-xl hover:shadow-green-300 flex justify-center items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wide text-sm hover:scale-105"
              >
                {submitting && <Loader2 className="animate-spin" size={20} />}
                Kirim Pemesanan
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

function InputField({ label, defaultValue, name, placeholder, readOnly }: { label: string, defaultValue?: string, name: string, placeholder?: string, readOnly?: boolean }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-[#1a1a1a]">{label}</label>
      <input 
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full border-2 border-[#1a1a1a]/10 p-3 rounded-2xl text-sm focus:border-[#FF6B35] focus:bg-[#FF6B35]/5 outline-none transition font-medium ${readOnly ? 'bg-[#FAF9F6] cursor-not-allowed' : ''}`}
      />
    </div>
  );
}