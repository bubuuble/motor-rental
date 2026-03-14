"use client";

import { useState, useEffect, useMemo } from "react";
import { X, ArrowLeft, Info, Loader2, ExternalLink } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
  is_student: boolean;
  student_status_approved: boolean;
}

// 1. Define the Interface to replace 'any'
export interface Motor {
  id: string;
  name: string;
  description?: string;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
  weekendPrice: number;
  transmission: string;
  fuel: string;
  rating: number;
  image?: string;
  year?: string;
  cc?: string;
  brand?: string;
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
  const [bookingNotes, setBookingNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [bookingTime, setBookingTime] = useState("");
  const [rentalType, setRentalType] = useState<"daily" | "weekly" | "monthly" | "weekend">(
    "daily",
  );
  const [rentalDuration, setRentalDuration] = useState(1);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const deliveryFee = 15000;
  const weekendPackageFee = 15000;
  const weekendPackageDays = 2;
  const depositFee = 100000;

  const todayDate = useMemo(() => {
    const tzOffset = (new Date()).getTimezoneOffset() * 60000;
    return (new Date(Date.now() - tzOffset)).toISOString().split("T")[0];
  }, []);

  // Hitung tanggal selesai berdasarkan tipe dan durasi sewa
  useEffect(() => {
    if (!startDate) return;

    const start = new Date(startDate);
    const end = new Date(start);

    if (rentalType === "daily") {
      end.setDate(start.getDate() + rentalDuration);
    } else if (rentalType === "weekly") {
      end.setDate(start.getDate() + rentalDuration * 7);
    } else if (rentalType === "monthly") {
      end.setMonth(start.getMonth() + rentalDuration);
    } else if (rentalType === "weekend") {
      end.setDate(start.getDate() + weekendPackageDays);
    }

    setEndDate(end.toISOString().split("T")[0]);
  }, [startDate, rentalType, rentalDuration, weekendPackageDays]);

  useEffect(() => {
    if (!startDate || rentalType !== "daily" || rentalDuration !== 1) return;
    const selectedDay = new Date(startDate).getDay();
    if (selectedDay === 0 || selectedDay === 6) {
      setRentalType("weekend");
      setRentalDuration(weekendPackageDays);
    }
  }, [startDate, rentalType, rentalDuration, weekendPackageDays]);

  useEffect(() => {
    if (rentalType === "weekend" && rentalDuration !== weekendPackageDays) {
      setRentalDuration(weekendPackageDays);
    }
  }, [rentalType, rentalDuration, weekendPackageDays]);

  // Hitung total harga berdasarkan tipe sewa
  const baseRentalPrice = useMemo(() => {
    if (rentalType === "monthly") {
      return motor.monthlyPrice * rentalDuration;
    } else if (rentalType === "weekly") {
      return motor.weeklyPrice * rentalDuration;
    } else if (rentalType === "weekend") {
      return motor.dailyPrice * weekendPackageDays;
    } else {
      return motor.dailyPrice * rentalDuration;
    }
  }, [
    rentalType,
    rentalDuration,
    motor.dailyPrice,
    motor.weeklyPrice,
    motor.monthlyPrice,
    weekendPackageDays,
  ]);

  const weekendPackageCharge = rentalType === "weekend" ? weekendPackageFee : 0;
  const rentalPrice = baseRentalPrice + weekendPackageCharge;

  // Cek apakah user adalah mahasiswa terverifikasi
  const isVerifiedStudent = useMemo(() => {
    const isVerified = profile?.is_student === true && profile?.student_status_approved === true;
    console.log("[DEBUG] isVerifiedStudent:", isVerified);
    console.log("[DEBUG] profile?.is_student:", profile?.is_student);
    console.log("[DEBUG] profile?.student_status_approved:", profile?.student_status_approved);
    return isVerified;
  }, [profile]);

  // Hitung diskon mahasiswa
  const studentDiscount = useMemo(() => {
    console.log("[DEBUG] Calculating discount - isVerifiedStudent:", isVerifiedStudent, "rentalType:", rentalType, "rentalDuration:", rentalDuration);
    if (!isVerifiedStudent) {
      console.log("[DEBUG] No discount - not verified student");
      return 0;
    }
    
    if (rentalType === "daily") {
      // Diskon 10rb per hari untuk sewa harian
      const discount = 10000 * rentalDuration;
      console.log("[DEBUG] Daily discount:", discount);
      return discount;
    } else if (rentalType === "weekly") {
      // Diskon 5rb per hari untuk sewa mingguan (7 hari)
      const discount = 5000 * rentalDuration * 7;
      console.log("[DEBUG] Weekly discount:", discount);
      return discount;
    }
    console.log("[DEBUG] No discount - monthly rental");
    return 0; // Tidak ada diskon untuk bulanan
  }, [isVerifiedStudent, rentalType, rentalDuration]);

  const totalPrice =
    rentalPrice - studentDiscount + (isDelivery ? deliveryFee : 0) + depositFee;

  // Fetch data profil saat modal dibuka
  useEffect(() => {
    let isMounted = true;

    const getProfile = async () => {
      try {
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!isMounted) return;

        // Redirect to login if not authenticated
        if (!user) {
          alert("Silakan login terlebih dahulu untuk melakukan pemesanan");
          router.push("/login");
          onClose();
          return;
        }

        if (user) {
          const { data } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();

          if (!isMounted) return;

          if (data) {
            console.log("[DEBUG] Profile loaded:", data);
            console.log("[DEBUG] is_student:", data.is_student);
            console.log("[DEBUG] student_status_approved:", data.student_status_approved);
            setProfile(data as UserProfile);
          }
        }
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        console.error("Failed to load profile:", error);
      }
    };

    getProfile();

    return () => {
      isMounted = false;
    };
  }, [supabase, router, onClose]);

  const handleBooking = async () => {
    // Validasi sederhana sebelum kirim
    if (!startDate || !endDate || !bookingTime) {
      alert("Mohon lengkapi tanggal dan jam sewa di langkah pertama.");
      setStep(1);
      return;
    }

    if (!bookingNotes || bookingNotes.trim() === "") {
      alert("Mohon isi alasan pemesanan.");
      setStep(1);
      return;
    }

    setSubmitting(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        alert("Silakan login terlebih dahulu");
        router.push("/login");
        return;
      }

      // 1. Cek apakah user sudah punya data KTP/SIM di profil
      const { data: profile } = await supabase
        .from("profiles")
        .select("ktp_url, sim_url")
        .eq("id", user.id)
        .single();

      if (!profile?.ktp_url || !profile?.sim_url) {
        alert(
          "Mohon lengkapi foto KTP dan SIM di halaman Profil sebelum memesan.",
        );
        router.push("/profile");
        return;
      }

      // 2. Insert ke tabel bookings (Gunakan data dari state modal)
      const { error } = await supabase.from("bookings").insert({
        user_id: user.id,
        motor_id: motor.id,
        motor_name: motor.name,
        start_date: startDate,
        end_date: endDate,
        start_time: bookingTime,
        end_time: bookingTime,
        rental_type: rentalType,
        rental_duration: rentalDuration,
        total_price: totalPrice,
        is_delivery: isDelivery,
        notes: bookingNotes,
        status: "Menunggu Konfirmasi",
      });

      if (error) throw error;

      alert(
        "Pemesanan Berhasil dikirim! Tim kami akan segera menghubungi Anda.",
      );
      onClose();
      router.push("/status");
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
    const p = profile;
    if (!p?.ktp_url || !p?.sim_url || !p?.address || !p?.phone || !p?.full_name || !p?.kelurahan || !p?.kecamatan || !p?.city || !p?.province) {
      alert(
        "Data profil Anda belum lengkap. Silakan lengkapi seluruh data (KTP/SIM/Alamat lengkap) terlebih dahulu di halaman profil.",
      );
      router.push("/profile");
      return;
    }

    if (!bookingNotes || bookingNotes.trim() === "") {
      alert("Mohon isi alasan pemesanan.");
      return;
    }

    if (rentalType === "weekend" && startDate) {
      const startDay = new Date(startDate).getDay();
      if (startDay !== 6) {
        alert("Paket Weekend wajib dimulai hari Sabtu (periode Sabtu–Senin).");
        return;
      }
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
              <button
                onClick={() => setStep(1)}
                className="hover:bg-[#2563EB]/10 p-2 rounded-xl transition flex-shrink-0 group"
              >
                <ArrowLeft
                  size={20}
                  className="text-[#1a1a1a] group-hover:text-[#2563EB] transition-colors"
                />
              </button>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl font-black text-[#1a1a1a] tracking-tight truncate">
                {step === 1 ? "Booking Motor" : "Data Pemesan"}
              </h2>
              {step === 1 && (
                <p className="text-sm text-[#2563EB] font-bold mt-0.5 truncate">
                  {motor.name}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-[#1a1a1a]/40 hover:text-[#2563EB] transition p-2 hover:bg-[#2563EB]/10 rounded-xl flex-shrink-0"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {step === 1 ? (
            <div className="space-y-6">
              {/* Product Info Card */}
              <div className="flex gap-4 p-5 bg-gradient-to-br from-[#2563EB]/5 via-[#FAF9F6] to-[#DC2626]/5 rounded-3xl border border-[#2563EB]/20">
                <div className="relative w-24 h-24 bg-white rounded-2xl flex-shrink-0 overflow-hidden shadow-lg">
                  <Image
                    src={motor.image || "/next.svg"}
                    alt={motor.name}
                    fill
                    className="object-contain p-2"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-[#1a1a1a] text-lg tracking-tight">
                    {motor.name}
                  </h3>
                  <p className="text-sm text-[#1a1a1a]/60 mt-1 font-medium">
                    {motor.transmission} • {motor.fuel}
                  </p>
                  <div className="mt-3 flex items-baseline gap-1">
                    <span className="font-black text-[#2563EB] text-2xl">
                      Rp{motor.dailyPrice.toLocaleString()}
                    </span>
                    <span className="text-[#1a1a1a]/40 text-xs font-bold">
                      /hari
                    </span>
                  </div>
                </div>
              </div>

              {/* Rental Type Selection */}
              <div className="space-y-4">
                <label className="text-sm font-bold text-[#1a1a1a]">
                  Tipe Sewa *
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <button
                    type="button"
                    onClick={() => setRentalType("daily")}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                      rentalType === "daily"
                        ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]"
                        : "border-[#1a1a1a]/10 hover:border-[#2563EB]/50"
                    }`}
                  >
                    <div className="text-lg mb-1">📅</div>
                    Harian
                    <div className="text-xs font-normal text-[#1a1a1a]/60 mt-1">
                      Rp{motor.dailyPrice.toLocaleString()}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentalType("weekly")}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                      rentalType === "weekly"
                        ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]"
                        : "border-[#1a1a1a]/10 hover:border-[#2563EB]/50"
                    }`}
                  >
                    <div className="text-lg mb-1">📆</div>
                    Mingguan
                    <div className="text-xs font-normal text-[#1a1a1a]/60 mt-1">
                      Rp{motor.weeklyPrice.toLocaleString()}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setRentalType("monthly")}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                      rentalType === "monthly"
                        ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]"
                        : "border-[#1a1a1a]/10 hover:border-[#2563EB]/50"
                    }`}
                  >
                    <div className="text-lg mb-1">🗓️</div>
                    Bulanan
                    <div className="text-xs font-normal text-[#1a1a1a]/60 mt-1">
                      Rp{motor.monthlyPrice.toLocaleString()}
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setRentalType("weekend");
                      setRentalDuration(weekendPackageDays);
                    }}
                    className={`p-4 rounded-2xl border-2 font-bold text-sm transition-all ${
                      rentalType === "weekend"
                        ? "border-[#2563EB] bg-[#2563EB]/10 text-[#2563EB]"
                        : "border-[#1a1a1a]/10 hover:border-[#2563EB]/50"
                    }`}
                  >
                    <div className="text-lg mb-1">🎉</div>
                    Weekend
                    <div className="text-xs font-normal text-[#1a1a1a]/60 mt-1">
                      2 hari + Rp15.000
                    </div>
                  </button>
                </div>
              </div>

              {/* Duration & Date Selection */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1a1a1a]">
                      {rentalType === "daily" && "Jumlah Hari *"}
                      {rentalType === "weekly" && "Jumlah Minggu *"}
                      {rentalType === "monthly" && "Jumlah Bulan *"}
                      {rentalType === "weekend" && "Durasi Weekend *"}
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={
                        rentalType === "daily"
                          ? 30
                          : rentalType === "weekly"
                            ? 12
                            : rentalType === "monthly"
                              ? 12
                              : weekendPackageDays
                      }
                      value={rentalDuration}
                      onChange={(e) =>
                        setRentalDuration(parseInt(e.target.value) || 1)
                      }
                      disabled={rentalType === "weekend"}
                      className="w-full border-2 border-[#1a1a1a]/10 p-3 rounded-2xl text-sm outline-none focus:border-[#2563EB] focus:bg-[#2563EB]/5 transition font-medium disabled:bg-[#FAF9F6] disabled:cursor-not-allowed"
                    />
                    {rentalType === "weekend" && (
                      <p className="text-xs text-[#1a1a1a]/55">
                        Paket Weekend otomatis durasi Sabtu–Senin.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[#1a1a1a]">
                      Tanggal Mulai *
                    </label>
                    <input
                      type="date"
                      min={todayDate}
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full border-2 border-[#1a1a1a]/10 p-3 rounded-2xl text-sm outline-none focus:border-[#2563EB] focus:bg-[#2563EB]/5 transition font-medium"
                    />
                  </div>
                </div>

                {/* Display End Date (Read Only) */}
                {endDate && (
                  <div className="p-4 bg-[#FAF9F6] rounded-2xl border-2 border-[#1a1a1a]/5">
                    <p className="text-xs text-[#1a1a1a]/60 font-bold uppercase tracking-wider mb-1">
                      Tanggal Selesai
                    </p>
                    <p className="font-bold text-[#1a1a1a]">
                      {new Date(endDate).toLocaleDateString("id-ID", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                )}

                {/* Single Time Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-[#1a1a1a]">
                    Waktu Pengambilan & Pengembalian *
                  </label>
                  <select
                    value={bookingTime}
                    onChange={(e) => setBookingTime(e.target.value)}
                    className="w-full border-2 border-[#1a1a1a]/10 p-3 rounded-2xl text-sm outline-none focus:border-[#2563EB] focus:bg-[#2563EB]/5 transition font-medium bg-white"
                  >
                    <option value="" disabled>Pilih Jam</option>
                    {Array.from({ length: 17 }, (_, i) => i + 6).map((hour) => {
                      const timeString = `${hour.toString().padStart(2, '0')}:00`;
                      return (
                        <option key={timeString} value={timeString}>
                          {timeString}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-xs text-[#1a1a1a]/50">
                    Waktu pengambilan dan pengembalian akan sama
                  </p>
                  {rentalType === "weekend" && (
                    <p className="text-xs text-red-500 font-semibold">
                      Untuk hari Sabtu/Minggu tidak bisa sewa 1 hari, otomatis
                      masuk Paket Weekend (Sabtu–Senin).
                    </p>
                  )}
                </div>
              </div>

              {/* Delivery Option */}
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 bg-white rounded-2xl border-2 border-[#1a1a1a]/10 cursor-pointer hover:border-[#2563EB] hover:bg-[#2563EB]/5 transition">
                  <input
                    type="checkbox"
                    checked={isDelivery}
                    onChange={(e) => setIsDelivery(e.target.checked)}
                    className="w-5 h-5 accent-[#2563EB] cursor-pointer"
                  />
                  <div className="flex-1">
                    <span className="text-sm font-bold text-[#1a1a1a] block">
                      Butuh Antar Jemput Motor
                    </span>
                    <span className="text-xs text-[#2563EB] font-bold">
                      Rp 15.000 + biaya ojek online (menyesuaikan)
                    </span>
                    <p className="text-xs text-[#1a1a1a]/55 mt-1">
                      Biaya disesuaikan dari alamat jemput ke Rental Motor
                      Kukusan dan akan dikordinasikan saat tahap survey.
                    </p>
                  </div>
                </label>

                <div className="p-4 rounded-2xl border-2 border-[#2563EB]/20 bg-[#2563EB]/5">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-bold text-[#1a1a1a]">
                      Deposit Jaminan (Otomatis)
                    </span>
                    <span className="text-sm font-black text-[#2563EB]">
                      Rp 100.000
                    </span>
                  </div>
                  <p className="text-xs text-[#1a1a1a]/65 mt-2 leading-relaxed">
                    Bersedia menyerahkan uang deposit senilai Rp 100.000,-. Uang
                    deposit akan dikembalikan 1x24 jam setelah pengembalian
                    motor dengan syarat kondisi motor, STNK, helm dan lainnya
                    dalam kondisi baik sama seperti saat serah terima.
                  </p>
                </div>
              </div>

              {/* Booking Reason */}
              <div className="space-y-2">
                <label className="text-sm font-bold text-[#1a1a1a]">
                  Alasan Pemesanan <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={bookingNotes}
                  onChange={(e) => setBookingNotes(e.target.value)}
                  placeholder="jalan-jalan keliling jakarta"
                  className="w-full border-2 border-[#1a1a1a]/10 p-3 rounded-2xl text-sm outline-none focus:border-[#2563EB] focus:bg-[#2563EB]/5 transition resize-none font-medium"
                  rows={3}
                  required
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
                      className="w-5 h-5 accent-[#2563EB] cursor-pointer mt-0.5 shrink-0"
                    />
                    <div className="flex-1">
                      <span className="text-sm font-bold text-[#1a1a1a] block leading-relaxed">
                        Saya telah membaca, memahami, dan menyetujui{" "}
                        <a
                          href="/syarat-ketentuan"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-[#2563EB] hover:text-[#3B82F6] underline inline-flex items-center gap-1 font-black"
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
                    <span className="font-bold">
                      Anda harus menyetujui Syarat & Ketentuan untuk melanjutkan
                      pemesanan
                    </span>
                  </div>
                )}
              </div>

              {/* Student Status Info */}
              {profile && (
                <div className={`p-4 rounded-2xl border-2 ${isVerifiedStudent ? 'bg-green-50 border-green-200' : 'bg-amber-50 border-amber-200'}`}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl mt-0.5">{isVerifiedStudent ? '🎓' : '👤'}</span>
                    <div className="flex-1">
                      {isVerifiedStudent ? (
                        <>
                          <p className="font-bold text-green-700">
                            🎓 Status: Mahasiswa Terverifikasi
                          </p>
                          <p className="text-sm text-green-600">
                            Diskon khusus mahasiswa aktif! (10rb/hari untuk harian, 5rb/hari untuk mingguan)
                          </p>
                        </>
                      ) : (
                        <>
                          <p className="font-bold text-amber-700">
                            Status: Bukan Mahasiswa
                          </p>
                          <p className="text-sm text-amber-600">
                            Jadilah mahasiswa & upload KTM di halaman Profil untuk diskon spesial!
                          </p>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Price Summary */}
              <div className="bg-gradient-to-br from-[#FAF9F6] to-[#DBEAFE]/30 p-6 rounded-3xl space-y-4 border border-[#2563EB]/20">
                <h3 className="font-black text-[#1a1a1a] text-sm uppercase tracking-wider">
                  Ringkasan Pembayaran
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm text-[#1a1a1a]/70 font-medium">
                    <span>
                      {rentalType === "daily" &&
                        `Sewa Harian (${rentalDuration} hari)`}
                      {rentalType === "weekly" &&
                        `Sewa Mingguan (${rentalDuration} minggu)`}
                      {rentalType === "monthly" &&
                        `Sewa Bulanan (${rentalDuration} bulan)`}
                      {rentalType === "weekend" &&
                        "Paket Weekend (Sabtu–Senin)"}
                    </span>
                    <span className="font-bold text-[#1a1a1a]">
                      Rp{baseRentalPrice.toLocaleString()}
                    </span>
                  </div>

                  {/* Student Discount */}
                  {isVerifiedStudent && studentDiscount > 0 && (
                    <div className="flex justify-between text-sm font-medium">
                      <span className="text-green-600 flex items-center gap-1">
                        🎓 Diskon Mahasiswa
                        {rentalType === "daily" && " (10rb/hari)"}
                        {rentalType === "weekly" && " (5rb/hari)"}
                      </span>
                      <span className="text-green-600 font-bold">
                        -Rp{studentDiscount.toLocaleString()}
                      </span>
                    </div>
                  )}

                  {/* Show student status info if verified */}
                  {isVerifiedStudent && (
                    <div className="flex items-center gap-2 text-xs text-green-700 bg-green-50 p-3 rounded-2xl border border-green-200">
                      <Info size={14} />
                      <span className="font-bold">
                        Status mahasiswa terverifikasi - Diskon berlaku!
                      </span>
                    </div>
                  )}

                  {isDelivery && (
                    <div className="flex justify-between text-sm text-[#1a1a1a]/70 font-medium">
                      <span>Layanan Antar Jemput</span>
                      <span className="text-[#DC2626] font-bold">
                        Rp 15.000
                      </span>
                    </div>
                  )}

                  {isDelivery && (
                    <div className="text-xs text-[#1a1a1a]/55 leading-relaxed bg-white/60 rounded-xl p-3 border border-[#1a1a1a]/10">
                      Biaya ojek online dari alamat jemput ke Rental Motor
                      Kukusan menyesuaikan dan akan dikordinasikan saat tahap
                      survey.
                    </div>
                  )}

                  {weekendPackageCharge > 0 && (
                    <div className="flex justify-between text-sm text-[#1a1a1a]/70 font-medium">
                      <span>Biaya Paket Weekend</span>
                      <span className="text-[#DC2626] font-bold">
                        Rp 15.000
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between text-sm text-[#1a1a1a]/70 font-medium">
                    <span>Deposit Jaminan (dikembalikan)</span>
                    <span className="text-[#2563EB] font-bold">Rp 100.000</span>
                  </div>

                  <div className="text-xs text-[#1a1a1a]/55 leading-relaxed bg-white/60 rounded-xl p-3 border border-[#1a1a1a]/10">
                    Bersedia menyerahkan uang deposit senilai Rp 100.000,-. Uang
                    deposit akan dikembalikan 1x24 jam setelah pengembalian
                    motor dengan syarat kondisi motor, STNK, helm dan lainnya
                    dalam kondisi baik sama seperti saat serah terima.
                  </div>

                  <div className="border-t-2 border-[#1a1a1a]/10 pt-4 mt-4">
                    <div className="flex justify-between items-center">
                      <span className="font-black text-[#1a1a1a]">
                        Total Pembayaran
                      </span>
                      <span className="text-3xl font-black text-[#2563EB]">
                        Rp{totalPrice.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Pricing Info */}
                  <div className="border-t border-[#1a1a1a]/10 pt-4 mt-4 space-y-1.5">
                    <p className="text-[10px] text-[#1a1a1a]/40 font-black uppercase tracking-widest">
                      Referensi Harga
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-xs text-[#1a1a1a]/60 font-medium">
                      <div>Harian: Rp{motor.dailyPrice.toLocaleString()}</div>
                      <div>
                        Paket Weekend: 2 hari + Rp15.000
                      </div>
                      <div>
                        Mingguan: Rp{motor.weeklyPrice.toLocaleString()}
                      </div>
                      <div>
                        Bulanan: Rp{motor.monthlyPrice.toLocaleString()}
                      </div>
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
                <span className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative uppercase tracking-wide text-sm">
                  Lanjutkan ke Data Pribadi
                </span>
              </button>
            </div>
          ) : (
            /* Step 2: Personal Data Form */
            <form className="space-y-6">
              {/* Personal Info */}
              <div className="space-y-4">
                <h3 className="font-black text-[#1a1a1a] tracking-tight">
                  Informasi Pribadi
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Nama Lengkap *"
                    defaultValue={profile?.full_name ?? ""}
                    name="full_name"
                    placeholder="Contoh: John Doe"
                    readOnly={true}
                  />
                  <InputField
                    label="No WhatsApp *"
                    defaultValue={profile?.phone ?? ""}
                    name="phone"
                    placeholder="08123456789"
                    readOnly={true}
                  />
                </div>
              </div>

              {/* Address Section */}
              <div className="space-y-4">
                <h3 className="font-black text-[#1a1a1a] tracking-tight">
                  Alamat Domisili
                </h3>
                <InputField
                  label="Alamat Tempat Tinggal *"
                  defaultValue={profile?.address ?? ""}
                  name="address"
                  placeholder="Jalan, nomor rumah, RT/RW"
                  readOnly={true}
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Kelurahan *"
                    defaultValue={profile?.kelurahan ?? ""}
                    name="kelurahan"
                    placeholder="Contoh: Jebres"
                    readOnly={true}
                  />
                  <InputField
                    label="Kecamatan *"
                    defaultValue={profile?.kecamatan ?? ""}
                    name="kecamatan"
                    placeholder="Contoh: Jebres"
                    readOnly={true}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Kota/Kabupaten *"
                    defaultValue={profile?.city ?? ""}
                    name="city"
                    placeholder="Contoh: Surakarta"
                    readOnly={true}
                  />
                  <InputField
                    label="Provinsi *"
                    defaultValue={profile?.province ?? ""}
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
                    <p className="text-sm font-black text-green-800">
                      Dokumen Terverifikasi
                    </p>
                    <p className="text-xs text-green-600 font-bold">
                      Foto KTP & SIM C sudah tersedia di profil Anda.
                    </p>
                  </div>
                </div>
              )}

              {/* Info Notice */}
              <div className="bg-gradient-to-br from-[#DC2626]/10 to-[#DC2626]/5 p-5 rounded-3xl flex gap-3 border-2 border-[#DC2626]/20">
                <Info size={20} className="text-[#DC2626] shrink-0 mt-0.5" />
                <p className="text-xs text-[#1a1a1a]/70 leading-relaxed font-medium">
                  Dengan menekan tombol{" "}
                  <b className="text-[#1a1a1a]">Kirim Pemesanan</b>, Anda
                  menyetujui syarat & ketentuan sewa motor kami. Data Anda akan
                  dijaga kerahasiaannya.
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

function InputField({
  label,
  defaultValue,
  name,
  placeholder,
  readOnly,
}: {
  label: string;
  defaultValue?: string;
  name: string;
  placeholder?: string;
  readOnly?: boolean;
}) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-[#1a1a1a]">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`w-full border-2 border-[#1a1a1a]/10 p-3 rounded-2xl text-sm focus:border-[#2563EB] focus:bg-[#2563EB]/5 outline-none transition font-medium ${readOnly ? "bg-[#FAF9F6] cursor-not-allowed" : ""}`}
      />
    </div>
  );
}
