'use client';

import Image from 'next/image';
import { ChevronRight, Zap } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-[90vh] overflow-hidden bg-gradient-to-br from-[#FAF9F6] via-[#FAF9F6] to-[#FFE8DD]">
      {/* Dynamic Background Pattern */}
      <div className="absolute inset-0 opacity-[0.015]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")` }}></div>
      
      {/* Diagonal Speed Lines */}
      <div className="absolute top-0 right-0 w-full h-full opacity-5">
        <div className="absolute top-1/4 -right-20 w-[600px] h-1 bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent rotate-12 animate-pulse"></div>
        <div className="absolute top-1/3 -right-32 w-[500px] h-0.5 bg-gradient-to-r from-transparent via-[#00D9FF] to-transparent rotate-12 animation-delay-300"></div>
        <div className="absolute top-1/2 -right-24 w-[550px] h-1 bg-gradient-to-r from-transparent via-[#FF6B35] to-transparent rotate-12 animation-delay-700"></div>
      </div>

      <div className="max-w-7xl mx-auto px-6 pt-20 pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Content */}
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#FF6B35]/10 to-[#FF6B35]/5 border border-[#FF6B35]/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Zap className="w-4 h-4 text-[#FF6B35]" fill="#FF6B35" />
              <span className="text-xs font-bold tracking-wider uppercase text-[#1a1a1a]">Rental Terpercaya</span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <h1 className="text-7xl md:text-8xl font-black leading-[0.9] tracking-tight text-[#1a1a1a]">
                Sewa
                <span className="block mt-2 bg-gradient-to-r from-[#FF6B35] to-[#FF8F5F] bg-clip-text text-transparent">Motor</span>
                <span className="block text-5xl md:text-6xl font-bold tracking-normal mt-3">Tanpa Ribet</span>
              </h1>
              
              <div className="h-1 w-24 bg-gradient-to-r from-[#FF6B35] to-transparent rounded-full"></div>
            </div>

            {/* Description */}
            <p className="text-lg leading-relaxed text-[#1a1a1a]/70 max-w-md font-medium">
              Proses cepat, verifikasi aman, motor siap pakai.
              <span className="block mt-2 text-[#FF6B35] font-bold">Booking sekarang, gas besok.</span>
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 pt-4">
              <a 
                href="#motor"
                className="group relative inline-flex items-center gap-3 bg-[#1a1a1a] text-white px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#1a1a1a]/20"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] to-[#FF8F5F] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative">Lihat Motor</span>
                <ChevronRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />
                
                {/* Shimmer Effect */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000"></span>
              </a>

              <a 
                href="#alur"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-[#1a1a1a]/10 text-[#1a1a1a] hover:border-[#FF6B35] hover:text-[#FF6B35] transition-all"
              >
                Cara Sewa
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-[#1a1a1a]/10">
              <div>
                <div className="text-3xl font-black text-[#FF6B35]">500+</div>
                <div className="text-sm font-medium text-[#1a1a1a]/60 uppercase tracking-wide">Trip Selesai</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#FF6B35]">15+</div>
                <div className="text-sm font-medium text-[#1a1a1a]/60 uppercase tracking-wide">Unit Motor</div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#FF6B35]">4.9</div>
                <div className="text-sm font-medium text-[#1a1a1a]/60 uppercase tracking-wide">Rating</div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="relative animate-in slide-in-from-right duration-700 animation-delay-300">
            <div className="absolute -top-8 -right-8 w-72 h-72 bg-gradient-to-br from-[#FF6B35]/20 to-[#00D9FF]/20 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-8 left-8 w-64 h-64 bg-gradient-to-tr from-[#00D9FF]/10 to-transparent rounded-full blur-3xl"></div>
            
            <div className="relative transform hover:scale-105 transition-transform duration-500">
              <Image 
                src="/images/banner3.png" 
                alt="Motor" 
                width={700} 
                height={600} 
                className="w-full h-auto drop-shadow-2xl relative z-10" 
                priority
              />
            </div>

            {/* Floating Card */}
            <div className="absolute bottom-12 -left-4 bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-[#1a1a1a]/5 animate-in zoom-in duration-700 animation-delay-1000 hover:scale-105 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#FF6B35] to-[#FF8F5F] flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" fill="white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1a1a1a]/60 uppercase tracking-wider">Mulai dari</div>
                  <div className="text-2xl font-black text-[#1a1a1a]">Rp 50K/hari</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}