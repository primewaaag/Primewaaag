'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { Check, Loader2, Award, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';

function PremiumContent() {
  const { user, isLoading, activeTier, loadingTier } = useAuth();
  const searchParams = useSearchParams();
  const router = useRouter();

  const successParam = searchParams.get('success');
  const tierParam = parseInt(searchParams.get('tier') || '0', 10);
  const oldTierParam = parseInt(searchParams.get('oldTier') || '0', 10);
  const [showSuccessModal, setShowSuccessModal] = useState(successParam === 'true');

  const isTwitchSubscriber = !!(
    user &&
    (
      ((user.twitchId || user.twitchUsername) && (user.role === 'Twitch Subscriber' || (user as any).isSubscriber === true)) ||
      user.role === 'Admin'
    )
  );

  const currentTierLevel = activeTier;
  const inPlan = currentTierLevel > 0;

  const renderCardButton = (cardTier: 1 | 2 | 3) => {
    if (isLoading || (user && loadingTier)) {
      return (
        <button
          disabled
          className="w-full py-3 px-4 rounded-full bg-zinc-800/40 text-zinc-500 font-bold text-xs uppercase tracking-wider cursor-wait text-center border border-zinc-800/40 block flex items-center justify-center gap-2"
        >
          <Loader2 size={12} className="animate-spin text-purple-500" />
          <span>Checking plan...</span>
        </button>
      );
    }

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
                  Get a glimpse of waaag in a nutshell!
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
                  Featured Supporter slot on Homepage!
                </p>

                <ul className="space-y-3 pt-2">
                  <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-semibold">
                    <Check size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span>💎 Widget Access</span>
                  </li>
                  <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-semibold">
                    <Check size={14} className="text-zinc-500 mt-0.5 flex-shrink-0" />
                    <span>🌟 Featured Supporter slot on Homepage</span>
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

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-md bg-black/70 animate-fadeIn">
          <div className="relative max-w-md w-full bg-[#121214] border border-zinc-800 rounded-[28px] p-8 shadow-2xl overflow-hidden text-center flex flex-col items-center gap-6">
            {/* Glowing background blobs */}
            <div className="absolute -top-12 -left-12 w-32 h-32 bg-purple-600/10 rounded-full blur-3xl animate-pulse pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-32 h-32 bg-indigo-600/10 rounded-full blur-3xl animate-pulse pointer-events-none" />

            {/* Premium Badge Icon */}
            <div className="relative flex items-center justify-center h-20 w-20 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 p-0.5 shadow-lg shadow-purple-500/20 animate-bounce">
              <div className="flex items-center justify-center h-full w-full rounded-full bg-[#121214]">
                <Award size={36} className="text-purple-400" />
              </div>
            </div>

            {/* Header */}
            <div className="space-y-1">
              <h2 className="text-2xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-purple-200 to-zinc-400">
                {oldTierParam > 0 ? 'TIER UPGRADED!' : 'PREMIUM UNLOCKED!'}
              </h2>
              <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">
                {oldTierParam > 0 
                  ? `Upgraded from Tier ${oldTierParam} to Tier ${tierParam || 1}` 
                  : `Welcome to Tier ${tierParam || 1} Lifetime Membership`
                }
              </p>
            </div>

            {/* Perks Box */}
            <div className="w-full bg-zinc-950/50 border border-zinc-900 rounded-2xl p-5 text-left space-y-3.5">
              <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 block">
                YOUR UNLOCKED PERKS:
              </span>
              <ul className="space-y-3">
                {(tierParam === 1 || tierParam === 0) && (
                  <>
                    <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-medium">
                      <CheckCircle size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>Access to teasers on Discord</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-medium">
                      <CheckCircle size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>Private Discord Channels</span>
                    </li>
                  </>
                )}
                {tierParam === 2 && (
                  <>
                    <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-medium">
                      <CheckCircle size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>💎 Exclusive Widget Access</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-medium">
                      <CheckCircle size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>Access to teasers on Discord</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-medium">
                      <CheckCircle size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>Private Discord Channels</span>
                    </li>
                  </>
                )}
                {tierParam === 3 && (
                  <>
                    <li className="flex items-start gap-2.5 text-xs text-zinc-100 font-semibold">
                      <CheckCircle size={14} className="text-purple-400 mt-0.5 flex-shrink-0" />
                      <span>🌟 Featured Supporter slot on Homepage</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-medium">
                      <CheckCircle size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>💎 Exclusive Widget Access</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-medium">
                      <CheckCircle size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>Access to teasers on Discord</span>
                    </li>
                    <li className="flex items-start gap-2.5 text-xs text-zinc-300 font-medium">
                      <CheckCircle size={14} className="text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>Private Discord Channels</span>
                    </li>
                  </>
                )}
              </ul>
            </div>

            {/* Action */}
            <button
              type="button"
              onClick={() => {
                setShowSuccessModal(false);
                router.replace('/premium');
              }}
              className="w-full py-3.5 px-6 rounded-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs uppercase tracking-widest transition-all shadow-lg hover:shadow-purple-500/20 cursor-pointer text-center block"
            >
              Continue to Portal
            </button>
          </div>
        </div>
      )}
    </main>
  );
}

export default function PremiumPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
      </div>
    }>
      <PremiumContent />
    </Suspense>
  );
}
