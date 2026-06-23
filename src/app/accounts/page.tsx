'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import {
  Loader2,
  ArrowLeft,
  Mail,
  Calendar,
  Shield,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Info,
  Clock,
  Plus,
  Check
} from 'lucide-react';
import { db } from '@/utils/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function AccountsPage() {
  const { user, isLoading, updateUserFields, setAuthModalOpen, linkGoogleAccount, loginOAuthPlatform, activeTier, loadingTier, premiumCreatedAt } = useAuth();
  const router = useRouter();

  const [selectedSource, setSelectedSource] = useState<'google' | 'twitch' | 'discord'>('google');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [purchases, setPurchases] = useState<any[]>([]);
  const [loadingPurchases, setLoadingPurchases] = useState(true);

  // Fetch user's orders from the database
  useEffect(() => {
    const fetchData = async () => {
      if (!user || !user.userId) return;
      try {
        const q = query(collection(db, 'orders'), where('userId', '==', user.userId));
        const snap = await getDocs(q);
        const list = snap.docs.map(doc => doc.data());
        // Sort client-side by createdAt descending
        list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setPurchases(list);
      } catch (err) {
        console.error('Error fetching purchases:', err);
      } finally {
        setLoadingPurchases(false);
      }
    };
    fetchData();
  }, [user]);

  // Sync chosen info source state on load
  useEffect(() => {
    if (user && user.infoSource) {
      setSelectedSource(user.infoSource);
    }
  }, [user]);

  // Redirect to login if unauthenticated after loading finishes
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?next=/accounts');
    }
  }, [user, isLoading, router]);

  const handleSourceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const source = e.target.value as 'google' | 'twitch' | 'discord';
    setSelectedSource(source);
    setSuccessMsg('');
    setErrorMsg('');

    if (!user) return;

    setIsSaving(true);
    try {
      let newUsername = user.username;
      let newAvatar = user.avatar;

      if (source === 'google') {
        newUsername = user.googleUsername || newUsername;
        newAvatar = user.googleAvatar || newAvatar;
      } else if (source === 'twitch') {
        newUsername = user.twitchUsername || newUsername;
        newAvatar = user.twitchAvatar || newAvatar;
      } else if (source === 'discord') {
        newUsername = user.discordUsername || newUsername;
        newAvatar = user.discordAvatar || newAvatar;
      }

      await updateUserFields({
        infoSource: source,
        username: newUsername,
        avatar: newAvatar
      });
    } catch (err: any) {
      console.error('Failed to change info source:', err);
      setErrorMsg(err.message || 'Failed to update profile settings.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="glow-blob-1 z-0" />
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin relative z-10" />
        <p className="text-zinc-400 text-sm mt-3 relative z-10">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden px-4">
        <div className="glow-blob-1 z-0" />
        <Navbar />
        <div className="max-w-md w-full glass-panel border border-white/5 p-8 rounded-3xl text-center space-y-6 relative z-10 mt-20">
          <div className="h-12 w-12 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400 mx-auto">
            <Shield size={24} />
          </div>
          <div>
            <h2 className="text-xl font-black tracking-tight text-white uppercase">Access Denied</h2>
            <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
              Please sign in to view your profile and manage account settings.
            </p>
          </div>
          <Link
            href="/auth/login?next=/accounts"
            className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold transition-all transform hover:scale-[1.02] cursor-pointer flex justify-center items-center"
          >
            Sign In
          </Link>
        </div>
      </main>
    );
  }

  // Format Join Date
  let joinDateStr = 'N/A';
  if (user.createdAt) {
    try {
      joinDateStr = new Date(user.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (_) { }
  }

  let premiumSinceStr = 'N/A';
  if (premiumCreatedAt) {
    try {
      premiumSinceStr = new Date(premiumCreatedAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (_) {}
  }

  let lastLoginStr = 'N/A';
  if (user.lastLogin) {
    try {
      lastLoginStr = new Date(user.lastLogin).toLocaleString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (_) {}
  }

  const isGoogleConnected = !!user.googleUsername;
  const isTwitchConnected = !!(user.twitchUsername || user.twitchId);
  const isDiscordConnected = !!(user.discordUsername || user.discordId);

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      {/* Glow blobs */}
      <div className="glow-blob-1 z-0" />
      <div className="glow-blob-2 z-0" />

      <Navbar />

      <div className="relative z-10 pt-28 pb-24 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-6">

        {/* Navigation Link Back */}
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-zinc-400 hover:text-white transition-colors uppercase tracking-wider group"
        >
          <ArrowLeft size={14} className="transition-transform group-hover:-translate-x-1" />
          Back to Home
        </Link>

        {/* Profile Card */}
        <div className="glass-panel border border-white/5 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden space-y-8">
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />

           {/* Profile Header */}
          <div className="flex flex-col sm:flex-row items-center gap-6 pb-6 border-b border-white/5">
            <div className="relative">
              <img
                src={user.avatar}
                alt={user.username}
                className="h-24 w-24 rounded-full border-2 border-purple-500/30 object-cover shadow-[0_0_30px_rgba(168,85,247,0.2)]"
              />
            </div>

            <div className="text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl font-black tracking-tight uppercase">{user.username}</h1>
              </div>
              <div className="flex flex-wrap gap-2 pt-1">
                {loadingTier ? (
                  <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest bg-zinc-900/50 px-3 py-1 rounded-full border border-zinc-800/40 inline-flex items-center gap-1.5 animate-pulse">
                    <Loader2 size={10} className="animate-spin text-purple-500" />
                    <span>Loading Roles...</span>
                  </p>
                ) : (
                  <>
                    {/* Base Role Badge */}
                    <p className="text-[10px] text-purple-400 uppercase font-bold tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 inline-block">
                      {user.email.toLowerCase() === 'marc.aeschbach@icloud.com' ? 'Admin' : 'User'}
                    </p>

                    {/* Subscription Tier Badge */}
                    {activeTier > 0 && (
                      <p className="text-[10px] text-emerald-400 uppercase font-bold tracking-widest bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 inline-block">
                        Tier {activeTier} Subscriber
                      </p>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Profile Source Selector */}
          <div className="space-y-3">
            <div>
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Profile Source</h2>
              <p className="text-xs text-zinc-500">Sync your profile username and avatar from a connected account.</p>
            </div>
            <div className="flex flex-wrap gap-2.5 pt-1">
              {[
                { id: 'google', name: 'Google', username: user.googleUsername, icon: "https://www.vectorlogo.zone/logos/google/google-icon.svg", activeColor: 'border-white/20 bg-white/10 text-white' },
                { id: 'twitch', name: 'Twitch', username: user.twitchUsername, icon: "https://cdn.simpleicons.org/twitch/a970ff", activeColor: 'border-[#9146FF]/30 bg-[#9146FF]/10 text-purple-300' },
                { id: 'discord', name: 'Discord', username: user.discordUsername, icon: "https://cdn.simpleicons.org/discord/5865F2", activeColor: 'border-[#5865F2]/30 bg-[#5865F2]/10 text-blue-300' },
              ].map((plat) => {
                if (!plat.username) return null;
                const isSelected = selectedSource === plat.id;
                return (
                  <button
                    type="button"
                    key={plat.id}
                    disabled={isSaving}
                    onClick={() => {
                      if (selectedSource !== plat.id) {
                        const fakeEvent = { target: { value: plat.id } } as any;
                        handleSourceChange(fakeEvent);
                      }
                    }}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      isSelected
                        ? plat.activeColor
                        : 'border-white/5 bg-white/2 text-zinc-400 hover:text-white hover:border-white/10'
                    }`}
                  >
                    <img src={plat.icon} alt={plat.name} className="h-3.5 w-3.5" />
                    <span>{plat.username}</span>
                    {isSelected && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse ml-0.5" />
                    )}
                  </button>
                );
              })}

              {isSaving && (
                <div className="flex items-center justify-center px-2">
                  <Loader2 size={16} className="animate-spin text-purple-500" />
                </div>
              )}
            </div>

            {successMsg && (
              <div className="text-xs text-emerald-400 flex items-center gap-1.5 animate-fadeIn">
                <CheckCircle size={12} />
                {successMsg}
              </div>
            )}
            {errorMsg && (
              <div className="text-xs text-red-400 flex items-center gap-1.5 animate-fadeIn">
                <Info size={12} />
                {errorMsg}
              </div>
            )}
          </div>

          {/* User Details Grid */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Account Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Mail size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Email Address</p>
                  <p className="text-xs font-semibold text-white truncate max-w-[200px] sm:max-w-none">{user.email || 'N/A'}</p>
                </div>
              </div>

              <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Calendar size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Join Date</p>
                  <p className="text-xs font-semibold text-white">{joinDateStr}</p>
                </div>
              </div>

              <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
                <div className="h-9 w-9 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Clock size={16} />
                </div>
                <div>
                  <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Last Login</p>
                  <p className="text-xs font-semibold text-white">{lastLoginStr}</p>
                </div>
              </div>

              {premiumSinceStr !== 'N/A' && (
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Premium Member Since</p>
                    <p className="text-xs font-semibold text-white">{premiumSinceStr}</p>
                  </div>
                </div>
              )}

              {/* Twitch ID if connected */}
              {user.twitchId && (
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-[#9146FF]/10 border border-[#9146FF]/20 flex items-center justify-center">
                    <img src="https://cdn.simpleicons.org/twitch/a970ff" alt="Twitch" className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Twitch User ID</p>
                    <p className="text-xs font-mono text-white select-all">{user.twitchId}</p>
                  </div>
                </div>
              )}

              {/* Discord ID if connected */}
              {user.discordId && (
                <div className="bg-white/2 border border-white/5 rounded-2xl p-4 flex items-center gap-3.5">
                  <div className="h-9 w-9 rounded-xl bg-[#5865F2]/10 border border-[#5865F2]/20 flex items-center justify-center">
                    <img src="https://cdn.simpleicons.org/discord/5865F2" alt="Discord" className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">Discord User ID</p>
                    <p className="text-xs font-mono text-white select-all">{user.discordId}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Login Methods List */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Login Methods</h2>
            <div className="grid grid-cols-1 gap-3">
              {[
                {
                  id: 'google',
                  name: 'Google',
                  icon: <img src="https://www.vectorlogo.zone/logos/google/google-icon.svg" alt="Google" className="h-4 w-4" />,
                  connected: isGoogleConnected,
                  btnBg: 'bg-white hover:bg-zinc-100 text-zinc-950 shadow-[0_4px_20px_rgba(255,255,255,0.15)]',
                  badgeStyle: 'bg-white/5 border-white/10 text-white'
                },
                {
                  id: 'twitch',
                  name: 'Twitch',
                  icon: <img src="https://cdn.simpleicons.org/twitch/ffffff" alt="Twitch" className="h-4 w-4" />,
                  connected: isTwitchConnected,
                  btnBg: 'bg-[#9146FF] hover:bg-[#772ce8] text-white shadow-[0_0_20px_rgba(145,70,255,0.15)]',
                  badgeStyle: 'bg-[#9146FF]/10 border-[#9146FF]/20 text-purple-300'
                },
                {
                  id: 'discord',
                  name: 'Discord',
                  icon: <img src="https://cdn.simpleicons.org/discord/ffffff" alt="Discord" className="h-4 w-4" />,
                  connected: isDiscordConnected,
                  btnBg: 'bg-[#5865F2] hover:bg-[#4752c4] text-white shadow-[0_0_20px_rgba(88,101,242,0.15)]',
                  badgeStyle: 'bg-[#5865F2]/10 border-[#5865F2]/20 text-blue-300'
                }
              ].map((p) => {
                const handleConnect = async () => {
                  setErrorMsg('');
                  setSuccessMsg('');

                  if (p.id === 'google') {
                    try {
                      await linkGoogleAccount();
                      setSuccessMsg('Google account linked successfully!');
                      setTimeout(() => setSuccessMsg(''), 4000);
                    } catch (err: any) {
                      setErrorMsg(err.message || 'Failed to link Google account.');
                      setTimeout(() => setErrorMsg(''), 5000);
                    }
                  } else if (p.id === 'twitch' || p.id === 'discord') {
                    try {
                      localStorage.setItem('connect_platform_uid', user.userId);
                      localStorage.setItem('connect_platform_email', user.email);
                      localStorage.setItem('connect_platform_type', p.id);
                      await loginOAuthPlatform(p.id);
                    } catch (err: any) {
                      setErrorMsg(err.message || `Failed to redirect to ${p.name}.`);
                      setTimeout(() => setErrorMsg(''), 5000);
                    }
                  }
                };

                return (
                  <div
                    key={p.id}
                    className="bg-white/2 border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-9 w-9 rounded-xl flex items-center justify-center ${p.id === 'google' ? 'bg-white' :
                        p.id === 'twitch' ? 'bg-[#9146FF]' :
                          p.id === 'discord' ? 'bg-[#5865F2]' : 'bg-indigo-600'
                        }`}>
                        {p.icon}
                      </div>
                      <span className="text-sm font-semibold text-white">{p.name}</span>
                    </div>

                    {p.connected ? (
                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold capitalize ${p.badgeStyle}`}>
                        <Check size={12} className="stroke-[3]" /> Connected
                      </div>
                    ) : (
                      <button
                        onClick={handleConnect}
                        disabled={isSaving}
                        className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer ${p.btnBg}`}
                      >
                        Connect <Plus size={12} className="stroke-[3]" />
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Purchases History */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Purchases</h2>
            {loadingPurchases ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-6 w-6 text-purple-500 animate-spin" />
              </div>
            ) : purchases.length === 0 ? (
              <div className="bg-white/2 border border-white/5 rounded-2xl p-6 text-center text-xs text-zinc-500 font-medium">
                No purchases found.
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-3">
                {purchases.map((purchase) => {
                  let purchaseDate = 'N/A';
                  if (purchase.createdAt) {
                    try {
                      purchaseDate = new Date(purchase.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      });
                    } catch (_) {}
                  }
                  return (
                    <div
                      key={purchase.id}
                      className="bg-white/2 border border-white/5 rounded-2xl p-4 space-y-3"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-xs font-bold text-white uppercase">Tier {purchase.tier} Membership</p>
                          <p className="text-[10px] text-zinc-500 font-medium mt-0.5">{purchaseDate}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-extrabold text-white">
                            {purchase.cost === 0 ? 'FREE' : `€${purchase.cost.toFixed(2)}`}
                          </p>
                          <p className="text-[9px] text-purple-400 uppercase font-black tracking-widest mt-0.5">Billed Once</p>
                        </div>
                      </div>
                      
                      {purchase.grantedByAdmin ? (
                        <div className="pt-2.5 border-t border-white/5 text-[11px] text-zinc-400 font-medium leading-relaxed">
                          ✨ You received this membership tier directly from an administrator. Write me on Discord or Email for more information.
                        </div>
                      ) : (
                        <div className="pt-2.5 border-t border-white/5 grid grid-cols-2 gap-2 text-[10px]">
                          <div>
                            <p className="text-zinc-500 font-bold uppercase tracking-wider">Billing Email</p>
                            <p className="text-zinc-300 font-medium mt-0.5 truncate">{purchase.billingEmail || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-zinc-500 font-bold uppercase tracking-wider">Address</p>
                            <p className="text-zinc-300 font-medium mt-0.5 truncate">
                              {purchase.billingAddress
                                ? `${purchase.billingAddress.fullName}, ${purchase.billingAddress.street}, ${purchase.billingAddress.city}, ${purchase.billingAddress.country}`
                                : 'N/A'}
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Delete Notice Information */}
          <div className="bg-red-500/5 border border-red-500/20 rounded-2xl p-4 flex items-start gap-3.5">
            <div className="h-9 w-9 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-500 flex-shrink-0">
              <HelpCircle size={16} />
            </div>
            <p className="text-xs text-red-400/90 leading-relaxed font-semibold">
              If you wish to delete your profile on here, drop me a Discord DM or send an email to{' '}
              <a href="mailto:primewaaag@gmail.com" className="text-red-300 underline hover:text-red-200">
                primewaaag@gmail.com
              </a>
            </p>
          </div>

        </div>
      </div>
    </main>
  );
}
