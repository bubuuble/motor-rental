import {
  Facebook,
  Instagram,
  Twitter,
  Phone,
  Mail,
  MapPin,
  Clock,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="relative bg-[#1a1a1a] text-slate-300 overflow-hidden">
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Gradient Blobs */}
      <div className="absolute top-0 right-20 w-96 h-96 bg-gradient-to-br from-[#2563EB]/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-20 w-96 h-96 bg-gradient-to-tl from-[#DC2626]/10 to-transparent rounded-full blur-3xl"></div>

      {/* Main Footer Content */}
      <div className="max-w-7xl mx-auto px-6 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-4 space-y-6">
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12">
                <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-2xl rotate-6"></div>
                <div className="relative w-full h-full bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                  <Image
                    src="/images/logo.png"
                    alt="Rental Motor Kukusan Logo"
                    width={48}
                    height={48}
                    className="object-contain p-1.5"
                  />
                </div>
              </div>
              <div>
                <h3 className="text-white font-black text-xl tracking-tight">
                  Rental Motor
                </h3>
                <p className="text-[#2563EB] font-bold text-xs uppercase tracking-widest">
                  Kukusan
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed text-slate-400 font-medium">
              Penyewaan motor terpercaya di Kukusan, Depok. Lebih dari 5 tahun
              melayani dengan armada terawat dan harga terjangkau.
            </p>

            {/* Operating Hours */}
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
              <div className="flex items-center gap-2 mb-3">
                <Clock size={16} className="text-[#DC2626]" />
                <span className="text-sm font-bold text-white">
                  Jam Operasional
                </span>
              </div>
              <div className="text-xs space-y-1.5 text-slate-400 font-medium">
                <p className="flex justify-between">
                  <span>Senin - Sabtu</span>
                  <span className="text-white">08.00 - 20.00</span>
                </p>
                <p className="flex justify-between">
                  <span>Minggu</span>
                  <span className="text-white">09.00 - 18.00</span>
                </p>
              </div>
            </div>

            {/* Social Media */}
            <div className="space-y-3">
              <p className="text-sm font-bold text-white">Ikuti Kami</p>
              <div className="flex gap-3">
                {[
                  { icon: Facebook, hover: "hover:bg-blue-600" },
                  {
                    icon: Instagram,
                    hover:
                      "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600",
                  },
                  { icon: Twitter, hover: "hover:bg-blue-400" },
                ].map((social, i) => {
                  const Icon = social.icon;
                  return (
                    <a
                      key={i}
                      href="#"
                      className={`group w-11 h-11 bg-white/5 ${social.hover} backdrop-blur-sm rounded-2xl border border-white/10 flex items-center justify-center transition-all duration-300 hover:border-transparent hover:scale-110`}
                    >
                      <Icon
                        size={18}
                        className="text-slate-400 group-hover:text-white transition-colors"
                      />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="lg:col-span-2 space-y-5">
            <h4 className="font-black text-white text-sm uppercase tracking-widest">
              Menu Cepat
            </h4>
            <ul className="space-y-3">
              {[
                { label: "Beranda", href: "/" },
                { label: "Daftar Motor", href: "/motors" },
                { label: "Booking Online", href: "/motors" },
                { label: "Syarat & Ketentuan", href: "/syarat-ketentuan" },
                { label: "FAQ", href: "/#faq" },
                { label: "Hubungi Kami", href: "/#hubungi-kami" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="group text-sm text-slate-400 hover:text-[#2563EB] transition-colors flex items-center gap-3 font-medium"
                  >
                    <div className="w-1 h-1 rounded-full bg-slate-600 group-hover:bg-[#2563EB] group-hover:w-2 transition-all"></div>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div className="lg:col-span-3 space-y-5">
            <h4 className="font-black text-white text-sm uppercase tracking-widest">
              Layanan Kami
            </h4>
            <ul className="space-y-3">
              {[
                {
                  name: "Sewa Harian, Mingguan, Bulanan",
                  desc: "Durasi fleksibel, harga makin hemat",
                },
                {
                  name: "Antar – Jemput Kendaraan",
                  desc: "Tarif ojek online + Rp15.000 biaya layanan",
                },
                {
                  name: "Diskon Mahasiswa",
                  desc: "Potongan Rp10.000/hari dengan KTM aktif",
                },
                {
                  name: "Tanpa DP di Awal",
                  desc: "Bayar saat serah terima kendaraan",
                },
              ].map((item) => (
                <li key={item.name} className="group">
                  <div className="text-sm text-slate-300 group-hover:text-[#2563EB] transition-colors font-bold">
                    {item.name}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {item.desc}
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div id="hubungi-kami" className="lg:col-span-3 space-y-5 scroll-mt-28">
            <h4 className="font-black text-white text-sm uppercase tracking-widest">
              Hubungi Kami
            </h4>
            <div className="space-y-3">
              <a
                href="tel:6282125901198"
                className="group flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#2563EB]/30 backdrop-blur-sm transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB]/20 to-[#2563EB]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Phone size={16} className="text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5 font-bold uppercase tracking-wider">
                    Telepon / WhatsApp
                  </p>
                  <p className="text-sm font-bold text-white">+62 821-2590-1198</p>
                </div>
              </a>

              <a
                href="mailto:rentalmotorkukusan@gmail.com"
                className="group flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-[#DC2626]/30 backdrop-blur-sm transition-all"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-[#DC2626]/20 to-[#DC2626]/10 rounded-xl flex items-center justify-center shrink-0">
                  <Mail size={16} className="text-[#DC2626]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5 font-bold uppercase tracking-wider">
                    Email
                  </p>
                  <p className="text-xs font-medium text-white break-all">
                    rentalmotorkukusan@gmail.com
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-3 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm">
                <div className="w-10 h-10 bg-gradient-to-br from-[#2563EB]/20 to-[#2563EB]/10 rounded-xl flex items-center justify-center shrink-0">
                  <MapPin size={16} className="text-[#2563EB]" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-500 mb-0.5 font-bold uppercase tracking-wider">
                    Alamat
                  </p>
                  <p className="text-xs font-medium text-white leading-relaxed">
                    Jl. H. Moh. Alif I No.6, Kukusan, Kec. Beji, Kota Depok,
                    Jawa Barat 16425
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10 relative z-10">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-medium">
            <p>© 2024 Rental Motor Kukusan. All rights reserved.</p>
            <div className="flex gap-6">
              <Link href="/" className="hover:text-[#2563EB] transition-colors">
                Kebijakan Privasi
              </Link>
              <Link href="/" className="hover:text-[#2563EB] transition-colors">
                Syarat & Ketentuan
              </Link>
              <Link href="/" className="hover:text-[#2563EB] transition-colors">
                Sitemap
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
