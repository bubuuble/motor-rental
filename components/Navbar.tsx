"use client";

import { useState, useEffect, type MouseEvent } from "react";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import {
  User as UserIcon,
  LogOut,
  ChevronDown,
  UserCircle,
  LayoutDashboard,
  Menu,
  X,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import type { User } from "@supabase/supabase-js";

function animateFastScroll(targetTop: number) {
  const startY = window.scrollY;
  const distance = targetTop - startY;
  const duration = 350;
  const startTime = performance.now();

  const easeOutCubic = (time: number) => 1 - Math.pow(1 - time, 3);

  const step = (now: number) => {
    const elapsed = now - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const eased = easeOutCubic(progress);
    window.scrollTo(0, startY + distance * eased);

    if (progress < 1) {
      requestAnimationFrame(step);
    }
  };

  requestAnimationFrame(step);
}

export default function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"customer" | "owner" | null>(null);
  const [userName, setUserName] = useState<string | null>(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const supabase = createClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      setUser(user);

      // Fetch user role from profiles table
      if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", user.id)
          .single();

        if (data) {
          setUserRole(data.role);
          setUserName(data.full_name);
        }
      }
    };
    getUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);

      // Fetch role when auth state changes
      if (session?.user) {
        const { data } = await supabase
          .from("profiles")
          .select("role, full_name")
          .eq("id", session.user.id)
          .single();

        if (data) {
          setUserRole(data.role);
          setUserName(data.full_name);
        }
      } else {
        setUserRole(null);
        setUserName(null);
      }
    });

    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);

    return () => {
      subscription.unsubscribe();
      window.removeEventListener("scroll", handleScroll);
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setDropdownOpen(false);
    router.push("/login");
  };

  const handleSectionClick = (
    event: MouseEvent<HTMLAnchorElement>,
    sectionId: string,
  ) => {
    if (pathname !== "/") return;
    event.preventDefault();
    const target = document.getElementById(sectionId);
    if (!target) return;
    const top = target.getBoundingClientRect().top + window.scrollY - 110;
    animateFastScroll(top);
  };

  const navLinks = [
    { href: "/", label: "Beranda" },
    { href: "/motors", label: "Katalog Motor" },
    { href: "/status", label: "Status Sewa" },
    { href: "/#layanan-kami", label: "Layanan Kami", sectionId: "layanan-kami" },
    { href: "/#faq", label: "FAQ", sectionId: "faq" },
  ];

  const handleMobileLinkClick = () => {
    setMobileMenuOpen(false);
  };

  return (
    <nav
      className={`sticky top-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-lg shadow-[#1a1a1a]/5 border-b border-[#1a1a1a]/10"
          : "bg-white/95 border-b border-[#1a1a1a]/10"
      }`}
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#1a1a1a]/12 to-transparent" />
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative w-11 h-11 sm:w-12 sm:h-12">
              <div className="absolute inset-0 bg-gradient-to-br from-[#2563EB] to-[#3B82F6] rounded-2xl rotate-6 group-hover:rotate-12 transition-transform"></div>
              <div className="relative w-full h-full bg-white rounded-2xl flex items-center justify-center shadow-lg overflow-hidden">
                <Image
                  src="/images/logo.png"
                  alt="Rental Motor Kukusan Logo"
                  fill
                  className="object-contain p-1.5"
                />
              </div>
            </div>
            <div className="hidden sm:block">
              <h1 className="font-black text-lg leading-none text-[#1a1a1a] tracking-tight">
                Rental Motor
              </h1>
              <p className="text-[9px] font-bold text-[#2563EB] uppercase tracking-widest">
                Kukusan
              </p>
            </div>
          </Link>

          {/* Links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={
                  link.sectionId
                    ? (event) => handleSectionClick(event, link.sectionId)
                    : undefined
                }
                className="relative px-5 py-2 text-sm font-bold text-[#1a1a1a]/70 hover:text-[#1a1a1a] transition-colors group"
              >
                {link.label}
                <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0 h-0.5 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] group-hover:w-full transition-all duration-300"></span>
              </Link>
            ))}

            {/* Dashboard button for owner */}
            {userRole === "owner" && (
              <Link
                href="/dashboard"
                className="flex items-center gap-2 ml-2 px-4 py-2 bg-blue-600 text-white text-sm font-bold rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-200 transition-all"
              >
                <LayoutDashboard size={15} strokeWidth={2.5} />
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth */}
          <div className="relative flex items-center gap-2">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label="Buka menu navigasi"
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-xl border border-[#1a1a1a]/15 bg-white text-[#1a1a1a] hover:text-[#2563EB] hover:border-[#2563EB]/30 transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>

            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 px-4 py-2 rounded-2xl bg-gradient-to-br from-[#2563EB] to-[#3B82F6] text-white hover:shadow-lg hover:shadow-[#2563EB]/30 transition-all"
                >
                  <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <UserIcon size={16} />
                  </div>
                  <span className="text-sm font-bold hidden sm:inline max-w-[120px] truncate">
                    {userName ? userName.split(" ")[0] : "Akun"}
                  </span>
                  <ChevronDown
                    size={14}
                    className={`transition-transform ${dropdownOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 top-14 w-56 bg-white/95 backdrop-blur-xl border border-[#1a1a1a]/10 rounded-3xl shadow-2xl py-3 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-5 py-3 border-b border-[#1a1a1a]/10 mb-2">
                      <p className="text-[9px] font-bold text-[#1a1a1a]/40 uppercase tracking-widest">
                        Masuk sebagai
                      </p>
                      <p className="text-sm font-bold truncate text-[#1a1a1a] mt-1">
                        {user.email}
                      </p>
                    </div>

                    {/* Dashboard link for owner in dropdown */}
                    {userRole === "owner" && (
                      <Link
                        href="/dashboard"
                        onClick={() => setDropdownOpen(false)}
                        className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-blue-600 hover:bg-blue-50 transition-colors"
                      >
                        <LayoutDashboard size={18} strokeWidth={2.5} /> Dashboard
                      </Link>
                    )}

                    <Link
                      href="/profile"
                      onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-[#1a1a1a] hover:bg-[#2563EB]/10 hover:text-[#2563EB] transition-colors"
                    >
                      <UserCircle size={18} /> Data Diri
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut size={18} /> Keluar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login">
                <button className="group relative px-6 sm:px-8 py-2.5 rounded-2xl font-bold text-sm overflow-hidden transition-all hover:scale-105">
                  <span className="absolute inset-0 bg-gradient-to-r from-[#2563EB] to-[#3B82F6]"></span>
                  <span className="absolute inset-0 bg-gradient-to-r from-[#3B82F6] to-[#2563EB] opacity-0 group-hover:opacity-100 transition-opacity"></span>
                  <span className="relative text-white">Login</span>
                </button>
              </Link>
            )}

            {mobileMenuOpen && (
              <div className="md:hidden absolute right-0 top-14 w-64 bg-white/95 backdrop-blur-xl border border-[#1a1a1a]/10 rounded-2xl shadow-2xl py-2 z-[60] animate-in fade-in slide-in-from-top-2 duration-200">
                {navLinks.map((link) => (
                  <Link
                    key={`mobile-${link.href}`}
                    href={link.href}
                    onClick={(event) => {
                      if (link.sectionId) {
                        handleSectionClick(event, link.sectionId);
                      }
                      handleMobileLinkClick();
                    }}
                    className="block px-4 py-2.5 text-sm font-semibold text-[#1a1a1a]/85 hover:bg-[#2563EB]/10 hover:text-[#2563EB] transition-colors"
                  >
                    {link.label}
                  </Link>
                ))}

                {userRole === "owner" && (
                  <Link
                    href="/dashboard"
                    onClick={handleMobileLinkClick}
                    className="block mt-1 mx-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
