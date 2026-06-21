'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ExtensionsModal from '@/components/ExtensionsModal';
import { 
  Loader2, 
  ArrowLeft, 
  Mail, 
  Calendar, 
  Shield, 
  CheckCircle,
  HelpCircle,
  Sparkles,
  Info
} from 'lucide-react';

export default function AccountsPage() {
  const { user, isLoading, updateUserFields, setAuthModalOpen } = useAuth();
  const router = useRouter();
  
  const [username, setUsername] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Prepopulate username when user state becomes available
  useEffect(() => {
    if (user) {
      setUsername(user.username);
    }
  }, [user]);

  // Redirect to login if unauthenticated after loading finishes
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/auth/login?next=/accounts');
    }
  }, [user, isLoading, router]);

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    if (!username.trim()) {
      setErrorMsg('Username cannot be empty.');
      return;
    }

    if (username.trim() === user?.username) {
      setSuccessMsg('Username is already up to date.');
      return;
    }

    setIsSaving(true);
    try {
      await updateUserFields({ username: username.trim() });
      setSuccessMsg('Username updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      console.error('Failed to update username:', err);
      setErrorMsg(err.message || 'Failed to update username. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden">
        <div className="glow-blob-1 z-0" />
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin relative z-10" />
        <p className="text-zinc-400 text-sm mt-3 relative z-10">Loading account credentials...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen text-white flex flex-col items-center justify-center relative overflow-hidden px-4">
        <div className="glow-blob-1 z-0" />
        <Navbar onOpenExtensions={() => setIsModalOpen(true)} />
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
        <ExtensionsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
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
    } catch (_) {}
  }

  // Connected Platforms List
  const platforms = user.platforms || [user.createdVia || user.platform || 'email'];

  return (
    <main className="min-h-screen text-white relative overflow-hidden">
      {/* Glow blobs */}
      <div className="glow-blob-1 z-0" />
      <div className="glow-blob-2 z-0" />

      <Navbar onOpenExtensions={() => setIsModalOpen(true)} />

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
              <span className="absolute bottom-0 right-0 h-6 w-6 rounded-full bg-emerald-500 border-2 border-zinc-950 flex items-center justify-center text-[10px] font-bold text-white shadow-md">
                ✓
              </span>
            </div>
            
            <div className="text-center sm:text-left space-y-2">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2.5">
                <h1 className="text-2xl font-black tracking-tight uppercase">{user.username}</h1>
                <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <p className="text-[10px] text-purple-400 uppercase font-bold tracking-widest bg-purple-500/10 px-3 py-1 rounded-full border border-purple-500/20 inline-block">
                {user.role}
              </p>
            </div>
          </div>

          {/* Editing form */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Manage Profile</h2>
            <form onSubmit={handleSaveName} className="flex flex-col sm:flex-row gap-3">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter new username"
                  maxLength={25}
                  disabled={isSaving}
                  className="w-full bg-zinc-950/40 text-white placeholder-zinc-600 text-sm px-4 py-2.5 rounded-xl border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                />
              </div>
              <button
                type="submit"
                disabled={isSaving || username.trim() === user.username}
                className="px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 disabled:hover:bg-purple-600 text-white text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                {isSaving && <Loader2 size={12} className="animate-spin" />}
                Save Name
              </button>
            </form>

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

          {/* Signed In With (Unified Platforms list) */}
          <div className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Connected Login Methods</h2>
            <div className="flex flex-wrap gap-3">
              {platforms.map((p) => {
                let label = 'Email';
                let iconEl = <Mail size={12} className="text-indigo-400" />;
                let style = 'bg-indigo-500/10 border-indigo-500/20 text-indigo-300';
                
                if (p === 'twitch') {
                  label = 'Twitch';
                  iconEl = <img src="https://cdn.simpleicons.org/twitch/a970ff" alt="Twitch" className="h-3.5 w-3.5" />;
                  style = 'bg-[#9146FF]/10 border-[#9146FF]/20 text-purple-300';
                } else if (p === 'discord') {
                  label = 'Discord';
                  iconEl = <img src="https://cdn.simpleicons.org/discord/5865F2" alt="Discord" className="h-3.5 w-3.5" />;
                  style = 'bg-[#5865F2]/10 border-[#5865F2]/20 text-blue-300';
                } else if (p === 'google') {
                  label = 'Google';
                  iconEl = <img src="https://www.vectorlogo.zone/logos/google/google-icon.svg" alt="Google" className="h-3.5 w-3.5" />;
                  style = 'bg-white/5 border-white/10 text-white';
                }

                return (
                  <div 
                    key={p} 
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold capitalize ${style}`}
                  >
                    {iconEl}
                    {label}
                  </div>
                );
              })}
            </div>
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
      <ExtensionsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
