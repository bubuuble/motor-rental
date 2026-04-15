"use client";

import { useState, useEffect, useMemo } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  User,
  Loader2,
  Upload,
  FileCheck,
  MapPin,
  Briefcase,
  Heart,
  Facebook,
  ArrowLeft,
} from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  address: string | null;
  kelurahan: string | null;
  kecamatan: string | null;
  city: string | null;
  province: string | null;
  role: "customer" | "owner";
  ktp_url: string | null;
  sim_url: string | null;
  is_student: boolean;
  ktm_url: string | null;
  student_status_approved: boolean;
  occupation: string | null;
  company_name: string | null;
  company_address: string | null;
  facebook_account: string | null;
  instagram_account: string | null;
  tiktok_account: string | null;
  emergency_contact_name: string | null;
  emergency_contact_relation: string | null;
  emergency_contact_phone: string | null;
  emergency_contact_address: string | null;
}

interface InputFieldProps {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: string;
  name: string;
  required?: boolean;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ktpUrl, setKtpUrl] = useState<string | null>(null);
  const [simUrl, setSimUrl] = useState<string | null>(null);
  const [ktmUrl, setKtmUrl] = useState<string | null>(null);
  const [isStudent, setIsStudent] = useState(false);
  const [isApproved, setIsApproved] = useState(false);

  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    console.log("[PROFILE] Masuk halaman /profile");
    console.time("[PROFILE] Fetch profile total");
    let subscription: ReturnType<typeof supabase.channel> | null = null;

    const fetchProfile = async () => {
      try {
        console.log("[PROFILE] Memulai fetchProfile");
        const {
          data: { session },
        } = await supabase.auth.getSession();
        console.log("[PROFILE] Session diperoleh:", session?.user?.id);

        const user = session?.user;

        if (!user) {
          console.error("[PROFILE] User tidak ditemukan, redirect ke login");
          router.push("/login");
          return;
        }
        console.log("[PROFILE] User authenticated, ID:", user.id);

        if (user) {
          console.time("[PROFILE] Fetch data dari database");
          let { data, error } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", user.id)
            .single();
          console.timeEnd("[PROFILE] Fetch data dari database");

          if (error) {
            console.warn("[PROFILE] Error saat fetch:", error);
            if (error.code === 'PGRST116') {
              console.log("[PROFILE] Profile tidak ditemukan, retrying dalam 1s...");
              await new Promise(resolve => setTimeout(resolve, 1000));
              const retry = await supabase
                .from("profiles")
                .select("*")
                .eq("id", user.id)
                .single();
              data = retry.data;
              error = retry.error;
              console.log("[PROFILE] Retry result:", { hasData: !!retry.data, error: retry.error?.message });
            }
          }

          if (!error && data) {
            console.log("[PROFILE] Data profil loaded:", {
              fullName: data.full_name,
              hasKt: !!data.ktp_url,
              hasSim: !!data.sim_url,
              hasKtm: !!data.ktm_url,
              isStudent: data.is_student,
              isApproved: data.student_status_approved,
            });
            const typedProfile = data as Profile;
            setProfile(typedProfile);
            setKtpUrl(typedProfile.ktp_url);
            setSimUrl(typedProfile.sim_url);
            setKtmUrl(typedProfile.ktm_url);
            setIsStudent(typedProfile.is_student);
            setIsApproved(typedProfile.student_status_approved);
          } else {
            console.error("[PROFILE] Gagal load profile:", error?.message);
          }

          // Subscribe to real-time updates
          console.log("[PROFILE] Setup realtime subscription untuk user:", user.id);
          subscription = supabase
            .channel('profile_changes')
            .on(
              'postgres_changes',
              {
                event: '*',
                schema: 'public',
                table: 'profiles',
                filter: `id=eq.${user.id}`,
              },
              (payload) => {
                console.log('[PROFILE] Realtime update diterima:', {
                  event: payload.eventType,
                  timestamp: new Date().toISOString(),
                  data: payload.new || payload.old,
                });
                const newData = (payload.new || payload.old) as Profile;
                if (!newData) return;
                setProfile(newData);
                setKtpUrl(newData.ktp_url);
                setSimUrl(newData.sim_url);
                setKtmUrl(newData.ktm_url);
                setIsStudent(newData.is_student);
                setIsApproved(newData.student_status_approved);
              }
            )
            .subscribe();
        }
      } catch (err) {
        console.error("[PROFILE] Error fatal saat fetch profile:", err);
      } finally {
        console.timeEnd("[PROFILE] Fetch profile total");
        console.log("[PROFILE] Loading selesai");
        setLoading(false);
      }
    };

    fetchProfile();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        console.log("[PROFILE] Cleanup subscription");
        supabase.removeChannel(subscription);
      }
    };
  }, [supabase, router]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("[PROFILE-SAVE] Form submission dimulai");
    console.time("[PROFILE-SAVE] Total save time");
    setUpdating(true);

    const formData = new FormData(e.currentTarget);
    const updates = {
      full_name: formData.get("full_name") as string,
      phone: formData.get("phone") as string,
      address: formData.get("address") as string,
      kelurahan: formData.get("kelurahan") as string,
      kecamatan: formData.get("kecamatan") as string,
      city: formData.get("city") as string,
      province: formData.get("province") as string,
      is_student: isStudent,
      occupation: formData.get("occupation") as string,
      company_name: formData.get("company_name") as string,
      company_address: formData.get("company_address") as string,
      facebook_account: formData.get("facebook_account") as string,
      instagram_account: formData.get("instagram_account") as string,
      tiktok_account: formData.get("tiktok_account") as string,
      emergency_contact_name: formData.get("emergency_contact_name") as string,
      emergency_contact_relation: formData.get(
        "emergency_contact_relation",
      ) as string,
      emergency_contact_phone: formData.get(
        "emergency_contact_phone",
      ) as string,
      emergency_contact_address: formData.get(
        "emergency_contact_address",
      ) as string,
    };
    console.log("[PROFILE-SAVE] Form data diambil:", updates);

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      const user = session?.user;
      if (!user) throw new Error("User tidak ditemukan");
      console.log("[PROFILE-SAVE] User authenticated:", user.id);

      console.time("[PROFILE-SAVE] Upsert ke database");
      const { error } = await supabase
        .from("profiles")
        .upsert({ 
          id: user.id, 
          email: user.email,
          ...updates 
        });
      console.timeEnd("[PROFILE-SAVE] Upsert ke database");

      if (error) throw new Error(error.message);
      console.log("[PROFILE-SAVE] Data berhasil disimpan ke database");

      setProfile((prev) => (prev ? { ...prev, ...updates } : null));
      console.log("[PROFILE-SAVE] Local state updated");

      console.timeEnd("[PROFILE-SAVE] Total save time");
      console.log("[PROFILE-SAVE] ✓ Profil berhasil diperbarui!");
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      console.timeEnd("[PROFILE-SAVE] Total save time");
      console.error("[PROFILE-SAVE] Error fatal:", error);
      if (error instanceof Error) {
        console.error("[PROFILE-SAVE] Error detail:", {
          message: error.message,
          stack: error.stack,
        });
        alert(`Gagal menyimpan: ${error.message}`);
      }
    } finally {
      console.log("[PROFILE-SAVE] Cleanup: setUpdating(false)");
      setUpdating(false);
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "ktp" | "sim" | "ktm",
  ) => {
    const file = e.target.files?.[0];
    if (!file) {
      console.log("[PROFILE-UPLOAD] No file selected");
      return;
    }

    console.log("[PROFILE-UPLOAD] Upload dimulai");
    console.time("[PROFILE-UPLOAD] Total upload time");
    console.log("[PROFILE-UPLOAD] File details:", {
      type,
      name: file.name,
      size: `${(file.size / 1024).toFixed(2)} KB`,
      mimetype: file.type,
    });

    setUpdating(true);
    try {
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();
      const user = session?.user;

      console.log("[PROFILE-UPLOAD] Session check:", {
        userId: user?.id,
        sessionError: sessionError?.message,
      });

      if (!user) {
        console.error("[PROFILE-UPLOAD] User tidak ditemukan");
        throw new Error("User tidak ditemukan");
      }

      const fileExt = file.name.split(".").pop();
      const fileName = `${user.id}-${type}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      console.log("[PROFILE-UPLOAD] File path untuk storage:", filePath);
      console.time("[PROFILE-UPLOAD] Upload ke Supabase storage");

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from("documents")
        .upload(filePath, file, { upsert: true });

      console.timeEnd("[PROFILE-UPLOAD] Upload ke Supabase storage");
      console.log("[PROFILE-UPLOAD] Upload result:", {
        success: !uploadError,
        error: uploadError?.message,
        data: uploadData,
      });

      if (uploadError) throw new Error(uploadError.message);

      const {
        data: { publicUrl },
      } = supabase.storage.from("documents").getPublicUrl(filePath);

      console.log("[PROFILE-UPLOAD] Public URL generated:", publicUrl);

      if (type === "ktp") setKtpUrl(publicUrl);
      if (type === "sim") setSimUrl(publicUrl);
      if (type === "ktm") setKtmUrl(publicUrl);
      console.log("[PROFILE-UPLOAD] UI state updated untuk tipe:", type);

      const columnName = `${type}_url`;
      console.time("[PROFILE-UPLOAD] Update profile record");
      console.log("[PROFILE-UPLOAD] Updating database column:", columnName);

      const { error: updateError, data: updateData } = await supabase
        .from("profiles")
        .upsert({ 
          id: user.id, 
          email: user.email,
          [columnName]: publicUrl 
        });

      console.timeEnd("[PROFILE-UPLOAD] Update profile record");
      console.log("[PROFILE-UPLOAD] Database update result:", {
        success: !updateError,
        error: updateError?.message,
        data: updateData,
      });

      if (updateError) throw new Error(updateError.message);

      console.timeEnd("[PROFILE-UPLOAD] Total upload time");
      const typeLabel = type === "ktm" ? "KTM" : type.toUpperCase();
      console.log("[PROFILE-UPLOAD] ✓ Upload berhasil untuk:", typeLabel);
      alert(`${typeLabel} berhasil diupload!`);
    } catch (error) {
      console.timeEnd("[PROFILE-UPLOAD] Total upload time");
      console.error("[PROFILE-UPLOAD] Error fatal:", error);
      if (error instanceof Error) {
        console.error("[PROFILE-UPLOAD] Error detail:", {
          message: error.message,
          name: error.name,
          stack: error.stack,
        });
        alert(error.message);
      }
    } finally {
      console.log("[PROFILE-UPLOAD] Cleanup: setUpdating(false)");
      setUpdating(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F6] to-white">
        <Loader2 className="animate-spin text-[#2563EB]" size={40} />
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAF9F6] to-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <button
            type="button"
            onClick={() => router.push("/")}
            aria-label="Kembali ke Beranda"
            className="inline-flex items-center justify-center rounded-full border border-[#1a1a1a]/15 bg-white w-9 h-9 text-[#1a1a1a] shadow-sm hover:border-[#2563EB]/30 hover:text-[#2563EB] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h1 className="text-5xl font-black text-[#1a1a1a] tracking-tight">
            Data Diri
          </h1>
          <p className="text-lg text-[#1a1a1a]/60 font-medium">
            Lengkapi data diri dan dokumen untuk menyewa motor.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8"
        >
          {/* Left Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border-2 border-[#1a1a1a]/10 rounded-3xl p-6 text-center shadow-lg hover:shadow-2xl hover:shadow-[#2563EB]/10 transition-all">
              <div className="relative w-28 h-28 mx-auto mb-5 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-xl">
                {profile?.full_name?.charAt(0).toUpperCase() || (
                  <User size={48} />
                )}
              </div>
              <h2 className="font-black text-xl text-[#1a1a1a] tracking-tight">
                {profile?.full_name || "No Name"}
              </h2>
              <p className="text-sm text-[#1a1a1a]/40 font-medium mt-1">
                {profile?.email}
              </p>
              <div className="mt-5 pt-5 border-t border-[#1a1a1a]/10">
                <div
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${
                    profile?.role === "owner"
                      ? "bg-purple-100 text-purple-700 border-2 border-purple-200"
                      : "bg-[#DC2626]/10 text-[#DC2626] border-2 border-[#DC2626]/20"
                  }`}
                >
                  {profile?.role === "owner" ? "Owner" : "Customer"}
                </div>
              </div>
            </div>

            {/* Progress Indicator */}
            <div className="bg-white border-2 border-[#1a1a1a]/10 rounded-3xl p-6 shadow-lg">
              <h3 className="font-black text-[#1a1a1a] mb-4 text-sm">
                Kelengkapan Data
              </h3>
              <div className="space-y-3">
                <ProgressItem
                  label="Data Pribadi"
                  complete={!!profile?.full_name && !!profile?.phone}
                />
                <ProgressItem
                  label="Alamat"
                  complete={!!profile?.address && !!profile?.city}
                />
                <ProgressItem
                  label="Pekerjaan"
                  complete={!!profile?.occupation}
                />
                <ProgressItem
                  label="Kontak Darurat"
                  complete={!!profile?.emergency_contact_name}
                />
                <ProgressItem
                  label="Dokumen"
                  complete={
                    !!profile?.ktp_url &&
                    !!profile?.sim_url &&
                    (!profile?.is_student || !!profile?.ktm_url)
                  }
                />
                {profile?.is_student && (
                  <ProgressItem
                    label="KTM (Mahasiswa)"
                    complete={!!profile?.ktm_url}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Personal Info */}
            <div className="bg-white border-2 border-[#1a1a1a]/10 rounded-3xl p-6 shadow-lg space-y-5 hover:shadow-2xl hover:shadow-[#2563EB]/10 transition-all">
              <div className="flex items-center gap-3 pb-4 border-b border-[#1a1a1a]/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <h3 className="font-black text-[#1a1a1a] tracking-tight">
                  Informasi Pribadi
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Nama Lengkap *"
                  name="full_name"
                  defaultValue={profile?.full_name ?? ""}
                  required
                />
                <InputField
                  label="No WhatsApp *"
                  name="phone"
                  defaultValue={profile?.phone ?? ""}
                  placeholder="08123..."
                  type="tel"
                  required
                />
              </div>
            </div>

            {/* Address */}
            <div className="bg-white border-2 border-[#1a1a1a]/10 rounded-3xl p-6 shadow-lg space-y-5 hover:shadow-2xl hover:shadow-[#DC2626]/10 transition-all">
              <div className="flex items-center gap-3 pb-4 border-b border-[#1a1a1a]/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#EF4444] flex items-center justify-center">
                  <MapPin size={20} className="text-white" />
                </div>
                <h3 className="font-black text-[#1a1a1a] tracking-tight">
                  Alamat Domisili
                </h3>
              </div>
              <div className="space-y-4">
                <InputField
                  label="Alamat Lengkap *"
                  name="address"
                  defaultValue={profile?.address ?? ""}
                  required
                />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Kelurahan *"
                    name="kelurahan"
                    defaultValue={profile?.kelurahan ?? ""}
                    required
                  />
                  <InputField
                    label="Kecamatan *"
                    name="kecamatan"
                    defaultValue={profile?.kecamatan ?? ""}
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField
                    label="Kota / Kabupaten *"
                    name="city"
                    defaultValue={profile?.city ?? ""}
                    required
                  />
                  <InputField
                    label="Provinsi *"
                    name="province"
                    defaultValue={profile?.province ?? ""}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Work Info */}
            <div className="bg-white border-2 border-[#1a1a1a]/10 rounded-3xl p-6 shadow-lg space-y-5 hover:shadow-2xl hover:shadow-[#2563EB]/10 transition-all">
              <div className="flex items-center gap-3 pb-4 border-b border-[#1a1a1a]/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                  <Briefcase size={20} className="text-white" />
                </div>
                <h3 className="font-black text-[#1a1a1a] tracking-tight">
                  Informasi Pekerjaan
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Pekerjaan"
                  name="occupation"
                  defaultValue={profile?.occupation ?? ""}
                  placeholder="Contoh: Karyawan Swasta, Mahasiswa, Wirausaha"
                />
                <InputField
                  label="Nama Instansi"
                  name="company_name"
                  defaultValue={profile?.company_name ?? ""}
                />
              </div>
              <InputField
                label="Alamat Instansi"
                name="company_address"
                defaultValue={profile?.company_address ?? ""}
              />
            </div>

            {/* Social Media */}
            <div className="bg-white border-2 border-[#1a1a1a]/10 rounded-3xl p-6 shadow-lg space-y-5 hover:shadow-2xl hover:shadow-[#DC2626]/10 transition-all">
              <div className="flex items-center gap-3 pb-4 border-b border-[#1a1a1a]/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#EF4444] flex items-center justify-center">
                  <Facebook size={20} className="text-white" />
                </div>
                <h3 className="font-black text-[#1a1a1a] tracking-tight">
                  Media Sosial
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Facebook"
                  name="facebook_account"
                  defaultValue={profile?.facebook_account ?? ""}
                  placeholder="username"
                />
                <InputField
                  label="Instagram"
                  name="instagram_account"
                  defaultValue={profile?.instagram_account ?? ""}
                  placeholder="@username"
                />
                <InputField
                  label="TikTok"
                  name="tiktok_account"
                  defaultValue={profile?.tiktok_account ?? ""}
                  placeholder="@username"
                />
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="bg-white border-2 border-red-100 rounded-3xl p-6 shadow-lg space-y-5 hover:shadow-2xl hover:shadow-red-500/10 transition-all">
              <div className="flex items-center gap-3 pb-4 border-b border-red-100">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
                  <Heart size={20} className="text-white" />
                </div>
                <h3 className="font-black text-[#1a1a1a] tracking-tight">
                  Kontak Darurat
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Nama Kontak"
                  name="emergency_contact_name"
                  defaultValue={profile?.emergency_contact_name ?? ""}
                  placeholder="Nama keluarga/kerabat"
                />
                <InputField
                  label="Hubungan"
                  name="emergency_contact_relation"
                  defaultValue={profile?.emergency_contact_relation ?? ""}
                  placeholder="Contoh: Ayah, Ibu, Saudara"
                />
                <InputField
                  label="No Telepon"
                  name="emergency_contact_phone"
                  defaultValue={profile?.emergency_contact_phone ?? ""}
                  type="tel"
                />
              </div>
              <InputField
                label="Alamat Kontak"
                name="emergency_contact_address"
                defaultValue={profile?.emergency_contact_address ?? ""}
              />
            </div>

            {/* Student Status */}
            <div className="bg-white border-2 border-[#1a1a1a]/10 rounded-3xl p-6 shadow-lg space-y-5 hover:shadow-2xl hover:shadow-[#2563EB]/10 transition-all">
              <div className="flex items-center gap-3 pb-4 border-b border-[#1a1a1a]/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <h3 className="font-black text-[#1a1a1a] tracking-tight">
                  Status Pelajar/Mahasiswa
                </h3>
              </div>
              <div className="space-y-4">
                {/* Jika sudah disetujui admin, tampilkan banner sukses */}
                {isApproved ? (
                  <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shrink-0">
                        <FileCheck size={20} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-green-800">Status Mahasiswa Aktif!</p>
                        <p className="text-sm text-green-600 mt-1">
                          Admin telah menyetujui status mahasiswa Anda. Anda sekarang mendapatkan diskon spesial saat booking motor!
                        </p>
                        <p className="text-xs text-green-500 mt-2">
                          🎓 Diskon: 10rb/hari (harian) | 5rb/hari (mingguan)
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Jika belum disetujui, tampilkan checkbox */
                  <label className="flex items-start gap-4 p-4 bg-[#FAF9F6] rounded-2xl border-2 border-[#1a1a1a]/5 cursor-pointer hover:border-[#2563EB]/30 transition-all">
                    <input
                      type="checkbox"
                      checked={isStudent}
                      onChange={(e) => setIsStudent(e.target.checked)}
                      className="w-6 h-6 mt-0.5 accent-[#2563EB] cursor-pointer"
                    />
                    <div className="flex-1">
                      <span className="font-bold text-[#1a1a1a] block">
                        Saya adalah Pelajar/Mahasiswa
                      </span>
                      <span className="text-sm text-[#1a1a1a]/60">
                        Centang jika Anda masih berstatus sebagai pelajar atau
                        mahasiswa aktif
                      </span>
                    </div>
                  </label>
                )}
                
                {/* Tampilkan upload KTM jika isStudent true atau sudah approved */}
                {(isStudent || isApproved) && (
                  <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                    <UploadCard
                      label="Foto KTM (Kartu Tanda Mahasiswa) *"
                      url={ktmUrl}
                      onChange={(e) => !isApproved && handleFileUpload(e, "ktm")}
                      required
                    />
                    {/* Status indicator di bawah KTM */}
                    {ktmUrl && (
                      <div className={`mt-4 p-4 rounded-2xl border-2 flex items-center gap-3 ${
                        isApproved ? 'bg-green-100 border-green-300 text-green-800' : 'bg-amber-50 border-amber-200 text-amber-800'
                      }`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${isApproved ? 'bg-green-600' : 'bg-amber-500'}`}>
                          {isApproved ? <FileCheck size={16}/> : <Loader2 size={16} className="animate-spin"/>}
                        </div>
                        <p className="text-xs font-bold uppercase tracking-tight">
                          {isApproved ? 'Verifikasi KTM Berhasil' : 'KTM Sedang Direview Oleh Admin'}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Documents */}
            <div className="bg-white border-2 border-[#1a1a1a]/10 rounded-3xl p-6 shadow-lg space-y-6 hover:shadow-2xl hover:shadow-[#2563EB]/10 transition-all">
              <div className="flex items-center gap-3 pb-4 border-b border-[#1a1a1a]/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                  <FileCheck size={20} className="text-white" />
                </div>
                <h3 className="font-black text-[#1a1a1a] tracking-tight">
                  Dokumen Identitas
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <UploadCard
                  label="Foto KTP *"
                  url={ktpUrl}
                  onChange={(e) => handleFileUpload(e, "ktp")}
                  required
                />
                <UploadCard
                  label="Foto SIM C *"
                  url={simUrl}
                  onChange={(e) => handleFileUpload(e, "sim")}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end pt-4">
              <button
                type="submit"
                disabled={updating}
                className="group relative bg-[#1a1a1a] text-white px-10 py-4 rounded-2xl font-black shadow-lg flex items-center gap-3 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transition-all hover:scale-105 uppercase tracking-wide text-sm"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative flex items-center gap-2">
                  {updating && <Loader2 className="animate-spin" size={18} />}
                  Simpan Profil
                </span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

function InputField({
  label,
  placeholder,
  defaultValue,
  type = "text",
  name,
  required,
}: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-[#1a1a1a]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <input
        name={name}
        type={type}
        className="w-full border-2 border-[#1a1a1a]/10 p-3 rounded-2xl text-sm outline-none focus:border-[#2563EB] focus:bg-[#2563EB]/5 bg-[#FAF9F6] font-medium transition-all"
        placeholder={placeholder}
        defaultValue={defaultValue}
        required={required}
      />
    </div>
  );
}

function UploadCard({
  label,
  url,
  onChange,
  required,
}: {
  label: string;
  url: string | null;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  required?: boolean;
}) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-[#1a1a1a]">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div className="relative h-48 border-2 border-dashed border-[#1a1a1a]/20 rounded-3xl overflow-hidden flex flex-col items-center justify-center group bg-gradient-to-br from-[#FAF9F6] to-[#DBEAFE]/30 hover:border-[#2563EB] transition-all cursor-pointer">
        {url ? (
          <>
            <Image src={url} alt={label} fill className="object-cover" />
            <div className="absolute inset-0 bg-[#1a1a1a]/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="bg-white text-[#2563EB] px-5 py-2 text-xs font-black rounded-full uppercase tracking-wider shadow-xl">
                Ganti Foto
              </span>
            </div>
          </>
        ) : (
          <>
            <Upload
              className="text-[#1a1a1a]/30 mb-3 group-hover:text-[#2563EB] transition-colors"
              size={40}
            />
            <span className="text-xs font-black text-[#2563EB] uppercase tracking-wider">
              Klik untuk Upload
            </span>
            <span className="text-[10px] text-[#1a1a1a]/40 font-medium mt-1">
              JPG, PNG maks 5MB
            </span>
          </>
        )}
        <input
          type="file"
          className="absolute inset-0 opacity-0 cursor-pointer"
          onChange={onChange}
          accept="image/*"
        />
      </div>
    </div>
  );
}

function ProgressItem({
  label,
  complete,
}: {
  label: string;
  complete: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-5 h-5 rounded-full flex items-center justify-center ${complete ? "bg-green-500" : "bg-[#1a1a1a]/10"}`}
      >
        {complete && <FileCheck size={12} className="text-white" />}
      </div>
      <span
        className={`text-xs font-bold ${complete ? "text-green-600" : "text-[#1a1a1a]/40"}`}
      >
        {label}
      </span>
    </div>
  );
}
