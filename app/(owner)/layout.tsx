'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { LayoutDashboard, ClipboardList, AlertCircle, Bike, DollarSign, UserCircle, Clock3, MessageSquare, Menu, X } from 'lucide-react';
import { createClient } from '@/utils/supabase/client';

const menuItems = [
  { href: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { href: '/dashboard/messages', label: 'Pesan', icon: <MessageSquare size={20} /> },
  { href: '/dashboard/bookings', label: 'Pesanan Masuk', icon: <ClipboardList size={20} /> },
  { href: '/dashboard/appeals', label: 'Banding Pemesanan', icon: <AlertCircle size={20} /> },
  { href: '/dashboard/motors', label: 'Pengelolaan Data Sewa', icon: <Clock3 size={20} /> },
  { href: '/dashboard/manage-motors', label: 'Pengelolaan Data Motor', icon: <Bike size={20} /> },
  { href: '/dashboard/finance', label: 'Pengelolaan Data Keuangan', icon: <DollarSign size={20} /> },
];

interface SidebarProps {
  pathname: string;
  onLinkClick?: () => void;
  onLogout: () => void;
}

function SidebarContent({ pathname, onLinkClick, onLogout }: SidebarProps) {
  return (
    <>
      <div className="p-6 border-b border-blue-100 flex items-center gap-3">
        <div className="relative w-10 h-10">
          <Image src="/images/logo.png" alt="Logo" fill className="rounded-lg object-contain" />
        </div>
        <span className="font-bold text-sm text-slate-800">Rental Motor Kukusan</span>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            onClick={onLinkClick}
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
          onClick={onLogout}
          className="w-full border border-slate-200 p-2 rounded-xl text-sm font-bold hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
        >
          Logout
        </button>
      </div>
    </>
  );
}

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const supabase = createClient();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen bg-blue-50/30 text-slate-900">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-72 bg-white border-r border-blue-100 flex-col fixed h-full shadow-sm z-30">
        <SidebarContent pathname={pathname} onLogout={handleLogout} />
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/40 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar drawer */}
      <aside
        className={`lg:hidden fixed top-0 left-0 h-full w-72 bg-white border-r border-blue-100 flex flex-col shadow-xl z-50 transition-transform duration-300 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="absolute top-4 right-4 p-2 rounded-xl hover:bg-slate-100 text-slate-500 transition"
        >
          <X size={20} />
        </button>
        <SidebarContent pathname={pathname} onLinkClick={() => setSidebarOpen(false)} onLogout={handleLogout} />
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-72 min-h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-blue-100 px-4 py-3 flex items-center gap-3 shadow-sm">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2">
            <div className="relative w-7 h-7">
              <Image src="/images/logo.png" alt="Logo" fill className="rounded-md object-contain" />
            </div>
            <span className="font-bold text-sm text-slate-800">Dashboard</span>
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}