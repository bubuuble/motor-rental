'use client';

import { useState } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Loader2, ArrowRight, CheckCircle2, Clock, Shield } from 'lucide-react';
import Image from 'next/image';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const router = useRouter();
  const supabase = createClient();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        // Data ini akan ditangkap oleh Trigger SQL (new.raw_user_meta_data)
        data: {
          full_name: fullName,
        },
      },
    });

    if (signUpError) {
      setError(signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      alert('Registrasi Berhasil! Silakan cek email Anda untuk verifikasi (jika aktif) atau silakan login.');
      router.push('/login');
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Side - Brand Section */}
      <div className="lg:w-1/2 bg-[#1a1a1a] flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
        
        <div className="max-w-lg relative z-10">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-4 mb-12 group">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-[#2563EB] rounded-2xl rotate-6 group-hover:rotate-12 transition-transform"></div>
              <div className="relative w-full h-full bg-white rounded-2xl flex items-center justify-center overflow-hidden shadow-xl">
                <Image 
                  src="/images/logo.png" 
                  alt="Rental Motor Kukusan Logo" 
                  width={64} 
                  height={64} 
                  className="object-contain p-2"
                />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Rental Motor</h1>
              <p className="text-sm text-white/90 font-bold">Kukusan</p>
            </div>
          </Link>

          {/* Tagline */}
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
            Mulai<br />
            Petualangan Anda
          </h2>
          <p className="text-lg text-white/90 mb-12 leading-relaxed">
            Bergabunglah dengan ribuan pengendara yang telah mempercayai kami untuk perjalanan mereka.
          </p>

          {/* Benefits List */}
          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#2563EB] flex items-center justify-center shrink-0">
                <CheckCircle2 className="text-white" size={24} strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-black text-white mb-1">Proses Cepat & Mudah</div>
                <div className="text-sm text-white/70">Booking motor hanya dalam hitungan menit</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Shield className="text-white" size={24} strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-black text-white mb-1">Motor Terawat</div>
                <div className="text-sm text-white/70">Semua unit selalu dalam kondisi prima</div>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center shrink-0">
                <Clock className="text-white" size={24} strokeWidth={2.5} />
              </div>
              <div>
                <div className="font-black text-white mb-1">Layanan 24/7</div>
                <div className="text-sm text-white/70">Siap melayani kapan pun Anda butuhkan</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Register Form */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-[#FAF9F6]">
        <div className="w-full max-w-md">
          <div className="bg-white p-10 rounded-3xl border-2 border-[#1a1a1a]/10 shadow-xl">
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-2 text-[#1a1a1a]">Daftar Akun</h2>
              <p className="text-sm text-[#1a1a1a]/60">Mulai sewa motor dengan mudah sekarang</p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 text-red-600 text-sm rounded-2xl text-center font-bold">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="space-y-5">
              {/* Name Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1a1a]/80 uppercase tracking-wide">Nama Lengkap</label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40" size={18} />
                  <input 
                    type="text" 
                    placeholder="John Doe" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#FAF9F6] border-2 border-[#1a1a1a]/10 rounded-2xl outline-none focus:border-[#2563EB] focus:bg-[#2563EB]/5 transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1a1a]/80 uppercase tracking-wide">Email</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40" size={18} />
                  <input 
                    type="email" 
                    placeholder="email@anda.com" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#FAF9F6] border-2 border-[#1a1a1a]/10 rounded-2xl outline-none focus:border-[#2563EB] focus:bg-[#2563EB]/5 transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1a1a]/80 uppercase tracking-wide">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40" size={18} />
                  <input 
                    type="password" 
                    placeholder="••••••••" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#FAF9F6] border-2 border-[#1a1a1a]/10 rounded-2xl outline-none focus:border-[#2563EB] focus:bg-[#2563EB]/5 transition-all text-sm font-medium"
                    required
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-[#1a1a1a] hover:bg-[#1a1a1a]/90 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 mt-8 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin" size={20} />
                    Membuat Akun...
                  </>
                ) : (
                  <>
                    Buat Akun Sekarang
                    <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            {/* Login Link */}
            <div className="mt-8 pt-6 border-t border-[#1a1a1a]/10 text-center text-sm text-[#1a1a1a]/60">
              Sudah punya akun?{' '}
              <Link href="/login" className="text-[#2563EB] font-bold hover:underline">
                Masuk di sini
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}