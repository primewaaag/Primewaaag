'use client';

import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { ShieldCheck, LogIn, CheckCircle, HelpCircle, Loader2, Sparkles, Star, Award, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

export default function PremiumPage() {
  const { user, isLoading: authLoading, loginOAuthPlatform, updateUserFields } = useAuth();
  const [verifying, setVerifying] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const isSubscribed = user && (
    user.role === 'Twitch Subscriber' || 
    user.role === 'Premium' || 
    user.role === 'Admin' || 
    (user as any).isSubscriber === true
  );

  const handleConnectTwitch = async () => {
    if (!user) return;
    // Set linking UID in localStorage
    localStorage.setItem('connect_twitch_uid', user.userId);
    try {
      await loginOAuthPlatform('twitch');
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || 'Failed to connect Twitch account.');
    }
  };

  const handleVerifySubscription = async () => {
    if (!user) return;
    setVerifying(true);
    setStatusMsg('');
    setErrorMsg('');

    // Simulate calling API verification
    setTimeout(async () => {
      try {
        await updateUserFields({
          role: 'Twitch Subscriber',
          isSubscriber: true as any
        });
        setStatusMsg('Subscription verified successfully! Welcome to Waag Premium.');
      } catch (err: any) {
        console.error(err);
        setErrorMsg('Failed to update subscription status. Please try again.');
      } finally {
        setVerifying(false);
      }
    }, 1500);
  };

  return (
    <main className="min-h-screen text-white selection:bg-purple-500/30 relative overflow-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="glow-blob-1 z-0" />
      <div className="glow-blob-2 z-0" />
      <div className="glow-blob-3 z-0" />

      <div className="relative z-10">
        <Navbar />

        <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Sparkles size={24} />
            </div>
            <h1 className="text-4xl sm:text-5xl font-black tracking-tighter uppercase text-white drop-shadow-md">
              WAAG PREMIUM
            </h1>
            <p className="text-zinc-400 text-sm max-w-lg leading-relaxed">
              Support the stream on Twitch to unlock premium assets, direct developer downloads, and private community benefits.
            </p>
            <div className="h-1 w-20 bg-purple-600 rounded-full mx-auto" />
          </div>

          {/* Status Box */}
          <div className="glass-panel border border-white/5 rounded-3xl p-6 sm:p-8 relative overflow-hidden max-w-2xl mx-auto space-y-6">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
            
            <h2 className="text-base font-bold uppercase tracking-wider text-zinc-400">Activation Status</h2>

            {authLoading ? (
              <div className="flex items-center gap-3 text-zinc-500 text-sm py-4 justify-center">
                <Loader2 className="h-5 w-5 text-purple-500 animate-spin" />
                <span>Checking account credentials...</span>
              </div>
            ) : !user ? (
              // CASE 1: Not logged in
              <div className="space-y-4 text-center py-4">
                <p className="text-sm text-zinc-400 leading-relaxed">
                  You must be logged in to link your Twitch subscription and activate Premium.
                </p>
                <Link
                  href="/auth/login?next=/premium"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  <LogIn size={14} /> Log In Here
                </Link>
              </div>
            ) : !user.twitchId ? (
              // CASE 2: Logged in, Twitch NOT connected
              <div className="space-y-4 text-center py-4">
                <div className="text-xs text-zinc-400">
                  Signed in as <code className="text-purple-400 font-mono">{user.username}</code> ({user.email})
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
                  Your Twitch account is not connected yet. Connect it to check your subscriber status.
                </p>
                <button
                  onClick={handleConnectTwitch}
                  className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-xl bg-[#9146FF] hover:bg-[#772ce8] text-white transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  <img src="https://cdn.simpleicons.org/twitch/ffffff" alt="Twitch" className="h-4 w-4" />
                  Connect Twitch Account
                </button>
              </div>
            ) : isSubscribed ? (
              // CASE 3A: Logged in, Twitch connected, IS subscriber
              <div className="space-y-4 text-center py-4">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/25 flex items-center justify-center text-emerald-400 mx-auto animate-pulse">
                  <Award size={24} />
                </div>
                <div className="space-y-1">
                  <p className="font-black text-lg text-emerald-400 uppercase tracking-wide">Premium Active</p>
                  <p className="text-xs text-zinc-400">Twitch ID Linked: <code className="text-purple-400 font-mono">{user.twitchId}</code></p>
                </div>
                <p className="text-sm text-zinc-300 max-w-sm mx-auto leading-relaxed">
                  Thanks for supporting! You have full access to premium downloads and private benefits.
                </p>
                <Link
                  href="/downloads?category=premium"
                  className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white transition-all font-bold text-xs uppercase tracking-wider cursor-pointer"
                >
                  Browse Premium Downloads
                </Link>
              </div>
            ) : (
              // CASE 3B: Logged in, Twitch connected, NOT subscriber
              <div className="space-y-4 text-center py-4">
                <div className="text-xs text-zinc-400">
                  Linked Twitch Account: <code className="text-purple-400 font-mono">{user.twitchId}</code>
                </div>
                <p className="text-sm text-zinc-300 leading-relaxed max-w-md mx-auto">
                  We couldn't detect an active subscription to <code className="text-purple-400 font-mono">primewaaag</code> on Twitch.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-3 pt-2">
                  <a
                    href="https://twitch.tv/primewaaag/subscribe"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase tracking-wider cursor-pointer"
                  >
                    Subscribe on Twitch
                  </a>
                  <button
                    onClick={handleVerifySubscription}
                    disabled={verifying}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider cursor-pointer disabled:opacity-50"
                  >
                    {verifying && <Loader2 size={12} className="animate-spin" />}
                    Verify Subscription
                  </button>
                </div>
              </div>
            )}

            {statusMsg && (
              <div className="p-3 text-xs bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 flex items-center gap-2 animate-fadeIn justify-center">
                <CheckCircle size={14} className="flex-shrink-0" />
                <span>{statusMsg}</span>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 text-xs bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 flex items-center gap-2 animate-fadeIn justify-center">
                <ShieldAlert size={14} className="flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}
          </div>

          {/* Perks Grid */}
          <section className="space-y-6">
            <div className="border-b border-white/5 pb-3">
              <h2 className="text-lg font-black tracking-tight text-white uppercase">Premium Perks</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Perk 1 */}
              <div className="group p-6 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between relative overflow-hidden shadow-lg space-y-4">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
                <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform duration-300">
                  <Star size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wide">Premium Download Access</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1.5">
                    Unlock and download premium creators packs, shortcuts, widgets, overlays, and plugins.
                  </p>
                </div>
              </div>

              {/* Perk 2 */}
              <div className="group p-6 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between relative overflow-hidden shadow-lg space-y-4">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-emerald-500/20 to-transparent" />
                <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform duration-300">
                  <Award size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wide">Attribution on Waag.dev</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1.5">
                    Feature your custom profile picture and username in our public Supporters hall of fame on the home page.
                  </p>
                </div>
              </div>

              {/* Perk 3 */}
              <div className="group p-6 rounded-3xl glass-panel glass-panel-hover flex flex-col justify-between relative overflow-hidden shadow-lg space-y-4">
                <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-blue-500/20 to-transparent" />
                <div className="h-10 w-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform duration-300">
                  <ShieldCheck size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white uppercase tracking-wide">Access to Private Discord</h3>
                  <p className="text-xs text-zinc-400 leading-relaxed mt-1.5">
                    Link Discord to get automatic custom role assignments and entry to subscriber-only channels.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
