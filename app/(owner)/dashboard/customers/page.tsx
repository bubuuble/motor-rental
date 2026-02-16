'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User, Mail, Phone, MapPin, Loader2, Image as ImageIcon } from 'lucide-react';

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
}

export default function CustomersManagement() {
  const [customers, setCustomers] = useState<CustomerProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = useMemo(() => createClient(), []);

  const fetchCustomers = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase.from('profiles').select('*').eq('role', 'customer');
    if (data) setCustomers(data as unknown as CustomerProfile[]);
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    const load = async () => { await fetchCustomers(); };
    load();
  }, [fetchCustomers]);

  if (loading) return <div className="p-20 flex justify-center"><Loader2 className="animate-spin text-blue-600" /></div>;

  return (
    <div className="space-y-8">
      <div className="relative">
        <div className="absolute -top-4 -left-4 w-32 h-32 bg-gradient-to-br from-[#00D9FF]/20 to-[#FF6B35]/20 rounded-full blur-3xl"></div>
        <h2 className="text-4xl font-black text-[#1a1a1a] tracking-tight relative z-10">Daftar Customer</h2>
        <p className="text-xs text-[#1a1a1a]/40 font-bold uppercase tracking-widest mt-2 relative z-10">Database pelanggan rental</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map((c, index) => (
          <div 
            key={c.id} 
            className="bg-white/80 backdrop-blur-sm p-6 rounded-3xl border-2 border-[#1a1a1a] shadow-lg space-y-4 flex flex-col hover:shadow-2xl hover:shadow-[#00D9FF]/10 transition-all hover:scale-105 animate-in fade-in slide-in-from-bottom-4"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex gap-4 items-center">
              <div className="w-14 h-14 bg-gradient-to-br from-[#00D9FF] to-[#00B8D9] rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-lg">
                {c.full_name?.charAt(0).toUpperCase() || <User size={24} strokeWidth={2.5} />}
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-black text-[#1a1a1a] truncate">{c.full_name || 'No Name'}</h3>
                <p className="text-[10px] text-[#1a1a1a]/40 flex items-center gap-1 font-bold"><Mail size={10}/> {c.email}</p>
              </div>
            </div>

            <div className="space-y-2 flex-1">
              <p className="flex items-center gap-2 text-xs font-bold text-[#1a1a1a] bg-[#FAF9F6] p-3 rounded-2xl border-2 border-[#1a1a1a]/5">
                <Phone size={14} className="text-[#00D9FF]" strokeWidth={2.5} /> {c.phone || '-'}
              </p>
              
              {/* Full Address Details */}
              <div className="bg-[#FAF9F6] p-4 rounded-2xl border-2 border-[#1a1a1a]/5 space-y-2">
                <div className="flex items-start gap-2">
                  <MapPin size={14} className="text-[#FF6B35] shrink-0 mt-0.5" strokeWidth={2.5} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#1a1a1a] mb-2">{c.address || '-'}</p>
                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      <div>
                        <span className="text-[#1a1a1a]/40 font-bold block">Kelurahan</span>
                        <span className="text-[#1a1a1a] font-bold">{c.kelurahan || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[#1a1a1a]/40 font-bold block">Kecamatan</span>
                        <span className="text-[#1a1a1a] font-bold">{c.kecamatan || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[#1a1a1a]/40 font-bold block">Kota</span>
                        <span className="text-[#1a1a1a] font-bold">{c.city || '-'}</span>
                      </div>
                      <div>
                        <span className="text-[#1a1a1a]/40 font-bold block">Provinsi</span>
                        <span className="text-[#1a1a1a] font-bold">{c.province || '-'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4 border-t-2 border-[#1a1a1a]/10">
              <DocButton label="KTP" url={c.ktp_url} />
              <DocButton label="SIM" url={c.sim_url} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function DocButton({ label, url }: { label: string, url: string | null }) {
  if (!url) return <div className="flex-1 p-3 border-2 border-dashed border-[#1a1a1a]/10 rounded-2xl text-[9px] text-[#1a1a1a]/20 font-black text-center uppercase bg-[#FAF9F6]">No {label}</div>;
  return (
    <a href={url} target="_blank" className="flex-1 p-3 bg-gradient-to-r from-[#00D9FF]/10 to-[#00D9FF]/20 border-2 border-[#00D9FF]/30 rounded-2xl flex items-center justify-center gap-2 text-[9px] font-black text-[#00D9FF] hover:from-[#00D9FF] hover:to-[#00B8D9] hover:text-white transition-all uppercase hover:scale-105">
      <ImageIcon size={12} strokeWidth={2.5} /> {label}
    </a>
  );
}