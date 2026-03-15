// app/(customer)/page.tsx
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import Hero from "@/components/Hero";
import AlurSewa from "@/components/Process";
import MotorCard from "@/components/MotorCard";
import BookingModal from "@/components/BookingModal";
import { createClient } from "@/utils/supabase/client";
import {
  AlertCircle,
  ArrowRight,
  Bike,
  CalendarDays,
  GraduationCap,
  Minus,
  Plus,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export interface Motor {
  id: string;
  name: string;
  description: string;
  daily_price: number;
  weekly_price: number;
  monthly_price: number;
  weekend_price: number;
  transmission: string;
  fuel: string;
  rating: number;
  image_url: string | null;
  year: string;
  cc: string;
  brand: string;
  status: string;
}

export default function HomePage() {
  const [selectedMotor, setSelectedMotor] = useState<Motor | null>(null);
  const [motors, setMotors] = useState<Motor[]>([]);
  const [rentedMotorIds, setRentedMotorIds] = useState<string[]>([]);
  const [topMotorIds, setTopMotorIds] = useState<string[]>([]);
  const [openRequirementIndex, setOpenRequirementIndex] = useState<number | null>(0);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [loadingMotors, setLoadingMotors] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const requirementItems = [
    {
      title: "01. Domisili / Stay di Depok",
      content:
        "Tempat tinggal sekarang di Depok atau tamu yang sedang stay di Depok (menunjukkan tiket, bukti pemesanan hotel, konser, dll).",
    },
    {
      title: "02. Bayar Saat Serah Terima",
      content:
        "Pembayaran full saat serah terima motor (sistem bayar pakai) dan kami tidak ada DP atau pembayaran apapun diawal.",
    },
    {
      title: "03. Dokumen Identitas Asli",
      content:
        "Bersedia menyerahkan min 2 dokumen identitas asli yang masih aktif selama pemakaian motor:\nA. e-KTP (wajib)\nB. KK\nC. SIM A\nD. Passport\nE. ID Card\nF. KTM\nG. Dokumen tambahan lain penyewa/penjamin\n(Poin B-G pilih salah satu).",
    },
    {
      title: "04. SIM C Aktif",
      content: "Wajib memiliki SIM C aktif (cukup diperlihatkan saja).",
    },
    {
      title: "05. Bersedia Disurvei",
      content:
        "Bersedia untuk disurvei setelah isi form & admin melakukan cek data.",
    },
    {
      title: "06. Deposit Jaminan",
      content:
        "Bersedia menyerahkan uang deposit senilai Rp 100.000,-. Uang deposit akan dikembalikan 1x24 jam setelah pengembalian motor dengan syarat kondisi motor, STNK, helm dan lainnya dalam kondisi baik sama seperti saat serah terima.",
    },
  ];

  const layananUtama = [
    {
      icon: CalendarDays,
      title: "Sewa Harian, Mingguan, Bulanan",
      desc: "Harga mengikuti jenis motor yang dipilih. Semakin panjang durasi sewa, harga per hari semakin hemat.",
    },
    {
      icon: Bike,
      title: "Antar – Jemput Kendaraan",
      desc: "Biaya dihitung dari tarif ojek online lokasi pengantaran ke Rental Motor Kukusan + Rp15.000 biaya layanan.",
    },
    {
      icon: GraduationCap,
      title: "Diskon Mahasiswa",
      desc: "Khusus mahasiswa dengan jaminan KTM aktif, mendapat potongan Rp10.000 per hari selama masa sewa.",
    },
    {
      icon: ShieldCheck,
      title: "Tanpa DP di Awal",
      desc: "Pembayaran dilakukan saat serah terima unit. Tidak ada biaya DP atau pembayaran lain sebelum proses selesai.",
    },
    {
      icon: Wrench,
      title: "Motor Selalu Prima",
      desc: "Motor selalu servis, diberikan 2 helm dan jas hujan.",
    },
  ] as { icon: LucideIcon; title: string; desc: string }[];

  const faqItems = [
    {
      title: "1. Bagaimana cara memesan motor di Rental Motor Kukusan?",
      content:
        "Anda dapat melakukan pemesanan melalui website resmi kami di rentalmotorkukusan.com.\nPilih jenis motor yang diinginkan, isi detail pemesanan, lalu ikuti langkah-langkah hingga proses selesai.\nKami juga menyediakan layanan pemesanan melalui WhatsApp apabila Anda memerlukan bantuan atau informasi lebih lanjut.",
    },
    {
      title: "2. Apa saja dokumen yang diperlukan untuk menyewa motor?",
      content:
        "Dokumen yang perlu disiapkan antara lain:\nBersedia menyerahkan min 2 dokumen identitas asli yang masih aktif selama pemakaian motor:\nA. e-KTP (wajib)\nB. KK\nC. SIM A\nD. Passport\nE. ID Card\nF. KTM\nG. Dokumen tambahan lain penyewa/penjamin\n(Poin B-G pilih salah satu).\nAkun Instagram aktif (untuk keperluan verifikasi).\nSeluruh dokumen akan diverifikasi terlebih dahulu sebelum pemesanan dikonfirmasi.",
    },
    {
      title: "3. Berapa usia minimum untuk menyewa motor?",
      content:
        "Penyewa minimal berusia 17 tahun dan wajib memiliki SIM C aktif.",
    },
    {
      title: "4. Apakah tersedia layanan antar–jemput kendaraan?",
      content:
        "Ya, kami menyediakan layanan antar–jemput motor.\nBiaya layanan dihitung sebagai berikut:\nRp15.000 + biaya ojek online (sesuai jarak dari lokasi antar/jemput ke lokasi Rental Motor Kukusan).\nAnda dapat memilih layanan ini saat melakukan pemesanan di website pada menu Layanan Antar Jemput.",
    },
    {
      title: "5. Bagaimana cara melakukan pembayaran?",
      content:
        "Pembayaran dapat dilakukan melalui:\nTransfer bank\nKartu kredit\nE-wallet\nPembayaran dilakukan saat serah terima kendaraan dan tidak memerlukan DP (uang muka).",
    },
    {
      title: "6. Apakah motor dapat digunakan di luar Jabodetabek?",
      content:
        "Tidak. Motor tidak diperbolehkan digunakan di luar wilayah Jabodetabek, termasuk ke area Puncak Bogor.\nKendaraan dilengkapi sistem GPS dan memiliki batas area penggunaan.",
    },
    {
      title: "7. Apakah motor boleh digunakan untuk ojek online?",
      content:
        "Tidak. Motor dari Rental Motor Kukusan tidak diperbolehkan digunakan untuk kegiatan ojek online atau aktivitas komersial lainnya.",
    },
    {
      title: "8. Apakah Rental Motor Kukusan memiliki cabang lain?",
      content:
        "Tidak. Kami tidak memiliki cabang lain.\nLokasi kami hanya berada di Kota Depok, dan kami hanya menggunakan satu nomor resmi untuk operasional.",
    },
    {
      title: "9. Apakah bisa menyewa tanpa memiliki SIM C?",
      content:
        "Tidak bisa.\nSetiap penyewa wajib memiliki SIM C aktif sebagai syarat utama penyewaan.",
    },
    {
      title: "10. Apakah bisa menyewa pada hari libur?",
      content:
        "Ya, kami menyediakan Paket Weekend untuk hari libur.\nKetentuan Paket Weekend:\nDurasi minimal 2 hari\nPeriode sewa: Sabtu – Senin\nBiaya: harga normal + Rp15.000\nSilakan lakukan pemesanan lebih awal untuk memastikan ketersediaan unit.",
    },
  ];

  const topMotors = useMemo(() => {
    const motorById = new Map(motors.map((motor) => [motor.id, motor]));
    const rankedFromBookings = topMotorIds
      .map((motorId) => motorById.get(motorId))
      .filter((motor): motor is Motor => Boolean(motor));

    const fallbackByRating = [...motors]
      .sort((a, b) => b.rating - a.rating)
      .slice(0, 3);

    const merged = [
      ...rankedFromBookings,
      ...fallbackByRating.filter(
        (motor) => !rankedFromBookings.some((ranked) => ranked.id === motor.id)
      ),
    ];

    return merged.slice(0, 3);
  }, [motors, topMotorIds]);

  useEffect(() => {
    const fetchMotors = async () => {
      const { data, error } = await supabase
        .from("motors")
        .select("*")
        .eq("status", "Tersedia")
        .order("name");

      if (error) {
        const { data: fallbackData } = await supabase
          .from("motors")
          .select("*")
          .order("name");
        setMotors((fallbackData as Motor[]) ?? []);
        setLoadingMotors(false);
        return;
      }

      if (data && data.length > 0) {
        setMotors(data as Motor[]);
        setLoadingMotors(false);
        return;
      }

      const { data: fallbackData } = await supabase
        .from("motors")
        .select("*")
        .order("name");
      setMotors((fallbackData as Motor[]) ?? []);
      setLoadingMotors(false);
    };
    void fetchMotors();
  }, [supabase]);

  useEffect(() => {
    const fetchRented = async () => {
      const { data } = await supabase
        .from("bookings")
        .select("motor_id, status");

      if (data) {
        const activeStatuses = new Set(["Disetujui", "Motor Terkirim"]);
        const popularStatuses = new Set([
          "Disetujui",
          "Motor Terkirim",
          "Selesai",
        ]);

        const activeMotorIds = data
          .filter((item) => activeStatuses.has(item.status))
          .map((item) => item.motor_id);
        setRentedMotorIds(activeMotorIds);

        const rentCountByMotor = data.reduce<Record<string, number>>(
          (accumulator, item) => {
            if (!popularStatuses.has(item.status)) {
              return accumulator;
            }
            accumulator[item.motor_id] = (accumulator[item.motor_id] ?? 0) + 1;
            return accumulator;
          },
          {}
        );

        const rankedMotorIds = Object.entries(rentCountByMotor)
          .sort((a, b) => b[1] - a[1])
          .map(([motorId]) => motorId)
          .slice(0, 3);

        setTopMotorIds(rankedMotorIds);
      }
    };
    void fetchRented();
  }, [supabase]);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-[#FAF9F6] to-white">
      <Hero />
      <AlurSewa />

      <section className="relative max-w-6xl mx-auto px-6 pb-8">
        <div className="mb-8 space-y-5 text-left">
          <h3 className="text-5xl md:text-6xl font-black text-[#1a1a1a] tracking-tight leading-tight">
            Persyaratan{" "}
            <span className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
              Sewa
            </span>
          </h3>

          <p className="text-sm md:text-base text-[#1a1a1a]/60 font-medium leading-relaxed max-w-4xl text-left">
            Lengkapi persyaratan berikut agar proses verifikasi lebih cepat,
            aman, dan penyewaan berjalan lancar tanpa salah paham.
          </p>

          <div className="rounded-2xl border border-[#2563EB]/30 bg-[#2563EB]/5 p-4 md:p-5">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#2563EB]/15 text-[#2563EB] flex items-center justify-center shrink-0 mt-0.5">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-black tracking-wide uppercase text-[#2563EB]">
                  Note Penting
                </p>
                <p className="mt-1.5 text-sm md:text-base text-[#1a1a1a]/75 font-medium leading-relaxed text-left">
                  Tidak disewakan untuk pemakaian ojek online. Settingan GPS
                  motor hanya bisa dipakai di area Jabodetabek (di luar area
                  tersebut mesin akan mati otomatis).
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-[#1a1a1a]/10 rounded-3xl p-6 md:p-8">
          <div className="space-y-4">
            {requirementItems.map((item, index) => {
              const isOpen = openRequirementIndex === index;
              return (
                <div
                  key={item.title}
                  className={`rounded-2xl border transition-colors ${
                    isOpen
                      ? "border-[#2563EB] bg-white"
                      : "border-[#1a1a1a]/10 bg-white"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setOpenRequirementIndex(isOpen ? null : index)}
                    className="w-full flex items-center justify-between gap-4 p-5 text-left"
                  >
                    <span
                      className={`text-lg font-bold ${
                        isOpen ? "text-[#2563EB]" : "text-[#1a1a1a]"
                      }`}
                    >
                      {item.title}
                    </span>
                    <span className="text-[#1a1a1a]/50">
                      {isOpen ? (
                        <Minus className="w-5 h-5" />
                      ) : (
                        <Plus className="w-5 h-5" />
                      )}
                    </span>
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 text-[#1a1a1a]/70 leading-relaxed text-base whitespace-pre-line text-left">
                      {item.content}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section id="layanan-kami" className="relative scroll-mt-28 max-w-6xl mx-auto px-6 py-16">
        <div className="text-left mb-12">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-[#1a1a1a] leading-tight">
            Layanan{" "}
            <span className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
              Kami
            </span>
          </h2>

          <p className="mt-4 text-sm md:text-base text-[#1a1a1a]/55 font-medium max-w-4xl leading-relaxed text-left">
            Kami menawarkan layanan sewa motor yang fleksibel dan transparan,
            supaya penyewa mudah memahami biaya, diskon, serta ketentuan sebelum
            melakukan pemesanan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-5">
          {layananUtama.map((layanan, index) => (
            <article
              key={layanan.title}
              className="relative overflow-hidden rounded-3xl border border-[#1a1a1a]/10 bg-white p-6 text-left transition-all duration-300 shadow-[0_8px_20px_rgba(15,23,42,0.06)] hover:-translate-y-1 hover:shadow-[0_14px_30px_rgba(15,23,42,0.10)]"
            >
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-transform duration-300 ${
                  index % 2 === 0
                    ? "bg-gradient-to-br from-[#2563EB] to-[#3B82F6] shadow-[#2563EB]/20"
                    : "bg-gradient-to-br from-[#DC2626] to-[#EF4444] shadow-[#DC2626]/20"
                }`}
              >
                <layanan.icon className="w-7 h-7 text-white" strokeWidth={2.5} />
              </div>
              <h3 className="mt-5 text-2xl font-black text-[#1a1a1a] tracking-tight leading-snug min-h-[96px]">
                {layanan.title}
              </h3>
              <p className="mt-3 text-sm md:text-base text-[#1a1a1a]/55 font-medium leading-relaxed text-left">
                {layanan.desc}
              </p>
            </article>
          ))}
        </div>
      </section>

      <section id="motor" className="relative max-w-6xl mx-auto px-6 pt-14 pb-24 overflow-hidden">
        <div className="absolute top-20 right-10 w-64 h-64 bg-gradient-to-br from-[#2563EB]/5 to-transparent rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-20 left-10 w-80 h-80 bg-gradient-to-tl from-[#DC2626]/5 to-transparent rounded-full blur-3xl -z-10" />

        <div className="mb-10 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="space-y-4 text-left md:max-w-4xl">
            <h2 className="text-5xl md:text-6xl font-black text-[#1a1a1a] tracking-tight leading-tight">
              3 Motor{" "}
              <span className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
                Terfavorit
              </span>{" "}
              Kami
            </h2>
            <p className="text-sm md:text-base text-[#1a1a1a]/60 font-medium leading-relaxed text-left">
              Pilihan motor yang paling sering disewa pelanggan. Semua unit
              terawat dan siap pakai.
            </p>
          </div>
        </div>

        {loadingMotors ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 bg-slate-100 rounded-2xl animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {topMotors.map((motor, index) => (
              <div key={motor.id} className="animate-in fade-in slide-in-from-bottom-4 duration-700" style={{ animationDelay: `${index * 100}ms` }}>
                <MotorCard
                  motor={{
                    id: motor.id,
                    name: motor.name,
                    description: motor.description,
                    dailyPrice: motor.daily_price,
                    weeklyPrice: motor.weekly_price,
                    monthlyPrice: motor.monthly_price,
                    weekendPrice: motor.weekend_price,
                    transmission: motor.transmission,
                    fuel: motor.fuel,
                    rating: motor.rating,
                    image: motor.image_url || '/motors/default.jpg',
                    year: motor.year,
                    cc: motor.cc,
                    brand: motor.brand,
                  }}
                  isRented={rentedMotorIds.includes(motor.id)}
                  onDetail={() => setSelectedMotor(motor)}
                  priority={true}
                />
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 flex justify-center">
          <Link
            href="/motors"
            className="group inline-flex w-full sm:w-auto items-center justify-center gap-2 px-8 py-4 rounded-2xl border-2 border-[#2563EB] bg-[#2563EB]/5 text-[#2563EB] font-black hover:bg-[#2563EB] hover:text-white active:scale-[0.99] transition-all shadow-lg hover:shadow-xl hover:shadow-[#2563EB]/30"
          >
            Lihat motor lainnya
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>
      </section>

      <section id="faq" className="relative scroll-mt-28 max-w-6xl mx-auto px-6 pb-20">
        <div className="text-left mb-10">
          <h2 className="text-5xl md:text-6xl font-black tracking-tight text-[#1a1a1a] leading-tight">
            Pertanyaan yang Sering Ditanyakan
          </h2>
          <p className="mt-3 text-sm md:text-base text-[#1a1a1a]/60 font-medium max-w-4xl leading-relaxed text-left">
            Temukan jawaban dari pertanyaan yang paling sering ditanyakan
            penyewa agar proses booking lebih jelas dan cepat.
          </p>
        </div>

        <div className="space-y-4">
          {faqItems.map((item, index) => {
            const isOpen = openFaqIndex === index;
            return (
              <div
                key={item.title}
                className={`rounded-2xl border transition-colors ${
                  isOpen ? "border-[#2563EB] bg-white" : "border-[#1a1a1a]/10 bg-white"
                }`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                  className="w-full flex items-center justify-between gap-4 p-5 text-left"
                >
                  <span
                    className={`text-lg font-bold ${
                      isOpen ? "text-[#2563EB]" : "text-[#1a1a1a]"
                    }`}
                  >
                    {item.title}
                  </span>
                  <span className="text-[#1a1a1a]/50">
                    {isOpen ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                  </span>
                </button>

                {isOpen && (
                  <div className="px-5 pb-5 text-[#1a1a1a]/70 leading-relaxed text-base whitespace-pre-line text-left">
                    {item.content}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {selectedMotor && (
        <BookingModal
          motor={{
            id: selectedMotor.id,
            name: selectedMotor.name,
            description: selectedMotor.description,
            dailyPrice: selectedMotor.daily_price,
            weeklyPrice: selectedMotor.weekly_price,
            monthlyPrice: selectedMotor.monthly_price,
            weekendPrice: selectedMotor.weekend_price,
            transmission: selectedMotor.transmission,
            fuel: selectedMotor.fuel,
            rating: selectedMotor.rating,
            image: selectedMotor.image_url || '/motors/default.jpg',
            year: selectedMotor.year,
            cc: selectedMotor.cc,
            brand: selectedMotor.brand,
          }}
          onClose={() => setSelectedMotor(null)}
        />
      )}

    </main>
  );
}
