'use client'
import { useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, Lock, ArrowRight, MapPin, Shield, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSweetAlert } from '@/utils/useSweetAlert'

export default function LoginPage() {
  const [identifier, setIdentifier] = useState('')  // email or username
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()
  const swal = useSweetAlert()

  const isEmail = (value: string) => value.includes('@')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    let email = identifier.trim()

    // If not email format, look up by username (full_name)
    if (!isEmail(email)) {
      try {
        const res = await fetch('/api/get-email-by-username', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username: email }),
        })
        const result = await res.json() as { email?: string; error?: string }
        if (!res.ok || !result.email) {
          const errorMsg = result.error || 'Username tidak ditemukan'
          setError(errorMsg)
          swal.error('Username Tidak Ditemukan', errorMsg)
          setLoading(false)
          return
        }
        email = result.email
      } catch {
        const errorMsg = 'Gagal mengecek username. Coba lagi.'
        setError(errorMsg)
        swal.error('Kesalahan', errorMsg)
        setLoading(false)
        return
      }
    }

    const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password })

    if (signInError) {
      const errorMsg = 'Email/username atau password salah'
      setError(errorMsg)
      swal.error('Login Gagal', errorMsg)
      setLoading(false)
      return
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single()

    swal.success('Login Berhasil', 'Selamat datang kembali!', () => {
      if (profile?.role === 'owner') {
        router.push('/dashboard')
      } else {
        router.push('/')
      }
    })
  }

  const inputIsEmail = isEmail(identifier)

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-white">
      {/* Left Side */}
      <div className="lg:w-1/2 bg-[#2563EB] flex items-center justify-center p-8 lg:p-16 relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
        <div className="max-w-lg relative z-10">
          <Link href="/" className="inline-flex items-center gap-4 mb-12 group">
            <div className="relative w-16 h-16">
              <div className="absolute inset-0 bg-white rounded-2xl rotate-6 group-hover:rotate-12 transition-transform"></div>
              <div className="relative w-full h-full bg-[#1a1a1a] rounded-2xl flex items-center justify-center overflow-hidden shadow-xl">
                <Image src="/images/logo.png" alt="Rental Motor Kukusan Logo" width={64} height={64} className="object-contain p-2" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Rental Motor</h1>
              <p className="text-sm text-white/90 font-bold">Kukusan</p>
            </div>
          </Link>
          <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 leading-tight tracking-tight">
            Selamat<br />Datang Kembali
          </h2>
          <p className="text-lg text-white/90 mb-12 leading-relaxed">
            Masuk ke akun Anda dan lanjutkan perjalanan berkendara dengan motor berkualitas terbaik.
          </p>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <MapPin className="text-white" size={24} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-sm font-bold text-white/80">Lokasi Strategis</div>
                <div className="text-xs text-white/60">Kukusan, Depok</div>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                <Shield className="text-white" size={24} strokeWidth={2.5} />
              </div>
              <div>
                <div className="text-sm font-bold text-white/80">Terpercaya & Aman</div>
                <div className="text-xs text-white/60">Motor terawat dengan baik</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="lg:w-1/2 flex items-center justify-center p-8 lg:p-16 bg-[#FAF9F6]">
        <div className="w-full max-w-md">
          <form onSubmit={handleLogin} className="bg-white p-10 rounded-3xl border-2 border-[#1a1a1a]/10 shadow-xl">
            <div className="mb-8">
              <h2 className="text-3xl font-black mb-2 text-[#1a1a1a]">Masuk</h2>
              <p className="text-sm text-[#1a1a1a]/60">Gunakan email atau nama lengkap Anda</p>
            </div>

            {error && (
              <div className="mb-5 p-4 bg-red-50 border-2 border-red-200 text-red-700 text-sm rounded-2xl font-bold">
                {error}
              </div>
            )}

            <div className="space-y-5">
              {/* Email or Username */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-[#1a1a1a]/80 uppercase tracking-wide">
                  Email atau Nama Lengkap
                </label>
                <div className="relative">
                  {inputIsEmail
                    ? <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-[#2563EB]" size={18} />
                    : <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#1a1a1a]/40" size={18} />
                  }
                  <input
                    type="text"
                    placeholder="email@anda.com atau Nama Lengkap"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-[#FAF9F6] border-2 border-[#1a1a1a]/10 rounded-2xl outline-none focus:border-[#2563EB] focus:bg-[#2563EB]/5 transition-all text-sm font-medium"
                    required
                  />
                </div>
                {!inputIsEmail && identifier.length > 0 && (
                  <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 bg-blue-400 rounded-full inline-block" />
                    Login sebagai nama: <span className="text-blue-600">{identifier}</span>
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-bold text-[#1a1a1a]/80 uppercase tracking-wide">Password</label>
                  <Link href="/forgot-password" className="text-xs text-[#2563EB] font-bold hover:underline">
                    Lupa password?
                  </Link>
                </div>
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

              <button
                disabled={loading}
                className="w-full bg-[#2563EB] hover:bg-[#2563EB]/90 text-white py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-2 group mt-8 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {loading ? 'Masuk...' : 'Masuk Sekarang'}
                {!loading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
              </button>
            </div>

            <div className="mt-8 pt-6 border-t border-[#1a1a1a]/10 text-center text-sm text-[#1a1a1a]/60">
              Belum punya akun?{' '}
              <Link href="/register" className="text-[#2563EB] font-bold hover:underline">
                Daftar Sekarang
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}