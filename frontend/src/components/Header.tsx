'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from '../Context/AuthContext';
import { useDarkMode } from '../Context/DarkModeProvide';
import {
  Moon,
  Sun,
  Layers,
  Users,
  LogIn,
  UserPlus,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
} from 'lucide-react';

export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const { isDarkMode, toggleDarkMode } = useDarkMode();
  const isSuperAdmin = user?.role === 'superadmin';

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border-b border-gray-300 dark:border-gray-700 shadow-lg transition-all duration-500">
      <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-3 select-none transform transition-transform duration-500 hover:scale-105"
          aria-label="ModernFarmers Home"
        >
          <Layers className="text-green-600 dark:text-green-400 animate-bounce" size={32} />
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white font-poppins">
            agru
          </h1>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6 text-gray-700 dark:text-gray-300 font-semibold font-poppins">

          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-1.5 rounded-full border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 focus:ring-2 focus:ring-green-400 transition"
            />
            <Search size={18} className="absolute left-3 top-2.5 text-gray-500" />
          </div>

          {isAuthenticated && user ? (
            <>
              {isSuperAdmin && (
                <>
                  <Link href="/dashboard" className="hover:text-green-600 dark:hover:text-green-400 transition">
                    Dashboard
                  </Link>
                  <Link href="/farmers" className="hover:text-green-600 dark:hover:text-green-400 transition">
                    Farmers
                  </Link>
                </>
              )}

              {/* User Avatar */}
             <Link href="/auth/profile">
              {user?.avatar ? (
                <img src={user.avatar} alt="User avatar" className="w-8 h-8 rounded-full border border-gray-300" />
              ) : (
                <span className="bg-green-600 text-white w-8 h-8 flex items-center justify-center rounded-full">
                  {user.name?.[0] || "U"}
                </span>
              )}
             </Link>

              {/* Sign Out button */}
              <button
                onClick={logout}
                className="bg-red-600 text-white px-4 py-1 rounded-full hover:bg-red-700 transition flex items-center gap-1"
                title="Sign Out"
              >
                <LogOut size={18} />

              </button>

              {/* Dark mode toggle - pill style */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 rounded-full border border-gray-300 dark:border-gray-600 px-3 py-1 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Toggle Dark Mode"
                title="Toggle Dark Mode"
              >
                {isDarkMode ? (
                  <>
                    <Sun size={16} />

                  </>
                ) : (
                  <>
                    <Moon size={16} />

                  </>
                )}
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" className="hover:text-green-600 dark:hover:text-green-400 transition">
                Sign In
              </Link>
              <Link href="/auth/signup" className="hover:text-green-600 dark:hover:text-green-400 transition">
                Sign Up
              </Link>
            </>
          )}
        </nav>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 rounded-md  0 transition"
          onClick={() => setMobileMenuOpen(prev => !prev)}
          aria-label="Toggle mobile menu"
        >
          {mobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="md:hidden  text-white    border-t border-gray-200 dark:border-gray-700 px-6 py-4 space-y-4 animate-slideDown">

          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search..."
              className="pl-10 pr-4 py-2 w-full rounded-full border border-gray-300 focus:ring-2 focus:ring-green-400"
            />
            <Search size={18} className="absolute left-3 top-3 " />
          </div>

          {isAuthenticated && user ? (
            <>
              {isSuperAdmin && (
                <>
                  <Link href="/dashboard" onClick={() => setMobileMenuOpen(false)} className="block hover:text-green-600">
                    Dashboard
                  </Link>
                  <Link href="/farmers" onClick={() => setMobileMenuOpen(false)} className="block hover:text-green-600">
                    Farmers
                  </Link>
                </>
              )}

              {/* Dark mode toggle - pill style */}
              <button
                onClick={toggleDarkMode}
                className="flex items-center gap-2 px-4 py-2 rounded-full border  w-full"
              >
                {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                {isDarkMode ? " " : " "}
              </button>

              <button
                onClick={() => {
                  logout();
                  setMobileMenuOpen(false);
                }}
                className="bg-red-600 text-white px-4 py-2 rounded-full w-full"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link href="/auth/signin" onClick={() => setMobileMenuOpen(false)} className="block hover:text-green-600">
                Sign In
              </Link>
              <Link href="/auth/signup" onClick={() => setMobileMenuOpen(false)} className="block hover:text-green-600">
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-slideDown {
          animation: slideDown 0.3s ease-out;
        }
      `}</style>
    </header>
  );
}
