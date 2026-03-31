"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Loader2,
  Image as ImageIcon,
  X,
  Eye,
  Briefcase,
  Building2,
  Heart,
  Facebook,
  Instagram,
  FileText,
} from "lucide-react";

interface CustomerProfile {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  address: string;
  kelurahan: string | null;
  kecamatan: string | null;
  city: string | null;
  province: string | null;
  ktp_url: string;
  sim_url: string;
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

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] =
    useState<CustomerProfile | null>(null);
  const [updatingStudent, setUpdatingStudent] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("role", "customer");
    if (data) setCustomers(data as unknown as CustomerProfile[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    let subscription: ReturnType<typeof supabase.channel> | null = null;

    const load = async () => {
      await fetchCustomers();

      // Subscribe to real-time updates for all customer profiles
      subscription = supabase
        .channel('customers_changes')
        .on(
          'postgres_changes',
          {
            event: 'UPDATE',
            schema: 'public',
            table: 'profiles',
            filter: 'role=eq.customer',
          },
          (payload) => {
            console.log('[REALTIME] Customer profile updated:', payload);
            const updatedCustomer = payload.new as CustomerProfile;

            // Update the customers list
            setCustomers((prev) =>
              prev.map((c) =>
                c.id === updatedCustomer.id ? updatedCustomer : c
              )
            );

            // Update selected customer if it's the one being updated
            setSelectedCustomer((prev) => {
              if (prev?.id === updatedCustomer.id) {
                return updatedCustomer;
              }
              return prev;
            });
          }
        )
        .subscribe();
    };

    load();

    // Cleanup subscription on unmount
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [fetchCustomers, supabase]);

  const handleToggleStudent = async (
    customerId: string,
    newStatus: boolean,
  ) => {
    setUpdatingStudent(true);
    try {
      // Jika owner approve, langsung set is_student = true juga
      // Jika owner cancel, biarkan is_student tetap true (atau bisa di-set false juga)
      const updates: { student_status_approved: boolean; is_student?: boolean } = {
        student_status_approved: newStatus,
      };
      
      if (newStatus) {
        // Saat approve, langsung aktifkan status mahasiswa
        updates.is_student = true;
      }

      const { error } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", customerId);

      if (error) throw error;

      alert(`Status mahasiswa ${newStatus ? "disetujui" : "dibatalkan"}!`);
      fetchCustomers(); // Refresh data
    } catch (err) {
      console.error("Error updating student status:", err);
      alert("Gagal update");
    } finally {
      setUpdatingStudent(false);
    }
  };

  if (loading)
    return (
      <div className="p-20 flex justify-center">
        <Loader2 className="animate-spin text-blue-600" />
      </div>
    );

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-[#DC2626]/20 to-[#2563EB]/20 rounded-full blur-3xl"></div>
        <h2 className="text-2xl sm:text-4xl font-black text-[#1a1a1a] tracking-tight relative z-10">
          Daftar Customer
        </h2>
        <p className="text-xs text-[#1a1a1a]/40 font-bold uppercase tracking-widest mt-2 relative z-10">
          Database pelanggan rental
        </p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((c, index) => (
          <div
            key={c.id}
            className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-[#1a1a1a] shadow-lg space-y-4 flex flex-col hover:shadow-2xl hover:shadow-[#DC2626]/10 transition-all hover:scale-105 animate-in fade-in slide-in-from-bottom-4 cursor-pointer"
            style={{ animationDelay: `${index * 100}ms` }}
            onClick={() => setSelectedCustomer(c)}
          >
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-[#DC2626] to-[#EF4444] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                {c.full_name?.charAt(0).toUpperCase() || (
                  <User size={24} strokeWidth={2.5} />
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-[#1a1a1a] truncate">
                  {c.full_name || "No Name"}
                </h3>
                <p className="text-[10px] text-[#1a1a1a]/40 flex items-center gap-1 font-bold truncate">
                  <Mail size={10} className="shrink-0" /> <span className="truncate">{c.email}</span>
                </p>
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <p className="flex items-center gap-2 text-xs font-bold text-[#1a1a1a] bg-[#FAF9F6] p-3 rounded-2xl border-2 border-[#1a1a1a]/5">
                <Phone size={14} className="text-[#DC2626]" strokeWidth={2.5} />{" "}
                {c.phone || "-"}
              </p>

              <div className="bg-[#FAF9F6] p-4 rounded-2xl border-2 border-[#1a1a1a]/5 space-y-2 w-full overflow-hidden">
                <div className="flex items-start gap-2 max-w-full">
                  <MapPin
                    size={14}
                    className="text-[#2563EB] shrink-0 mt-0.5"
                    strokeWidth={2.5}
                  />
                  <div className="flex-1 min-w-0 break-words">
                    <p className="text-xs font-bold text-[#1a1a1a] mb-2">
                      {c.address || "-"}
                    </p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div className="min-w-0">
                        <span className="text-[#1a1a1a]/40 font-bold block truncate">
                          Kelurahan
                        </span>
                        <span className="text-[#1a1a1a] font-bold block truncate">
                          {c.kelurahan || "-"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[#1a1a1a]/40 font-bold block truncate">
                          Kecamatan
                        </span>
                        <span className="text-[#1a1a1a] font-bold block truncate">
                          {c.kecamatan || "-"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[#1a1a1a]/40 font-bold block truncate">
                          Kota
                        </span>
                        <span className="text-[#1a1a1a] font-bold block truncate">
                          {c.city || "-"}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <span className="text-[#1a1a1a]/40 font-bold block truncate">
                          Provinsi
                        </span>
                        <span className="text-[#1a1a1a] font-bold block truncate">
                          {c.province || "-"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t-2 border-[#1a1a1a]/10">
              <DocButton label="KTP" url={c.ktp_url} small />
              <DocButton label="SIM" url={c.sim_url} small />
              <button
                className="flex-1 py-2 px-2 bg-gradient-to-r from-[#2563EB]/10 to-[#2563EB]/20 border-2 border-[#2563EB]/30 rounded-xl flex items-center justify-center text-[10px] font-black text-[#2563EB] hover:from-[#2563EB] hover:to-[#3B82F6] hover:text-white transition-all uppercase hover:scale-105"
                style={{ minHeight: 0, height: '36px', fontSize: '11px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedCustomer(c);
                }}
              >
                Detail
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Customer Detail Modal */}
      {selectedCustomer && (
        <div
          className="fixed inset-0 bg-black/60 z-[110] flex items-center justify-center p-4 backdrop-blur-sm"
          onClick={() => setSelectedCustomer(null)}
        >
          <div
            className="bg-white/95 backdrop-blur-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl border-2 border-[#1a1a1a] shadow-2xl animate-in zoom-in duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white/95 backdrop-blur-xl border-b-2 border-[#1a1a1a]/10 p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#DC2626] to-[#EF4444] flex items-center justify-center text-white font-black text-2xl shadow-lg">
                  {selectedCustomer.full_name?.charAt(0).toUpperCase() || (
                    <User size={28} strokeWidth={2.5} />
                  )}
                </div>
                <div>
                  <h3 className="font-black text-[#1a1a1a] text-xl">
                    {selectedCustomer.full_name || "No Name"}
                  </h3>
                  <p className="text-xs text-[#1a1a1a]/40 font-bold uppercase tracking-wider">
                    {selectedCustomer.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="w-10 h-10 rounded-2xl bg-[#FAF9F6] border-2 border-[#1a1a1a]/10 flex items-center justify-center text-[#1a1a1a] hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
              >
                <X size={20} strokeWidth={2.5} />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Contact Info */}
              <div className="bg-[#FAF9F6] p-6 rounded-2xl border-2 border-[#1a1a1a]/5 space-y-4">
                <h4 className="font-black text-[#1a1a1a] text-sm uppercase tracking-wider flex items-center gap-2">
                  <Phone size={16} className="text-[#DC2626]" /> Kontak
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoRow
                    icon={<Phone size={14} />}
                    label="WhatsApp"
                    value={selectedCustomer.phone}
                  />
                  <InfoRow
                    icon={<Mail size={14} />}
                    label="Email"
                    value={selectedCustomer.email}
                  />
                </div>
              </div>

              {/* Work Info */}
              {(selectedCustomer.occupation ||
                selectedCustomer.company_name) && (
                <div className="bg-[#FAF9F6] p-6 rounded-2xl border-2 border-[#1a1a1a]/5 space-y-4">
                  <h4 className="font-black text-[#1a1a1a] text-sm uppercase tracking-wider flex items-center gap-2">
                    <Briefcase size={16} className="text-[#2563EB]" /> Pekerjaan
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow
                      icon={<Briefcase size={14} />}
                      label="Pekerjaan"
                      value={selectedCustomer.occupation}
                    />
                    <InfoRow
                      icon={<Building2 size={14} />}
                      label="Perusahaan"
                      value={selectedCustomer.company_name}
                    />
                  </div>
                  {selectedCustomer.company_address && (
                    <InfoRow
                      icon={<MapPin size={14} />}
                      label="Alamat Perusahaan"
                      value={selectedCustomer.company_address}
                    />
                  )}
                </div>
              )}

              {/* Address */}
              <div className="bg-[#FAF9F6] p-6 rounded-2xl border-2 border-[#1a1a1a]/5 space-y-4">
                <h4 className="font-black text-[#1a1a1a] text-sm uppercase tracking-wider flex items-center gap-2">
                  <MapPin size={16} className="text-[#DC2626]" /> Alamat
                  Domisili
                </h4>
                <InfoRow
                  icon={<MapPin size={14} />}
                  label="Alamat Lengkap"
                  value={selectedCustomer.address}
                />
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <InfoRow
                    icon={null}
                    label="Kelurahan"
                    value={selectedCustomer.kelurahan}
                  />
                  <InfoRow
                    icon={null}
                    label="Kecamatan"
                    value={selectedCustomer.kecamatan}
                  />
                  <InfoRow
                    icon={null}
                    label="Kota"
                    value={selectedCustomer.city}
                  />
                  <InfoRow
                    icon={null}
                    label="Provinsi"
                    value={selectedCustomer.province}
                  />
                </div>
              </div>

              {/* Social Media */}
              {(selectedCustomer.facebook_account ||
                selectedCustomer.instagram_account ||
                selectedCustomer.tiktok_account) && (
                <div className="bg-[#FAF9F6] p-6 rounded-2xl border-2 border-[#1a1a1a]/5 space-y-4">
                  <h4 className="font-black text-[#1a1a1a] text-sm uppercase tracking-wider flex items-center gap-2">
                    <Facebook size={16} className="text-[#2563EB]" /> Media
                    Sosial
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {selectedCustomer.facebook_account && (
                      <InfoRow
                        icon={<Facebook size={14} />}
                        label="Facebook"
                        value={selectedCustomer.facebook_account}
                      />
                    )}
                    {selectedCustomer.instagram_account && (
                      <InfoRow
                        icon={<Instagram size={14} />}
                        label="Instagram"
                        value={selectedCustomer.instagram_account}
                      />
                    )}
                    {selectedCustomer.tiktok_account && (
                      <InfoRow
                        icon={<FileText size={14} />}
                        label="TikTok"
                        value={selectedCustomer.tiktok_account}
                      />
                    )}
                  </div>
                </div>
              )}

              {/* Emergency Contact */}
              {(selectedCustomer.emergency_contact_name ||
                selectedCustomer.emergency_contact_phone) && (
                <div className="bg-red-50 p-6 rounded-2xl border-2 border-red-100 space-y-4">
                  <h4 className="font-black text-[#1a1a1a] text-sm uppercase tracking-wider flex items-center gap-2">
                    <Heart size={16} className="text-red-500" /> Kontak Darurat
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InfoRow
                      icon={<User size={14} />}
                      label="Nama"
                      value={selectedCustomer.emergency_contact_name}
                    />
                    <InfoRow
                      icon={<FileText size={14} />}
                      label="Hubungan"
                      value={selectedCustomer.emergency_contact_relation}
                    />
                    <InfoRow
                      icon={<Phone size={14} />}
                      label="Telepon"
                      value={selectedCustomer.emergency_contact_phone}
                    />
                  </div>
                  {selectedCustomer.emergency_contact_address && (
                    <InfoRow
                      icon={<MapPin size={14} />}
                      label="Alamat"
                      value={selectedCustomer.emergency_contact_address}
                    />
                  )}
                </div>
              )}

              {/* Documents */}
              <div className="bg-[#FAF9F6] p-6 rounded-2xl border-2 border-[#1a1a1a]/5 space-y-4">
                <h4 className="font-black text-[#1a1a1a] text-sm uppercase tracking-wider flex items-center gap-2">
                  <ImageIcon size={16} className="text-[#DC2626]" /> Dokumen
                </h4>
                <div className="grid grid-cols-2 gap-4">
                  <DocButton label="KTP" url={selectedCustomer.ktp_url} />
                  <DocButton label="SIM C" url={selectedCustomer.sim_url} />
                </div>
              </div>

              {/* Student Status Approval */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 p-6 rounded-2xl border-2 border-amber-200 space-y-4">
                <h4 className="font-black text-[#1a1a1a] text-sm uppercase tracking-wider flex items-center gap-2">
                  <User size={16} className="text-amber-600" /> Status
                  Pelajar/Mahasiswa
                </h4>

                {selectedCustomer.ktm_url ? (
                  <>
                    <div className="flex items-center gap-4">
                      <DocButton
                        label="KTM (Kartu Tanda Mahasiswa)"
                        url={selectedCustomer.ktm_url}
                      />
                    </div>
                     <div className="flex items-center justify-between p-4 bg-white rounded-2xl border-2 border-[#1a1a1a]/5">
                       <div>
                         <p className="font-bold text-[#1a1a1a]">
                           Status Mahasiswa
                         </p>
                         <p className="text-sm text-[#1a1a1a]/60">
                           {selectedCustomer.student_status_approved
                             ? "Disetujui sebagai mahasiswa"
                             : "Belum disetujui sebagai mahasiswa"}
                         </p>
                       </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedCustomer.student_status_approved}
                          onChange={(e) =>
                            handleToggleStudent(
                              selectedCustomer.id,
                              e.target.checked,
                            )
                          }
                          disabled={updatingStudent}
                          className="sr-only peer"
                        />
                        <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-amber-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-amber-500"></div>
                      </label>
                    </div>
                  </>
                ) : (
                  <div className="p-4 bg-white rounded-2xl border-2 border-dashed border-[#1a1a1a]/10 text-center">
                    <p className="text-sm text-[#1a1a1a]/60">
                      Customer belum mengupload KTM
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function DocButton({ label, url, small }: { label: string; url: string | null; small?: boolean }) {
  if (!url)
    return (
      <div className={
        small
          ? "py-2 px-2 border-2 border-dashed border-[#1a1a1a]/10 rounded-xl text-[10px] text-[#1a1a1a]/20 text-center uppercase font-black bg-white min-h-0 h-9"
          : "p-4 border-2 border-dashed border-[#1a1a1a]/10 rounded-2xl text-xs text-[#1a1a1a]/20 text-center uppercase font-black bg-white"
      }>
        No {label}
      </div>
    );
  return (
    <a
      href={url}
      target="_blank"
      className={
        small
          ? "flex-1 py-2 px-2 bg-gradient-to-r from-[#DC2626]/10 to-[#DC2626]/20 border-2 border-[#DC2626]/30 rounded-xl flex items-center justify-center text-[11px] font-black text-[#DC2626] hover:from-[#DC2626] hover:to-[#EF4444] hover:text-white transition-all uppercase hover:scale-105 min-h-0 h-9"
          : "p-4 bg-gradient-to-r from-[#DC2626]/10 to-[#DC2626]/20 border-2 border-[#DC2626]/30 rounded-2xl flex items-center justify-center text-sm font-black text-[#DC2626] hover:from-[#DC2626] hover:to-[#EF4444] hover:text-white transition-all uppercase hover:scale-105"
      }
      style={small ? { minHeight: 0, height: '36px', fontSize: '11px' } : {}}
    >
      Lihat {label}
    </a>
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
    <div className="flex items-start gap-2 p-3 bg-white rounded-xl border border-[#1a1a1a]/5">
      {icon && <div className="text-[#DC2626] shrink-0 mt-0.5">{icon}</div>}
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-black text-[#1a1a1a]/40 uppercase tracking-wider">
          {label}
        </p>
        <p className="text-sm font-bold text-[#1a1a1a] break-words">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}
