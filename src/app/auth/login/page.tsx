'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Navbar from '@/components/Navbar';
import ExtensionsModal from '@/components/ExtensionsModal';

function LoginContent() {
  const {
    user,
    isLoading,
    loginWithGoogle,
    loginOAuthPlatform
  } = useAuth();

  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get('next') || '/';
  const [errorMsg, setErrorMsg] = useState('');

  // Redirect if user is already logged in
  useEffect(() => {
    if (!isLoading && user) {
      router.push(next);
    }
  }, [user, isLoading, router, next]);

  return (
    <div className="w-full max-w-md bg-zinc-900/80 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl overflow-hidden relative">
      {/* Glow highlight top line */}
      <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/30 to-transparent" />

      {/* Form Content */}
      <div className="flex flex-col items-center text-center space-y-6">
        <div className="space-y-2">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">Sign in</h2>
          <p className="text-xs text-zinc-400 max-w-sm leading-relaxed">
            Choose how you'd like to sign in. Your purchases are tied to the account you sign in with.
          </p>
        </div>

        {errorMsg && (
          <div className="w-full p-3 text-xs bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-left">
            {errorMsg}
          </div>
        )}

        {/* PLATFORM LOGIN CHOICES */}
        <div className="w-full space-y-3 pt-2 text-left">

          {/* Twitch Login */}
          <button
            onClick={async () => {
              setErrorMsg('');
              try {
                await loginOAuthPlatform('twitch');
              } catch (err: any) {
                setErrorMsg(err.message || 'Failed to redirect to Twitch.');
              }
            }}
            disabled={isLoading}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-[#9146FF] hover:bg-[#772ce8] text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(145,70,255,0.15)] cursor-pointer"
          >
            <img src="https://cdn.simpleicons.org/twitch/ffffff" alt="Twitch" className="h-5 w-5 object-contain" />
            <span className="flex-1 text-left">Continue with Twitch</span>
          </button>

          {/* Discord Login */}
          <button
            onClick={async () => {
              setErrorMsg('');
              try {
                await loginOAuthPlatform('discord');
              } catch (err: any) {
                setErrorMsg(err.message || 'Failed to redirect to Discord.');
              }
            }}
            disabled={isLoading}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-[#5865F2] hover:bg-[#4752c4] text-white transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-[0_0_20px_rgba(88,101,242,0.15)] cursor-pointer"
          >
            <img src="https://cdn.simpleicons.org/discord/ffffff" alt="Discord" className="h-5 w-5 object-contain" />
            <span className="flex-1 text-left">Continue with Discord</span>
          </button>

          {/* Google Login */}
          <button
            onClick={() => loginWithGoogle()}
            disabled={isLoading}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-white hover:bg-zinc-100 text-zinc-950 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-[0_4px_20px_rgba(255,255,255,0.15)] cursor-pointer"
          >
            <img src="https://www.vectorlogo.zone/logos/google/google-icon.svg" alt="Google" className="h-5 w-5 object-contain" />
            <span className="flex-1 text-left">Continue with Google</span>
          </button>

          <p className="text-[11px] text-zinc-500 pt-4 text-center leading-relaxed font-semibold">
            An account is created automatically on first sign in.
          </p>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center space-y-4 z-50">
          <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
          <p className="text-sm font-semibold text-zinc-300">Connecting account...</p>
        </div>
      )}
    </div>
  );
}

export default function LoginPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <main className="min-h-screen text-white relative overflow-hidden flex flex-col items-center justify-center p-4">
      {/* Ambient background glows */}
      <div className="glow-blob-1 z-0" />
      <div className="glow-blob-2 z-0" />
      <div className="glow-blob-3 z-0" />

      <Navbar onOpenExtensions={() => setIsModalOpen(true)} />

      <div className="relative z-10 w-full flex justify-center mt-20">
        <Suspense fallback={
          <div className="w-full max-w-md bg-zinc-900/80 border border-white/10 rounded-2xl p-8 shadow-2xl backdrop-blur-xl overflow-hidden flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
            <p className="text-zinc-400 text-sm">Loading authentication state...</p>
          </div>
        }>
          <LoginContent />
        </Suspense>
      </div>

      <ExtensionsModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </main>
  );
}
