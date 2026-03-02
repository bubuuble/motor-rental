"use client";

import Image from "next/image";
import { BadgeDollarSign, ChevronRight, Zap } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative min-h-[72vh] lg:min-h-[90vh] overflow-hidden bg-white">

      <div className="max-w-7xl mx-auto px-6 pt-14 sm:pt-16 lg:pt-20 pb-8 sm:pb-12 lg:pb-16 relative z-10">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center lg:items-start">
          {/* Content */}
          <div className="space-y-8 animate-in slide-in-from-left duration-700">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB]/10 to-[#2563EB]/5 border border-[#2563EB]/20 px-4 py-2 rounded-full backdrop-blur-sm">
              <Zap className="w-4 h-4 text-[#2563EB]" fill="#2563EB" />
              <span className="text-xs font-bold tracking-wider uppercase text-[#1a1a1a]">
                Rental Terpercaya
              </span>
            </div>

            {/* Heading */}
            <div className="space-y-4">
              <div className="relative pb-16 sm:pb-20 lg:pb-0 lg:static">
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 w-[72%] max-w-[270px] opacity-45 pointer-events-none lg:hidden">
                  <Image
                    src="/images/banner baru.png"
                    alt="Motor"
                    width={700}
                    height={560}
                    className="w-full h-auto"
                    priority
                  />
                </div>

                <h1 className="relative z-10 max-w-[68%] text-6xl sm:text-7xl md:text-8xl font-black leading-[0.9] tracking-tight text-[#1a1a1a] lg:max-w-none">
                  Sewa
                  <span className="block mt-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
                    Motormu
                  </span>
                  <span className="block text-4xl sm:text-5xl md:text-6xl font-bold tracking-normal mt-3">
                    Sekarang!
                  </span>
                </h1>

                <div className="lg:hidden absolute right-0 bottom-0 z-20 bg-white/95 backdrop-blur-sm px-3 py-2.5 rounded-2xl shadow-lg border border-[#1a1a1a]/10">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                      <BadgeDollarSign className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <div className="text-[9px] font-bold text-[#1a1a1a]/60 uppercase tracking-wider leading-none">
                        Biaya sewa mulai dari
                      </div>
                      <div className="text-base font-black text-[#1a1a1a] leading-tight mt-0.5">
                        Rp 70K/hari
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="h-1 w-24 bg-gradient-to-r from-[#2563EB] to-transparent rounded-full"></div>
            </div>

            {/* Description */}
            <p className="text-lg leading-relaxed text-[#1a1a1a]/70 max-w-md font-medium">
              Proses cepat, verifikasi aman, motor siap pakai.
              <span className="block mt-2 text-[#2563EB] font-bold">
                Solusi mudah transportasi anda!
              </span>
            </p>

            {/* CTA */}
            <div className="flex flex-wrap gap-4 pt-4">
              <a
                href="/motors"
                className="group relative inline-flex items-center gap-3 bg-[#1a1a1a] text-white px-8 py-4 rounded-2xl font-bold text-lg overflow-hidden transition-all hover:scale-105 hover:shadow-2xl hover:shadow-[#1a1a1a]/20"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                <span className="relative">Lihat Motor</span>
                <ChevronRight className="relative w-5 h-5 group-hover:translate-x-1 transition-transform" />

                {/* Shimmer Effect */}
                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000"></span>
              </a>

              <a
                href="#alur"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl font-bold text-lg border-2 border-[#1a1a1a]/10 text-[#1a1a1a] hover:border-[#2563EB] hover:text-[#2563EB] transition-all"
              >
                Cara Sewa
              </a>
            </div>

            {/* Stats */}
            <div className="flex gap-8 pt-8 border-t border-[#1a1a1a]/10">
              <div>
                <div className="text-3xl font-black text-[#2563EB]">500+</div>
                <div className="text-sm font-medium text-[#1a1a1a]/60 uppercase tracking-wide">
                  Trip Selesai
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#2563EB]">15+</div>
                <div className="text-sm font-medium text-[#1a1a1a]/60 uppercase tracking-wide">
                  Unit Motor
                </div>
              </div>
              <div>
                <div className="text-3xl font-black text-[#2563EB]">4.9</div>
                <div className="text-sm font-medium text-[#1a1a1a]/60 uppercase tracking-wide">
                  Rating
                </div>
              </div>
            </div>
          </div>

          {/* Image */}
          <div className="hidden lg:block relative animate-in slide-in-from-right duration-700 animation-delay-300 lg:self-start">
            <div className="relative transform hover:scale-105 transition-transform duration-500 lg:-mt-2">
              <Image
                src="/images/banner baru.png"
                alt="Motor"
                width={1000}
                height={800}
                className="w-full h-auto max-w-[620px] ml-auto relative z-10"
                priority
              />
            </div>

            {/* Floating Card */}
            <div className="absolute bottom-12 -left-4 bg-white p-6 rounded-3xl shadow-xl border border-[#1a1a1a]/5 animate-in zoom-in duration-700 animation-delay-1000 hover:scale-105 transition-transform">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center">
                  <BadgeDollarSign className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div className="text-xs font-bold text-[#1a1a1a]/60 uppercase tracking-wider">
                    Biaya sewa mulai dari
                  </div>
                  <div className="text-2xl font-black text-[#1a1a1a]">
                    Rp 70K/hari
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
