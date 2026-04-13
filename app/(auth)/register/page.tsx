'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { User, Mail, Lock, Loader2, ArrowRight, CheckCircle2, Clock, Shield, Eye, EyeOff } from 'lucide-react';
import Image from 'next/image';
import { useSweetAlert } from '@/utils/useSweetAlert';

export default function RegisterPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [passwordTouched, setPasswordTouched] = useState(false);

  const passwordRules = {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };
  const isPasswordValid = Object.values(passwordRules).every(Boolean);
  
  const router = useRouter();
  const supabase = createClient();
  const swal = useSweetAlert();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isPasswordValid) {
      setPasswordTouched(true);
      swal.warning('Password Tidak Valid', 'Pastikan password memenuhi semua kriteria keamanan.');
      return;
    }
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
      swal.error('Registrasi Gagal', signUpError.message);
      setLoading(false);
      return;
    }

    if (data.user) {
      setIsOtpSent(true);
      setResendCooldown(60);
      swal.success('OTP Terkirim', 'Silakan cek email Anda untuk kode OTP 6 digit.');
    }
    setLoading(false);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: otpCode,
      type: 'signup'
    });

    if (verifyError) {
      setError(verifyError.message);
      swal.error('Verifikasi Gagal', verifyError.message);
      setLoading(false);
      return;
    }

    swal.success('Registrasi Berhasil', 'Email Anda telah diverifikasi.', () => {
      if (data.session) {
        router.refresh();
        router.push('/');
      } else {
        router.push('/login');
      }
    });
  };

  const handleResendOtp = async () => {
    setLoading(true);
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email,
    });
    if (error) {
      swal.error('Gagal Mengirim Ulang', error.message);
    } else {
      setResendCooldown(60);
      swal.success('OTP Dikirim Ulang', `Kode baru telah dikirim ke ${email}.`);
    }
    setLoading(false);
  };

  // Countdown timer for resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [resendCooldown]);

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

            {!isOtpSent ? (
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
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => { setPassword(e.target.value); setPasswordTouched(true); }}
                      className={`w-full pl-12 pr-12 py-4 bg-[#FAF9F6] border-2 rounded-2xl outline-none transition-all text-sm font-medium ${
                        passwordTouched && !isPasswordValid
                          ? 'border-red-300 focus:border-red-400'
                          : passwordTouched && isPasswordValid
                          ? 'border-green-400 focus:border-green-500'
                          : 'border-[#1a1a1a]/10 focus:border-[#2563EB] focus:bg-[#2563EB]/5'
                      }`}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/30 hover:text-[#1a1a1a]/70 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>

                  {/* Password checklist */}
                  {passwordTouched && (
                    <div className="grid grid-cols-2 gap-1.5 mt-2">
                      {([
                        { key: 'minLength', label: 'Min. 8 karakter' },
                        { key: 'hasUpper',  label: 'Huruf besar (A-Z)' },
                        { key: 'hasLower',  label: 'Huruf kecil (a-z)' },
                        { key: 'hasSymbol', label: 'Simbol (!@#$...)' },
                      ] as const).map(({ key, label }) => (
                        <div key={key} className={`flex items-center gap-1.5 text-xs font-semibold ${
                          passwordRules[key] ? 'text-green-600' : 'text-[#1a1a1a]/40'
                        }`}>
                          <div className={`w-3.5 h-3.5 rounded-full flex items-center justify-center shrink-0 ${
                            passwordRules[key] ? 'bg-green-500' : 'bg-[#1a1a1a]/10'
                          }`}>
                            {passwordRules[key] && (
                              <svg viewBox="0 0 10 10" className="w-2 h-2" fill="none">
                                <path d="M2 5l2.5 2.5L8 3" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          {label}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#1a1a1a] hover:bg-[#1a1a1a]/90 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 mt-6 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
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
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-[#1a1a1a]/80 uppercase tracking-wide">Kode OTP</label>
                  <div className="relative">
                    <Shield className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40" size={18} />
                    <input 
                      type="text" 
                      placeholder="Masukkan 6 digit kode OTP" 
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-[#FAF9F6] border-2 border-[#1a1a1a]/10 rounded-2xl outline-none focus:border-[#2563EB] focus:bg-[#2563EB]/5 transition-all text-sm font-medium tracking-[0.25em]"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-[#1a1a1a]/60">
                    Cek inbox atau folder spam di email <b>{email}</b> Anda.
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || otpCode.length !== 6}
                  className="w-full bg-[#2563EB] hover:bg-[#1d4ed8] text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 mt-8 group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Verifikasi...
                    </>
                  ) : (
                    <>
                      Verifikasi OTP
                      <CheckCircle2 size={20} />
                    </>
                  )}
                </button>

                {/* Resend OTP */}
                <div className="text-center mt-4">
                  {resendCooldown > 0 ? (
                    <p className="text-sm text-[#1a1a1a]/40 font-bold">
                      Kirim ulang OTP dalam{' '}
                      <span className="text-[#2563EB] tabular-nums">{resendCooldown}s</span>
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={loading}
                      className="text-sm text-[#2563EB] font-bold hover:underline disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                      Tidak menerima email? Kirim ulang OTP
                    </button>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => setIsOtpSent(false)}
                  className="w-full text-[#1a1a1a]/60 text-sm font-bold mt-2 hover:text-[#1a1a1a] transition-colors"
                >
                  Kembali ke Pendaftaran
                </button>
              </form>
            )}

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