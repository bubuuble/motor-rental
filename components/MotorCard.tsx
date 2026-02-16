'use client';

import Image from 'next/image';
import { Settings, Calendar, Zap } from 'lucide-react';
import { Motor } from '@/app/constants/motors';

interface MotorCardProps {
  motor: Motor;
  isRented?: boolean;
  onDetail: () => void;
}

export default function MotorCard({ motor, isRented = false, onDetail }: MotorCardProps) {
  return (
    <div className={`group relative bg-white border border-[#1a1a1a]/10 rounded-3xl overflow-hidden transition-all duration-500 flex flex-col h-full ${
      isRented 
        ? 'opacity-60 hover:shadow-lg' 
        : 'hover:shadow-2xl hover:shadow-[#FF6B35]/10 hover:-translate-y-2 hover:border-[#FF6B35]/30'
    }`}>
      {/* Decorative Top Bar */}
      <div className={`h-1 transition-all duration-500 ${
        isRented 
          ? 'bg-gradient-to-r from-slate-400 to-slate-300' 
          : 'bg-gradient-to-r from-[#FF6B35] to-[#FF8F5F] group-hover:h-2'
      }`}></div>

      {/* Image Container */}
      <div className="relative h-48 bg-gradient-to-br from-[#FAF9F6] to-[#FFE8DD]/30 overflow-hidden">
        {/* Diagonal Accent */}
        {!isRented && (
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#FF6B35]/5 to-transparent rotate-12 transform translate-x-8 -translate-y-8"></div>
        )}
        
        <Image 
          src={motor.image} 
          alt={motor.name} 
          fill 
          className="object-contain p-6 transition-transform duration-500 group-hover:scale-110" 
        />
        
        {/* Rented Overlay */}
        {isRented && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a1a]/70 to-[#1a1a1a]/50 backdrop-blur-[2px] flex items-center justify-center">
            <div className="text-center">
              <div className="inline-flex items-center gap-2 bg-red-600 text-white text-xs font-black uppercase px-5 py-2 rounded-full shadow-xl mb-2">
                <Zap size={12} fill="white" />
                Sedang Disewa
              </div>
              <p className="text-white/80 text-[10px] font-bold">Motor akan kembali segera</p>
            </div>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-grow">
        {/* Title */}
        <div className="mb-4">
          <h3 className="font-black text-[#1a1a1a] text-xl tracking-tight leading-tight">{motor.name}</h3>
          <p className="text-xs text-[#1a1a1a]/50 line-clamp-2 mt-1 font-medium">{motor.description}</p>
        </div>

        {/* Specs */}
        <div className="flex gap-3 mb-5 pb-5 border-b border-[#1a1a1a]/5">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF6B35]/5 border border-[#FF6B35]/10">
            <Settings size={12} className="text-[#FF6B35]" />
            <span className="text-[10px] font-bold text-[#1a1a1a]/70">{motor.cc}</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#00D9FF]/5 border border-[#00D9FF]/10">
            <Calendar size={12} className="text-[#00D9FF]" />
            <span className="text-[10px] font-bold text-[#1a1a1a]/70">{motor.year}</span>
          </div>
        </div>

        {/* Price & CTA */}
        <div className="mt-auto flex items-end justify-between gap-4">
          <div>
            <p className="text-[9px] font-bold text-[#1a1a1a]/40 uppercase tracking-widest mb-1">Mulai dari</p>
            <p className="text-2xl font-black text-[#FF6B35] leading-none">Rp{motor.dailyPrice.toLocaleString()}</p>
            <p className="text-[10px] font-bold text-[#1a1a1a]/40 mt-1">/hari</p>
          </div>
          <button 
            onClick={isRented ? undefined : onDetail}
            disabled={isRented}
            className={`relative px-6 py-3 rounded-2xl text-xs font-black uppercase tracking-wide transition-all duration-300 overflow-hidden ${
              isRented 
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed' 
                : 'bg-[#1a1a1a] text-white hover:scale-105 hover:shadow-lg hover:shadow-[#1a1a1a]/30 group/btn'
            }`}
          >
            {!isRented && (
              <>
                <span className="absolute inset-0 bg-gradient-to-r from-[#FF6B35] to-[#FF8F5F] opacity-0 group-hover/btn:opacity-100 transition-opacity"></span>
                <span className="relative">Pesan</span>
              </>
            )}
            {isRented && 'Not Available'}
          </button>
        </div>
      </div>

      {/* Hover Glow */}
      {!isRented && (
        <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-[#FF6B35]/5 via-transparent to-[#00D9FF]/5 rounded-3xl"></div>
        </div>
      )}
    </div>
  );
}