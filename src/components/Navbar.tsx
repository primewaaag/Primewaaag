'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X, Puzzle, FolderCode, BarChart2, LogIn, ChevronDown, User, LogOut, Mail } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

interface NavbarProps {
  onOpenExtensions?: () => void;
}

export default function Navbar({ onOpenExtensions }: NavbarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showSocials, setShowSocials] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const { user, isAdmin, setAuthModalOpen, logout } = useAuth();
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/5 bg-[#020813]/40 backdrop-blur-xl px-6 py-3 transition-all duration-300">
        {/* Specular highlight top layer */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/[0.03] to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto flex items-center justify-between relative z-10">

          {/* BRAND LOGO */}
          <Link href="/" className="flex items-center">
            <img
              src="/primewaaag.webp"
              alt="Logo"
              className="h-8 md:h-10 w-auto object-contain transition-all duration-300 hover:scale-[1.02] filter drop-shadow-[0_0_15px_rgba(168,85,247,0.15)]"
            />
          </Link>

          {/* CENTER NAV LINKS */}
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={onOpenExtensions}
              className="nav-link-premium cursor-pointer"
            >
              <Puzzle size={14} className="text-purple-400" />
              Extensions
            </button>
            <Link
              href="/projects"
              className={`nav-link-premium ${pathname === '/projects' ? 'active' : ''}`}
            >
              <FolderCode size={14} className="text-emerald-400" />
              Projects
            </Link>
            <Link 
            href="/stats" 
            className={`nav-link-premium ${pathname === '/stats' ? 'active' : ''}`}
          >
            <BarChart2 size={14} className="text-cyan-400" />
            Stats
          </Link>
            {isAdmin && (
              <Link
                href="/admin"
                className={`nav-link-premium ${pathname === '/admin' ? 'active text-purple-400' : 'text-purple-300/80'}`}
              >
                <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse mr-0.5" />
                Admin
              </Link>
            )}
          </div>

          {/* RIGHT SIDE: SOCIALS DROPDOWN & AUTH */}
          <div className="hidden md:flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setShowSocials(!showSocials)}
                className="flex items-center gap-1.5 px-4.5 py-2 rounded-full text-xs font-bold bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer uppercase tracking-wider"
              >
                Socials <ChevronDown size={14} className={`transition-transform duration-300 ${showSocials ? 'rotate-180' : ''}`} />
              </button>

              {/* EXPANDABLE DROPDOWN MENU GRID */}
              {showSocials && (
                <div className="absolute right-0 mt-2 w-52 rounded-2xl border border-white/10 bg-[#0d1624] p-2 shadow-2xl backdrop-blur-xl animate-fadeIn">
                  <a href="https://tiktok.com/@primewaaag" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                    <img src="https://cdn.simpleicons.org/tiktok/ffffff" alt="TikTok" className="h-4 w-4" />
                    TikTok
                  </a>
                  <a href="https://youtube.com/@primewaaag" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                    <img src="https://cdn.simpleicons.org/youtube/ff0000" alt="YouTube" className="h-4 w-4" />
                    YouTube
                  </a>
                  <a href="https://twitch.tv/primewaaag" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                    <img src="https://cdn.simpleicons.org/twitch/a970ff" alt="Twitch" className="h-4 w-4" />
                    Twitch
                  </a>
                  <a href="https://kick.com/primewaaag" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                    <img src="https://cdn.simpleicons.org/kick/00E701" alt="Kick" className="h-4 w-4" />
                    Kick
                  </a>
                  <a href="https://discord.com/invite/N5T4SXfE2N" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                    <img src="https://cdn.simpleicons.org/discord/5865F2" alt="Discord" className="h-4 w-4" />
                    Discord
                  </a>
                  <a href="https://steamcommunity.com/id/primewaaag/" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                    <img src="https://cdn.simpleicons.org/steam/ffffff" alt="Steam" className="h-4 w-4" />
                    Steam
                  </a>
                  <a href="https://github.com/primewaaag" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                    <img src="https://cdn.simpleicons.org/github/ffffff" alt="GitHub" className="h-4 w-4" />
                    GitHub
                  </a>
                  <a href="https://buymeacoffee.com/primewaaag" target="_blank" rel="noreferrer" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 transition-all">
                    <img src="https://cdn.simpleicons.org/buymeacoffee/FFDD00" alt="BuyMeACoffee" className="h-4 w-4" />
                    BuyMeACoffee
                  </a>
                </div>
              )}
            </div>

            {/* Authenticated user badge or login trigger */}
            {!user ? (
              <Link
                href={`/auth/login?next=${encodeURIComponent(pathname)}`}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-xs font-bold bg-white text-zinc-950 hover:bg-zinc-100 hover:scale-[1.02] active:scale-[0.98] transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)] uppercase tracking-wider cursor-pointer"
              >
                <LogIn size={14} /> Login
              </Link>
            ) : (
              <div className="relative">
                <button
                  onClick={() => setShowUserDropdown(!showUserDropdown)}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 hover:bg-white/[0.08] hover:border-white/20 transition-all cursor-pointer"
                >
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-6 w-6 rounded-full border border-purple-500/30 object-cover"
                  />
                  <span className="text-xs font-bold text-zinc-200 max-w-[120px] truncate uppercase tracking-wider ml-1">
                    {user.username}
                  </span>
                  <ChevronDown size={12} className={`text-zinc-400 transition-transform ${showUserDropdown ? 'rotate-180' : ''}`} />
                </button>

                {showUserDropdown && (
                  <>
                    {/* Backdrop to close user dropdown */}
                    <div className="fixed inset-0 z-30" onClick={() => setShowUserDropdown(false)} />

                    <div className="absolute right-0 mt-2.5 w-48 rounded-xl border border-white/10 bg-[#0d1624] py-1.5 shadow-2xl backdrop-blur-xl animate-fadeIn z-40">
                      <Link
                        href="/accounts"
                        onClick={() => setShowUserDropdown(false)}
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-white/5 text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <User size={14} className="text-purple-400" />
                        Account
                      </Link>
                      <hr className="border-white/5 my-1" />
                      <button
                        onClick={() => {
                          logout();
                          setShowUserDropdown(false);
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 hover:bg-red-500/10 text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <LogOut size={14} />
                        Log Out
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>

          {/* MOBILE MENU BUTTON CONTROL */}
          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-400 hover:text-white transition-colors">
              {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* MOBILE DRAWER OVERLAY */}
        {isOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 border-b border-white/10 bg-zinc-950/95 backdrop-blur-lg px-6 py-6 flex flex-col gap-6 shadow-2xl animate-fadeIn">
            {/* NAV LINKS */}
            <div className="flex flex-col gap-3">
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:text-purple-300"
                >
                  <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                  Admin Panel
                </Link>
              )}
              <button
                onClick={() => {
                  onOpenExtensions?.();
                  setIsOpen(false);
                }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-white/3 border border-white/5 text-zinc-300 hover:text-white"
              >
                <Puzzle size={18} className="text-purple-400" />
                Extensions
              </button>
              <Link
                href="/projects"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-white/3 border border-white/5 text-zinc-300 hover:text-white"
              >
                <FolderCode size={18} className="text-emerald-400" />
                Projects
              </Link>
              <Link 
              href="/stats" 
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-white/3 border border-white/5 text-zinc-300 hover:text-white"
            >
              <BarChart2 size={18} className="text-cyan-400" />
              Stats
            </Link>
            </div>

            {/* SOCIALS */}
            <div className="space-y-2">
              <h4 className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase px-4">Socials</h4>
              <div className="grid grid-cols-2 gap-2">
                <a href="https://tiktok.com/@primewaaag" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/2 hover:bg-white/5">
                  <img src="https://cdn.simpleicons.org/tiktok/ffffff" alt="TikTok" className="h-3.5 w-3.5 mr-2" />
                  TikTok
                </a>
                <a href="https://youtube.com/@primewaaag" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/2 hover:bg-white/5">
                  <img src="https://cdn.simpleicons.org/youtube/ff0000" alt="YouTube" className="h-3.5 w-3.5 mr-2" />
                  YouTube
                </a>
                <a href="https://twitch.tv/primewaaag" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/2 hover:bg-white/5">
                  <img src="https://cdn.simpleicons.org/twitch/a970ff" alt="Twitch" className="h-3.5 w-3.5 mr-2" />
                  Twitch
                </a>
                <a href="https://kick.com/primewaaag" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/2 hover:bg-white/5">
                  <img src="https://cdn.simpleicons.org/kick/00E701" alt="Kick" className="h-3.5 w-3.5 mr-2" />
                  Kick
                </a>
                <a href="https://discord.com/invite/N5T4SXfE2N" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/2 hover:bg-white/5">
                  <img src="https://cdn.simpleicons.org/discord/5865F2" alt="Discord" className="h-3.5 w-3.5 mr-2" />
                  Discord
                </a>
                <a href="https://steamcommunity.com/id/primewaaag/" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/2 hover:bg-white/5">
                  <img src="https://cdn.simpleicons.org/steam/ffffff" alt="Steam" className="h-3.5 w-3.5 mr-2" />
                  Steam
                </a>
                <a href="https://github.com/primewaaag" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/2 hover:bg-white/5">
                  <img src="https://cdn.simpleicons.org/github/ffffff" alt="GitHub" className="h-3.5 w-3.5 mr-2" />
                  GitHub
                </a>
                <a href="https://buymeacoffee.com/primewaaag" target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/2 hover:bg-white/5">
                  <img src="https://cdn.simpleicons.org/buymeacoffee/FFDD00" alt="BuyMeACoffee" className="h-3.5 w-3.5 mr-2" />
                  BuyMeACoffee
                </a>
              </div>
            </div>

            {/* AUTH SECTION */}
            <div className="border-t border-white/10 pt-6">
              {!user ? (
                <Link
                  href={`/auth/login?next=${encodeURIComponent(pathname)}`}
                  onClick={() => setIsOpen(false)}
                  className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200"
                >
                  <LogIn size={16} /> Login
                </Link>
              ) : (
                <div className="bg-white/2 border border-white/5 rounded-2xl p-3.5 space-y-3">
                  <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                    <img src={user.avatar} alt={user.username} className="h-9 w-9 rounded-full border border-white/10" />
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate">{user.username}</h4>
                      <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Link
                      href="/accounts"
                      onClick={() => setIsOpen(false)}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-white/5 border border-white/5 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                    >
                      <User size={14} className="text-purple-400" />
                      Account
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        setIsOpen(false);
                      }}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
                    >
                      <LogOut size={14} />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </nav>
    </>
  );
}