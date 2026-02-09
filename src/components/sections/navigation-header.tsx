'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { User } from '@supabase/supabase-js';

export default function NavigationHeader() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className="flex w-full flex-col sm:static sm:z-auto sticky top-0 z-40 font-sans antialiased text-foreground">
      {/* Top Announcement Bar */}
      <div className="h-10 bg-[#cc2127] px-4 py-2 sm:px-12 inline-flex border-none">
        <div className="mx-auto flex w-full max-w-[83.75rem] items-center justify-center md:justify-between">
          {/* Left Side: Brand & Slogan */}
          <div className="inline-flex h-5 items-center justify-start gap-[5px]">
            <div className="hidden md:flex font-bold text-[#fbefef] text-[12px]">
              TICKETSHWARI
            </div>
            <div className="hidden md:flex font-light text-[#fbefef] text-[12px]">
              - Fly across East Africa and beyond with confidence
            </div>
          </div>

          {/* Right Side: Currency & Contact */}
          <div className="inline-flex h-6 items-center justify-start gap-12">
            <div className="flex gap-2 text-center font-bold text-white text-[12px]">
              <p>
                Call
                <a href="tel:+254709816000" className="hover:underline">
                  {" "}
                  +254-709-816-000
                </a>
              </p>
              <p className="hidden md:flex"> | </p>
              <p className="hidden md:flex gap-2">
                Email
                <a
                  href="mailto:travel@ticketshwari.com"
                  className="hover:underline"
                >
                  {" "}
                  travel@ticketshwari.com
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="flex w-full flex-col border-b border-[#D9D9D9] bg-background px-4 py-3.5 sm:px-12 xl:py-5">
        <div className="mx-auto flex w-full max-w-[83.75rem] items-center justify-between">
          <div className="flex items-center gap-24">
            {/* Logo */}
            <a href="/" className="block">
              <svg
                width="60"
                height="60"
                viewBox="0 0 100 100"
                className="w-auto h-10 xl:h-14"
                aria-label="TicketShwari Logo"
              >
                <defs>
                  <linearGradient id="planeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#0090da" />
                    <stop offset="100%" stopColor="#cc2127" />
                  </linearGradient>
                </defs>
                <g transform="translate(50, 50)">
                  <path
                    d="M -20 -5 L 25 -5 L 30 0 L 25 5 L -20 5 L -25 0 Z M 15 -5 L 18 -15 L 22 -15 L 19 -5 Z M 15 5 L 18 15 L 22 15 L 19 5 Z M -15 -5 L -12 -12 L -8 -12 L -11 -5 Z M -15 5 L -12 12 L -8 12 L -11 5 Z"
                    fill="url(#planeGradient)"
                    transform="rotate(-45)"
                  />
                  <circle cx="26" cy="-26" r="3" fill="#0090da" opacity="0.6" />
                  <circle cx="30" cy="-22" r="2" fill="#0090da" opacity="0.4" />
                  <circle cx="22" cy="-30" r="2" fill="#0090da" opacity="0.4" />
                </g>
                <text
                  x="50"
                  y="88"
                  fontFamily="Arial, sans-serif"
                  fontWeight="900"
                  fontSize="16"
                  fill="#000"
                  textAnchor="middle"
                >
                  TICKETSHWARI
                </text>
              </svg>
            </a>

            {/* Main Desktop Navigation */}
            <nav className="hidden items-center gap-8 pt-2.5 xl:flex">
              <a
                className="font-bold transition-colors text-[#cc2127] text-[14px]"
                href="/"
              >
                Flights
              </a>
              <a
                className="text-muted-foreground font-bold transition-colors hover:text-[#cc2127] text-[14px]"
                href="/my-bookings"
              >
                My Bookings
              </a>
            </nav>
          </div>

            {/* Right Desktop Menu (User Actions) */}
            <div className="hidden items-center gap-8 pt-2.5 xl:flex">
              <a
                className="text-muted-foreground font-medium transition-colors hover:text-[#cc2127] text-[14px]"
                href="/support"
              >
                Help
              </a>
              {!loading && (
                <>
                  {user ? (
                    <>
                      <a
                        className="text-muted-foreground font-medium transition-colors hover:text-[#cc2127] text-[14px]"
                        href="/my-bookings"
                      >
                        My Bookings
                      </a>
                      <div className="relative group">
                        <button
                          className="flex items-center gap-2 text-muted-foreground font-medium transition-colors hover:text-[#cc2127] text-[14px]"
                        >
                          <span className="w-8 h-8 rounded-full bg-[#cc2127] text-white flex items-center justify-center text-xs font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                          <span className="max-w-[120px] truncate">{user.email?.split('@')[0]}</span>
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <polyline points="6 9 12 15 18 9"></polyline>
                          </svg>
                        </button>
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="px-4 py-2 border-b border-gray-100">
                            <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                          </div>
                          <a
                            href="/my-bookings"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#cc2127]"
                          >
                            My Bookings
                          </a>
                          <button
                            onClick={handleLogout}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-[#cc2127]"
                          >
                            Log Out
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <>
                      <a
                        className="text-muted-foreground font-medium transition-colors hover:text-[#cc2127] text-[14px]"
                        href="/auth/login"
                      >
                        Log In
                      </a>
                      <a
                        className="font-medium transition-colors text-[#cc2127] text-[14px]"
                        href="/auth/signup"
                      >
                        Sign Up
                      </a>
                    </>
                  )}
                </>
              )}
            </div>

          {/* Mobile Hamburger Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring text-primary underline-offset-4 hover:underline size-9 xl:hidden"
            type="button"
            aria-label="Toggle menu"
            data-state={isMobileMenuOpen ? "open" : "closed"}
          >
            <svg
              width="18"
              height="14"
              viewBox="0 0 18 14"
              fill="currentColor"
              xmlns="http://www.w3.org/2000/svg"
              className="text-[#cc2127]"
            >
              <rect width="18" height="2.10526" rx="1.05263" />
              <rect y="5.94739" width="18" height="2.10526" rx="1.05263" />
              <rect y="11.8948" width="18" height="2.10526" rx="1.05263" />
            </svg>
          </button>
        </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div className="xl:hidden mt-4 pb-4 border-t border-[#D9D9D9] pt-4 animate-in slide-in-from-top-2">
              <nav className="flex flex-col gap-4">
                <a
                  className="font-bold text-[#cc2127] text-[14px] py-2"
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Flights
                </a>
                <a
                  className="text-muted-foreground font-bold hover:text-[#cc2127] text-[14px] py-2"
                  href="/my-bookings"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Bookings
                </a>
                <div className="h-px bg-[#D9D9D9] my-2"></div>
                <a
                  className="text-muted-foreground font-medium hover:text-[#cc2127] text-[14px] py-2"
                  href="/support"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Help
                </a>
                {!loading && (
                  <>
                    {user ? (
                      <>
                        <div className="flex items-center gap-3 py-2 border-t border-[#D9D9D9] mt-2 pt-4">
                          <span className="w-10 h-10 rounded-full bg-[#cc2127] text-white flex items-center justify-center text-sm font-bold">
                            {user.email?.charAt(0).toUpperCase()}
                          </span>
                          <div>
                            <p className="text-sm font-medium text-gray-900 truncate max-w-[200px]">{user.email}</p>
                            <p className="text-xs text-gray-500">Logged in</p>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            handleLogout();
                            setIsMobileMenuOpen(false);
                          }}
                          className="text-left font-medium text-[#cc2127] text-[14px] py-2"
                        >
                          Log Out
                        </button>
                      </>
                    ) : (
                      <>
                        <a
                          className="text-muted-foreground font-medium hover:text-[#cc2127] text-[14px] py-2"
                          href="/auth/login"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Log In
                        </a>
                        <a
                          className="font-medium text-[#cc2127] text-[14px] py-2"
                          href="/auth/signup"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Sign Up
                        </a>
                      </>
                    )}
                  </>
                )}
              </nav>
            </div>
          )}
      </div>
    </header>
  );
}