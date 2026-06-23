'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  signOut, 
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  linkWithPopup,
  unlink
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { auth, db } from '@/utils/firebase';

export interface User {
  username: string;
  avatar: string;
  email: string;
  role: string;
  userId: string;
  createdVia?: string;
  signUpMethod?: string;
  createdAt?: string;
  twitchId?: string | null;
  discordId?: string | null;
  isSubscriber?: boolean;
  infoSource?: 'google' | 'twitch' | 'discord';
  googleUsername?: string | null;
  googleAvatar?: string | null;
  twitchUsername?: string | null;
  twitchAvatar?: string | null;
  discordUsername?: string | null;
  discordAvatar?: string | null;
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
  linkGoogleAccount: () => Promise<void>;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signUpWithEmail: (email: string, pass: string) => Promise<void>;
  loginOAuthPlatform: (platform: 'twitch' | 'discord') => Promise<void>;
  updateUserFields: (fields: Partial<User>) => Promise<void>;
  refreshUser: () => Promise<void>;
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

  const proxyAvatar = (url: string) => {
    if (url && url.startsWith('https://lh3.googleusercontent.com/')) {
      return `/.netlify/functions/avatar-proxy?url=${encodeURIComponent(url)}`;
    }
    return url;
  };

  const syncSupporterStatus = async (userId: string, username: string, avatar: string, role: string) => {
    try {
      const subQ = query(
        collection(db, 'premium'),
        where('userId', '==', userId),
        where('status', '==', 'active')
      );
      const subSnap = await getDocs(subQ);
      let isTier3 = false;
      if (!subSnap.empty) {
        const subData = subSnap.docs[0].data();
        if (subData.tier === 3) {
          isTier3 = true;
        }
      }

      if (isTier3) {
        await setDoc(doc(db, 'supporters', userId), {
          userId: userId,
          username: username,
          avatar: avatar,
        }, { merge: true });
      } else {
        await deleteDoc(doc(db, 'supporters', userId));
      }
    } catch (err) {
      console.error('Error syncing supporter status:', err);
    }
  };

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
    
    // Determine platform-specific username & avatar
    const currentUsername = oauthUsername || fbUser.displayName || email.split('@')[0] || 'User';
    let currentAvatar = proxyAvatar(oauthAvatar || fbUser.photoURL || '');
    if (!currentAvatar) {
      const color = platform === 'twitch' ? 'a970ff' : platform === 'discord' ? '5865f2' : '4f46e5';
      const firstLetter = currentUsername.charAt(0).toUpperCase();
      currentAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=${color}&color=fff&size=128&bold=true`;
    }

    const googleUsername = platform === 'google' ? currentUsername : (existingData?.googleUsername || null);
    const googleAvatar = platform === 'google' ? currentAvatar : (existingData?.googleAvatar || null);

    const twitchUsername = platform === 'twitch' ? currentUsername : (existingData?.twitchUsername || null);
    const twitchAvatar = platform === 'twitch' ? currentAvatar : (existingData?.twitchAvatar || null);

    const discordUsername = platform === 'discord' ? currentUsername : (existingData?.discordUsername || null);
    const discordAvatar = platform === 'discord' ? currentAvatar : (existingData?.discordAvatar || null);

    const infoSource = (existingData?.infoSource || (platform === 'email' ? 'google' : platform)) as 'google' | 'twitch' | 'discord';

    // Resolve primary details
    let resolvedUsername = currentUsername;
    let resolvedAvatar = currentAvatar;

    if (infoSource === 'google') {
      resolvedUsername = googleUsername || resolvedUsername;
      resolvedAvatar = googleAvatar || resolvedAvatar;
    } else if (infoSource === 'twitch') {
      resolvedUsername = twitchUsername || resolvedUsername;
      resolvedAvatar = twitchAvatar || resolvedAvatar;
    } else if (infoSource === 'discord') {
      resolvedUsername = discordUsername || resolvedUsername;
      resolvedAvatar = discordAvatar || resolvedAvatar;
    }

    const twitchId = platform === 'twitch' ? (oauthId || null) : (existingData?.twitchId || null);
    const discordId = platform === 'discord' ? (oauthId || null) : (existingData?.discordId || null);

    const userData: User = {
      username: resolvedUsername,
      avatar: resolvedAvatar,
      email: existingData?.email || email,
      role: existingData?.role || role,
      userId: fbUser.uid,
      createdVia: existingData?.createdVia || platform,
      signUpMethod: existingData?.signUpMethod || platform,
      createdAt: existingData?.createdAt || new Date().toISOString(),
      twitchId,
      discordId,
      infoSource,
      googleUsername,
      googleAvatar,
      twitchUsername,
      twitchAvatar,
      discordUsername,
      discordAvatar,
    };

    // Save to firestore
    await setDoc(userRef, {
      ...userData,
      lastLogin: new Date().toISOString(),
    }, { merge: true });

    // Sync admin or premium supporter to public supporters collection
    await syncSupporterStatus(fbUser.uid, userData.username, userData.avatar, userData.role);

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
            avatar: proxyAvatar(data.avatar),
            email: data.email,
            role: data.role,
            userId: data.userId,
            createdVia: data.createdVia,
            signUpMethod: data.signUpMethod,
            createdAt: data.createdAt,
            twitchId: data.twitchId || null,
            discordId: data.discordId || null,
            infoSource: data.infoSource || null,
            googleUsername: data.googleUsername || null,
            googleAvatar: proxyAvatar(data.googleAvatar) || null,
            twitchUsername: data.twitchUsername || null,
            twitchAvatar: data.twitchAvatar || null,
            discordUsername: data.discordUsername || null,
            discordAvatar: data.discordAvatar || null,
          });
        } else {
          // Do NOT sync to Firestore to avoid race condition with callback pages.
          // Simply set local React user state.
          const platform = (fbUser.providerData[0]?.providerId === 'google.com' ? 'google' : 'email') as 'google' | 'twitch' | 'discord' | 'email';
          const currentUsername = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';
          const firstLetter = currentUsername.charAt(0).toUpperCase();
          const currentAvatar = proxyAvatar(fbUser.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=4f46e5&color=fff&size=128&bold=true`);
          setUser({
            username: currentUsername,
            avatar: currentAvatar,
            email: fbUser.email || '',
            role: 'User',
            userId: fbUser.uid,
            createdAt: new Date().toISOString(),
            twitchId: null,
            discordId: null,
            infoSource: (platform === 'email' ? 'google' : platform) as 'google' | 'twitch' | 'discord',
            googleUsername: platform === 'google' ? currentUsername : null,
            googleAvatar: platform === 'google' ? currentAvatar : null,
            twitchUsername: platform === 'twitch' ? currentUsername : null,
            twitchAvatar: platform === 'twitch' ? currentAvatar : null,
            discordUsername: platform === 'discord' ? currentUsername : null,
            discordAvatar: platform === 'discord' ? currentAvatar : null,
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
    } catch (e: any) {
      setIsLoading(false);
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        return;
      }
      console.error('Google Sign-In Error:', e);
      throw e;
    }
  };

  // Link Google Account
  const linkGoogleAccount = async () => {
    if (!user) throw new Error('No user is currently logged in.');
    setIsLoading(true);
    const provider = new GoogleAuthProvider();
    try {
      if (auth.currentUser) {
        const credential = await linkWithPopup(auth.currentUser, provider);
        const googleProvider = credential.user.providerData.find(p => p.providerId === 'google.com');
        if (googleProvider && googleProvider.email && googleProvider.email.toLowerCase() !== user.email.toLowerCase()) {
          await unlink(auth.currentUser, 'google.com');
          window.location.href = '/auth/callback?error=email_mismatch';
          return;
        }
        
        const googleUsername = googleProvider?.displayName || user.username;
        const googleAvatar = googleProvider?.photoURL || user.avatar;
        
        await updateUserFields({
          googleUsername,
          googleAvatar
        });
      } else {
        const credential = await signInWithPopup(auth, provider);
        const googleUser = credential.user;
        if (googleUser.email && googleUser.email.toLowerCase() !== user.email.toLowerCase()) {
          await signOut(auth);
          window.location.href = '/auth/callback?error=email_mismatch';
          return;
        }
        
        const googleUsername = googleUser.displayName || user.username;
        const googleAvatar = googleUser.photoURL || user.avatar;
        
        await updateUserFields({
          googleUsername,
          googleAvatar
        });
      }
      setIsLoading(false);
    } catch (e: any) {
      setIsLoading(false);
      if (e.code === 'auth/popup-closed-by-user' || e.code === 'auth/cancelled-popup-request') {
        return;
      }
      if (e.code === 'auth/email-already-in-use') {
        window.location.href = '/auth/callback?error=email_mismatch';
        return;
      }
      console.error('Link Google Error:', e);
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
        const firstLetter = email.split('@')[0].charAt(0).toUpperCase();
        const localUser: User = {
          username: email.split('@')[0],
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=4f46e5&color=fff&size=128&bold=true`,
          email: email,
          role: email.toLowerCase() === 'marc.aeschbach@icloud.com' ? 'Admin' : 'User',
          userId: uid,
          createdVia: 'email',
          signUpMethod: 'email',
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
        const firstLetter = email.split('@')[0].charAt(0).toUpperCase();
        const localUser: User = {
          username: email.split('@')[0],
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(firstLetter)}&background=4f46e5&color=fff&size=128&bold=true`,
          email: email,
          role: email.toLowerCase() === 'marc.aeschbach@icloud.com' ? 'Admin' : 'User',
          userId: uid,
          createdVia: 'email',
          signUpMethod: 'email',
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
      const updatedUser = { ...user, ...fields };
      setUser(updatedUser);
      await syncSupporterStatus(user.userId, updatedUser.username, updatedUser.avatar, updatedUser.role);
    } catch (err) {
      console.error('Failed to update user fields in Firestore:', err);
      throw err;
    }
  };

  // Refresh user data from Firestore
  const refreshUser = async () => {
    const fbUser = auth.currentUser;
    const sessionStr = localStorage.getItem('primewaaag_session');
    
    let targetUid = fbUser?.uid;
    if (!targetUid && sessionStr) {
      try {
        const session = JSON.parse(sessionStr);
        targetUid = session.user?.userId;
      } catch (e) {}
    }

    if (!targetUid) return;

    try {
      const userRef = doc(db, 'users', targetUid);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const data = userDoc.data();
        const updatedUser: User = {
          username: data.username,
          avatar: proxyAvatar(data.avatar),
          email: data.email,
          role: data.role,
          userId: data.userId,
          createdVia: data.createdVia,
          signUpMethod: data.signUpMethod,
          createdAt: data.createdAt,
          twitchId: data.twitchId || null,
          discordId: data.discordId || null,
          infoSource: data.infoSource || null,
          googleUsername: data.googleUsername || null,
          googleAvatar: proxyAvatar(data.googleAvatar) || null,
          twitchUsername: data.twitchUsername || null,
          twitchAvatar: data.twitchAvatar || null,
          discordUsername: data.discordUsername || null,
          discordAvatar: data.discordAvatar || null,
        };
        setUser(updatedUser);
        
        if (sessionStr) {
          try {
            const parsed = JSON.parse(sessionStr);
            parsed.user = updatedUser;
            localStorage.setItem('primewaaag_session', JSON.stringify(parsed));
          } catch (e) {}
        }
        await syncSupporterStatus(updatedUser.userId, updatedUser.username, updatedUser.avatar, updatedUser.role);
      }
    } catch (err) {
      console.error('Failed to refresh user fields from Firestore:', err);
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
        linkGoogleAccount,
        loginWithEmail,
        signUpWithEmail,
        loginOAuthPlatform,
        updateUserFields,
        refreshUser,
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
