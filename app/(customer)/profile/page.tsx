'use client';

import { useState, useEffect, useMemo } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Loader2, Upload, FileCheck, MapPin } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

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
  role: 'customer' | 'owner';
  ktp_url: string | null;
  sim_url: string | null;
}

interface InputFieldProps {
  label: string;
  placeholder?: string;
  defaultValue?: string;
  type?: string;
  name: string;
}

export default function ProfilePage() {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [ktpUrl, setKtpUrl] = useState<string | null>(null);
  const [simUrl, setSimUrl] = useState<string | null>(null);

  const supabase = useMemo(() => createClient(), []);
  const router = useRouter();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        // Redirect to login if not authenticated
        if (!user) {
          router.push('/login');
          return;
        }
        
        if (user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
          
          if (!error && data) {
            const typedProfile = data as Profile;
            setProfile(typedProfile);
            setKtpUrl(typedProfile.ktp_url);
            setSimUrl(typedProfile.sim_url);
          }
        }
      } catch (err) {
        console.error("Error fetching profile:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [supabase, router]);

  // LOGIK UNTUK SIMPAN DATA TEKS
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUpdating(true);

    const formData = new FormData(e.currentTarget);
    const updates = {
      full_name: formData.get('full_name') as string,
      phone: formData.get('phone') as string,
      address: formData.get('address') as string,
      kelurahan: formData.get('kelurahan') as string,
      kecamatan: formData.get('kecamatan') as string,
      city: formData.get('city') as string,
      province: formData.get('province') as string,
    };

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak ditemukan");

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      // UPDATE STATE LOKAL AGAR WEB LANGSUNG BERUBAH
      setProfile((prev) => prev ? { ...prev, ...updates } : null);
      
      alert("Profil berhasil diperbarui!");
    } catch (error) {
      console.error("Error update:", error);
      if (error instanceof Error) alert(`Gagal menyimpan: ${error.message}`);
    } finally {
      setUpdating(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'ktp' | 'sim') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUpdating(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User tidak ditemukan");

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${type}-${Date.now()}.${fileExt}`; // Tambah timestamp agar tidak cache
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('documents')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('documents')
        .getPublicUrl(filePath);

      if (type === 'ktp') setKtpUrl(publicUrl);
      if (type === 'sim') setSimUrl(publicUrl);

      await supabase
        .from('profiles')
        .update({ [`${type}_url`]: publicUrl })
        .eq('id', user.id);

      alert(`${type.toUpperCase()} berhasil diupload!`);
    } catch (error) {
      if (error instanceof Error) alert(error.message);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FAF9F6] to-white">
      <Loader2 className="animate-spin text-[#FF6B35]" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-[#FAF9F6] to-white py-12">
      <div className="max-w-5xl mx-auto px-4">
        {/* Header */}
        <div className="mb-12 space-y-4">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#00D9FF]/10 border border-[#FF6B35]/20 px-4 py-2 rounded-full">
            <User size={14} className="text-[#FF6B35]" />
            <span className="text-xs font-bold tracking-wider uppercase text-[#1a1a1a]">Profil Saya</span>
          </div>
          <h1 className="text-5xl font-black text-[#1a1a1a] tracking-tight">Data Diri</h1>
          <p className="text-lg text-[#1a1a1a]/60 font-medium">Lengkapi data diri dan dokumen untuk menyewa motor.</p>
        </div>

        {/* Bungkus dengan Form dan onSubmit */}
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white border-2 border-[#1a1a1a]/10 rounded-3xl p-6 text-center shadow-lg hover:shadow-2xl hover:shadow-[#FF6B35]/10 transition-all">
              <div className="relative w-28 h-28 mx-auto mb-5 bg-gradient-to-br from-[#FF6B35] to-[#FF8F5F] rounded-3xl flex items-center justify-center text-white font-black text-4xl shadow-xl">
                {profile?.full_name?.charAt(0).toUpperCase() || <User size={48} />}
              </div>
              <h2 className="font-black text-xl text-[#1a1a1a] tracking-tight">{profile?.full_name || 'No Name'}</h2>
              <p className="text-sm text-[#1a1a1a]/40 font-medium mt-1">{profile?.email}</p>
              <div className="mt-5 pt-5 border-t border-[#1a1a1a]/10">
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wider ${
                  profile?.role === 'owner' 
                    ? 'bg-purple-100 text-purple-700 border-2 border-purple-200' 
                    : 'bg-[#00D9FF]/10 text-[#00D9FF] border-2 border-[#00D9FF]/20'
                }`}>
                  {profile?.role === 'owner' ? 'Owner' : 'Customer'}
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border-2 border-[#1a1a1a]/10 rounded-3xl p-6 shadow-lg space-y-5 hover:shadow-2xl hover:shadow-[#FF6B35]/10 transition-all">
              <div className="flex items-center gap-3 pb-4 border-b border-[#1a1a1a]/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF8F5F] flex items-center justify-center">
                  <User size={20} className="text-white" />
                </div>
                <h3 className="font-black text-[#1a1a1a] tracking-tight">Informasi Pribadi</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField label="Nama Lengkap *" name="full_name" defaultValue={profile?.full_name ?? ''} />
                <InputField label="No WhatsApp *" name="phone" defaultValue={profile?.phone ?? ''} placeholder="08123..." type="tel" />
              </div>
            </div>

            <div className="bg-white border-2 border-[#1a1a1a]/10 rounded-3xl p-6 shadow-lg space-y-5 hover:shadow-2xl hover:shadow-[#00D9FF]/10 transition-all">
              <div className="flex items-center gap-3 pb-4 border-b border-[#1a1a1a]/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#00D9FF] to-[#00B8D9] flex items-center justify-center">
                  <MapPin size={20} className="text-white" />
                </div>
                <h3 className="font-black text-[#1a1a1a] tracking-tight">Alamat Domisili</h3>
              </div>
              <div className="space-y-4">
                <InputField label="Alamat Lengkap *" name="address" defaultValue={profile?.address ?? ''} />
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Kelurahan *" name="kelurahan" defaultValue={profile?.kelurahan ?? ''} />
                  <InputField label="Kecamatan *" name="kecamatan" defaultValue={profile?.kecamatan ?? ''} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InputField label="Kota / Kabupaten *" name="city" defaultValue={profile?.city ?? ''} />
                  <InputField label="Provinsi *" name="province" defaultValue={profile?.province ?? ''} />
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-[#1a1a1a]/10 rounded-3xl p-6 shadow-lg space-y-6 hover:shadow-2xl hover:shadow-[#FF6B35]/10 transition-all">
              <div className="flex items-center gap-3 pb-4 border-b border-[#1a1a1a]/10">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#FF6B35] to-[#FF8F5F] flex items-center justify-center">
                  <FileCheck size={20} className="text-white" />
                </div>
                <h3 className="font-black text-[#1a1a1a] tracking-tight">Dokumen Identitas</h3>
              </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <UploadCard 
                label="Foto KTP *" 
                url={ktpUrl} 
                onChange={(e) => handleFileUpload(e, 'ktp')} 
              />
              <UploadCard 
                label="Foto SIM C *" 
                url={simUrl} 
                onChange={(e) => handleFileUpload(e, 'sim')} 
              />
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button 
              type="submit"
              disabled={updating}
              className="group relative bg-[#1a1a1a] text-white px-10 py-4 rounded-2xl font-black shadow-lg flex items-center gap-3 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transition-all hover:scale-105 uppercase tracking-wide text-sm"
            >
              <span className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] to-[#FF8F5F] opacity-0 group-hover:opacity-100 transition-opacity"></span>
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

// Komponen Pembantu agar kode lebih bersih
function InputField({ label, placeholder, defaultValue, type = "text", name }: InputFieldProps) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-bold text-[#1a1a1a]">{label}</label>
      <input 
        name={name}
        type={type}
        className="w-full border-2 border-[#1a1a1a]/10 p-3 rounded-2xl text-sm outline-none focus:border-[#FF6B35] focus:bg-[#FF6B35]/5 bg-[#FAF9F6] font-medium transition-all" 
        placeholder={placeholder}
        defaultValue={defaultValue}
      />
    </div>
  );
}

function UploadCard({ label, url, onChange }: { label: string, url: string | null, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) {
  return (
    <div className="space-y-3">
      <label className="text-sm font-bold text-[#1a1a1a]">{label}</label>
      <div className="relative h-48 border-2 border-dashed border-[#1a1a1a]/20 rounded-3xl overflow-hidden flex flex-col items-center justify-center group bg-gradient-to-br from-[#FAF9F6] to-[#FFE8DD]/30 hover:border-[#FF6B35] transition-all cursor-pointer">
        {url ? (
          <>
            <Image src={url} alt={label} fill className="object-cover" />
            <div className="absolute inset-0 bg-[#1a1a1a]/60 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <span className="bg-white text-[#FF6B35] px-5 py-2 text-xs font-black rounded-full uppercase tracking-wider shadow-xl">Ganti Foto</span>
            </div>
          </>
        ) : (
          <>
            <Upload className="text-[#1a1a1a]/30 mb-3 group-hover:text-[#FF6B35] transition-colors" size={40} />
            <span className="text-xs font-black text-[#FF6B35] uppercase tracking-wider">Klik untuk Upload</span>
            <span className="text-[10px] text-[#1a1a1a]/40 font-medium mt-1">JPG, PNG maks 5MB</span>
          </>
        )}
        <input type="file" className="absolute inset-0 opacity-0 cursor-pointer" onChange={onChange} accept="image/*" />
      </div>
    </div>
  );
}