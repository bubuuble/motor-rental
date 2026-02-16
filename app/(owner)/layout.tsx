'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, ClipboardList, AlertCircle, Bike, DollarSign, UserCircle } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
    { href: '/dashboard/bookings', label: 'Pesanan Masuk', icon: <ClipboardList size={20} /> },
    { href: '/dashboard/appeals', label: 'Banding Pemesanan', icon: <AlertCircle size={20} /> },
    { href: '/dashboard/motors', label: 'Pengelolaan Data Motor', icon: <Bike size={20} /> },
    { href: '/dashboard/finance', label: 'Pengelolaan Data Keuangan', icon: <DollarSign size={20} /> },
    { href: '/dashboard/customers', label: 'Pengelolaan Data Pelanggan', icon: <UserCircle size={20} /> },
  ];

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-72 bg-white border-r flex flex-col fixed h-full">
        <div className="p-6 border-b flex items-center gap-3">
          <img src="/images/logo.png" alt="Logo" className="w-10 h-10 rounded" />
          <span className="font-bold text-sm">Rental Motor Kukusan</span>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
                pathname === item.href ? 'bg-slate-100 border' : 'hover:bg-slate-50'
              }`}
            >
              {item.icon} {item.label}
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t space-y-3">
           <div className="flex items-center gap-3 px-4">
              <UserCircle size={32} className="text-slate-300" />
              <div className="text-xs">
                <p className="font-bold">Admin Pemilik</p>
                <p className="text-slate-400">Online</p>
              </div>
           </div>
           <button 
            onClick={async () => { await supabase.auth.signOut(); router.push('/login'); }}
            className="w-full border p-2 rounded text-sm font-bold hover:bg-red-50 hover:text-red-600 transition"
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