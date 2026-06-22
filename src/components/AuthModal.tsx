'use client';

import React, { useState } from 'react';
import { X, Loader2, Mail, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function AuthModal() {
  const { 
    isAuthModalOpen, 
    setAuthModalOpen, 
    isLoading, 
    loginWithGoogle, 
    loginOAuthPlatform, 
    loginWithEmail, 
    signUpWithEmail 
  } = useAuth();

  const [isEmailMode, setIsEmailMode] = useState(false);
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  if (!isAuthModalOpen) return null;

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!email || !password) {
      setErrorMsg('Please enter both email and password.');
      return;
    }

    try {
      if (isRegisterMode) {
        await signUpWithEmail(email, password);
      } else {
        await loginWithEmail(email, password);
      }
      // Reset form on success
      setEmail('');
      setPassword('');
      setIsEmailMode(false);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/user-not-found') {
        setErrorMsg('User not found. Check email or toggle "Create Account" below.');
      } else if (err.code === 'auth/wrong-password') {
        setErrorMsg('Incorrect password. Please try again.');
      } else if (err.code === 'auth/email-already-in-use') {
        setErrorMsg('Email already in use. Try signing in.');
      } else {
        setErrorMsg(err.message || 'Authentication failed. Please check credentials.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-zinc-950/85 backdrop-blur-md p-4 animate-fadeIn">
      {/* Backdrop click to close */}
      <div 
        className="absolute inset-0" 
        onClick={() => !isLoading && setAuthModalOpen(false)} 
      />

      <div className="relative w-full max-w-md bg-zinc-900/80 border border-white/10 rounded-2xl p-6 shadow-2xl backdrop-blur-xl overflow-hidden">
        {/* Close Button */}
        {!isLoading && (
          <button 
            onClick={() => setAuthModalOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-xl bg-zinc-950/50 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-950 transition-colors"
          >
            <X size={16} />
          </button>
        )}

        {/* Modal Content */}
        <div className="flex flex-col items-center text-center space-y-5">
          <div className="h-12 w-12 rounded-2xl bg-linear-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-bold text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] text-xl">
            P
          </div>
          
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white">Sign in to Creator Hub</h2>
            <p className="text-xs text-zinc-400 mt-1">Connect your Firebase account or streaming profiles.</p>
          </div>

          {errorMsg && (
            <div className="w-full p-3 text-xs bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-left">
              {errorMsg}
            </div>
          )}

          {/* PLATFORM LOGIN CHOICES */}
          <div className="w-full space-y-3 pt-2">
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

            {/* Google Login */}
            <button
              onClick={() => loginWithGoogle()}
              disabled={isLoading}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold bg-white hover:bg-zinc-100 text-zinc-950 transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:pointer-events-none shadow-[0_4px_20px_rgba(255,255,255,0.15)] cursor-pointer"
            >
              <img src="https://www.vectorlogo.zone/logos/google/google-icon.svg" alt="Google" className="h-5 w-5 object-contain" />
              <span className="flex-1 text-left">Continue with Google</span>
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
              <img src="https://cdn.discordapp.com/ffffff" alt="Discord" className="h-5 w-5 object-contain" />
              <span className="flex-1 text-left">Continue with Discord</span>
            </button>
          </div>
        </div>

        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-zinc-950/90 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
            <p className="text-sm font-semibold text-zinc-300">Loading...</p>
          </div>
        )}
      </div>
    </div>
  );
}
