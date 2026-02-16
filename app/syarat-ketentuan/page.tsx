import Link from 'next/link';
import { ArrowLeft, CheckCircle2, AlertCircle, MapPin, CreditCard, FileText, Shield, Ban, Navigation } from 'lucide-react';

export default function SyaratKetentuanPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FAF9F6] via-white to-[#DBEAFE]/20">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1a1a1a] to-[#2a2a2a] text-white py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-white/70 hover:text-white transition mb-6 group"
          >
            <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-bold">Kembali ke Beranda</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-black tracking-tight mb-4">
            Syarat & Ketentuan
          </h1>
          <p className="text-white/70 text-lg font-medium">
            Persyaratan Sewa Motor yang Wajib Dipenuhi
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-12">
        {/* Important Notice */}
        <div className="bg-gradient-to-br from-[#2563EB]/10 to-[#2563EB]/5 border-2 border-[#2563EB] rounded-3xl p-6 mb-8 flex gap-4">
          <AlertCircle className="text-[#2563EB] shrink-0 mt-1" size={24} />
          <div>
            <h3 className="font-black text-[#1a1a1a] text-lg mb-2">Penting untuk Dibaca</h3>
            <p className="text-[#1a1a1a]/70 font-medium leading-relaxed">
              Harap baca dan pahami seluruh persyaratan di bawah ini sebelum melakukan pemesanan. 
              Dengan menyetujui syarat dan ketentuan, Anda menyatakan telah memahami dan menyetujui 
              seluruh ketentuan yang berlaku.
            </p>
          </div>
        </div>

        {/* Requirements List */}
        <div className="space-y-6">
          {/* Requirement 1 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-[#1a1a1a]/5 hover:border-[#2563EB]/30 transition-all">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg">
                1
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="text-[#2563EB]" size={20} />
                  <h3 className="font-black text-[#1a1a1a] text-lg">Domisili di Depok</h3>
                </div>
                <p className="text-[#1a1a1a]/70 font-medium leading-relaxed">
                  Tempat tinggal sekarang di <span className="font-bold text-[#1a1a1a]">Depok</span> atau 
                  tamu yang sedang stay di Depok (menunjukkan tiket, bukti pemesanan hotel, konser, dll).
                </p>
              </div>
            </div>
          </div>

          {/* Requirement 2 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-[#1a1a1a]/5 hover:border-[#2563EB]/30 transition-all">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg">
                2
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="text-[#2563EB]" size={20} />
                  <h3 className="font-black text-[#1a1a1a] text-lg">Sistem Bayar Pakai</h3>
                </div>
                <p className="text-[#1a1a1a]/70 font-medium leading-relaxed mb-2">
                  Pembayaran <span className="font-bold text-[#1a1a1a]">FULL saat serah terima motor</span> (Sistem bayar pakai).
                </p>
                <div className="bg-[#00D9FF]/10 border-l-4 border-[#00D9FF] p-3 rounded-xl">
                  <p className="text-sm font-bold text-[#1a1a1a]">
                    ⓘ Kami tidak ada DP atau pembayaran apapun di awal
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Requirement 3 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-[#1a1a1a]/5 hover:border-[#2563EB]/30 transition-all">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg">
                3
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="text-[#2563EB]" size={20} />
                  <h3 className="font-black text-[#1a1a1a] text-lg">Dokumen Identitas Asli</h3>
                </div>
                <p className="text-[#1a1a1a]/70 font-medium leading-relaxed mb-4">
                  Bersedia menyerahkan <span className="font-bold text-[#1a1a1a]">minimal 2 dokumen identitas asli</span> yang 
                  masih aktif selama pemakaian motor:
                </p>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 bg-green-50 p-3 rounded-xl border-l-4 border-green-500">
                    <CheckCircle2 className="text-green-600 shrink-0 mt-0.5" size={18} />
                    <div>
                      <p className="font-bold text-green-900 text-sm">A. e-KTP</p>
                      <p className="text-xs text-green-700 font-medium">(Wajib/Mandatory)</p>
                    </div>
                  </div>
                  <div className="bg-[#FAF9F6] p-4 rounded-xl border border-[#1a1a1a]/10">
                    <p className="text-sm font-bold text-[#1a1a1a] mb-3">Pilih salah satu dari:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                      {['KK (Kartu Keluarga)', 'SIM C', 'PASPORT', 'ID CARD', 'KTM (Kartu Mahasiswa)', 'Dokumen lain penyewa/penjamin'].map((doc, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-[#2563EB] rounded-full"></div>
                          <span className="text-[#1a1a1a]/80 font-medium">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Requirement 4 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-[#1a1a1a]/5 hover:border-[#2563EB]/30 transition-all">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg">
                4
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="text-[#2563EB]" size={20} />
                  <h3 className="font-black text-[#1a1a1a] text-lg">SIM C Aktif</h3>
                </div>
                <p className="text-[#1a1a1a]/70 font-medium leading-relaxed">
                  Wajib memiliki <span className="font-bold text-[#1a1a1a]">SIM C aktif</span> (cukup diperlihatkan saja).
                </p>
              </div>
            </div>
          </div>

          {/* Requirement 5 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-[#1a1a1a]/5 hover:border-[#2563EB]/30 transition-all">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg">
                5
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <CheckCircle2 className="text-[#2563EB]" size={20} />
                  <h3 className="font-black text-[#1a1a1a] text-lg">Survei & Verifikasi Data</h3>
                </div>
                <p className="text-[#1a1a1a]/70 font-medium leading-relaxed">
                  Bersedia untuk <span className="font-bold text-[#1a1a1a]">disurvei setelah isi form</span> dan 
                  admin melakukan cek data.
                </p>
              </div>
            </div>
          </div>

          {/* Requirement 6 */}
          <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-[#1a1a1a]/5 hover:border-[#2563EB]/30 transition-all">
            <div className="flex gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-2xl flex items-center justify-center text-white font-black text-xl shrink-0 shadow-lg">
                6
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="text-[#2563EB]" size={20} />
                  <h3 className="font-black text-[#1a1a1a] text-lg">Uang Deposit</h3>
                </div>
                <p className="text-[#1a1a1a]/70 font-medium leading-relaxed mb-3">
                  Bersedia menyerahkan uang deposit senilai <span className="font-black text-[#2563EB] text-lg">Rp 100.000,-</span>
                </p>
                <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded-xl">
                  <p className="text-sm font-bold text-green-900 mb-1">Pengembalian Deposit:</p>
                  <p className="text-xs text-green-700 font-medium leading-relaxed">
                    Uang deposit akan dikembalikan 1x24 jam setelah pengembalian motor dengan syarat kondisi motor, 
                    STNK, helm dan lainnya dalam kondisi baik sama seperti saat serah terima.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="mt-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border-2 border-blue-200">
          <div className="flex gap-3 mb-4">
            <AlertCircle className="text-blue-600 shrink-0" size={24} />
            <h3 className="font-black text-[#1a1a1a] text-xl">Catatan Penting</h3>
          </div>
          <div className="space-y-3 pl-9">
            <div className="flex gap-3">
              <Ban className="text-red-500 shrink-0 mt-1" size={18} />
              <p className="text-[#1a1a1a]/80 font-medium leading-relaxed">
                <span className="font-bold text-[#1a1a1a]">Tidak disewakan untuk pemakaian ojek online</span>
              </p>
            </div>
            <div className="flex gap-3">
              <Navigation className="text-amber-600 shrink-0 mt-1" size={18} />
              <p className="text-[#1a1a1a]/80 font-medium leading-relaxed">
                Settingan GPS Motor hanya bisa dipakai di <span className="font-bold text-[#1a1a1a]">area Jabodetabek saja</span>, 
                keluar dari itu mesin akan mati sendiri <span className="font-bold text-red-600">(area puncak tidak bisa)</span>
              </p>
            </div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="mt-12 text-center">
          <Link 
            href="/"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white font-black px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-[#2563EB]/30 transition-all hover:scale-105"
          >
            <CheckCircle2 size={20} />
            <span className="uppercase tracking-wide">Saya Mengerti, Lanjutkan Sewa</span>
          </Link>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center">
          <p className="text-xs text-[#1a1a1a]/40 font-medium">
            Dengan melanjutkan pemesanan, Anda menyatakan telah membaca, memahami, dan menyetujui seluruh syarat & ketentuan di atas.
          </p>
        </div>
      </div>
    </div>
  );
}
