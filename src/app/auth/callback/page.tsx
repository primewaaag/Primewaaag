'use client';

import React, { useEffect, useState, Suspense, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  updateProfile 
} from 'firebase/auth';
import { auth, db } from '@/utils/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { Loader2, ShieldCheck, AlertCircle } from 'lucide-react';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState('');
  const { syncUserToFirestore, refreshUser } = useAuth();
  const calledRef = useRef(false);

  // Redirect back to accounts after 3 seconds on same email linking error
  useEffect(() => {
    if (status === 'error' && errorMessage === 'Could not be linked because not same email.') {
      const timer = setTimeout(() => {
        router.replace('/accounts');
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [status, errorMessage, router]);

  useEffect(() => {
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // twitch or discord
    const error = searchParams.get('error');

    if (error || searchParams.has('error')) {
      if (error === 'email_mismatch') {
        setStatus('error');
        setErrorMessage('Could not be linked because not same email.');
        return;
      }

      const isLinking = !!localStorage.getItem('connect_platform_uid');
      
      localStorage.removeItem('connect_platform_uid');
      localStorage.removeItem('connect_platform_type');
      localStorage.removeItem('connect_platform_email');
      
      const nextUrl = isLinking ? '/accounts' : (localStorage.getItem('auth_next') || '/');
      localStorage.removeItem('auth_next');
      
      router.replace(nextUrl);
      return;
    }

    if (!code || !state) {
      setStatus('error');
      setErrorMessage('Missing OAuth authorization code or state parameter.');
      return;
    }

    if (calledRef.current) return;
    calledRef.current = true;

    const exchangeCode = async () => {
      try {
        const redirectUri = window.location.origin + '/auth/callback';
        
        // 1. Exchange code on Netlify serverless backend
        const response = await fetch('/.netlify/functions/oauth-callback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ code, platform: state, redirectUri })
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || 'Failed to exchange authorization code.');
        }

        const { email, password, username, avatar, id } = data;

        // Check if we are linking an OAuth platform to an existing user!
        const connectPlatformUid = localStorage.getItem('connect_platform_uid');
        const connectPlatformType = localStorage.getItem('connect_platform_type');
        const connectPlatformEmail = localStorage.getItem('connect_platform_email');

        if (connectPlatformUid && connectPlatformType) {
          // Verify if the OAuth email matches the registered account email
          if (connectPlatformEmail && email.toLowerCase() !== connectPlatformEmail.toLowerCase()) {
            localStorage.removeItem('connect_platform_uid');
            localStorage.removeItem('connect_platform_type');
            localStorage.removeItem('connect_platform_email');
            setStatus('error');
            setErrorMessage('Could not be linked because not same email.');
            return;
          }

          const userRef = doc(db, 'users', connectPlatformUid);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            const firstLetter = username ? username.charAt(0).toUpperCase() : 'U';
            const resolvedAvatar = avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=${connectPlatformType === 'twitch' ? 'a970ff' : '5865f2'}&color=fff&size=128&bold=true`;
            const updateFields: any = {};
            if (connectPlatformType === 'twitch') {
              updateFields.twitchId = id;
              updateFields.twitchUsername = username;
              updateFields.twitchAvatar = resolvedAvatar;
            } else if (connectPlatformType === 'discord') {
              updateFields.discordId = id;
              updateFields.discordUsername = username;
              updateFields.discordAvatar = resolvedAvatar;
            }
            await setDoc(userRef, updateFields, { merge: true });
          }
          
          localStorage.removeItem('connect_platform_uid');
          localStorage.removeItem('connect_platform_type');
          localStorage.removeItem('connect_platform_email');
          setStatus('success');
          
          // Clear current session in localStorage so it reloads latest profile
          localStorage.removeItem('primewaaag_session');
          
          await refreshUser();
          
          // Redirect to accounts page
          setTimeout(() => {
            router.replace('/accounts');
          }, 1500);
          return;
        }

        // 2. Sign in or Sign up with Firebase Auth (client side)
        let userCredential;
        try {
          userCredential = await signInWithEmailAndPassword(auth, email, password);
        } catch (signInErr: any) {
          // If user doesn't exist, register them
          if (signInErr.code === 'auth/user-not-found' || signInErr.code === 'auth/invalid-credential') {
            userCredential = await createUserWithEmailAndPassword(auth, email, password);
          } else {
            throw signInErr;
          }
        }

        const fbUser = userCredential.user;

        // 3. Update Firebase display profile
        await updateProfile(fbUser, {
          displayName: username,
          photoURL: avatar
        });

        // 4. Save metadata to Firestore users collection and sync Auth state
        await syncUserToFirestore(fbUser, state as 'twitch' | 'discord', id, username, avatar);

        // Clean local session from storage if it exists
        localStorage.removeItem('primewaaag_session');

        setStatus('success');
        
        // Redirect to target nextUrl or homepage after a brief delay
        const nextUrl = localStorage.getItem('auth_next') || '/';
        localStorage.removeItem('auth_next');
        setTimeout(() => {
          router.replace(nextUrl);
        }, 1500);

      } catch (err: any) {
        console.error('OAuth Callback Error:', err);
        setStatus('error');
        setErrorMessage(err.message || 'An error occurred during authentication.');
      }
    };

    exchangeCode();
  }, [searchParams, router, syncUserToFirestore]);

  if (status === 'loading') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
        <div>
          <h2 className="text-xl font-bold text-white">Loading...</h2>
          <p className="text-zinc-400 text-sm mt-1">Please wait...</p>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
        <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500">
          <AlertCircle size={24} />
        </div>
        <div>
          <h2 className="text-xl font-bold text-white">
            {errorMessage === 'Could not be linked because not same email.' ? 'Linking Failed' : 'Sign-In Failed'}
          </h2>
          <p className="text-red-400 text-sm mt-1 max-w-md">{errorMessage}</p>
        </div>
        <button 
          onClick={() => router.replace(errorMessage === 'Could not be linked because not same email.' ? '/accounts' : '/')}
          className="px-5 py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 text-white text-xs font-bold transition-all cursor-pointer"
        >
          {errorMessage === 'Could not be linked because not same email.' ? 'Return to Accounts' : 'Return to Homepage'}
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-500">
        <ShieldCheck size={24} />
      </div>
      <div>
        <h2 className="text-xl font-bold text-white">Successfully Authenticated</h2>
        <p className="text-zinc-400 text-sm mt-1">Logged in successfully. Redirecting you home...</p>
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <main className="min-h-screen text-white flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900/40 border border-white/5 p-8 rounded-3xl backdrop-blur-md shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
        
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
            <Loader2 className="h-10 w-10 text-purple-500 animate-spin" />
            <div>
              <h2 className="text-xl font-bold text-white">Loading...</h2>
              <p className="text-zinc-400 text-sm mt-1">Please wait...</p>
            </div>
          </div>
        }>
          <CallbackContent />
        </Suspense>
      </div>
    </main>
  );
}
