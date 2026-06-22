'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Check } from 'lucide-react';
import Link from 'next/link';

export default function PremiumPage() {
  const { user } = useAuth();

  const isTwitchSubscriber = !!(
    user && 
    (
      ((user.twitchId || user.twitchUsername) && (user.role === 'Twitch Subscriber' || (user as any).isSubscriber === true)) ||
      user.role === 'Admin'
    )
  );

  const getTierLevel = (role?: string) => {
    if (role === 'Tier 1') return 1;
    if (role === 'Tier 2') return 2;
    if (role === 'Tier 3') return 3;
    return 0;
  };

  const currentTierLevel = getTierLevel(user?.role);
  const inPlan = currentTierLevel > 0;

  const renderCardButton = (cardTier: 1 | 2 | 3) => {
    if (currentTierLevel === cardTier) {
      return (
        <button
          disabled
          className="w-full py-3 px-4 rounded-full bg-zinc-800 text-zinc-500 font-bold text-xs uppercase tracking-wider cursor-not-allowed text-center border border-zinc-700 block"
        >
          Current tier
        </button>
      );
    }

    if (cardTier < currentTierLevel) {
      return (
        <button
          disabled
          className="w-full py-3 px-4 rounded-full bg-zinc-900/50 text-zinc-600 font-bold text-xs uppercase tracking-wider cursor-not-allowed text-center border border-zinc-800/40 block"
        >
          Downgrade Unavailable
        </button>
      );
    }
    
    let btnText = 'Join now';
    if (inPlan) {
      btnText = 'Upgrade tier';
    }

    return (
      <Link
        href={`/premium/checkout?tier=${cardTier}`}
        className="w-full py-3 px-4 rounded-full bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-bold text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer text-center block"
      >
        {btnText}
      </Link>
    );
  };

  return (
    <main className="min-h-screen text-white selection:bg-purple-500/30 relative overflow-hidden">
      {/* Dynamic Ambient Background Elements */}
      <div className="glow-blob-1 z-0 animate-pulse duration-[8000ms]" />
      <div className="glow-blob-2 z-0 animate-pulse duration-[10000ms]" />
      <div className="glow-blob-3 z-0" />

      <div className="relative z-10">
        <Navbar />

        <div className="pt-32 pb-24 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto space-y-16">
          {/* Header */}
          <div className="flex flex-col items-center text-center space-y-4">
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-wider uppercase text-white font-sans">
              {inPlan ? 'MEMBER DASHBOARD' : 'BECOME A MEMBER'}
            </h1>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">
            {/* TIER 1 */}
            <div className="bg-[#121214] border border-zinc-800 rounded-[24px] p-8 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xl">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Tier 1</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-extrabold text-white">€10</span>
                    <span className="text-xs text-zinc-500 font-medium">once (plus tax)</span>
                  </div>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                      or <span className="text-green-400 font-black">FREE</span> for <img src="https://cdn.simpleicons.org/twitch/a970ff" alt="Twitch" className="h-3 w-3 inline" /> subs
                    </span>
                  </div>
                </div>

                {renderCardButton(1)}

                <div className="text-center h-4" />

                <p className="text-xs text-zinc-300 font-medium pt-2">
                  Get a glimpse of nutty in a nutshell!
                </p>

                <ul className="space-y-3 pt-2">
                  <li className="flex items-start gap-2.5 text-xs text-zinc-400">
                    <Check size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span>Access to teasers on Discord</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-400">
                    <Check size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span>Private Discord Channels</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* TIER 2 */}
            <div className="bg-[#121214] border border-zinc-800 rounded-[24px] p-8 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xl relative">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400 flex items-center justify-center gap-1.5">
                    💎 Tier 2
                  </h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-extrabold text-white">€25</span>
                    <span className="text-xs text-zinc-500 font-medium">once (plus tax)</span>
                  </div>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                      or <span className="text-[#a970ff] font-black">€20</span> for <img src="https://cdn.simpleicons.org/twitch/a970ff" alt="Twitch" className="h-3 w-3 inline" /> subs
                    </span>
                  </div>
                </div>

                {renderCardButton(2)}

                <div className="text-center h-4" />

                <p className="text-xs text-zinc-300 font-medium pt-2">
                  Get access to member exclusive widgets!
                </p>

                <ul className="space-y-3 pt-2">
                  <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-semibold">
                    <Check size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span>💎 Widget Access</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-400">
                    <Check size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span>Access to teasers on Discord</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-400">
                    <Check size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span>Private Discord Channels</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* TIER 3 */}
            <div className="bg-[#121214] border border-zinc-800 rounded-[24px] p-8 flex flex-col justify-between hover:border-zinc-700 transition-all shadow-xl">
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-zinc-400">Tier 3</h3>
                  <div className="flex items-baseline justify-center gap-1">
                    <span className="text-2xl font-extrabold text-white">€50</span>
                    <span className="text-xs text-zinc-500 font-medium">once (plus tax)</span>
                  </div>
                  <div className="pt-1">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-800 bg-zinc-900/50 text-[10px] font-black text-zinc-300 uppercase tracking-widest">
                      or <span className="text-[#a970ff] font-black">€40</span> for <img src="https://cdn.simpleicons.org/twitch/a970ff" alt="Twitch" className="h-3 w-3 inline" /> subs
                    </span>
                  </div>
                </div>

                {renderCardButton(3)}

                <div className="text-center h-4" />

                <p className="text-xs text-zinc-300 font-medium pt-2">
                  Name Attribution On nutty.gg!
                </p>

                <ul className="space-y-3 pt-2">
                  <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-semibold">
                    <Check size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span>💎 Widget Access</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-semibold">
                    <Check size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span>🔥 Attribution on waaag.dev</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-400">
                    <Check size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span>Access to teasers on Discord</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-400">
                    <Check size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span>Private Discord Channels</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
