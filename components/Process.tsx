import {
  FileText,
  Search,
  CheckCircle,
  MapPin,
  Truck,
  CreditCard,
  ArrowRight,
} from "lucide-react";

const steps = [
  {
    icon: FileText,
    title: "Isi Data",
    desc: "User mengisi formulir data penyewa dengan lengkap",
    color: "from-[#2563EB] to-[#3B82F6]",
  },
  {
    icon: Search,
    title: "Croscek Data",
    desc: "Tim memeriksa kelengkapan data secara menyeluruh",
    color: "from-[#DC2626] to-[#EF4444]",
  },
  {
    icon: CheckCircle,
    title: "Persetujuan",
    desc: "Data dinyatakan valid dan disetujui",
    color: "from-[#2563EB] to-[#3B82F6]",
  },
  {
    icon: MapPin,
    title: "Survey Lokasi",
    desc: "Tim melakukan survey sesuai kebutuhan",
    color: "from-[#DC2626] to-[#EF4444]",
  },
  {
    icon: Truck,
    title: "Penyerahan Motor",
    desc: "Motor diserahkan ke penyewa dengan aman",
    color: "from-[#2563EB] to-[#3B82F6]",
  },
  {
    icon: CreditCard,
    title: "Pembayaran",
    desc: "User melakukan pembayaran rental",
    color: "from-[#DC2626] to-[#EF4444]",
  },
];

export default function AlurSewa() {
  return (
    <section
      id="alur"
      className="relative py-14 sm:py-20 lg:py-24 overflow-hidden bg-gradient-to-b from-white via-[#FAF9F6] to-white"
    >
      {/* Background Pattern */}
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      ></div>

      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-64 h-64 bg-gradient-to-br from-[#2563EB]/10 to-transparent rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-80 h-80 bg-gradient-to-tl from-[#DC2626]/10 to-transparent rounded-full blur-3xl"></div>

      <div className="max-w-6xl mx-auto px-6 relative z-10">
        {/* Header */}
        <div className="text-left mb-12 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-[#1a1a1a] tracking-tight leading-tight">
            Perjalananmu Dimulai{" "}
            <span className="bg-gradient-to-r from-[#2563EB] to-[#3B82F6] bg-clip-text text-transparent">
               di Sini!
            </span>
          </h2>
          <p className="text-xs sm:text-sm md:text-base text-[#1a1a1a]/60 font-medium max-w-4xl leading-relaxed text-left">
            6 Langkah mudah untuk menyewa motor impian Anda, ikuti langkah sewa berikut!
          </p>
        </div>

        {/* Timeline */}
        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden lg:block absolute top-20 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#1a1a1a]/10 to-transparent"></div>

          {/* Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8 lg:gap-12">
            {steps.map((step, i) => {
              const Icon = step.icon;
              return (
                <div
                  key={i}
                  className="group relative animate-in fade-in slide-in-from-bottom-4 duration-700"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
                  {/* Card */}
                  <div className="relative bg-white border border-[#1a1a1a]/10 rounded-3xl p-6 hover:shadow-2xl hover:shadow-[#2563EB]/5 hover:-translate-y-2 transition-all duration-500">
                    {/* Step Number */}
                    <div className="absolute -top-4 -left-4 w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white flex items-center justify-center font-black text-xs sm:text-sm shadow-xl">
                      {i + 1}
                    </div>

                    {/* Icon */}
                    <div
                      className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-5 shadow-lg shadow-[#2563EB]/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}
                    >
                      <Icon className="w-8 h-8 text-white" strokeWidth={2.5} />
                    </div>

                    {/* Content */}
                    <h3 className="font-black text-lg sm:text-xl text-[#1a1a1a] mb-2 tracking-tight">
                      {step.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#1a1a1a]/60 font-medium leading-relaxed">
                      {step.desc}
                    </p>

                    {/* Hover Accent */}
                    <div
                      className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-100 transition-opacity rounded-b-3xl`}
                    ></div>
                  </div>

                  {/* Arrow Connector (Desktop) */}
                  {i % 3 !== 2 && i < steps.length - 1 && (
                    <div className="hidden lg:flex absolute top-20 -right-6 items-center justify-center">
                      <ArrowRight
                        className="w-5 h-5 text-[#2563EB]/40"
                        strokeWidth={2}
                      />
                    </div>
                  )}

                  {/* Arrow Connector (Mobile) */}
                  {i < steps.length - 1 && (
                    <div className="lg:hidden flex justify-center my-2">
                      <div className="w-0.5 h-5 bg-gradient-to-b from-[#2563EB]/40 to-transparent"></div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}
