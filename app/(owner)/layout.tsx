'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ClipboardList, AlertCircle, Bike, DollarSign, UserCircle, Wrench, CalendarClock, MessageSquare } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/dashboard/bookings', label: 'Pesanan Masuk', icon: <ClipboardList size={20} /> },
    { href: '/dashboard/appeals', label: 'Banding Pemesanan', icon: <AlertCircle size={20} /> },
    { href: '/dashboard/motors', label: 'Kelola Data Sewa', icon: <Bike size={20} /> },
    { href: '/dashboard/manage-motors', label: 'Pengelolaan Data Motor', icon: <Wrench size={20} /> },
    { href: '/dashboard/messages', label: 'Pesan', icon: <MessageSquare size={20} /> },
    { href: '/dashboard/finance', label: 'Pengelolaan Data Keuangan', icon: <DollarSign size={20} /> },
    { href: '/dashboard/customers', label: 'Pengelolaan Data Pelanggan', icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-blue-50/30 text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r border-blue-100 flex flex-col fixed h-full shadow-sm">
        <div className="p-6 border-b border-blue-100 flex items-center gap-3">
          <img src="/images/logo.png" alt="Logo" className="w-10 h-10 rounded-lg" />
          <span className="font-bold text-sm text-slate-800">Rental Motor Kukusan</span>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                pathname === item.href
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-200'
                  : 'text-slate-600 hover:bg-blue-50 hover:text-blue-700'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-blue-100 space-y-3">
          <div className="flex items-center gap-3 px-4">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <UserCircle size={20} className="text-blue-600" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-slate-800">Admin Pemilik</p>
              <p className="text-slate-400">Online</p>
            </div>
          </div>
          <button
            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
            className="w-full border border-slate-200 p-2 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
          >
            Logout
          </button>
        </div>
      </aside>

      <main className="ml-72 flex-1 min-h-screen p-8">
        {children}
      </main>
    </div>
  );
}