'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, Puzzle, FolderCode, BarChart2, LogIn, ChevronDown, User, LogOut, Share2, Sparkles, Gift, Gem, Clock, Terminal, Gamepad2, TrendingUp, Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function Navbar() {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [renderedMenu, setRenderedMenu] = useState<string | null>(null);
  const [isLocked, setIsLocked] = useState(false);
  const [submenuX, setSubmenuX] = useState<number>(0);
  const [isOpen, setIsOpen] = useState(false);
  const { user, isAdmin, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();

  const submenuRef = useRef<HTMLDivElement>(null);
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const renderTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Sync activeMenu to renderedMenu with delay on close
  useEffect(() => {
    if (activeMenu) {
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
        renderTimeoutRef.current = null;
      }
      setRenderedMenu(activeMenu);
    } else {
      renderTimeoutRef.current = setTimeout(() => {
        setRenderedMenu(null);
      }, 300);
    }
  }, [activeMenu]);

  // Document-wide click listener to clear locked submenus when clicking outside
  useEffect(() => {
    const handleDocumentClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const navCapsule = document.querySelector('.nav-capsule');
      const submenuEl = submenuRef.current;

      const clickedInsideNav = navCapsule?.contains(target);
      const clickedInsideSubmenu = submenuEl?.contains(target);

      if (!clickedInsideNav && !clickedInsideSubmenu) {
        setIsLocked(false);
        setActiveMenu(null);
      }
    };

    document.addEventListener('click', handleDocumentClick);
    return () => {
      document.removeEventListener('click', handleDocumentClick);
    };
  }, []);

  // Close menus automatically when page changes
  useEffect(() => {
    setIsLocked(false);
    setActiveMenu(null);
    setIsOpen(false);
  }, [pathname]);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current);
      }
      if (renderTimeoutRef.current) {
        clearTimeout(renderTimeoutRef.current);
      }
    };
  }, []);

  // Update submenu horizontal coordinate relative to the capsule navbar
  useEffect(() => {
    if (renderedMenu && submenuRef.current) {
      const submenuWidth = submenuRef.current.offsetWidth;
      const navCapsule = document.querySelector('.nav-capsule');
      if (navCapsule) {
        const navRect = navCapsule.getBoundingClientRect();
        const rightLimit = navRect.right - submenuWidth;
        const leftLimit = navRect.left;

        let targetX = submenuX;
        // Keep submenu bounded inside the capsule dimensions
        if (targetX > rightLimit) {
          targetX = rightLimit;
        }
        if (targetX < leftLimit) {
          targetX = leftLimit;
        }

        submenuRef.current.style.translate = `${targetX}px 0px`;
      }
    }
  }, [renderedMenu, submenuX]);

  const handleMouseEnter = (menuName: string, event: React.MouseEvent<HTMLElement>) => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
    const target = event.currentTarget;
    const rect = target.getBoundingClientRect();
    setActiveMenu(menuName);
    // Align left side of submenu with the target list item minus a padding offset
    setSubmenuX(rect.x - 24);
  };

  const handleMouseLeave = () => {
    if (isLocked) return;
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  const handleTriggerClick = (menuName: string, event: React.MouseEvent<HTMLElement>) => {
    event.stopPropagation();
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }

    if (activeMenu === menuName && isLocked) {
      setIsLocked(false);
      setActiveMenu(null);
    } else {
      const rect = event.currentTarget.getBoundingClientRect();
      setActiveMenu(menuName);
      setSubmenuX(rect.x - 24);
      setIsLocked(true);
    }
  };

  const handleSubmenuMouseEnter = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current);
      closeTimeoutRef.current = null;
    }
  };

  const handleSubmenuMouseLeave = () => {
    if (isLocked) return;
    closeTimeoutRef.current = setTimeout(() => {
      setActiveMenu(null);
    }, 150);
  };

  return (
    <>
      {/* DESKTOP CAPSULE NAVBAR */}
      <nav className="nav-capsule hidden md:flex items-center">
        {/* BRAND LOGO */}
        <Link href="/" className="flex items-center">
          <img
            src="/logo.svg"
            alt="Logo"
            className="nav-capsule-logo hover:scale-[1.03] transition-transform filter drop-shadow-[0_0_15px_rgba(168,85,247,0.15)]"
          />
        </Link>

        {/* SLIDING CENTER MENU */}
        <div className="nav-capsule-menu">
          <ul>
            <li
              className="cursor-pointer"
              onMouseEnter={(e) => handleMouseEnter('downloads', e)}
              onMouseLeave={handleMouseLeave}
            >
              <Link href="/downloads" className={`category-link ${pathname === '/downloads' || activeMenu === 'downloads' ? 'active' : ''}`} onClick={() => setActiveMenu(null)}>
                <Puzzle size={13} className="text-purple-400" />
                Downloads
              </Link>
            </li>
            <li>
              <Link
                href="/projects"
                className={`category-link ${pathname === '/projects' ? 'active' : ''}`}
              >
                <FolderCode size={13} className="text-emerald-400" />
                Projects
              </Link>
            </li>
            <li>
              <Link
                href="/stream/profile"
                className={`category-link ${pathname.startsWith('/stream') ? 'active' : ''}`}
                onClick={() => setActiveMenu(null)}
              >
                <BarChart2 size={13} className="text-cyan-400" />
                Stream
              </Link>
            </li>
            <li>
              <Link
                href="/premium"
                className={`category-link ${pathname === '/premium' ? 'active' : ''}`}
              >
                <Sparkles size={13} className="text-amber-400" />
                Premium
              </Link>
            </li>
          </ul>
        </div>

        {/* RIGHT SIDE USER STATE & SOCIALS */}
        <div className="ml-auto flex items-center gap-6">
          {/* SOCIALS TRIGGER WITH ICON (LEFT OF LOGIN) */}
          <div
            className={`category-link cursor-pointer ${activeMenu === 'socials' ? 'active' : ''}`}
            onMouseEnter={(e) => handleMouseEnter('socials', e)}
            onMouseLeave={handleMouseLeave}
            onClick={(e) => handleTriggerClick('socials', e)}
          >
            <Share2 size={13} className="text-pink-400" />
            Socials
          </div>
          {user ? (
            <div
              className={`flex items-center gap-2 py-1.5 px-3 rounded-full hover:bg-white/[0.04] cursor-pointer transition-all border border-transparent hover:border-white/10 ${activeMenu === 'account' ? 'bg-white/[0.04] border-white/10' : ''
                }`}
              onMouseEnter={(e) => handleMouseEnter('account', e)}
              onMouseLeave={handleMouseLeave}
              onClick={(e) => handleTriggerClick('account', e)}
            >
              <img
                src={user.avatar}
                alt={user.username}
                className="h-6 w-6 rounded-full border border-purple-500/30 object-cover"
              />
              <span className="text-xs font-bold text-zinc-200 max-w-[120px] truncate uppercase tracking-wider">
                {user.username}
              </span>
              <ChevronDown size={12} className={`text-zinc-400 transition-transform ${activeMenu === 'account' ? 'rotate-180' : ''}`} />
            </div>
          ) : (
            <div>
              <Link
                href={`/auth/login?next=${encodeURIComponent(pathname)}`}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold bg-white/[0.04] border border-white/10 text-zinc-300 hover:text-white hover:bg-white/[0.08] hover:border-white/20 transition-all uppercase tracking-wider cursor-pointer"
              >
                <LogIn size={13} className="text-purple-400" /> Login
              </Link>
            </div>
          )}
        </div>
      </nav>

      {/* MOBILE CAPSULE NAVBAR */}
      <nav className="nav-capsule flex md:hidden items-center justify-between">
        {/* BRAND LOGO */}
        <Link href="/" className="flex items-center">
          <img
            src="/logo.svg"
            alt="Logo"
            className="h-7 w-auto object-contain"
          />
        </Link>

        {/* MOBILE MENU TOGGLE */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-zinc-300 hover:text-white p-1 rounded-lg bg-white/[0.04] border border-white/5 transition-colors cursor-pointer"
        >
          {isOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* SLIDING DESKTOP SUBMENU OVERLAY */}
      {renderedMenu && (
        <div
          ref={submenuRef}
          className={`nav-capsule-submenu ${activeMenu ? 'open' : ''}`}
          style={{
            translate: `${submenuX}px 0px`
          }}
          onMouseEnter={handleSubmenuMouseEnter}
          onMouseLeave={handleSubmenuMouseLeave}
        >

          {/* Downloads Submenu */}
          <div className={`submenu-downloads ${renderedMenu === 'downloads' ? 'visible' : ''} w-[180px]`}>
            <ul className="flex flex-col gap-1">
              <li>
                <Link
                  href="/downloads?category=free"
                  onClick={() => setActiveMenu(null)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-sm font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Gift size={16} className="text-emerald-500" />
                  Free Stuff
                </Link>
              </li>
              <li>
                <Link
                  href="/downloads?category=premium"
                  onClick={() => setActiveMenu(null)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-sm font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Gem size={16} className="text-amber-500" />
                  Premium
                </Link>
              </li>
              <li>
                <Link
                  href="/downloads?category=early-access"
                  onClick={() => setActiveMenu(null)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-white/[0.06] text-sm font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                >
                  <Clock size={16} className="text-purple-500" />
                  Early Access
                </Link>
              </li>
            </ul>
          </div>


          {/* Socials Submenu */}
          <div className={`submenu-socials ${renderedMenu === 'socials' ? 'visible' : ''} w-[180px]`}>
            <div className="flex flex-col gap-1">
              {[
                { name: 'Discord', url: 'https://discord.com/invite/N5T4SXfE2N', icon: 'https://cdn.simpleicons.org/discord/5865F2' },
                { name: 'Twitch', url: 'https://twitch.tv/primewaaag', icon: 'https://cdn.simpleicons.org/twitch/a970ff' },
                { name: 'YouTube', url: 'https://youtube.com/@primewaaag', icon: 'https://cdn.simpleicons.org/youtube/ff0000' },
                { name: 'TikTok', url: 'https://tiktok.com/@primewaaag', icon: 'https://cdn.simpleicons.org/tiktok/ffffff' },
                { name: 'Steam', url: 'https://steamcommunity.com/id/primewaaag/', icon: 'https://cdn.simpleicons.org/steam/ffffff' },
                { name: 'GitHub', url: 'https://github.com/primewaaag', icon: 'https://cdn.simpleicons.org/github/ffffff' },
                { name: 'Kick', url: 'https://kick.com/primewaaag', icon: 'https://cdn.simpleicons.org/kick/00E701' },
                { name: 'BuyMeACoffee', url: 'https://buymeacoffee.com/primewaaag', icon: 'https://cdn.simpleicons.org/buymeacoffee/FFDD00' },
              ].map((soc) => (
                <a
                  key={soc.name}
                  href={soc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-white/[0.06] transition-all cursor-pointer group"
                >
                  <img src={soc.icon} alt={soc.name} className="h-4.5 w-4.5 object-contain" />
                  <span className="text-sm font-bold text-zinc-300 group-hover:text-white transition-colors">{soc.name}</span>
                </a>
              ))}
            </div>
          </div>
          {/* Account Submenu */}
          <div className={`submenu-account ${renderedMenu === 'account' ? 'visible' : ''} w-[280px]`}>
            {user ? (
              <div className="space-y-4">
                <div className="flex items-center gap-3 pb-3 border-b border-white/10">
                  <img
                    src={user.avatar}
                    alt={user.username}
                    className="h-10 w-10 rounded-full border border-purple-500/30 object-cover"
                  />
                  <div className="overflow-hidden">
                    <div className="text-sm font-bold text-white truncate">{user.username}</div>
                    <div className="text-xs text-zinc-400 truncate">{user.email}</div>
                  </div>
                </div>
                <ul className="grid grid-cols-1 gap-1">
                  <li>
                    <Link
                      href="/accounts"
                      onClick={() => setActiveMenu(null)}
                      className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                    >
                      <User size={14} className="text-purple-400" />
                      Account Settings
                    </Link>
                  </li>
                  {isAdmin && (
                    <li>
                      <Link
                        href="/admin"
                        onClick={() => setActiveMenu(null)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/[0.06] text-xs font-bold text-zinc-300 hover:text-white transition-colors cursor-pointer"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-purple-400 animate-pulse mr-0.5" />
                        Admin Panel
                      </Link>
                    </li>
                  )}
                  <li>
                    <button
                      onClick={() => {
                        logout();
                        setActiveMenu(null);
                      }}
                      className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-red-500/10 text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer text-left"
                    >
                      <LogOut size={14} />
                      Log Out
                    </button>
                  </li>
                </ul>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <h4 className="text-xs font-bold text-zinc-200">Sign In</h4>
                  <p className="text-[11px] text-zinc-400 mt-1">Connect your profiles to view settings and stats.</p>
                </div>
                <Link
                  href={`/auth/login?next=${encodeURIComponent(pathname)}`}
                  onClick={() => setActiveMenu(null)}
                  className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl text-xs font-bold bg-white text-zinc-950 hover:bg-zinc-100 transition-all cursor-pointer shadow-lg"
                >
                  <LogIn size={14} /> Sign In
                </Link>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MOBILE DRAWER OVERLAY */}
      {isOpen && (
        <div className="md:hidden fixed top-[98px] left-[16px] right-[16px] rounded-[24px] border border-white/10 bg-[#0d1624]/90 p-5 shadow-2xl backdrop-blur-xl animate-fadeIn z-45 max-h-[calc(100vh-130px)] overflow-y-auto">
          {/* Navigation/Explore */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase px-2">Downloads</h4>
            <div className="flex flex-col gap-2">
              <Link
                href="/downloads"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.03] border border-white/5 text-zinc-300 hover:text-white"
              >
                <Puzzle size={16} className="text-purple-400" />
                All Downloads
              </Link>
              <Link
                href="/downloads?category=free"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.03] border border-white/5 text-zinc-300 hover:text-white"
              >
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                Free Stuff
              </Link>
              <Link
                href="/downloads?category=premium"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.03] border border-white/5 text-zinc-300 hover:text-white"
              >
                <span className="h-2 w-2 rounded-full bg-amber-400" />
                Premium
              </Link>
              <Link
                href="/downloads?category=early-access"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.03] border border-white/5 text-zinc-300 hover:text-white"
              >
                <span className="h-2 w-2 rounded-full bg-purple-400" />
                Early Access
              </Link>
              <Link
                href="/projects"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.03] border border-white/5 text-zinc-300 hover:text-white"
              >
                <FolderCode size={16} className="text-emerald-400" />
                Projects
              </Link>
              <Link
                href="/stream/commands"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.03] border border-white/5 text-zinc-300 hover:text-white"
              >
                <Terminal size={16} className="text-cyan-400" />
                Commands
              </Link>
              <Link
                href="/stream/setup"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.03] border border-white/5 text-zinc-300 hover:text-white"
              >
                <Gamepad2 size={16} className="text-cyan-400" />
                Setup
              </Link>
              <Link
                href="/stream/ranks"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.03] border border-white/5 text-zinc-300 hover:text-white"
              >
                <TrendingUp size={16} className="text-cyan-400" />
                Ranks/Tracker
              </Link>
              <Link
                href="/stream/leaderboard"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.03] border border-white/5 text-zinc-300 hover:text-white"
              >
                <Trophy size={16} className="text-cyan-400" />
                Loyalty Leaderboard
              </Link>
              <Link
                href="/premium"
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-white/[0.03] border border-white/5 text-zinc-300 hover:text-white"
              >
                <Sparkles size={16} className="text-amber-400" />
                Premium
              </Link>
              {isAdmin && (
                <Link
                  href="/admin"
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:text-purple-300"
                >
                  <span className="h-2 w-2 rounded-full bg-purple-400 animate-pulse" />
                  Admin Panel
                </Link>
              )}
            </div>
          </div>

          {/* Socials */}
          <div className="space-y-3 mt-6">
            <h4 className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase px-2">Connect</h4>
            <div className="grid grid-cols-2 gap-2">
              {[
                { name: 'Discord', url: 'https://discord.com/invite/N5T4SXfE2N', icon: 'https://cdn.simpleicons.org/discord/5865F2' },
                { name: 'Twitch', url: 'https://twitch.tv/primewaaag', icon: 'https://cdn.simpleicons.org/twitch/a970ff' },
                { name: 'YouTube', url: 'https://youtube.com/@primewaaag', icon: 'https://cdn.simpleicons.org/youtube/ff0000' },
                { name: 'TikTok', url: 'https://tiktok.com/@primewaaag', icon: 'https://cdn.simpleicons.org/tiktok/ffffff' },
                { name: 'Steam', url: 'https://steamcommunity.com/id/primewaaag/', icon: 'https://cdn.simpleicons.org/steam/ffffff' },
                { name: 'GitHub', url: 'https://github.com/primewaaag', icon: 'https://cdn.simpleicons.org/github/ffffff' },
                { name: 'Kick', url: 'https://kick.com/primewaaag', icon: 'https://cdn.simpleicons.org/kick/00E701' },
                { name: 'BuyMeACoffee', url: 'https://buymeacoffee.com/primewaaag', icon: 'https://cdn.simpleicons.org/buymeacoffee/FFDD00' },
              ].map((soc) => (
                <a
                  key={soc.name}
                  href={soc.url}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/[0.02] hover:bg-white/[0.05] border border-white/5"
                >
                  <img src={soc.icon} alt={soc.name} className="h-3.5 w-3.5 mr-2" />
                  {soc.name}
                </a>
              ))}
            </div>
          </div>

          {/* Account/Auth */}
          <div className="border-t border-white/10 pt-5 mt-6">
            {user ? (
              <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <img src={user.avatar} alt={user.username} className="h-9 w-9 rounded-full border border-white/10" />
                  <div className="overflow-hidden">
                    <h4 className="text-xs font-bold text-white truncate">{user.username}</h4>
                    <p className="text-[10px] text-zinc-400 truncate">{user.email}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    href="/accounts"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center justify-center gap-2 py-2 rounded-xl bg-white/[0.05] border border-white/5 text-zinc-300 hover:text-white text-xs font-bold transition-all cursor-pointer"
                  >
                    <User size={14} className="text-purple-400" />
                    Account
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 py-2 rounded-xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white border border-red-500/20 text-xs font-bold transition-all cursor-pointer"
                  >
                    <LogOut size={14} />
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href={`/auth/login?next=${encodeURIComponent(pathname)}`}
                onClick={() => setIsOpen(false)}
                className="w-full flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-semibold bg-white text-zinc-950 hover:bg-zinc-200"
              >
                <LogIn size={16} /> Login
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  );
}