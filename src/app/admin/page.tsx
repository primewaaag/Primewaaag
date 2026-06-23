'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useDownloads } from '@/hooks/useDownloads';
import { useNews } from '@/hooks/useNews';
import { useProjects } from '@/hooks/useProjects';
import { db, storage } from '@/utils/firebase';
import { Download, DownloadAction } from '@/utils/downloads';
import { VersionEntry } from '@/hooks/useProjects';
import { Shield, Users, Puzzle, Plus, Edit2, Trash2, Check, X, Loader2, Sparkles, MoreVertical, Newspaper, Video, FolderCode, Tag, GitBranch, ChevronDown, ChevronUp, Download as DownloadIcon, Copy, Terminal } from 'lucide-react';

interface RegisteredUser {
  id: string;
  email: string;
  username: string;
  infoSource?: string;
  role: string;
  avatar: string;
  lastLogin: string;
  userId: string;
  createdAt?: string;
  googleUsername?: string | null;
  twitchUsername?: string | null;
  discordUsername?: string | null;
}

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading, token } = useAuth();
  const { downloads, isLoading: downloadsLoading, refresh: refreshDownloads } = useDownloads();
  const { news, isLoading: newsLoading, refresh: refreshNews } = useNews();

  const [activeTab, setActiveTab] = useState<'downloads' | 'news' | 'projects' | 'users' | 'commands'>('downloads');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Set URL parameter on activeTab change (client-side)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const pageParam = params.get('page');
      if (pageParam && ['downloads', 'news', 'projects', 'users', 'commands'].includes(pageParam)) {
        setActiveTab(pageParam as any);
      }
    }
  }, []);

  const handleTabChange = (tab: 'downloads' | 'news' | 'projects' | 'users' | 'commands') => {
    setActiveTab(tab);
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('page', tab);
      window.history.pushState({}, '', url.toString());
    }
  };

  const handleCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const { projects, isLoading: projectsLoading, refresh: refreshProjects } = useProjects();
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [userSubscriptions, setUserSubscriptions] = useState<{ [userId: string]: { subId: string; tier: number } }>({});

  // Form States
  const [formId, setFormId] = useState('');
  const [formTitle, setFormTitle] = useState('');
  const [formPrice, setFormPrice] = useState('FREE');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formCategory, setFormCategory] = useState<'free' | 'premium' | 'early-access'>('free');
  const [formDesc, setFormDesc] = useState('');
  const [formDownloadType, setFormDownloadType] = useState<'file' | 'copy'>('file');
  const [formFileUrl, setFormFileUrl] = useState('');
  const [formCopyIcon, setFormCopyIcon] = useState('link');
  const [formCopyTitle, setFormCopyTitle] = useState('');
  const [formCopyDesc, setFormCopyDesc] = useState('');
  const [formCopyText, setFormCopyText] = useState('');
  const [formCopyBtnText, setFormCopyBtnText] = useState('Copy URL');
  const [formActions, setFormActions] = useState<DownloadAction[]>([]);
  const [editingDl, setEditingDl] = useState<Download | null>(null);

  // Single Action Form States
  const [actionFormId, setActionFormId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<'file' | 'copy'>('file');
  const [actionLabel, setActionLabel] = useState('');
  const [actionFileUrl, setActionFileUrl] = useState('');
  const [actionCopyIcon, setActionCopyIcon] = useState('link');
  const [actionCopyTitle, setActionCopyTitle] = useState('');
  const [actionCopyDesc, setActionCopyDesc] = useState('');
  const [actionCopyText, setActionCopyText] = useState('');
  const [actionCopyBtnText, setActionCopyBtnText] = useState('Copy URL');

  const clearActionForm = () => {
    setActionFormId(null);
    setActionType('file');
    setActionLabel('');
    setActionFileUrl('');
    setActionFileFile(null);
    setActionCopyIcon('link');
    setActionCopyTitle('');
    setActionCopyDesc('');
    setActionCopyText('');
    setActionCopyBtnText('Copy URL');
  };

  const handleSaveAction = () => {
    setApiError('');
    if (actionType === 'file' && !actionFileFile && !actionFileUrl) {
      setApiError('File is required for file action.');
      return;
    }
    if (actionType === 'copy' && !actionCopyText) {
      setApiError('Text to copy is required for copy action.');
      return;
    }

    const newAction: DownloadAction = {
      id: actionFormId || Date.now().toString(),
      type: actionType,
      label: actionType === 'file' ? actionLabel : undefined,
      fileUrl: actionType === 'file' ? (actionFileFile ? undefined : actionFileUrl) : undefined,
      file: actionType === 'file' ? (actionFileFile || undefined) : undefined,
      copyIcon: actionType === 'copy' ? actionCopyIcon : undefined,
      copyTitle: actionType === 'copy' ? actionCopyTitle : undefined,
      copyDesc: actionType === 'copy' ? actionCopyDesc : undefined,
      copyText: actionType === 'copy' ? actionCopyText : undefined,
      copyBtnText: actionType === 'copy' ? actionCopyBtnText : undefined,
    };

    if (actionFormId) {
      setFormActions(prev => prev.map(a => a.id === actionFormId ? newAction : a));
    } else {
      setFormActions(prev => [...prev, newAction]);
    }
    clearActionForm();
  };

  const handleEditAction = (act: DownloadAction) => {
    setActionFormId(act.id);
    setActionType(act.type);
    setActionLabel(act.label || '');
    setActionFileUrl(act.fileUrl || '');
    setActionFileFile(act.file || null);
    setActionCopyIcon(act.copyIcon || 'link');
    setActionCopyTitle(act.copyTitle || '');
    setActionCopyDesc(act.copyDesc || '');
    setActionCopyText(act.copyText || '');
    setActionCopyBtnText(act.copyBtnText || 'Copy URL');
  };

  const handleRemoveAction = (id: string) => {
    setFormActions(prev => prev.filter(a => a.id !== id));
    if (actionFormId === id) clearActionForm();
  };

  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // News Form States
  const [newsFormId, setNewsFormId] = useState('');
  const [newsFormTitle, setNewsFormTitle] = useState('');
  const [newsFormContent, setNewsFormContent] = useState('');
  const [newsFormType, setNewsFormType] = useState<'RELEASE' | 'NEW VIDEO' | 'ANNOUNCEMENT'>('RELEASE');
  const [newsFormDate, setNewsFormDate] = useState(getTodayDateString());
  const [newsFormMediaUrl, setNewsFormMediaUrl] = useState('');
  const [newsFormReadMoreUrl, setNewsFormReadMoreUrl] = useState('');
  const [editingNews, setEditingNews] = useState<any | null>(null);

  // ── PROJECT FORM STATES ──────────────────────────────────────────────
  const [projFormId, setProjFormId] = useState('');
  const [projFormTitle, setProjFormTitle] = useState('');
  const [projFormDescription, setProjFormDescription] = useState('');
  const [projFormDetailDesc, setProjFormDetailDesc] = useState('');
  const [projFormTags, setProjFormTags] = useState<string[]>([]);
  const [projFormTagInput, setProjFormTagInput] = useState('');
  const [projFormTagSuggestOpen, setProjFormTagSuggestOpen] = useState(false);
  // Status
  const [projFormStatusText, setProjFormStatusText] = useState('');
  const [projFormStatusColor, setProjFormStatusColor] = useState('zinc');
  // Quick View Button
  const [projFormQvBtnEnabled, setProjFormQvBtnEnabled] = useState(false);
  const [projFormQvBtnIcon, setProjFormQvBtnIcon] = useState('github');
  const [projFormQvBtnLabel, setProjFormQvBtnLabel] = useState('');
  const [projFormQvBtnLink, setProjFormQvBtnLink] = useState('');
  // Quick View Image
  const [projFormQvImgEnabled, setProjFormQvImgEnabled] = useState(false);
  const [projFormQvImgUrl, setProjFormQvImgUrl] = useState('');
  const [projFormQvImgRedirect, setProjFormQvImgRedirect] = useState('');
  // Detail page
  const [projFormRedirectLink, setProjFormRedirectLink] = useState('');
  const [projFormImages, setProjFormImages] = useState<{ url?: string; file?: File | null; redirectLink?: string; alt?: string }[]>([]);
  const [projFormImgUrl, setProjFormImgUrl] = useState('');
  const [projFormImgRedirect, setProjFormImgRedirect] = useState('');
  const [projFormImgAlt, setProjFormImgAlt] = useState('');
  // Versions
  const [projFormVersions, setProjFormVersions] = useState<VersionEntry[]>([]);
  const [projNewVersion, setProjNewVersion] = useState('');
  const [projNewChanges, setProjNewChanges] = useState('');
  // Misc
  const [projFormFeatured, setProjFormFeatured] = useState(false);
  const [editingProject, setEditingProject] = useState<any | null>(null);

  // Command Form States
  const [cmdName, setCmdName] = useState('');
  const [cmdPermission, setCmdPermission] = useState<'everyone' | 'moderator'>('everyone');
  const [cmdResponse, setCmdResponse] = useState('');
  const [cmdAliases, setCmdAliases] = useState('');
  const [cmdKind, setCmdKind] = useState<'general' | 'socials' | 'games' | 'fun'>('general');
  const [editingCmd, setEditingCmd] = useState<any | null>(null);
  const [commandsList, setCommandsList] = useState<any[]>([]);
  const [commandsLoading, setCommandsLoading] = useState(false);

  // Deferred File Upload States
  const [formImageFile, setFormImageFile] = useState<File | null>(null);
  const [actionFileFile, setActionFileFile] = useState<File | null>(null);
  const [newsFormMediaFile, setNewsFormMediaFile] = useState<File | null>(null);
  const [projFormQvImgFile, setProjFormQvImgFile] = useState<File | null>(null);
  const [projFormImgFile, setProjFormImgFile] = useState<File | null>(null);

  const uploadFileToStorage = async (file: File, folderPath: string = 'uploads', returnUrl: boolean = true): Promise<string> => {
    const { ref, uploadBytes, getDownloadURL } = await import('firebase/storage');
    const path = `${folderPath}/${Date.now()}_${file.name}`;
    const storageRef = ref(storage, path);
    const snapshot = await uploadBytes(storageRef, file);
    if (!returnUrl) {
      return path;
    }
    return await getDownloadURL(snapshot.ref);
  };

  const STATUS_COLORS = ['emerald', 'cyan', 'amber', 'rose', 'blue', 'purple', 'zinc', 'white'];
  const ICON_OPTIONS = ['github', 'star', 'external-link', 'globe', 'code', 'download', 'play'];

  const slugify = (str: string) =>
    str.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  // All unique tags from existing projects for autocomplete
  const allExistingTags = Array.from(
    new Set(projects.flatMap(p => Array.isArray(p.tags) ? p.tags : []))
  ).sort();

  const clearProjectForm = () => {
    setProjFormId('');
    setProjFormTitle('');
    setProjFormDescription('');
    setProjFormDetailDesc('');
    setProjFormTags([]);
    setProjFormTagInput('');
    setProjFormStatusText('');
    setProjFormStatusColor('zinc');
    setProjFormQvBtnEnabled(false);
    setProjFormQvBtnIcon('github');
    setProjFormQvBtnLabel('');
    setProjFormQvBtnLink('');
    setProjFormQvImgEnabled(false);
    setProjFormQvImgUrl('');
    setProjFormQvImgRedirect('');
    setProjFormRedirectLink('');
    setProjFormImages([]);
    setProjFormImgUrl('');
    setProjFormImgRedirect('');
    setProjFormImgAlt('');
    setProjFormVersions([]);
    setProjNewVersion('');
    setProjNewChanges('');
    setProjFormFeatured(false);
    setProjFormQvImgFile(null);
    setProjFormImgFile(null);
    setEditingProject(null);
  };

  const handleEditProjectClick = (proj: any) => {
    setEditingProject(proj);
    setProjFormId(proj.id);
    setProjFormTitle(proj.title || '');
    setProjFormDescription(proj.description || '');
    setProjFormDetailDesc(proj.detailDescription || '');
    setProjFormTags(Array.isArray(proj.tags) ? proj.tags : []);
    setProjFormTagInput('');
    setProjFormStatusText(proj.statusText || '');
    setProjFormStatusColor(proj.statusColor || 'zinc');
    const btn = proj.quickViewButton;
    setProjFormQvBtnEnabled(!!btn);
    setProjFormQvBtnIcon(btn?.icon || 'github');
    setProjFormQvBtnLabel(btn?.label || '');
    setProjFormQvBtnLink(btn?.link || '');
    const img = proj.quickViewImage;
    setProjFormQvImgEnabled(!!img);
    setProjFormQvImgUrl(img?.url || '');
    setProjFormQvImgRedirect(img?.redirectLink || '');
    setProjFormRedirectLink(proj.redirectLink || '');
    setProjFormImages(Array.isArray(proj.images) ? proj.images : []);
    setProjFormImgUrl('');
    setProjFormImgRedirect('');
    setProjFormImgAlt('');
    const vers = Array.isArray(proj.versions) ? proj.versions : [];
    setProjFormVersions(vers.map((v: any, i: number) => ({ ...v, order: v.order ?? i })));
    setProjNewVersion('');
    setProjNewChanges('');
    setProjFormFeatured(proj.featured === true);
    setProjFormQvImgFile(null);
    setProjFormImgFile(null);
    setApiError('');
    setApiSuccess('');
  };

  const addTagFromInput = () => {
    const tag = projFormTagInput.trim();
    if (tag && !projFormTags.includes(tag)) {
      setProjFormTags(prev => [...prev, tag]);
    }
    setProjFormTagInput('');
    setProjFormTagSuggestOpen(false);
  };

  const removeTag = (tag: string) => {
    setProjFormTags(prev => prev.filter(t => t !== tag));
  };

  const handleAddVersion = () => {
    const ver = projNewVersion.trim();
    const changes = projNewChanges.split('\n').map(s => s.trim()).filter(Boolean);
    if (!ver || changes.length === 0) {
      setApiError('Version number and at least one change are required.');
      return;
    }
    if (projFormVersions.some(v => v.version === ver)) {
      setApiError(`Version "${ver}" already exists.`);
      return;
    }
    setApiError('');
    const newOrder = projFormVersions.length > 0 ? Math.max(...projFormVersions.map(v => v.order ?? 0)) + 1 : 0;
    setProjFormVersions(prev => [...prev, { version: ver, changes, order: newOrder }]);
    setProjNewVersion('');
    setProjNewChanges('');
  };

  const handleRemoveVersion = (version: string) => {
    setProjFormVersions(prev => prev.filter(v => v.version !== version));
  };

  const handleMoveVersion = (idx: number, dir: 'up' | 'down') => {
    const sorted = [...projFormVersions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    const targetIdx = dir === 'up' ? idx - 1 : idx + 1;
    if (targetIdx < 0 || targetIdx >= sorted.length) return;
    const tempOrder = sorted[idx].order ?? 0;
    sorted[idx] = { ...sorted[idx], order: sorted[targetIdx].order ?? 0 };
    sorted[targetIdx] = { ...sorted[targetIdx], order: tempOrder };
    setProjFormVersions(sorted);
  };

  const handleAddImage = () => {
    if (!projFormImgFile) return;
    setProjFormImages(prev => [...prev, {
      file: projFormImgFile,
      redirectLink: projFormImgRedirect.trim() || undefined,
      alt: projFormImgAlt.trim() || undefined,
    }]);
    setProjFormImgFile(null);
    setProjFormImgRedirect('');
    setProjFormImgAlt('');
  };

  const handleRemoveImage = (idx: number) => {
    setProjFormImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    if (!projFormId || !projFormTitle || !projFormDescription) {
      setApiError('Slug, Title, and Description are required.');
      return;
    }
    setActionLoading(true);
    const method = editingProject ? 'PUT' : 'POST';
    try {
      let finalQvImgUrl = projFormQvImgUrl;
      if (projFormQvImgEnabled && projFormQvImgFile) {
        setApiSuccess('Uploading Quick View Image...');
        finalQvImgUrl = await uploadFileToStorage(projFormQvImgFile, 'images/projects');
      }

      const finalImages = [];
      for (const img of projFormImages) {
        if (img.file) {
          setApiSuccess(`Uploading project image: ${img.file.name}...`);
          const uploadedUrl = await uploadFileToStorage(img.file, 'images/projects');
          finalImages.push({
            url: uploadedUrl,
            redirectLink: img.redirectLink,
            alt: img.alt,
          });
        } else {
          finalImages.push({
            url: img.url,
            redirectLink: img.redirectLink,
            alt: img.alt,
          });
        }
      }

      const response = await fetch('/.netlify/functions/manage-projects', {
        method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({
          id: projFormId,
          title: projFormTitle,
          description: projFormDescription,
          detailDescription: projFormDetailDesc,
          tags: projFormTags,
          statusText: projFormStatusText,
          statusColor: projFormStatusColor,
          quickViewButton: projFormQvBtnEnabled && projFormQvBtnLabel && projFormQvBtnLink
            ? { icon: projFormQvBtnIcon, label: projFormQvBtnLabel, link: projFormQvBtnLink }
            : null,
          quickViewImage: projFormQvImgEnabled && finalQvImgUrl
            ? { url: finalQvImgUrl, redirectLink: projFormQvImgRedirect || undefined }
            : null,
          redirectLink: projFormRedirectLink || null,
          images: finalImages,
          versions: projFormVersions,
          featured: false,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error occurred.');
      setApiSuccess(editingProject ? 'Project updated!' : 'Project added!');
      clearProjectForm();
      refreshProjects();
    } catch (err: any) {
      setApiError(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm(`Delete project: ${id}?`)) return;
    setApiError('');
    setApiSuccess('');
    setActionLoading(true);
    try {
      const response = await fetch('/.netlify/functions/manage-projects', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ id }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Server error occurred.');
      setApiSuccess('Project deleted!');
      refreshProjects();
      if (editingProject?.id === id) clearProjectForm();
    } catch (err: any) {
      setApiError(err.message || 'Failed to delete project.');
    } finally {
      setActionLoading(false);
    }
  };

  // 3-dots Menu State
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const [apiError, setApiError] = useState('');
  const [apiSuccess, setApiSuccess] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const handleUpdateUserSubscription = async (targetUser: RegisteredUser, newTier: number) => {
    setApiError('');
    setApiSuccess('');
    setActionLoading(true);
    try {
      const { collection, doc, setDoc, deleteDoc, getDocs, query, where } = await import('firebase/firestore');
      
      // 1. Find any existing subscription for this user
      const subQ = query(
        collection(db, 'premium'),
        where('userId', '==', targetUser.userId)
      );
      const subSnap = await getDocs(subQ);

      // 2. If new tier is 0 (None), delete the subscription document(s) from database
      if (newTier === 0) {
        for (const docSnap of subSnap.docs) {
          await deleteDoc(doc(db, 'premium', docSnap.id));
        }
        // Update local state map
        setUserSubscriptions(prev => {
          const next = { ...prev };
          delete next[targetUser.userId];
          return next;
        });
      } else {
        const subId = targetUser.userId;
        const targetPricePaid = newTier === 1 ? 10 : newTier === 2 ? 25 : 50;

        // Clean up old random sub document if it existed under a different ID
        if (!subSnap.empty && subSnap.docs[0].id !== subId) {
          try {
            await deleteDoc(doc(db, 'premium', subSnap.docs[0].id));
          } catch (e) {
            console.error('Failed to delete legacy premium document:', e);
          }
        }

        await setDoc(doc(db, 'premium', subId), {
          id: subId,
          userId: targetUser.userId,
          tier: newTier,
          pricePaid: targetPricePaid,
          createdAt: !subSnap.empty ? (subSnap.docs[0].data().createdAt || new Date().toISOString()) : new Date().toISOString(),
          expiresAt: null
        }, { merge: true });

        // Create order document in orders collection
        const orderId = `order_admin_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await setDoc(doc(db, 'orders', orderId), {
          id: orderId,
          userId: targetUser.userId,
          subscriptionId: subId,
          tier: newTier,
          cost: 0,
          createdAt: new Date().toISOString(),
          grantedByAdmin: true,
          billingEmail: null,
          billingAddress: null
        });

        // Update local state map
        setUserSubscriptions(prev => ({
          ...prev,
          [targetUser.userId]: { subId, tier: newTier }
        }));
      }

      // 4. Sync supporter status
      if (newTier === 3) {
        await setDoc(doc(db, 'supporters', targetUser.userId), {
          userId: targetUser.userId,
          username: targetUser.username,
          avatar: targetUser.avatar,
        });
      } else {
        try {
          await deleteDoc(doc(db, 'supporters', targetUser.userId));
        } catch (e) {
          console.error('Failed to clean up supporter document:', e);
        }
      }

      setApiSuccess(`Successfully updated ${targetUser.username}'s premium tier to Tier ${newTier}`);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Failed to update user premium subscription.');
    } finally {
      setActionLoading(false);
    }
  };

  // Fetch registered users and active subscriptions directly from Firestore (client-side admin)
  useEffect(() => {
    const fetchUsersAndSubscriptions = async () => {
      if (activeTab === 'users' && isAdmin) {
        setUsersLoading(true);
        setApiError('');
        try {
          const { collection, getDocs, query, where } = await import('firebase/firestore');
          
          // Fetch users
          const usersCol = collection(db, 'users');
          const snapshot = await getDocs(query(usersCol));
          const list: RegisteredUser[] = [];
          snapshot.forEach(doc => {
            list.push({ id: doc.id, ...(doc.data() as any) });
          });
          setUsers(list);

          // Fetch active subscriptions
          const premiumCol = collection(db, 'premium');
          const premiumSnap = await getDocs(premiumCol);
          const subsMap: { [userId: string]: { subId: string; tier: number } } = {};
          premiumSnap.forEach(doc => {
            const data = doc.data();
            if (data.userId) {
              subsMap[data.userId] = {
                subId: doc.id,
                tier: data.tier || 0
              };
            }
          });
          setUserSubscriptions(subsMap);
        } catch (err: any) {
          console.error(err);
          setApiError(err.message || 'Failed to fetch users');
        } finally {
          setUsersLoading(false);
        }
      }
    };
    fetchUsersAndSubscriptions();
  }, [activeTab, isAdmin]);

  // Fetch stream commands directly from Firestore (client-side admin)
  useEffect(() => {
    const fetchCommands = async () => {
      if (activeTab === 'commands' && isAdmin) {
        setCommandsLoading(true);
        try {
          const { collection, getDocs } = await import('firebase/firestore');
          const cmdCol = collection(db, 'commands');
          const snapshot = await getDocs(cmdCol);
          const list: any[] = [];
          snapshot.forEach(doc => {
            list.push({ id: doc.id, ...doc.data() });
          });
          // Sort alphabetically by name (case-insensitive)
          list.sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase()));
          setCommandsList(list);
        } catch (err: any) {
          console.error(err);
          setApiError(err.message || 'Failed to fetch commands');
        } finally {
          setCommandsLoading(false);
        }
      }
    };
    fetchCommands();
  }, [activeTab, isAdmin]);

  const clearCommandForm = () => {
    setCmdName('');
    setCmdPermission('everyone');
    setCmdResponse('');
    setCmdAliases('');
    setCmdKind('general');
    setEditingCmd(null);
  };

  const handleCommandSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');
    if (!cmdName.trim() || !cmdResponse.trim()) {
      setApiError('Command name and response are required.');
      return;
    }
    
    // Ensure name starts with !
    let formattedName = cmdName.trim();
    if (!formattedName.startsWith('!')) {
      formattedName = '!' + formattedName;
    }

    setActionLoading(true);
    try {
      const { doc, setDoc } = await import('firebase/firestore');
      
      // Parse aliases (comma separated list)
      const parsedAliases = cmdAliases
        .split(',')
        .map(a => a.trim())
        .filter(a => a.length > 0)
        .map(a => a.startsWith('!') ? a : '!' + a);

      const cmdId = formattedName.toLowerCase();
      
      await setDoc(doc(db, 'commands', cmdId), {
        id: cmdId,
        name: formattedName,
        permission: cmdPermission,
        response: cmdResponse.trim(),
        aliases: parsedAliases,
        kind: cmdKind,
        createdAt: editingCmd?.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setApiSuccess(editingCmd ? 'Command updated!' : 'Command added!');
      clearCommandForm();
      
      // Refresh list
      const { collection, getDocs } = await import('firebase/firestore');
      const cmdCol = collection(db, 'commands');
      const snapshot = await getDocs(cmdCol);
      const list: any[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...doc.data() });
      });
      list.sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase()));
      setCommandsList(list);
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Failed to save command.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteCommand = async (id: string) => {
    if (!confirm('Are you sure you want to delete this command?')) return;
    setApiError('');
    setApiSuccess('');
    setActionLoading(true);
    try {
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'commands', id));
      setApiSuccess('Command deleted!');
      setCommandsList(prev => prev.filter(c => c.id !== id));
      if (editingCmd?.id === id) {
        clearCommandForm();
      }
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Failed to delete command.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleEditCommandClick = (cmd: any) => {
    setEditingCmd(cmd);
    setCmdName(cmd.name);
    setCmdPermission(cmd.permission || 'everyone');
    setCmdResponse(cmd.response);
    setCmdAliases(cmd.aliases ? cmd.aliases.join(', ') : '');
    setCmdKind(cmd.kind || 'general');
  };

  const clearForm = () => {
    setFormId('');
    setFormTitle('');
    setFormPrice('FREE');
    setFormImageUrl('');
    setFormCategory('free');
    setFormDesc('');
    setFormDownloadType('file');
    setFormFileUrl('');
    setFormCopyIcon('link');
    setFormCopyTitle('');
    setFormCopyDesc('');
    setFormCopyText('');
    setFormCopyBtnText('Copy URL');
    setFormActions([]);
    clearActionForm();
    setFormImageFile(null);
    setEditingDl(null);
  };

  const handleEditClick = (dl: Download) => {
    setEditingDl(dl);
    setFormId(dl.id);
    setFormTitle(dl.title);
    setFormPrice(dl.price === 'FREE' || dl.price === 'PREMIUM' ? dl.price : 'FREE');
    setFormImageUrl(dl.imageUrl);
    setFormCategory(dl.category);
    setFormDesc(dl.description || '');
    setFormDownloadType(dl.downloadType || 'file');
    setFormFileUrl(dl.fileUrl || '');
    setFormCopyIcon(dl.copyIcon || 'link');
    setFormCopyTitle(dl.copyTitle || '');
    setFormCopyDesc(dl.copyDesc || '');
    setFormCopyText(dl.copyText || '');
    setFormCopyBtnText(dl.copyBtnText || 'Copy URL');
    setFormActions(dl.actions || []);
    clearActionForm();
    setApiError('');
    setApiSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    if (!formId || !formTitle || !formPrice || (!formImageUrl && !formImageFile) || !formCategory) {
      setApiError('ID, Title, Price, Image File, and Category are required.');
      return;
    }

    setActionLoading(true);
    const method = editingDl ? 'PUT' : 'POST';

    try {
      let finalImageUrl = formImageUrl;
      if (formImageFile) {
        setApiSuccess('Uploading Cover Image...');
        finalImageUrl = await uploadFileToStorage(formImageFile, 'images/downloads');
      }

      const finalActions = [];
      for (const act of formActions) {
        if (act.type === 'file' && act.file) {
          setApiSuccess(`Uploading Action File: ${act.file.name}...`);
          const isPremiumCat = formCategory === 'premium' || formCategory === 'early-access';
          const folderPath = isPremiumCat ? 'downloads/premium' : 'downloads/free';
          const uploadedUrl = await uploadFileToStorage(act.file, folderPath, !isPremiumCat);
          finalActions.push({
            id: act.id,
            type: act.type,
            label: act.label,
            fileUrl: uploadedUrl,
          });
        } else {
          finalActions.push({
            id: act.id,
            type: act.type,
            label: act.label,
            fileUrl: act.fileUrl,
            copyIcon: act.copyIcon,
            copyTitle: act.copyTitle,
            copyDesc: act.copyDesc,
            copyText: act.copyText,
            copyBtnText: act.copyBtnText,
          });
        }
      }

      const response = await fetch('/.netlify/functions/manage-downloads', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: formId,
          title: formTitle,
          price: formPrice,
          imageUrl: finalImageUrl,
          category: formCategory,
          description: formDesc,
          featured: false,
          downloadType: formDownloadType,
          fileUrl: formFileUrl,
          copyIcon: formCopyIcon,
          copyTitle: formCopyTitle,
          copyDesc: formCopyDesc,
          copyText: formCopyText,
          copyBtnText: formCopyBtnText,
          actions: finalActions,
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred.');
      }

      setApiSuccess(editingDl ? 'Download updated successfully!' : 'Download added successfully!');
      clearForm();
      refreshDownloads();
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const deleteFileFromStorage = async (url: string) => {
    if (!url || !url.includes('firebasestorage.googleapis.com')) return;
    try {
      const { ref: storageRef, deleteObject } = await import('firebase/storage');
      // Extract path or reference using the URL
      const fileRef = storageRef(storage, url);
      await deleteObject(fileRef);
      console.log('Successfully deleted file:', url);
    } catch (err) {
      console.error('Failed to delete file from storage:', url, err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete download ID: ${id}?`)) return;

    setApiError('');
    setApiSuccess('');
    setActionLoading(true);

    try {
      // Find the download item to get its file URLs
      const itemToDelete = downloads.find(dl => dl.id === id);
      if (itemToDelete) {
        // Delete cover image
        if (itemToDelete.imageUrl) {
          await deleteFileFromStorage(itemToDelete.imageUrl);
        }
        // Delete legacy fileUrl
        if (itemToDelete.fileUrl) {
          await deleteFileFromStorage(itemToDelete.fileUrl);
        }
        // Delete action files
        if (itemToDelete.actions) {
          for (const act of itemToDelete.actions) {
            if (act.fileUrl) {
              await deleteFileFromStorage(act.fileUrl);
            }
          }
        }
      }

      const response = await fetch('/.netlify/functions/manage-downloads', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred.');
      }

      setApiSuccess('Download deleted successfully!');
      refreshDownloads();
      if (editingDl?.id === id) clearForm();
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Failed to delete download.');
    } finally {
      setActionLoading(false);
    }
  };



  // News Handlers
  const clearNewsForm = () => {
    setNewsFormId('');
    setNewsFormTitle('');
    setNewsFormContent('');
    setNewsFormType('RELEASE');
    setNewsFormDate(getTodayDateString());
    setNewsFormMediaUrl('');
    setNewsFormReadMoreUrl('');
    setNewsFormMediaFile(null);
    setEditingNews(null);
  };

  const handleEditNewsClick = (item: any) => {
    setEditingNews(item);
    setNewsFormId(item.id);
    setNewsFormTitle(item.title);
    setNewsFormContent(item.content);
    setNewsFormType(item.type || 'RELEASE');
    setNewsFormDate(item.date || getTodayDateString());
    setNewsFormMediaUrl(item.mediaUrl || '');
    setNewsFormReadMoreUrl(item.readMoreUrl || '');
    setApiError('');
    setApiSuccess('');
  };

  const handleNewsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    if (!newsFormId || !newsFormTitle || !newsFormContent || !newsFormType || !newsFormDate) {
      setApiError('ID, Title, Content, Type, and Date are required.');
      return;
    }

    setActionLoading(true);
    const method = editingNews ? 'PUT' : 'POST';

    try {
      let finalMediaUrl = newsFormMediaUrl;
      if (newsFormMediaFile) {
        setApiSuccess('Uploading Media Image...');
        finalMediaUrl = await uploadFileToStorage(newsFormMediaFile, 'images/news');
      }

      const response = await fetch('/.netlify/functions/manage-news', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: newsFormId,
          title: newsFormTitle,
          content: newsFormContent,
          type: newsFormType,
          date: newsFormDate,
          mediaUrl: finalMediaUrl || null,
          readMoreUrl: newsFormReadMoreUrl || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred.');
      }

      setApiSuccess(editingNews ? 'News updated successfully!' : 'News added successfully!');
      clearNewsForm();
      refreshNews();
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm(`Are you sure you want to delete news ID: ${id}?`)) return;

    setApiError('');
    setApiSuccess('');
    setActionLoading(true);

    try {
      const response = await fetch('/.netlify/functions/manage-news', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred.');
      }

      setApiSuccess('News deleted successfully!');
      refreshNews();
      if (editingNews?.id === id) clearNewsForm();
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Failed to delete news.');
    } finally {
      setActionLoading(false);
    }
  };



  // Close menus on outside click
  useEffect(() => {
    const handleOutsideClick = () => {
      setOpenMenuId(null);
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, []);

  if (authLoading) {
    return (
      <main className="min-h-screen text-white flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 text-purple-500 animate-spin" />
          <p className="text-zinc-400 text-sm">Verifying credentials...</p>
        </div>
      </main>
    );
  }

  if (!isAdmin) {
    return (
      <main className="min-h-screen text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-zinc-900/40 border border-red-500/20 p-8 rounded-2xl text-center space-y-4 backdrop-blur-md">
          <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center text-red-500 mx-auto">
            <Shield size={24} />
          </div>
          <h2 className="text-xl font-bold text-white">Access Denied</h2>
          <p className="text-zinc-400 text-sm">
            Only authorized administrator accounts can access the panel.
          </p>
          <div className="pt-2">
            <Link href="/" className="inline-block px-5 py-2 rounded-xl bg-white text-zinc-950 hover:bg-zinc-200 text-sm font-semibold transition-colors">
              Return Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen text-white selection:bg-purple-500/30 relative overflow-hidden bg-transparent">
      {/* Ambient background glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[600px] h-[600px] bg-indigo-600/5 rounded-full blur-[160px] pointer-events-none" />

      <Navbar />

      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8 relative z-10">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-8 border-b border-white/10">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-purple-500/10 to-indigo-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shadow-inner">
              <Shield size={24} className="animate-pulse" />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight bg-gradient-to-r from-white via-zinc-100 to-zinc-400 bg-clip-text text-transparent">Admin Dashboard</h1>
              <p className="text-xs text-purple-400/80 font-medium mt-0.5">System settings and collections database panel.</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-1.5 bg-zinc-900/60 p-1.5 rounded-2xl border border-white/10 backdrop-blur-xl shadow-lg">
            <button
              onClick={() => handleTabChange('downloads')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer duration-300 ${activeTab === 'downloads' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <DownloadIcon size={14} /> Downloads
            </button>
            <button
              onClick={() => handleTabChange('news')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer duration-300 ${activeTab === 'news' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Newspaper size={14} /> News
            </button>
            <button
              onClick={() => handleTabChange('projects')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer duration-300 ${activeTab === 'projects' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <FolderCode size={14} /> Projects
            </button>
            <button
              onClick={() => handleTabChange('users')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer duration-300 ${activeTab === 'users' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Users size={14} /> Registered Users
            </button>
            <button
              onClick={() => handleTabChange('commands')}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer duration-300 ${activeTab === 'commands' ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-500/10' : 'text-zinc-400 hover:text-white hover:bg-white/5'}`}
            >
              <Terminal size={14} /> Commands
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {apiError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-semibold backdrop-blur-md shadow-lg animate-fadeIn flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
            {apiError}
          </div>
        )}
        {apiSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-2xl text-emerald-400 text-sm font-semibold backdrop-blur-md shadow-lg animate-fadeIn flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
            {apiSuccess}
          </div>
        )}

        {/* TAB CONTENT: DOWNLOADS MANAGER */}
        {activeTab === 'downloads' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* 1. MANAGE / ADD FORM */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 h-fit backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-400">
                  {editingDl ? 'Edit Download' : 'Add New Download'}
                </h2>
                {editingDl && (
                  <button
                    onClick={clearForm}
                    className="text-[10px] text-zinc-500 hover:text-white bg-zinc-950/50 px-2.5 py-1 rounded-md"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1 space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Slug / ID</label>
                    <input
                      type="text"
                      disabled={!!editingDl}
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      placeholder="e.g. starter-pack"
                      className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Category</label>
                    <select
                      value={formCategory}
                      onChange={(e) => {
                        const cat = e.target.value as 'free' | 'premium' | 'early-access';
                        setFormCategory(cat);
                        if (cat === 'free') {
                          setFormPrice('FREE');
                        } else if (cat === 'premium') {
                          setFormPrice('PREMIUM');
                        }
                      }}
                      className="w-full bg-zinc-950/50 text-white text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                    >
                      <option value="free">Free Stuff</option>
                      <option value="premium">Premium</option>
                      <option value="early-access">Early Access</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Price Tier</label>
                    <select
                      disabled={formCategory !== 'early-access'}
                      value={formPrice}
                      onChange={(e) => setFormPrice(e.target.value)}
                      className="w-full bg-zinc-950/50 text-white text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all disabled:opacity-50"
                    >
                      <option value="FREE">FREE (Green Text)</option>
                      <option value="PREMIUM">PREMIUM (Yellow/Amber Text)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Title</label>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g. Streamer.bot Starter Pack"
                      className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Cover Image</label>
                  <div className="flex items-center gap-3">
                    {formImageFile || formImageUrl ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-zinc-950/50 group/preview shrink-0">
                        <img
                          src={formImageFile ? URL.createObjectURL(formImageFile) : formImageUrl}
                          alt="Cover Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setFormImageFile(null);
                            setFormImageUrl('');
                          }}
                          className="absolute inset-0 bg-black/65 opacity-0 group-hover/preview:opacity-100 transition-all duration-200 flex items-center justify-center text-red-450 hover:text-red-400 cursor-pointer"
                          title="Remove Cover Image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center h-[38px] px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white cursor-pointer relative transition-all w-full">
                        <span>Choose Cover Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setFormImageFile(file);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Description (Optional)</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Brief summary describing this asset."
                    rows={3}
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* List of Actions */}
                <div className="space-y-2 border-t border-white/5 pt-3">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase flex items-center gap-1">Download Actions / Buttons</label>
                  {formActions.length > 0 && (
                    <div className="space-y-1.5">
                      {formActions.map((act) => (
                        <div key={act.id} className="flex items-center justify-between p-2.5 rounded-lg bg-white/3 border border-white/8">
                          <div className="min-w-0 flex-1">
                            <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded capitalize ${act.type === 'file' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>{act.type}</span>
                            <span className="text-[10px] text-zinc-300 ml-2 truncate">
                              {act.type === 'file' ? (act.label || act.fileUrl) : (act.copyTitle || act.copyText)}
                            </span>
                          </div>
                          <div className="flex items-center gap-1.5 flex-shrink-0">
                            <button type="button" onClick={() => handleEditAction(act)}
                              className="px-2 py-1 text-[10px] rounded bg-zinc-950/40 border border-white/5 text-zinc-400 hover:text-white cursor-pointer">Edit</button>
                            <button type="button" onClick={() => handleRemoveAction(act.id)}
                              className="p-1 text-red-400 hover:text-red-300 cursor-pointer"><Trash2 size={11} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Add/Edit Action Box */}
                  <div className="p-3 rounded-xl bg-zinc-950/45 border border-white/5 space-y-3">
                    <p className="text-[9px] font-extrabold text-zinc-500 uppercase tracking-widest">
                      {actionFormId ? 'Edit Action Item' : 'Add Action Item'}
                    </p>

                    <div className="space-y-1">
                      <label className="text-[9px] font-bold text-zinc-500 uppercase">Action Type</label>
                      <select
                        value={actionType}
                        onChange={(e) => setActionType(e.target.value as 'file' | 'copy')}
                        className="w-full bg-zinc-950/50 text-white text-xs px-2 py-1.5 rounded-lg border border-white/5 focus:outline-none"
                      >
                        <option value="file">File Download Button</option>
                        <option value="copy">Copy Text Box (OBS Style)</option>
                      </select>
                    </div>

                    {actionType === 'file' ? (
                      <div className="space-y-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase">Button Label</label>
                          <input
                            type="text"
                            value={actionLabel}
                            onChange={(e) => setActionLabel(e.target.value)}
                            placeholder="e.g. Download Codex Installer"
                            className="w-full bg-zinc-950/50 text-white text-xs px-2 py-1.5 rounded-lg border border-white/5 focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase">File Upload</label>
                          <div className="flex gap-2 items-center">
                            <div className="flex-grow bg-zinc-950/50 text-zinc-400 text-xs px-2 py-1.5 rounded-lg border border-white/5 truncate">
                              {actionFileFile ? `Selected: ${actionFileFile.name}` : (actionFileUrl ? `Current: ${actionFileUrl.split('/').pop()}` : 'No file chosen')}
                            </div>
                            <label className="flex-shrink-0 flex items-center justify-center h-[30px] px-2.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[10px] font-bold text-zinc-300 hover:text-white cursor-pointer relative transition-all">
                              <span>Choose File</span>
                              <input
                                type="file"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setActionFileFile(file);
                                  e.target.value = '';
                                }}
                                className="hidden"
                              />
                            </label>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase">Copy Icon</label>
                            <select
                              value={actionCopyIcon}
                              onChange={(e) => setActionCopyIcon(e.target.value)}
                              className="w-full bg-zinc-950/50 text-white text-xs px-2 py-1.5 rounded-lg border border-white/5 focus:outline-none"
                            >
                              <option value="link">Link Icon 🔗</option>
                              <option value="copy">Copy Icon 📋</option>
                              <option value="code">Code Icon 💻</option>
                              <option value="terminal">Terminal Icon 🐚</option>
                              <option value="external-link">External Link ↗</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="text-[9px] font-bold text-zinc-500 uppercase">Button Text</label>
                            <input
                              type="text"
                              value={actionCopyBtnText}
                              onChange={(e) => setActionCopyBtnText(e.target.value)}
                              placeholder="e.g. Copy URL"
                              className="w-full bg-zinc-950/50 text-white text-xs px-2 py-1.5 rounded-lg border border-white/5 focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase">Title</label>
                          <input
                            type="text"
                            value={actionCopyTitle}
                            onChange={(e) => setActionCopyTitle(e.target.value)}
                            placeholder="e.g. Browser Source URL"
                            className="w-full bg-zinc-950/50 text-white text-xs px-2 py-1.5 rounded-lg border border-white/5 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase">Description</label>
                          <input
                            type="text"
                            value={actionCopyDesc}
                            onChange={(e) => setActionCopyDesc(e.target.value)}
                            placeholder="e.g. Add this as a browser source to OBS."
                            className="w-full bg-zinc-950/50 text-white text-xs px-2 py-1.5 rounded-lg border border-white/5 focus:outline-none"
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-500 uppercase">Text to Copy</label>
                          <textarea
                            value={actionCopyText}
                            onChange={(e) => setActionCopyText(e.target.value)}
                            placeholder="Link or code snippet"
                            rows={2}
                            className="w-full bg-zinc-950/50 text-white text-xs px-2 py-1.5 rounded-lg border border-white/5 focus:outline-none resize-none font-mono"
                          />
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-1">
                      {actionFormId && (
                        <button
                          type="button"
                          onClick={clearActionForm}
                          className="flex-1 py-1.5 rounded-lg text-[10px] font-bold bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleSaveAction}
                        className="flex-grow py-1.5 rounded-lg text-[10px] font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all cursor-pointer"
                      >
                        {actionFormId ? 'Save Action' : 'Add Action Item'}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingDl ? (
                    'Save Changes'
                  ) : (
                    <>
                      <Plus size={14} /> Add Download
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 2. DOWNLOADS GRID/LIST */}
            <div className="lg:col-span-2 bg-zinc-900/30 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-400">
                  Database Collections ({downloads.length})
                </h2>
              </div>

              {downloadsLoading ? (
                <div className="py-12 flex flex-col items-center gap-2 text-zinc-500 text-xs">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  <span>Loading database...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {downloads.map((dl) => {
                    return (
                      <div
                        key={dl.id}
                        className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-zinc-950/20 hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[10px] font-mono text-zinc-500 font-bold bg-zinc-950/50 px-2 py-1 rounded-md">ID {dl.id}</span>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white truncate">{dl.title}</h4>
                              <span className={`text-[8px] font-extrabold px-1 rounded text-purple-400 bg-purple-500/10 uppercase`}>
                                {dl.category}
                              </span>
                              <span className={`text-[8px] font-extrabold px-1 rounded ${dl.price === 'FREE' ? 'text-emerald-400 bg-emerald-500/10' : 'text-amber-400 bg-amber-500/10'}`}>
                                {dl.price}
                              </span>
                            </div>
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5 max-w-[280px]">
                              {dl.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          <button
                            onClick={() => handleEditClick(dl)}
                            className="p-2 rounded-lg bg-zinc-950/40 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer"
                            title="Edit Details"
                          >
                            <Edit2 size={13} />
                          </button>
                          <button
                            onClick={() => handleDelete(dl.id)}
                            className="p-2 rounded-lg bg-zinc-950/40 border border-white/5 text-red-400 hover:text-red-300 hover:bg-zinc-900 transition-all cursor-pointer"
                            title="Delete Download"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    );
                  })}

                  {downloads.length === 0 && (
                    <div className="py-12 text-center text-zinc-500 text-xs">
                      No downloads registered in database.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: NEWS MANAGER */}
        {activeTab === 'news' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* 1. MANAGE / ADD FORM */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 h-fit backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-400">
                  {editingNews ? 'Edit News Article' : 'Add News Article'}
                </h2>
                {editingNews && (
                  <button
                    onClick={clearNewsForm}
                    className="text-[10px] text-zinc-500 hover:text-white bg-zinc-950/50 px-2.5 py-1 rounded-md"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleNewsSubmit} className="space-y-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-1 space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Slug/ID</label>
                    <input
                      type="text"
                      disabled={!!editingNews}
                      value={newsFormId}
                      onChange={(e) => setNewsFormId(e.target.value)}
                      placeholder="news_X"
                      className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Category</label>
                    <select
                      value={newsFormType}
                      onChange={(e) => setNewsFormType(e.target.value as any)}
                      className="w-full bg-zinc-950/50 text-white text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                    >
                      <option value="RELEASE">RELEASE</option>
                      <option value="NEW VIDEO">NEW VIDEO</option>
                      <option value="ANNOUNCEMENT">ANNOUNCEMENT</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Date</label>
                  <input
                    type="date"
                    value={newsFormDate}
                    onChange={(e) => setNewsFormDate(e.target.value)}
                    className="w-full bg-zinc-950/50 text-white text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Title</label>
                  <input
                    type="text"
                    value={newsFormTitle}
                    onChange={(e) => setNewsFormTitle(e.target.value)}
                    placeholder="e.g. CHAT LOOKUP"
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Content Description</label>
                  <textarea
                    value={newsFormContent}
                    onChange={(e) => setNewsFormContent(e.target.value)}
                    placeholder="Describe the release, announcement, or video..."
                    rows={4}
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Media Image (Optional)</label>
                  <div className="flex items-center gap-3">
                    {newsFormMediaFile || newsFormMediaUrl ? (
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden border border-white/10 bg-zinc-950/50 group/preview shrink-0">
                        <img
                          src={newsFormMediaFile ? URL.createObjectURL(newsFormMediaFile) : newsFormMediaUrl}
                          alt="Media Preview"
                          className="w-full h-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setNewsFormMediaFile(null);
                            setNewsFormMediaUrl('');
                          }}
                          className="absolute inset-0 bg-black/65 opacity-0 group-hover/preview:opacity-100 transition-all duration-200 flex items-center justify-center text-red-450 hover:text-red-400 cursor-pointer"
                          title="Remove Media Image"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ) : (
                      <label className="flex items-center justify-center h-[38px] px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white cursor-pointer relative transition-all w-full">
                        <span>Choose Media Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) setNewsFormMediaFile(file);
                            e.target.value = '';
                          }}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Read More URL (Optional)</label>
                  <input
                    type="text"
                    value={newsFormReadMoreUrl}
                    onChange={(e) => setNewsFormReadMoreUrl(e.target.value)}
                    placeholder="External link or Discord invite"
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingNews ? (
                    'Save Changes'
                  ) : (
                    <>
                      <Plus size={14} /> Add News Article
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 2. NEWS GRID/LIST */}
            <div className="lg:col-span-2 bg-zinc-900/30 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
              <div className="pb-3 border-b border-white/5 mb-4">
                <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-400">
                  News Collection ({news.length})
                </h2>
              </div>

              {newsLoading ? (
                <div className="py-12 flex flex-col items-center gap-2 text-zinc-500 text-xs">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  <span>Loading database...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[550px] overflow-y-auto pr-1">
                  {news.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-zinc-950/20 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[10px] font-mono text-zinc-500 font-bold bg-zinc-950/50 px-2 py-1 rounded-md">ID {item.id}</span>
                        <div className="truncate">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${item.type === 'RELEASE' ? 'bg-amber-500/10 text-amber-500' :
                                item.type === 'NEW VIDEO' ? 'bg-rose-500/10 text-rose-500' :
                                  'bg-purple-500/10 text-purple-500'
                              }`}>
                              {item.type}
                            </span>
                            <span className="text-[10px] text-zinc-500 ml-1">{item.date}</span>
                          </div>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5 max-w-[280px]">
                            {item.content}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditNewsClick(item);
                          }}
                          className="p-2 rounded-lg bg-zinc-950/40 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNews(item.id);
                          }}
                          className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400 hover:text-white hover:bg-red-500 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {news.length === 0 && (
                    <div className="py-12 text-center text-zinc-500 text-xs">
                      No news articles registered in database.
                    </div>
                  )}
                </div>
              )}
            </div>

          </div>
        )}



        {/* TAB CONTENT: PROJECTS MANAGER */}
        {activeTab === 'projects' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* LEFT: Form */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 h-fit backdrop-blur-md space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-400">
                  {editingProject ? 'Edit Project' : 'Add New Project'}
                </h2>
                {editingProject && (
                  <button onClick={clearProjectForm} className="text-[10px] text-zinc-500 hover:text-white bg-zinc-950/50 px-2.5 py-1 rounded-md">Cancel</button>
                )}
              </div>

              <form onSubmit={handleProjectSubmit} className="space-y-4">

                {/* ── SLUG + TITLE ── */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Title</label>
                  <input type="text" value={projFormTitle}
                    onChange={(e) => { setProjFormTitle(e.target.value); if (!editingProject) setProjFormId(slugify(e.target.value)); }}
                    placeholder="My Awesome Project"
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Slug / ID <span className="text-zinc-600 normal-case font-normal">(auto)</span></label>
                  <input type="text" disabled={!!editingProject} value={projFormId}
                    onChange={(e) => setProjFormId(e.target.value)}
                    placeholder="my-awesome-project"
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all disabled:opacity-40"
                  />
                </div>

                {/* ── QUICK VIEW DESCRIPTION ── */}
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Short Description <span className="text-zinc-600 normal-case font-normal">(shown on card)</span></label>
                  <textarea value={projFormDescription} onChange={(e) => setProjFormDescription(e.target.value)}
                    placeholder="One-liner shown on the project card."
                    rows={2}
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all resize-none"
                  />
                </div>

                {/* ── TAGS ── */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Tags</label>
                  {/* existing tag pills */}
                  {projFormTags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {projFormTags.map(t => (
                        <span key={t} className="flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white/6 border border-white/10 text-zinc-300">
                          {t}
                          <button type="button" onClick={() => removeTag(t)} className="text-zinc-500 hover:text-red-400 cursor-pointer"><X size={10} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                  {/* input + autocomplete */}
                  <div className="relative">
                    <input
                      type="text"
                      value={projFormTagInput}
                      onFocus={() => setProjFormTagSuggestOpen(true)}
                      onBlur={() => setTimeout(() => setProjFormTagSuggestOpen(false), 150)}
                      onChange={(e) => { setProjFormTagInput(e.target.value); setProjFormTagSuggestOpen(true); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTagFromInput(); } }}
                      placeholder="Type a tag + Enter"
                      className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                    />
                    {projFormTagSuggestOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-20 py-1 max-h-32 overflow-y-auto">
                        {allExistingTags
                          .filter(t => !projFormTags.includes(t) && t.toLowerCase().includes(projFormTagInput.toLowerCase()))
                          .map(t => (
                            <button key={t} type="button"
                              onMouseDown={() => { setProjFormTags(prev => [...prev, t]); setProjFormTagInput(''); }}
                              className="w-full text-left px-3 py-1.5 text-xs text-zinc-300 hover:bg-white/5 transition-colors cursor-pointer">
                              {t}
                            </button>
                          ))}
                        {projFormTagInput.trim() && !allExistingTags.includes(projFormTagInput.trim()) && (
                          <button type="button"
                            onMouseDown={addTagFromInput}
                            className="w-full text-left px-3 py-1.5 text-xs text-emerald-400 hover:bg-white/5 transition-colors cursor-pointer">
                            + Create &quot;{projFormTagInput.trim()}&quot;
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* ── STATUS TEXT + COLOR ── */}
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Status Label + Color</label>
                  <div className="flex gap-2">
                    <input type="text" value={projFormStatusText} onChange={(e) => setProjFormStatusText(e.target.value)}
                      placeholder="e.g. Live, WIP, v2.3"
                      className="flex-1 bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                    />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {STATUS_COLORS.map(c => (
                      <button key={c} type="button" onClick={() => setProjFormStatusColor(c)}
                        className={`text-[9px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer capitalize ${projFormStatusColor === c
                            ? 'border-white/30 bg-white/15 text-white'
                            : 'border-white/8 bg-white/3 text-zinc-500 hover:text-zinc-300'
                          }`}>
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                {/* ── QUICK VIEW BUTTON (OPTIONAL) ── */}
                <div className="space-y-2 p-3 rounded-xl bg-zinc-950/30 border border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Optional Button (bottom-right of card)</label>
                    <input type="checkbox" checked={projFormQvBtnEnabled} onChange={(e) => setProjFormQvBtnEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-white/5 bg-zinc-950 text-purple-600 focus:ring-0 cursor-pointer" />
                  </div>
                  {projFormQvBtnEnabled && (
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-600 uppercase">Icon</label>
                          <select value={projFormQvBtnIcon} onChange={(e) => setProjFormQvBtnIcon(e.target.value)}
                            className="w-full bg-zinc-950/50 text-white text-xs px-2 py-2 rounded-lg border border-white/5 focus:outline-none">
                            {ICON_OPTIONS.map(i => <option key={i} value={i}>{i}</option>)}
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[9px] font-bold text-zinc-600 uppercase">Label</label>
                          <input type="text" value={projFormQvBtnLabel} onChange={(e) => setProjFormQvBtnLabel(e.target.value)}
                            placeholder="GitHub"
                            className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-2 py-2 rounded-lg border border-white/5 focus:outline-none" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-600 uppercase">Link URL</label>
                        <input type="text" value={projFormQvBtnLink} onChange={(e) => setProjFormQvBtnLink(e.target.value)}
                          placeholder="https://github.com/..."
                          className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-2 py-2 rounded-lg border border-white/5 focus:outline-none" />
                      </div>
                    </div>
                  )}
                </div>

                {/* ── QUICK VIEW IMAGE (OPTIONAL) ── */}
                <div className="space-y-2 p-3 rounded-xl bg-zinc-950/30 border border-white/5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Optional Image (bottom of card)</label>
                    <input type="checkbox" checked={projFormQvImgEnabled} onChange={(e) => setProjFormQvImgEnabled(e.target.checked)}
                      className="h-4 w-4 rounded border-white/5 bg-zinc-950 text-purple-600 focus:ring-0 cursor-pointer" />
                  </div>
                  {projFormQvImgEnabled && (
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-600 uppercase">Cover Image</label>
                        <div className="flex items-center gap-3">
                          {projFormQvImgFile || projFormQvImgUrl ? (
                            <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-zinc-950/50 group/preview shrink-0">
                              <img
                                src={projFormQvImgFile ? URL.createObjectURL(projFormQvImgFile) : projFormQvImgUrl}
                                alt="Project Cover Preview"
                                className="w-full h-full object-cover"
                              />
                              <button
                                type="button"
                                onClick={() => {
                                  setProjFormQvImgFile(null);
                                  setProjFormQvImgUrl('');
                                }}
                                className="absolute inset-0 bg-black/65 opacity-0 group-hover/preview:opacity-100 transition-all duration-200 flex items-center justify-center text-red-450 hover:text-red-400 cursor-pointer"
                                title="Remove Cover Image"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          ) : (
                            <label className="flex items-center justify-center h-[34px] px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white cursor-pointer relative transition-all w-full">
                              <span>Choose Cover Image</span>
                              <input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) setProjFormQvImgFile(file);
                                  e.target.value = '';
                                }}
                                className="hidden"
                              />
                            </label>
                          )}
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-zinc-600 uppercase">Redirect Link (optional, on click)</label>
                        <input type="text" value={projFormQvImgRedirect} onChange={(e) => setProjFormQvImgRedirect(e.target.value)}
                          placeholder="https://..."
                          className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-2 py-2 rounded-lg border border-white/5 focus:outline-none" />
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-white/5 pt-4 space-y-4">
                  <p className="text-[10px] font-extrabold text-zinc-500 uppercase tracking-widest">Project View (Detail Page)</p>

                  {/* ── DETAIL DESCRIPTION (MARKDOWN) ── */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Description <span className="text-zinc-600 normal-case font-normal">(markdown)</span></label>
                    <textarea value={projFormDetailDesc} onChange={(e) => setProjFormDetailDesc(e.target.value)}
                      placeholder="## About\nDetailed markdown description shown on the project detail page."
                      rows={5}
                      className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all resize-none font-mono"
                    />
                  </div>

                  {/* ── REDIRECT LINK ── */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Redirect Link <span className="text-zinc-600 normal-case font-normal">(top-left on detail page)</span></label>
                    <input type="text" value={projFormRedirectLink} onChange={(e) => setProjFormRedirectLink(e.target.value)}
                      placeholder="https://github.com/..."
                      className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                    />
                  </div>

                  {/* ── IMAGE LIST ── */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Image List</label>
                    {projFormImages.length > 0 && (
                      <div className="space-y-1.5">
                        {projFormImages.map((img, i) => (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/3 border border-white/8 gap-2 font-mono">
                            <span className="text-[10px] text-zinc-400 truncate flex-1">
                              {img.file ? `Selected: ${img.file.name}` : (img.url ? img.url.split('/').pop() : 'Unknown Image')}
                            </span>
                            <button type="button" onClick={() => handleRemoveImage(i)}
                              className="text-red-400 hover:text-red-300 cursor-pointer flex-shrink-0"><Trash2 size={11} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-zinc-950/40 border border-white/5 space-y-2">
                      <div className="flex items-center gap-3">
                        {projFormImgFile ? (
                          <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-white/10 bg-zinc-950/50 group/preview shrink-0">
                            <img
                              src={URL.createObjectURL(projFormImgFile)}
                              alt="Project Image Preview"
                              className="w-full h-full object-cover"
                            />
                            <button
                              type="button"
                              onClick={() => {
                                setProjFormImgFile(null);
                              }}
                              className="absolute inset-0 bg-black/65 opacity-0 group-hover/preview:opacity-100 transition-all duration-200 flex items-center justify-center text-red-450 hover:text-red-400 cursor-pointer"
                              title="Remove Image"
                            >
                              <Trash2 size={14} />
                            </button>
                          </div>
                        ) : (
                          <label className="flex items-center justify-center h-[34px] px-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-xs font-bold text-zinc-300 hover:text-white cursor-pointer relative transition-all w-full">
                            <span>Choose Image</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) setProjFormImgFile(file);
                                e.target.value = '';
                              }}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <input type="text" value={projFormImgRedirect} onChange={(e) => setProjFormImgRedirect(e.target.value)}
                          placeholder="Click redirect (optional)"
                          className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-2 py-2 rounded-lg border border-white/5 focus:outline-none" />
                        <input type="text" value={projFormImgAlt} onChange={(e) => setProjFormImgAlt(e.target.value)}
                          placeholder="Alt text (optional)"
                          className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-2 py-2 rounded-lg border border-white/5 focus:outline-none" />
                      </div>
                      <button type="button" onClick={handleAddImage}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/5 border border-white/8 hover:bg-white/10 text-zinc-300 transition-all cursor-pointer">
                        <Plus size={11} /> Add Image
                      </button>
                    </div>
                  </div>

                  {/* ── VERSION HISTORY ── */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase flex items-center gap-1"><GitBranch size={10} /> Version History</label>
                    {projFormVersions.length > 0 && (
                      <div className="space-y-1.5">
                        {[...projFormVersions].sort((a, b) => (a.order ?? 0) - (b.order ?? 0)).map((v, idx, arr) => (
                          <div key={v.version} className="flex items-center justify-between p-2.5 rounded-lg bg-white/3 border border-white/8">
                            <div className="min-w-0 flex-1">
                              <span className="text-xs font-mono font-bold text-emerald-400">{v.version}</span>
                              <span className="text-[10px] text-zinc-500 ml-2">{v.changes.length} change{v.changes.length !== 1 ? 's' : ''}</span>
                            </div>
                            <div className="flex items-center gap-1 flex-shrink-0">
                              <button type="button" disabled={idx === 0}
                                onClick={() => handleMoveVersion(idx, 'up')}
                                className="px-1.5 py-1 text-[10px] rounded bg-zinc-950/40 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer">▲</button>
                              <button type="button" disabled={idx === arr.length - 1}
                                onClick={() => handleMoveVersion(idx, 'down')}
                                className="px-1.5 py-1 text-[10px] rounded bg-zinc-950/40 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer">▼</button>
                              <button type="button" onClick={() => handleRemoveVersion(v.version)}
                                className="p-1 text-red-400 hover:text-red-300 cursor-pointer"><Trash2 size={11} /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-zinc-950/40 border border-white/5 space-y-2">
                      <input type="text" value={projNewVersion} onChange={(e) => setProjNewVersion(e.target.value)}
                        placeholder="e.g. v1.0.0"
                        className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-2 py-2 rounded-lg border border-white/5 focus:outline-none" />
                      <textarea value={projNewChanges} onChange={(e) => setProjNewChanges(e.target.value)}
                        placeholder={"One change per line\nAdded dark mode\nFixed crash on startup"}
                        rows={3}
                        className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-2 py-2 rounded-lg border border-white/5 focus:outline-none resize-none" />
                      <button type="button" onClick={handleAddVersion}
                        className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[10px] font-bold bg-white/5 border border-white/8 hover:bg-white/10 text-zinc-300 transition-all cursor-pointer">
                        <Plus size={11} /> Add Version
                      </button>
                    </div>
                  </div>
                </div>



                <button type="submit" disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50 cursor-pointer">
                  {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingProject ? 'Save Changes' : <><Plus size={14} /> Add Project</>}
                </button>
              </form>
            </div>

            {/* RIGHT: Projects List */}
            <div className="lg:col-span-2 bg-zinc-900/30 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-400">Projects ({projects.length})</h2>
                <Link href="/projects" target="_blank"
                  className="text-[10px] text-zinc-400 hover:text-white bg-zinc-950/50 px-3 py-1 rounded-md border border-white/5 transition-colors">View Live ↗</Link>
              </div>
              {projectsLoading ? (
                <div className="py-12 flex flex-col items-center gap-2 text-zinc-500 text-xs">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  <span>Loading...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
                  {projects.map((proj) => (
                    <div key={proj.id}
                      className="flex items-start justify-between p-3.5 rounded-xl border border-white/5 bg-zinc-950/20 hover:border-white/10 transition-all gap-3">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-bold text-white">{proj.title}</h4>
                            {proj.statusText && (
                              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-white/8 text-zinc-300">{proj.statusText}</span>
                            )}

                          </div>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5 max-w-[320px]">{proj.description}</p>
                          {proj.tags && proj.tags.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              {proj.tags.slice(0, 4).map((tag: string) => (
                                <span key={tag} className="text-[8px] px-1.5 py-0.5 rounded-full bg-white/4 border border-white/8 text-zinc-500">{tag}</span>
                              ))}
                              {proj.tags.length > 4 && <span className="text-[8px] text-zinc-600">+{proj.tags.length - 4}</span>}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <Link href={`/projects/${proj.id}`} target="_blank"
                          className="p-2 rounded-lg bg-zinc-950/40 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all" title="View">
                          <FolderCode size={12} /></Link>
                        <button onClick={(e) => { e.stopPropagation(); handleEditProjectClick(proj); }}
                          className="p-2 rounded-lg bg-zinc-950/40 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer" title="Edit">
                          <Edit2 size={12} /></button>
                        <button onClick={(e) => { e.stopPropagation(); handleDeleteProject(proj.id); }}
                          className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400 hover:text-white hover:bg-red-500 transition-all cursor-pointer" title="Delete">
                          <Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                  {projects.length === 0 && (
                    <div className="py-12 text-center text-zinc-500 text-xs">
                      No projects registered in database.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: COMMANDS MANAGEMENT */}
        {activeTab === 'commands' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* LEFT: Add/Edit Command Form */}
            <div className="lg:col-span-1 bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white uppercase flex items-center gap-2">
                  {editingCmd ? 'Edit Chat Command' : 'Add Chat Command'}
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Define trigger commands and responses for Twitch chat.</p>
              </div>

              <form onSubmit={handleCommandSubmit} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Command Name</label>
                  <input
                    type="text"
                    value={cmdName}
                    onChange={(e) => setCmdName(e.target.value)}
                    placeholder="e.g. !discord"
                    className="w-full bg-zinc-950/40 text-white placeholder-zinc-700 text-sm px-4 py-2.5 rounded-xl border border-white/5 focus:border-purple-500/40 focus:outline-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Permission Level</label>
                  <select
                    value={cmdPermission}
                    onChange={(e) => setCmdPermission(e.target.value as any)}
                    className="w-full bg-zinc-950/40 text-white text-sm px-4 py-2.5 rounded-xl border border-white/5 focus:border-purple-500/40 focus:outline-none cursor-pointer"
                  >
                    <option value="everyone" className="bg-zinc-950">Everyone</option>
                    <option value="moderator" className="bg-zinc-950">Moderator</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Command Type (Kind)</label>
                  <select
                    value={cmdKind}
                    onChange={(e) => setCmdKind(e.target.value as any)}
                    className="w-full bg-zinc-950/40 text-white text-sm px-4 py-2.5 rounded-xl border border-white/5 focus:border-purple-500/40 focus:outline-none cursor-pointer"
                  >
                    <option value="general" className="bg-zinc-950">General</option>
                    <option value="socials" className="bg-zinc-950">Socials</option>
                    <option value="games" className="bg-zinc-950">Games</option>
                    <option value="fun" className="bg-zinc-950">Fun</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Response Message</label>
                  <textarea
                    value={cmdResponse}
                    onChange={(e) => setCmdResponse(e.target.value)}
                    placeholder="Message bot will send back to chat..."
                    rows={4}
                    className="w-full bg-zinc-950/40 text-white placeholder-zinc-700 text-sm px-4 py-2.5 rounded-xl border border-white/5 focus:border-purple-500/40 focus:outline-none resize-none"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block">Aliases (comma separated)</label>
                  <input
                    type="text"
                    value={cmdAliases}
                    onChange={(e) => setCmdAliases(e.target.value)}
                    placeholder="e.g. !dc, !chat"
                    className="w-full bg-zinc-950/40 text-white placeholder-zinc-700 text-sm px-4 py-2.5 rounded-xl border border-white/5 focus:border-purple-500/40 focus:outline-none"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  {editingCmd && (
                    <button
                      type="button"
                      onClick={clearCommandForm}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-zinc-800 hover:bg-zinc-700 text-white transition-all cursor-pointer text-center"
                    >
                      Cancel
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50 cursor-pointer"
                  >
                    {actionLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : editingCmd ? 'Save Changes' : <><Plus size={14} /> Add Command</>}
                  </button>
                </div>
              </form>
            </div>

            {/* RIGHT: Commands List */}
            <div className="lg:col-span-2 bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <div>
                  <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-400">Commands Directory ({commandsList.length})</h2>
                  <p className="text-xs text-zinc-500 mt-0.5">Alphabetically ordered stream command list.</p>
                </div>
                <Link href="/stream/commands" target="_blank"
                  className="text-[10px] text-zinc-400 hover:text-white bg-zinc-950/50 px-3 py-1.5 rounded-lg border border-white/5 transition-colors">View Live ↗</Link>
              </div>

              {commandsLoading ? (
                <div className="py-20 flex flex-col items-center gap-2 text-zinc-500 text-xs">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  <span>Loading directory database...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[700px] overflow-y-auto pr-1">
                  {commandsList.map((cmd) => (
                    <div key={cmd.id}
                      className="flex items-start justify-between p-3.5 rounded-xl border border-white/5 bg-zinc-950/20 hover:border-white/10 transition-all gap-3 group">
                      <div className="flex items-start gap-3 min-w-0 flex-1">
                        <div className="min-w-0 space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="text-xs font-mono font-black text-cyan-400">{cmd.name}</h4>
                            {cmd.aliases && cmd.aliases.length > 0 && (
                              <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 border border-white/5">
                                +{cmd.aliases.length} ({cmd.aliases.join(', ')})
                              </span>
                            )}
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider ${
                              cmd.permission === 'moderator' 
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                : 'bg-zinc-800/60 text-zinc-400 border border-white/5'
                            }`}>
                              {cmd.permission}
                            </span>
                            <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20">
                              {cmd.kind || 'general'}
                            </span>
                          </div>
                          <p className="text-[11px] text-zinc-400 leading-relaxed font-mono truncate max-w-[400px]">{cmd.response}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <button onClick={() => handleEditCommandClick(cmd)}
                          className="p-2 rounded-lg bg-zinc-950/40 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer" title="Edit Command">
                          <Edit2 size={12} /></button>
                        <button onClick={() => handleDeleteCommand(cmd.id)}
                          className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400 hover:text-white hover:bg-red-500 transition-all cursor-pointer" title="Delete Command">
                          <Trash2 size={12} /></button>
                      </div>
                    </div>
                  ))}
                  {commandsList.length === 0 && (
                    <div className="py-20 text-center text-zinc-500 text-xs font-semibold">
                      No chat commands stored in Firestore.
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB CONTENT: USERS LIST */}
        {activeTab === 'users' && (
          <div className="bg-zinc-900/40 border border-white/10 rounded-3xl p-6 backdrop-blur-xl shadow-2xl hover:border-purple-500/10 transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-white/10 mb-6 gap-3">
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Registered Streamers & Viewers
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">Manage user profiles and active subscriptions.</p>
              </div>
              <span className="text-[10px] text-purple-400 font-extrabold uppercase tracking-widest bg-purple-500/10 border border-purple-500/20 px-3 py-1 rounded-full self-start sm:self-center">
                {users.length} Users
              </span>
            </div>

            {usersLoading ? (
              <div className="py-20 flex flex-col items-center gap-3 text-zinc-500 text-sm">
                <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
                <span>Fetching directory database...</span>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-2xl border border-white/5 bg-zinc-950/20">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/10 bg-white/[0.02] text-zinc-400 font-bold uppercase tracking-wider text-[10px]">
                      <th className="py-4 px-5">User</th>
                      <th className="py-4 px-5">Email</th>
                      <th className="py-4 px-5">Login Methods</th>
                      <th className="py-4 px-5">Roles</th>
                      <th className="py-4 px-5">Premium Status</th>
                      <th className="py-4 px-5">Firebase UID</th>
                      <th className="py-4 px-5 text-right">Last Login</th>
                      <th className="py-4 px-5 text-right">Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => {
                      const activeTier = userSubscriptions[u.userId]?.tier || 0;
                      
                      // Identify linked login methods
                      const methods = [];
                      if (u.googleUsername) methods.push('google');
                      if (u.twitchUsername) methods.push('twitch');
                      if (u.discordUsername) methods.push('discord');
                      if (methods.length === 0 && u.infoSource && u.infoSource !== 'email') {
                        methods.push(u.infoSource);
                      }

                      return (
                        <tr key={u.id} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors group">
                          <td className="py-4 px-5 flex items-center gap-3">
                            <img src={u.avatar} alt={u.username} className="h-9 w-9 rounded-xl border border-white/10 bg-zinc-950 group-hover:scale-105 transition-transform" />
                            <span className="font-extrabold text-white text-sm">{u.username}</span>
                          </td>
                          <td className="py-4 px-5 text-zinc-300 font-medium">{u.email || <span className="text-zinc-600 font-italic">N/A</span>}</td>
                          <td className="py-4 px-5">
                            <div className="flex flex-wrap gap-1">
                              {methods.map((method) => (
                                <span 
                                  key={method}
                                  className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider ${
                                    method === 'twitch' ? 'bg-[#9146ff]/10 text-[#a970ff] border border-[#9146ff]/20' : 
                                    method === 'discord' ? 'bg-[#5865f2]/10 text-[#7289da] border border-[#5865f2]/20' : 
                                    method === 'google' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                                    'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                                  }`}
                                >
                                  {method}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-800 text-zinc-300 border border-zinc-700">
                                {u.role || 'User'}
                            </span>
                          </td>
                          <td className="py-4 px-5">
                            <select
                              value={activeTier}
                              disabled={actionLoading}
                              onChange={(e) => handleUpdateUserSubscription(u, parseInt(e.target.value))}
                              className={`border text-[11px] rounded-lg px-2.5 py-1 focus:outline-none font-bold uppercase tracking-wider transition-all duration-200 cursor-pointer ${
                                activeTier === 3 ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' :
                                activeTier === 2 ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400' :
                                activeTier === 1 ? 'bg-purple-500/10 border-purple-500/30 text-purple-400' :
                                'bg-zinc-900/60 border-white/5 text-zinc-400'
                              }`}
                            >
                              <option value={0} className="bg-zinc-950 text-zinc-400 font-bold">None</option>
                              <option value={1} className="bg-zinc-950 text-purple-400 font-bold">Tier 1</option>
                              <option value={2} className="bg-zinc-950 text-cyan-400 font-bold">Tier 2</option>
                              <option value={3} className="bg-zinc-950 text-amber-400 font-bold">Tier 3 (Supporter)</option>
                            </select>
                          </td>
                          <td className="py-4 px-5 font-mono text-[11px]">
                            <div className="flex items-center gap-1.5 bg-zinc-950/60 border border-white/10 px-2.5 py-1.5 rounded-xl w-fit group/uid">
                              <span className="text-zinc-300 font-bold">{u.userId.substring(0, 8)}...{u.userId.substring(u.userId.length - 8)}</span>
                              <button
                                onClick={() => handleCopy(u.userId)}
                                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
                                title="Copy Full Firebase UID"
                              >
                                {copiedId === u.userId ? (
                                  <Check size={12} className="text-emerald-400" />
                                ) : (
                                  <Copy size={12} className="group-hover/uid:scale-105 transition-transform" />
                                )}
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-zinc-400 text-right font-medium">
                            <div className="text-white font-bold">{u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'N/A'}</div>
                          </td>
                          <td className="py-4 px-5 text-zinc-400 text-right font-medium">
                            <div className="text-white font-bold">{u.createdAt ? new Date(u.createdAt).toLocaleString() : 'N/A'}</div>
                          </td>
                        </tr>
                      );
                    })}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan={8} className="py-16 text-center text-zinc-500 text-sm font-semibold">
                          No users registered in database.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

      </div>
    </main>
  );
}
