"use client";

import { use, useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  ChevronLeft,
  Check,
  X,
  Camera,
  FileText,
  User,
  Phone,
  MapPin,
  Loader2,
  Calendar,
  Send,
  ChevronDown,
  CheckCircle,
  Briefcase,
  Building2,
  Heart,
  Users,
  Facebook,
  Instagram,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

interface BookingDetail {
  id: string;
  motor_name: string;
  total_price: number;
  status: string;
  start_date: string;
  end_date: string;
  delivery_proof_url: string | null;
  profiles: {
    id: string;
    full_name: string;
    email: string;
    phone: string;
    address: string;
    kelurahan: string;
    kecamatan: string;
    city: string;
    province: string;
    ktp_url: string;
    sim_url: string;
    occupation: string;
    company_name: string;
    company_address: string;
    facebook_account: string;
    instagram_account: string;
    tiktok_account: string;
    emergency_contact_name: string;
    emergency_contact_relation: string;
    emergency_contact_phone: string;
    emergency_contact_address: string;
  } | null;
}

export default function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [reason, setReason] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const fetchDetail = useCallback(async () => {
    try {
      const { data } = await supabase
        .from("bookings")
        .select("*, profiles(*)")
        .eq("id", id)
        .single();
      if (data) setBooking(data as unknown as BookingDetail);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [id, supabase]);

  useEffect(() => {
    const loadData = async () => {
      await fetchDetail();
    };
    loadData();
  }, [fetchDetail]);

  const handleReject = async () => {
    if (!reason.trim()) {
      alert("Silakan isi alasan penolakan");
      return;
    }
    await supabase
      .from("bookings")
      .update({
        status: "Ditolak",
        rejection_reason: reason,
      })
      .eq("id", id);
    setShowRejectModal(false);
    setReason("");
    await fetchDetail();
    alert("Pesanan ditolak. Alasan telah dikirim ke customer.");
  };

  const handleApprove = async () => {
    if (!deliveryDate) {
      alert("Silakan isi jadwal pengiriman");
      return;
    }
    if (!booking?.profiles) return;

    await supabase
      .from("bookings")
      .update({
        status: "Disetujui",
        delivery_date: deliveryDate,
      })
      .eq("id", id);

    setShowApproveModal(false);
    setDeliveryDate("");
    await fetchDetail();

    const message = `Halo ${booking.profiles.full_name}, pesanan motor *${booking.motor_name}* Anda telah kami SETUJUI.%0A%0AUnit akan diantar pada: *${deliveryDate}*%0A%0ATerima kasih!`;
    window.open(
      `https://wa.me/${booking.profiles.phone.replace(/^0/, "62")}?text=${message}`,
      "_blank",
    );
  };

  const handleCompleteOrder = async () => {
    if (
      !confirm("Konfirmasi bahwa motor sudah dikembalikan dan order selesai?")
    )
      return;
    await supabase.from("bookings").update({ status: "Selesai" }).eq("id", id);
    await fetchDetail();
    alert("Order telah diselesaikan. Motor kembali tersedia.");
  };

  const handleManualStatus = async (newStatus: string) => {
    setShowStatusDropdown(false);
    if (!confirm(`Ubah status order menjadi "${newStatus}"?`)) return;
    await supabase.from("bookings").update({ status: newStatus }).eq("id", id);
    await fetchDetail();
  };

  const ALL_STATUSES = [
    "Menunggu Konfirmasi",
    "Disetujui",
    "Motor Terkirim",
    "Selesai",
    "Ditolak",
  ];

  const handleUploadProof = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const fileExt = file.name.split(".").pop();
    const fileName = `proof-${id}-${Date.now()}.${fileExt}`;

    const { error: upError } = await supabase.storage
      .from("documents")
      .upload(fileName, file);
    if (!upError) {
      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(fileName);
      await supabase
        .from("bookings")
        .update({
          delivery_proof_url: publicUrl,
          status: "Motor Terkirim",
        })
        .eq("id", id);
      await fetchDetail();
    }
    setUploading(false);
  };

  if (loading)
    return (
      <div className="p-20 text-center">
        <Loader2 className="animate-spin inline" />
      </div>
    );
  if (!booking)
    return (
      <div className="p-10 text-center font-bold">Pesanan tidak ditemukan</div>
    );

  return (
    <div className="max-w-6xl space-y-8 animate-in fade-in duration-500">
      <Link
        href="/dashboard/bookings"
        className="flex items-center gap-2 text-[#1a1a1a]/40 hover:text-[#2563EB] transition font-bold text-sm group"
      >
        <ChevronLeft
          size={18}
          strokeWidth={2.5}
          className="group-hover:-translate-x-1 transition-transform"
        />{" "}
        Kembali ke Daftar
      </Link>

      <div className="flex flex-col md:flex-row justify-between items-start gap-6">
        <div className="space-y-3 relative">
          <div className="absolute -top-6 -left-6 w-40 h-40 bg-gradient-to-br from-[#2563EB]/20 to-[#DC2626]/20 rounded-full blur-3xl"></div>
          <h1 className="text-2xl sm:text-4xl font-black text-[#1a1a1a] leading-none tracking-tight relative z-10">
            {booking.motor_name}
          </h1>
          <p className="text-xs font-black text-[#2563EB] uppercase tracking-widest relative z-10">
            {booking.status}
          </p>
        </div>
        <div className="flex gap-3 flex-wrap">
          {booking.status === "Menunggu Konfirmasi" && (
            <>
              <button
                onClick={() => setShowApproveModal(true)}
                className="flex items-center gap-2 bg-gradient-to-r from-green-600 to-green-700 text-white px-6 py-3 rounded-2xl font-black hover:shadow-xl hover:shadow-green-500/30 transition-all hover:scale-105"
              >
                <Check size={18} strokeWidth={2.5} /> Setujui
              </button>
              <button
                onClick={() => setShowRejectModal(true)}
                className="flex items-center gap-2 bg-red-50 border-2 border-red-200 text-red-600 px-6 py-3 rounded-2xl font-black hover:bg-red-600 hover:text-white transition-all hover:scale-105"
              >
                <X size={18} strokeWidth={2.5} /> Tolak
              </button>
            </>
          )}
          {booking.status === "Disetujui" && (
            <button
              onClick={() => setShowApproveModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-[#DC2626] to-[#EF4444] text-white px-6 py-3 rounded-2xl font-black hover:shadow-xl hover:shadow-[#DC2626]/30 transition-all hover:scale-105"
            >
              <Calendar size={18} strokeWidth={2.5} /> Atur Pengiriman
            </button>
          )}
          {booking.status === "Motor Terkirim" && (
            <button
              onClick={() => void handleCompleteOrder()}
              className="flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 text-white px-6 py-3 rounded-2xl font-black hover:shadow-xl hover:shadow-emerald-500/30 transition-all hover:scale-105"
            >
              <CheckCircle size={18} strokeWidth={2.5} /> Selesai (Motor
              Kembali)
            </button>
          )}

          <div className="relative">
            <button
              onClick={() => setShowStatusDropdown(!showStatusDropdown)}
              className="flex items-center gap-2 bg-[#FAF9F6] border-2 border-[#1a1a1a]/10 text-[#1a1a1a] px-5 py-3 rounded-2xl font-black hover:border-[#2563EB] transition-all text-sm"
            >
              Ubah Status <ChevronDown size={16} strokeWidth={2.5} />
            </button>
            {showStatusDropdown && (
              <div className="absolute right-0 top-full mt-2 bg-white/90 backdrop-blur-xl border-2 border-[#1a1a1a] rounded-2xl shadow-2xl z-50 w-64 overflow-hidden">
                {ALL_STATUSES.map((s) => (
                  <button
                    key={s}
                    onClick={() => void handleManualStatus(s)}
                    disabled={s === booking.status}
                    className={`w-full text-left px-5 py-3 text-sm font-black transition ${
                      s === booking.status
                        ? "bg-gradient-to-r from-[#2563EB]/10 to-[#2563EB]/20 text-[#2563EB] cursor-default"
                        : "text-[#1a1a1a]/70 hover:bg-[#FAF9F6]"
                    }`}
                  >
                    {s === booking.status ? `● ${s}` : s}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Customer Info - Takes 2 columns */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-[#1a1a1a] shadow-xl space-y-6 hover:shadow-2xl hover:shadow-[#DC2626]/10 transition-all">
            <div className="flex items-center gap-4 pb-4 border-b-2 border-[#1a1a1a]/10">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#EF4444] flex items-center justify-center text-white font-black text-2xl shadow-lg">
                {booking.profiles?.full_name?.charAt(0).toUpperCase() || (
                  <User size={28} strokeWidth={2.5} />
                )}
              </div>
              <div>
                <h3 className="font-black text-[#1a1a1a] text-xl">
                  {booking.profiles?.full_name || "No Name"}
                </h3>
                <p className="text-xs text-[#1a1a1a]/40 font-bold uppercase tracking-wider">
                  {booking.profiles?.email}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InfoRow
                icon={<Phone size={16} strokeWidth={2.5} />}
                label="WhatsApp"
                value={booking.profiles?.phone}
              />
              <InfoRow
                icon={<Briefcase size={16} strokeWidth={2.5} />}
                label="Pekerjaan"
                value={booking.profiles?.occupation}
              />
              <InfoRow
                icon={<Building2 size={16} strokeWidth={2.5} />}
                label="Perusahaan"
                value={booking.profiles?.company_name}
              />
            </div>
          </div>

          {/* Address */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-[#1a1a1a] shadow-xl space-y-6 hover:shadow-2xl hover:shadow-[#2563EB]/10 transition-all">
            <h3 className="font-black text-[#1a1a1a] text-lg flex items-center gap-3 pb-4 border-b-2 border-[#1a1a1a]/10">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                <MapPin size={20} className="text-white" strokeWidth={2.5} />
              </div>
              Alamat Domisili
            </h3>
            <div className="space-y-4">
              <InfoRow
                icon={<MapPin size={16} strokeWidth={2.5} />}
                label="Alamat Lengkap"
                value={booking.profiles?.address}
              />
              <div className="grid grid-cols-2 gap-4">
                <InfoRow
                  icon={null}
                  label="Kelurahan"
                  value={booking.profiles?.kelurahan}
                />
                <InfoRow
                  icon={null}
                  label="Kecamatan"
                  value={booking.profiles?.kecamatan}
                />
                <InfoRow
                  icon={null}
                  label="Kota"
                  value={booking.profiles?.city}
                />
                <InfoRow
                  icon={null}
                  label="Provinsi"
                  value={booking.profiles?.province}
                />
              </div>
            </div>
          </div>

          {/* Work Address */}
          {booking.profiles?.company_address && (
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-[#1a1a1a] shadow-xl space-y-6 hover:shadow-2xl hover:shadow-[#DC2626]/10 transition-all">
              <h3 className="font-black text-[#1a1a1a] text-lg flex items-center gap-3 pb-4 border-b-2 border-[#1a1a1a]/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#EF4444] flex items-center justify-center">
                  <Building2
                    size={20}
                    className="text-white"
                    strokeWidth={2.5}
                  />
                </div>
                Alamat Perusahaan
              </h3>
              <InfoRow
                icon={<MapPin size={16} strokeWidth={2.5} />}
                label="Alamat"
                value={booking.profiles?.company_address}
              />
            </div>
          )}

          {/* Social Media */}
          {(booking.profiles?.facebook_account ||
            booking.profiles?.instagram_account ||
            booking.profiles?.tiktok_account) && (
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-[#1a1a1a] shadow-xl space-y-6 hover:shadow-2xl hover:shadow-[#2563EB]/10 transition-all">
              <h3 className="font-black text-[#1a1a1a] text-lg flex items-center gap-3 pb-4 border-b-2 border-[#1a1a1a]/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                  <Users size={20} className="text-white" strokeWidth={2.5} />
                </div>
                Media Sosial
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {booking.profiles?.facebook_account && (
                  <InfoRow
                    icon={<Facebook size={16} strokeWidth={2.5} />}
                    label="Facebook"
                    value={booking.profiles?.facebook_account}
                  />
                )}
                {booking.profiles?.instagram_account && (
                  <InfoRow
                    icon={<Instagram size={16} strokeWidth={2.5} />}
                    label="Instagram"
                    value={booking.profiles?.instagram_account}
                  />
                )}
                {booking.profiles?.tiktok_account && (
                  <InfoRow
                    icon={<FileText size={16} strokeWidth={2.5} />}
                    label="TikTok"
                    value={booking.profiles?.tiktok_account}
                  />
                )}
              </div>
            </div>
          )}

          {/* Emergency Contact */}
          {(booking.profiles?.emergency_contact_name ||
            booking.profiles?.emergency_contact_phone) && (
            <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-[#1a1a1a] shadow-xl space-y-6 hover:shadow-2xl hover:shadow-red-500/10 transition-all border-red-100">
              <h3 className="font-black text-[#1a1a1a] text-lg flex items-center gap-3 pb-4 border-b-2 border-red-100">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <Heart size={20} className="text-white" strokeWidth={2.5} />
                </div>
                Kontak Darurat
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoRow
                  icon={<User size={16} strokeWidth={2.5} />}
                  label="Nama"
                  value={booking.profiles?.emergency_contact_name}
                />
                <InfoRow
                  icon={<FileText size={16} strokeWidth={2.5} />}
                  label="Hubungan"
                  value={booking.profiles?.emergency_contact_relation}
                />
                <InfoRow
                  icon={<Phone size={16} strokeWidth={2.5} />}
                  label="Telepon"
                  value={booking.profiles?.emergency_contact_phone}
                />
              </div>
              {booking.profiles?.emergency_contact_address && (
                <InfoRow
                  icon={<MapPin size={16} strokeWidth={2.5} />}
                  label="Alamat"
                  value={booking.profiles?.emergency_contact_address}
                />
              )}
            </div>
          )}

          {/* Documents */}
          <div className="bg-white/80 backdrop-blur-sm p-8 rounded-3xl border-2 border-[#1a1a1a] shadow-xl space-y-6 hover:shadow-2xl hover:shadow-[#DC2626]/10 transition-all">
            <h3 className="font-black text-[#1a1a1a] text-lg flex items-center gap-3 pb-4 border-b-2 border-[#1a1a1a]/10">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#EF4444] flex items-center justify-center">
                <FileText size={20} className="text-white" strokeWidth={2.5} />
              </div>
              Dokumen Identitas
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <DocPreview label="KTP" url={booking.profiles?.ktp_url} />
              <DocPreview label="SIM C" url={booking.profiles?.sim_url} />
            </div>
          </div>
        </div>

        {/* Delivery Proof - Takes 1 column */}
        <div className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] p-8 rounded-3xl text-white space-y-6 border-2 border-[#1a1a1a] shadow-2xl hover:shadow-[#2563EB]/10 transition-all h-fit">
          <h3 className="font-black flex items-center gap-3 pb-4 border-b-2 border-white/10">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
              <Camera size={20} className="text-white" strokeWidth={2.5} />
            </div>
            Bukti Pengiriman
          </h3>
          <div className="relative h-64 bg-white/5 rounded-3xl border-2 border-dashed border-white/20 overflow-hidden flex flex-col items-center justify-center group hover:border-[#2563EB]/50 transition-all">
            {booking.delivery_proof_url ? (
              <Image
                src={booking.delivery_proof_url}
                alt="Bukti"
                fill
                className="object-cover"
              />
            ) : (
              <>
                {uploading ? (
                  <Loader2
                    className="animate-spin"
                    size={40}
                    strokeWidth={2.5}
                  />
                ) : (
                  <Camera size={48} className="text-white/20" strokeWidth={2} />
                )}
                <p className="text-xs mt-4 text-white/60 font-black uppercase tracking-wider">
                  Klik untuk upload foto motor sampai
                </p>
              </>
            )}
            <input
              type="file"
              className="absolute inset-0 opacity-0 cursor-pointer"
              onChange={handleUploadProof}
              disabled={uploading}
            />
          </div>
          <p className="text-xs text-white/40 leading-relaxed font-bold">
            &ldquo;Upload bukti pengiriman secara otomatis akan mengubah status
            pesanan menjadi Motor Terkirim.&rdquo;
          </p>
        </div>
      </div>

      {/* Modal Setujui */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-xl w-full max-w-md rounded-3xl border-2 border-[#1a1a1a] shadow-2xl animate-in zoom-in duration-200">
            <div className="p-8 space-y-6">
              <div className="text-center space-y-3">
                <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl flex items-center justify-center mx-auto shadow-xl shadow-green-500/30">
                  <Calendar
                    size={36}
                    className="text-white"
                    strokeWidth={2.5}
                  />
                </div>
                <h3 className="text-2xl font-black text-[#1a1a1a]">
                  Atur Jadwal Pengantaran
                </h3>
                <p className="text-sm text-[#1a1a1a]/60 font-bold">
                  Tentukan waktu pengantaran untuk{" "}
                  {booking?.profiles?.full_name}
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-xs font-black text-[#1a1a1a]/60 uppercase tracking-widest">
                  Input Jadwal (Hari, Jam, atau Tgl)
                </label>
                <input
                  type="text"
                  value={deliveryDate}
                  placeholder="Contoh: Besok pagi jam 10:00"
                  className="w-full border-2 border-[#1a1a1a]/10 p-4 rounded-2xl outline-none focus:border-green-500 focus:bg-green-50 transition-all font-bold text-[#1a1a1a] bg-[#FAF9F6]"
                  onChange={(e) => setDeliveryDate(e.target.value)}
                />
              </div>

              <button
                onClick={() => void handleApprove()}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-3 hover:shadow-xl hover:shadow-green-500/30 transition-all hover:scale-105 uppercase tracking-wide"
              >
                <Send size={18} strokeWidth={2.5} /> SIMPAN &amp; CHAT WHATSAPP
              </button>
              <button
                onClick={() => setShowApproveModal(false)}
                className="w-full text-sm font-bold text-[#1a1a1a]/50 hover:text-[#1a1a1a] transition"
              >
                Batalkan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Tolak */}
      {showRejectModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[110] p-4 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-xl rounded-3xl border-2 border-[#1a1a1a] p-8 max-w-md w-full space-y-6 shadow-2xl animate-in zoom-in duration-200">
            <h3 className="text-3xl font-black text-[#1a1a1a]">
              Tolak Pesanan
            </h3>
            <div className="space-y-3">
              <label className="block text-sm font-black text-[#1a1a1a]/80">
                Alasan Penolakan
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Jelaskan alasan penolakan..."
                rows={4}
                className="w-full px-4 py-4 rounded-2xl border-2 border-[#1a1a1a]/10 focus:border-red-500 focus:bg-red-50 outline-none font-bold resize-none bg-[#FAF9F6] transition-all"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleReject}
                className="flex-1 bg-gradient-to-r from-red-600 to-red-700 text-white py-4 rounded-2xl font-black hover:shadow-xl hover:shadow-red-500/30 transition-all hover:scale-105"
              >
                Tolak Pesanan
              </button>
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-8 bg-[#FAF9F6] border-2 border-[#1a1a1a]/10 text-[#1a1a1a] py-4 rounded-2xl font-black hover:border-[#1a1a1a]/30 transition-all"
              >
                Batal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function InfoRow({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div className="flex items-start gap-3 p-3 bg-[#FAF9F6] rounded-2xl border-2 border-[#1a1a1a]/5">
      {icon && <div className="text-[#DC2626] shrink-0 mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-[#1a1a1a]/60 uppercase tracking-widest">
          {label}
        </p>
        <p className="text-sm font-black text-[#1a1a1a] break-words">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function DocPreview({
  label,
  url,
}: {
  label: string;
  url: string | undefined | null;
}) {
  if (!url)
    return (
      <div className="p-4 border-2 border-dashed border-[#1a1a1a]/10 rounded-2xl text-xs text-[#1a1a1a]/20 text-center uppercase font-black bg-[#FAF9F6]">
        {label} Kosong
      </div>
    );
  return (
    <a
      href={url}
      target="_blank"
      className="p-4 bg-gradient-to-r from-[#DC2626]/10 to-[#DC2626]/20 border-2 border-[#DC2626]/30 rounded-2xl text-xs text-[#DC2626] text-center uppercase font-black hover:from-[#DC2626] hover:to-[#EF4444] hover:text-white transition-all hover:scale-105"
    >
      Lihat {label}
    </a>
  );
}
