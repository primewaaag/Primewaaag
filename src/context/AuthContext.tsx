'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser 
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '@/utils/firebase';

export interface User {
  username: string;
  avatar: string;
  email: string;
  platform: 'twitch' | 'google' | 'discord' | 'email';
  role: string;
  userId: string;
  createdVia?: string;
  signUpMethod?: string;
  createdAt?: string;
  platforms?: string[];
  twitchId?: string | null;
  discordId?: string | null;
  isSubscriber?: boolean;
}

interface AuthContextType {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  token: string | null;
  isLoading: boolean;
  isAuthModalOpen: boolean;
  isAdmin: boolean;
  setAuthModalOpen: (open: boolean) => void;
  loginWithGoogle: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  loginOAuthPlatform: (platform: 'twitch' | 'discord') => Promise<void>;
  updateUserFields: (fields: Partial<User>) => Promise<void>;
  syncUserToFirestore: (
    fbUser: FirebaseUser,
    platform: 'google' | 'twitch' | 'discord' | 'email',
    oauthId?: string,
    oauthUsername?: string,
    oauthAvatar?: string
  ) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const generateLocalToken = (email: string, uid: string) => {
  try {
    const headerStr = JSON.stringify({ alg: "HS256", typ: "JWT" });
    const payloadStr = JSON.stringify({ 
      email: email, 
      user_id: uid, 
      sub: uid,
      name: email.split('@')[0]
    });
    const header = typeof window !== 'undefined' ? window.btoa(headerStr) : Buffer.from(headerStr).toString('base64');
    const payload = typeof window !== 'undefined' ? window.btoa(payloadStr) : Buffer.from(payloadStr).toString('base64');
    return `${header}.${payload}.localsignature`;
  } catch (e) {
    console.error('Failed to generate local JWT:', e);
    return 'local.token.signature';
  }
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);

  const isAdmin = user?.email?.toLowerCase() === 'marc.aeschbach@icloud.com';

  // Helper to sync/create user document in Firestore
  const syncUserToFirestore = async (
    fbUser: FirebaseUser,
    platform: 'google' | 'twitch' | 'discord' | 'email',
    oauthId?: string,
    oauthUsername?: string,
    oauthAvatar?: string
  ) => {
    const userRef = doc(db, 'users', fbUser.uid);
    const userDoc = await getDoc(userRef);
    const existingData = userDoc.exists() ? userDoc.data() : null;

    const email = fbUser.email || '';
    const isOwner = email.toLowerCase() === 'marc.aeschbach@icloud.com';
    const role = isOwner ? 'Admin' : (platform === 'twitch' ? 'Twitch Creator' : platform === 'discord' ? 'Discord Moderator' : 'User');
    
    // Choose avatar
    let avatar = existingData?.avatar || oauthAvatar || fbUser.photoURL || '';
    if (!avatar) {
      const color = platform === 'twitch' ? 'a970ff' : platform === 'discord' ? '5865f2' : '4f46e5';
      avatar = `https://api.dicebear.com/7.x/identicon/svg?seed=${fbUser.uid}&backgroundColor=${color}`;
    }

    const username = existingData?.username || oauthUsername || fbUser.displayName || email.split('@')[0] || 'User';

    let platforms = existingData?.platforms || [];
    if (existingData?.createdVia && !platforms.includes(existingData.createdVia)) {
      platforms.push(existingData.createdVia);
    }
    if (existingData?.platform && !platforms.includes(existingData.platform)) {
      platforms.push(existingData.platform);
    }
    if (!platforms.includes(platform)) {
      platforms.push(platform);
    }
    if (platforms.length === 0) {
      platforms = [platform];
    }

    const twitchId = platform === 'twitch' ? (oauthId || null) : (existingData?.twitchId || null);
    const discordId = platform === 'discord' ? (oauthId || null) : (existingData?.discordId || null);

    const userData: User = {
      username,
      avatar,
      email: existingData?.email || email,
      role: existingData?.role || role,
      platform: existingData?.platform || platform,
      userId: fbUser.uid,
      createdVia: existingData?.createdVia || platform,
      signUpMethod: existingData?.signUpMethod || platform,
      createdAt: existingData?.createdAt || new Date().toISOString(),
      platforms,
      twitchId,
      discordId,
    };

    // Save to firestore
    await setDoc(userRef, {
      ...userData,
      lastLogin: new Date().toISOString(),
    }, { merge: true });

    setUser(userData);
  };

  // Listen to Auth state changes
  useEffect(() => {
    const localSession = localStorage.getItem('primewaaag_session');
    let hasLocal = false;
    if (localSession) {
      try {
        const { user: localUser, token: localToken } = JSON.parse(localSession);
        setUser(localUser);
        setToken(localToken);
        hasLocal = true;
      } catch (e) {
        localStorage.removeItem('primewaaag_session');
      }
    }

    if (hasLocal) {
      setIsLoading(false);
    }

    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      // If we currently have a local session, do not let onAuthStateChanged override it
      const currentLocal = localStorage.getItem('primewaaag_session');
      if (currentLocal) {
        setIsLoading(false);
        return;
      }

      setIsLoading(true);
      if (fbUser) {
        setFirebaseUser(fbUser);
        const userToken = await fbUser.getIdToken();
        setToken(userToken);

        // Fetch platform custom metadata from Firestore
        const userRef = doc(db, 'users', fbUser.uid);
        const userDoc = await getDoc(userRef);
        if (userDoc.exists()) {
          const data = userDoc.data();
          setUser({
            username: data.username,
            avatar: data.avatar,
            email: data.email,
            platform: data.platform,
            role: data.role,
            userId: data.userId,
            createdVia: data.createdVia,
            signUpMethod: data.signUpMethod,
            createdAt: data.createdAt,
            platforms: data.platforms || [data.createdVia || data.platform || 'email'],
            twitchId: data.twitchId || null,
            discordId: data.discordId || null,
          });
        } else {
          // Do NOT sync to Firestore to avoid race condition with callback pages.
          // Simply set local React user state.
          let platform: 'google' | 'twitch' | 'discord' | 'email' = 'email';
          if (fbUser.providerData[0]?.providerId === 'google.com') {
            platform = 'google';
          }
          const username = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';
          const avatar = fbUser.photoURL || `https://api.dicebear.com/7.x/identicon/svg?seed=${fbUser.uid}&backgroundColor=4f46e5`;
          setUser({
            username,
            avatar,
            email: fbUser.email || '',
            platform,
            role: 'User',
            userId: fbUser.uid,
            createdAt: new Date().toISOString(),
            platforms: [platform],
            twitchId: null,
            discordId: null
          });
        }
      } else {
        setFirebaseUser(null);
        setUser(null);
        setToken(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In
  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const credential = await signInWithPopup(auth, provider);
      await syncUserToFirestore(credential.user, 'google');
      localStorage.removeItem('primewaaag_session');
      setAuthModalOpen(false);
    } catch (e) {
      console.error('Google Sign-In Error:', e);
      setIsLoading(false);
      throw e;
    }
  };

  // Email Sign-In
  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const credential = await signInWithEmailAndPassword(auth, email, pass);
      await syncUserToFirestore(credential.user, 'email');
      localStorage.removeItem('primewaaag_session');
      setAuthModalOpen(false);
    } catch (e: any) {
      if (e.code === 'auth/configuration-not-found' || e.message?.includes('configuration-not-found')) {
        console.warn('Firebase Email/Password auth not enabled. Falling back to local authentication...');
        const uid = `local_email_${btoa(email).replace(/=/g, '')}`;
        const localUser: User = {
          username: email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${uid}&backgroundColor=4f46e5`,
          email: email,
          platform: 'email',
          role: email.toLowerCase() === 'marc.aeschbach@icloud.com' ? 'Admin' : 'User',
          userId: uid,
          createdVia: 'email',
          signUpMethod: 'email'
        };
        const localToken = generateLocalToken(email, uid);
        
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
          ...localUser,
          lastLogin: new Date().toISOString()
        }, { merge: true });

        setUser(localUser);
        setToken(localToken);
        localStorage.setItem('primewaaag_session', JSON.stringify({ user: localUser, token: localToken }));
        setAuthModalOpen(false);
        setIsLoading(false);
        return;
      }
      console.error('Email Sign-In Error:', e);
      setIsLoading(false);
      throw e;
    }
  };

  // Email Sign-Up
  const signUpWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const credential = await createUserWithEmailAndPassword(auth, email, pass);
      await syncUserToFirestore(credential.user, 'email');
      localStorage.removeItem('primewaaag_session');
      setAuthModalOpen(false);
    } catch (e: any) {
      if (e.code === 'auth/configuration-not-found' || e.message?.includes('configuration-not-found')) {
        console.warn('Firebase Email/Password auth not enabled. Falling back to local sign up...');
        const uid = `local_email_${btoa(email).replace(/=/g, '')}`;
        const localUser: User = {
          username: email.split('@')[0],
          avatar: `https://api.dicebear.com/7.x/identicon/svg?seed=${uid}&backgroundColor=4f46e5`,
          email: email,
          platform: 'email',
          role: email.toLowerCase() === 'marc.aeschbach@icloud.com' ? 'Admin' : 'User',
          userId: uid,
          createdVia: 'email',
          signUpMethod: 'email'
        };
        const localToken = generateLocalToken(email, uid);
        
        const userRef = doc(db, 'users', uid);
        await setDoc(userRef, {
          ...localUser,
          lastLogin: new Date().toISOString()
        }, { merge: true });

        setUser(localUser);
        setToken(localToken);
        localStorage.setItem('primewaaag_session', JSON.stringify({ user: localUser, token: localToken }));
        setAuthModalOpen(false);
        setIsLoading(false);
        return;
      }
      console.error('Email Sign-Up Error:', e);
      setIsLoading(false);
      throw e;
    }
  };

  // OAuth Redirect Flow for Twitch and Discord
  const loginOAuthPlatform = async (platform: 'twitch' | 'discord') => {
    setIsLoading(true);
    try {
      const redirectUri = window.location.origin + '/auth/callback';
      let authorizeUrl = '';

      if (platform === 'twitch') {
        const clientId = process.env.NEXT_PUBLIC_TWITCH_CLIENT_ID;
        if (!clientId) {
          throw new Error('Twitch Client ID is not configured. Please add NEXT_PUBLIC_TWITCH_CLIENT_ID to your .env file.');
        }
        authorizeUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=user:read:email&state=twitch`;
      } else if (platform === 'discord') {
        const clientId = process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID;
        if (!clientId) {
          throw new Error('Discord Client ID is not configured. Please add NEXT_PUBLIC_DISCORD_CLIENT_ID to your .env file.');
        }
        authorizeUrl = `https://discord.com/oauth2/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=code&scope=${encodeURIComponent('identify email')}&state=discord`;
      }

      // Redirect browser to the OAuth authorization page
      window.location.href = authorizeUrl;
    } catch (e) {
      console.error(`${platform} Redirect Error:`, e);
      setIsLoading(false);
      throw e;
    }
  };

  // Update user profile fields in Firestore & local state
  const updateUserFields = async (fields: Partial<User>) => {
    if (!user || !user.userId) return;
    try {
      const userRef = doc(db, 'users', user.userId);
      await setDoc(userRef, fields, { merge: true });
      setUser(prev => prev ? { ...prev, ...fields } : null);
    } catch (err) {
      console.error('Failed to update user fields in Firestore:', err);
      throw err;
    }
  };

  // Sign Out
  const logout = async () => {
    setIsLoading(true);
    try {
      localStorage.removeItem('primewaaag_session');
      await signOut(auth);
      setFirebaseUser(null);
      setUser(null);
      setToken(null);
      setIsLoading(false);
    } catch (e) {
      console.error('Sign-Out Error:', e);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        firebaseUser,
        token,
        isLoading,
        isAuthModalOpen,
        isAdmin,
        setAuthModalOpen,
        loginWithGoogle,
        loginWithEmail,
        signUpWithEmail,
        loginOAuthPlatform,
        updateUserFields,
        syncUserToFirestore,
        logout
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
