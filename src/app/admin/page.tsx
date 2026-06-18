'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { useExtensions } from '@/hooks/useExtensions';
import { useNews } from '@/hooks/useNews';
import { useVideos } from '@/hooks/useVideos';
import { useProjects } from '@/hooks/useProjects';
import { VersionEntry } from '@/hooks/useProjects';
import { Shield, Users, Puzzle, Plus, Edit2, Trash2, Check, X, Loader2, Sparkles, MoreVertical, Newspaper, Video, FolderCode, Tag, GitBranch, ChevronDown, ChevronUp } from 'lucide-react';
import { Extension } from '@/utils/extensions';

interface RegisteredUser {
  id: string;
  email: string;
  username: string;
  platform: string;
  role: string;
  avatar: string;
  lastLogin: string;
  userId: string;
}

export default function AdminPage() {
  const { user, isAdmin, isLoading: authLoading, token } = useAuth();
  const { extensions, featuredExtensions, isLoading: extensionsLoading, refresh: refreshExtensions } = useExtensions();
  const { news, isLoading: newsLoading, refresh: refreshNews } = useNews();
  const { videos, isLoading: videosLoading, refresh: refreshVideos } = useVideos();
  
  const [activeTab, setActiveTab] = useState<'extensions' | 'news' | 'videos' | 'projects' | 'users'>('extensions');
  const { projects, isLoading: projectsLoading, refresh: refreshProjects } = useProjects();
  const [users, setUsers] = useState<RegisteredUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  
  // Form States
  const [formId, setFormId] = useState('');
  const [formName, setFormName] = useState('');
  const [formBadge, setFormBadge] = useState<'NEW' | 'PREMIUM' | ''>('');
  const [formDesc, setFormDesc] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [editingExt, setEditingExt] = useState<Extension | null>(null);

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

  // Video Form States
  const [videoFormId, setVideoFormId] = useState('');
  const [videoFormTitle, setVideoFormTitle] = useState('');
  const [videoFormThumbnail, setVideoFormThumbnail] = useState('');
  const [videoFormUrl, setVideoFormUrl] = useState('');
  const [videoFormOrder, setVideoFormOrder] = useState<number>(0);
  const [editingVideo, setEditingVideo] = useState<any | null>(null);

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
  const [projFormImages, setProjFormImages] = useState<{ url: string; redirectLink?: string; alt?: string }[]>([]);
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
    const url = projFormImgUrl.trim();
    if (!url) return;
    setProjFormImages(prev => [...prev, {
      url,
      redirectLink: projFormImgRedirect.trim() || undefined,
      alt: projFormImgAlt.trim() || undefined,
    }]);
    setProjFormImgUrl('');
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
          quickViewImage: projFormQvImgEnabled && projFormQvImgUrl
            ? { url: projFormQvImgUrl, redirectLink: projFormQvImgRedirect || undefined }
            : null,
          redirectLink: projFormRedirectLink || null,
          images: projFormImages,
          versions: projFormVersions,
          featured: projFormFeatured,
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

  // Fetch registered users
  useEffect(() => {
    if (activeTab === 'users' && isAdmin && token) {
      setUsersLoading(true);
      setApiError('');
      fetch('/.netlify/functions/get-users', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch users');
          return res.json();
        })
        .then(data => {
          setUsers(data);
          setUsersLoading(false);
        })
        .catch(err => {
          console.error(err);
          setApiError('Failed to load registered users from database.');
          setUsersLoading(false);
        });
    }
  }, [activeTab, isAdmin, token]);

  const clearForm = () => {
    setFormId('');
    setFormName('');
    setFormBadge('');
    setFormDesc('');
    setFormFeatured(false);
    setEditingExt(null);
  };

  const handleEditClick = (ext: Extension) => {
    setEditingExt(ext);
    setFormId(ext.id);
    setFormName(ext.name);
    setFormBadge(ext.badge || '');
    setFormDesc(ext.description || '');
    setFormFeatured(ext.featured === true || ext.feature === true);
    setApiError('');
    setApiSuccess('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    if (!formId || !formName) {
      setApiError('ID and Name are required.');
      return;
    }

    setActionLoading(true);
    const method = editingExt ? 'PUT' : 'POST';

    try {
      const response = await fetch('/.netlify/functions/manage-extensions', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: formId,
          name: formName,
          badge: formBadge || null,
          description: formDesc,
          featured: formFeatured
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred.');
      }

      setApiSuccess(editingExt ? 'Extension updated successfully!' : 'Extension added successfully!');
      clearForm();
      refreshExtensions();
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(`Are you sure you want to delete extension ID: ${id}?`)) return;

    setApiError('');
    setApiSuccess('');
    setActionLoading(true);

    try {
      const response = await fetch('/.netlify/functions/manage-extensions', {
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

      setApiSuccess('Extension deleted successfully!');
      refreshExtensions();
      if (editingExt?.id === id) clearForm();
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Failed to delete extension.');
    } finally {
      setActionLoading(false);
    }
  };

  // Inline extension updates (from 3-dots menu actions)
  const handleUpdateExtensionField = async (ext: Extension, updates: Partial<Extension>) => {
    setApiError('');
    setApiSuccess('');
    setActionLoading(true);

    try {
      const response = await fetch('/.netlify/functions/manage-extensions', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: ext.id,
          name: ext.name,
          badge: updates.badge !== undefined ? (updates.badge || null) : (ext.badge || null),
          description: ext.description || '',
          featured: updates.featured !== undefined ? updates.featured : (ext.featured === true || ext.feature === true)
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred.');
      }

      setApiSuccess(`Extension "${ext.name}" updated successfully!`);
      refreshExtensions();
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Action failed.');
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
          mediaUrl: newsFormMediaUrl || null,
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

  // Video Mutation Handlers
  const clearVideoForm = () => {
    setVideoFormId('');
    setVideoFormTitle('');
    setVideoFormThumbnail('');
    setVideoFormUrl('');
    setVideoFormOrder(0);
    setEditingVideo(null);
  };

  const handleEditVideoClick = (item: any) => {
    setEditingVideo(item);
    setVideoFormId(item.id);
    setVideoFormTitle(item.title);
    setVideoFormThumbnail(item.thumbnail);
    setVideoFormUrl(item.url);
    setVideoFormOrder(item.order || 0);
    setApiError('');
    setApiSuccess('');
  };

  const handleVideoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setApiSuccess('');

    if (!videoFormId || !videoFormTitle || !videoFormThumbnail || !videoFormUrl) {
      setApiError('ID, Title, Thumbnail, and Link (URL) are required.');
      return;
    }

    setActionLoading(true);
    const method = editingVideo ? 'PUT' : 'POST';

    // Limit validation
    if (!editingVideo && videos.length >= 3) {
      setApiError('Validation Error: A maximum of 3 videos can be featured, but you are trying to add a 4th video.');
      setActionLoading(false);
      return;
    }

    const finalOrder = editingVideo 
      ? videoFormOrder 
      : (videos.length > 0 ? Math.max(...videos.map(v => v.order)) + 1 : 0);

    try {
      const response = await fetch('/.netlify/functions/manage-videos', {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: videoFormId,
          title: videoFormTitle,
          thumbnail: videoFormThumbnail,
          url: videoFormUrl,
          order: finalOrder
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Server error occurred.');
      }

      setApiSuccess(editingVideo ? 'Video updated successfully!' : 'Video added successfully!');
      clearVideoForm();
      refreshVideos();
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Action failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVideo = async (id: string) => {
    if (!confirm(`Are you sure you want to delete video ID: ${id}?`)) return;

    setApiError('');
    setApiSuccess('');
    setActionLoading(true);

    try {
      const response = await fetch('/.netlify/functions/manage-videos', {
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

      setApiSuccess('Video deleted successfully!');
      refreshVideos();
      if (editingVideo?.id === id) clearVideoForm();
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Failed to delete video.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleMoveVideo = async (index: number, direction: 'up' | 'down') => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= videos.length) return;

    setActionLoading(true);
    setApiError('');
    setApiSuccess('');

    try {
      const videoA = { ...videos[index] };
      const videoB = { ...videos[targetIdx] };

      const tempOrder = videoA.order;
      videoA.order = videoB.order;
      videoB.order = tempOrder;

      const updateVideo = async (vid: any) => {
        const res = await fetch('/.netlify/functions/manage-videos', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: vid.id,
            title: vid.title,
            thumbnail: vid.thumbnail,
            url: vid.url,
            order: vid.order
          })
        });
        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.error || 'Failed to swap video orders.');
        }
      };

      await updateVideo(videoA);
      await updateVideo(videoB);

      setApiSuccess('Videos reordered successfully!');
      refreshVideos();
    } catch (err: any) {
      console.error(err);
      setApiError(err.message || 'Failed to reorder videos.');
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
            Only authorized administrator accounts can access the panel. Please sign in as <code className="text-purple-400">marc.aeschbach@icloud.com</code>.
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
    <main className="min-h-screen text-white selection:bg-purple-500/30">
      <Navbar />

      <div className="pt-28 pb-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
              <Shield size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">Admin Dashboard</h1>
              <p className="text-xs text-purple-400">System settings and collections database panel.</p>
            </div>
          </div>
          
          <div className="flex flex-wrap gap-2 bg-zinc-900/60 p-1 rounded-xl border border-white/5">
            <button
              onClick={() => setActiveTab('extensions')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'extensions' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              <Puzzle size={14} /> Extensions
            </button>
            <button
              onClick={() => setActiveTab('news')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'news' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              <Newspaper size={14} /> News
            </button>
            <button
              onClick={() => setActiveTab('videos')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'videos' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              <Video size={14} /> Videos
            </button>
            <button
              onClick={() => setActiveTab('projects')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'projects' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              <FolderCode size={14} /> Projects
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${activeTab === 'users' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-400 hover:text-white'}`}
            >
              <Users size={14} /> Registered Users
            </button>
          </div>
        </div>

        {/* ALERTS */}
        {apiError && (
          <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
            {apiError}
          </div>
        )}
        {apiSuccess && (
          <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 text-sm">
            {apiSuccess}
          </div>
        )}

        {/* TAB CONTENT: EXTENSIONS MANAGER */}
        {activeTab === 'extensions' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1. MANAGE / ADD FORM */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 h-fit backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-400">
                  {editingExt ? 'Edit Extension' : 'Add New Extension'}
                </h2>
                {editingExt && (
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
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">ID</label>
                    <input
                      type="text"
                      disabled={!!editingExt}
                      value={formId}
                      onChange={(e) => setFormId(e.target.value)}
                      placeholder="e.g. 31"
                      className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all disabled:opacity-50"
                    />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Badge</label>
                    <select
                      value={formBadge}
                      onChange={(e) => setFormBadge(e.target.value as any)}
                      className="w-full bg-zinc-950/50 text-white text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                    >
                      <option value="">None</option>
                      <option value="NEW">NEW</option>
                      <option value="PREMIUM">PREMIUM</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Extension Name</label>
                  <input
                    type="text"
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder="e.g. MUSIC PLAYER"
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Description (Featured block only)</label>
                  <textarea
                    value={formDesc}
                    onChange={(e) => setFormDesc(e.target.value)}
                    placeholder="Brief summary displayed when featured on home page."
                    rows={3}
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all resize-none"
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-zinc-200">Featured On Homepage</span>
                    <span className="text-[10px] text-purple-400 mt-0.5">Maximum 3 extensions can be featured</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={formFeatured}
                    onChange={(e) => setFormFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-white/5 bg-zinc-950 text-purple-600 focus:ring-0 cursor-pointer"
                  />
                </div>

                <button
                  type="submit"
                  disabled={actionLoading}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold bg-purple-600 hover:bg-purple-500 text-white transition-all disabled:opacity-50 cursor-pointer"
                >
                  {actionLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : editingExt ? (
                    'Save Changes'
                  ) : (
                    <>
                      <Plus size={14} /> Add Extension
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 2. EXTENSIONS GRID/LIST */}
            <div className="lg:col-span-2 bg-zinc-900/30 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-400">
                  Database Collections ({extensions.length})
                </h2>
                <div className="text-[10px] bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/10 font-bold">
                  Featured: {featuredExtensions.length}/3
                </div>
              </div>

              {extensionsLoading ? (
                <div className="py-12 flex flex-col items-center gap-2 text-zinc-500 text-xs">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  <span>Loading database...</span>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
                  {extensions.map((ext) => {
                    const isExtFeatured = ext.featured === true || ext.feature === true;
                    return (
                      <div 
                        key={ext.id}
                        className={`flex items-center justify-between p-3.5 rounded-xl border transition-all ${isExtFeatured ? 'border-purple-500/20 bg-purple-500/2' : 'border-white/5 bg-zinc-950/20 hover:border-white/10'}`}
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-[10px] font-mono text-zinc-500 font-bold bg-zinc-950/50 px-2 py-1 rounded-md">ID {ext.id}</span>
                          <div className="truncate">
                            <div className="flex items-center gap-2">
                              <h4 className="text-xs font-bold text-white truncate">{ext.name}</h4>
                              {ext.badge && (
                                <span className={`text-[8px] font-extrabold px-1 rounded ${ext.badge === 'PREMIUM' ? 'text-amber-400 bg-amber-500/10' : 'text-emerald-400 bg-emerald-500/10'}`}>
                                  {ext.badge}
                                </span>
                              )}
                              {isExtFeatured && (
                                <span className="text-[8px] font-extrabold text-purple-400 bg-purple-500/10 px-1 rounded border border-purple-500/10">
                                  ★ FEATURED
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-zinc-500 truncate mt-0.5 max-w-[280px]">
                              {ext.description || 'No description provided.'}
                            </p>
                          </div>
                        </div>

                        <div className="relative flex-shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuId(openMenuId === ext.id ? null : ext.id);
                            }}
                            className="p-2 rounded-lg bg-zinc-950/40 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer"
                            title="Options"
                          >
                            <MoreVertical size={14} />
                          </button>

                          {openMenuId === ext.id && (
                            <div className="absolute right-0 mt-1.5 w-48 bg-zinc-900 border border-white/10 rounded-xl shadow-xl z-50 py-1.5 animate-fadeIn">
                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  // Toggle NEW badge
                                  const newBadge = ext.badge === 'NEW' ? undefined : 'NEW';
                                  await handleUpdateExtensionField(ext, { badge: newBadge });
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-white/5 text-xs text-zinc-300 hover:text-white transition-colors"
                              >
                                {ext.badge === 'NEW' ? 'Remove "NEW" Badge' : 'Add "NEW" Badge'}
                              </button>

                              <button
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  // Toggle Featured status
                                  const isExtFeatured = ext.featured === true || ext.feature === true;
                                  if (!isExtFeatured) {
                                    // Check total featured count
                                    const currentFeatured = extensions.filter(e => e.featured === true || e.feature === true).length;
                                    if (currentFeatured >= 3) {
                                      alert('Validation Error: A maximum of 3 extensions can be featured, but you are trying to feature a 4th extension.');
                                      return;
                                    }
                                  }
                                  await handleUpdateExtensionField(ext, { featured: !isExtFeatured });
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-white/5 text-xs text-zinc-300 hover:text-white transition-colors"
                              >
                                {isExtFeatured ? 'Unfeature Extension' : 'Feature Extension'}
                              </button>

                              <hr className="border-white/5 my-1" />

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  handleEditClick(ext);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-white/5 text-xs text-zinc-300 hover:text-white transition-colors"
                              >
                                Edit Details
                              </button>

                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setOpenMenuId(null);
                                  handleDelete(ext.id);
                                }}
                                className="w-full text-left px-4 py-2 hover:bg-red-500/10 text-xs text-red-400 hover:text-red-300 transition-colors"
                              >
                                Delete Extension
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {extensions.length === 0 && (
                    <div className="py-12 text-center text-zinc-500 text-xs">
                      No extensions registered in database.
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
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Media URL (Optional)</label>
                  <input
                    type="text"
                    value={newsFormMediaUrl}
                    onChange={(e) => setNewsFormMediaUrl(e.target.value)}
                    placeholder="Image URL or YouTube video link"
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                  />
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
                            <span className={`text-[8px] font-extrabold px-1.5 py-0.5 rounded ${
                              item.type === 'RELEASE' ? 'bg-amber-500/10 text-amber-500' :
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

        {/* TAB CONTENT: VIDEOS MANAGER */}
        {activeTab === 'videos' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1. Video Form */}
            <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 h-fit backdrop-blur-md space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-400">
                  {editingVideo ? 'Edit Video' : 'Add Video'}
                </h2>
                {editingVideo && (
                  <button 
                    onClick={clearVideoForm}
                    className="text-[10px] text-zinc-500 hover:text-white bg-zinc-950/50 px-2.5 py-1 rounded-md"
                  >
                    Cancel Edit
                  </button>
                )}
              </div>

              <form onSubmit={handleVideoSubmit} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Slug/ID</label>
                  <input
                    type="text"
                    disabled={!!editingVideo}
                    value={videoFormId}
                    onChange={(e) => setVideoFormId(e.target.value)}
                    placeholder="video_X"
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all disabled:opacity-50"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Title</label>
                  <input
                    type="text"
                    value={videoFormTitle}
                    onChange={(e) => setVideoFormTitle(e.target.value)}
                    placeholder="Video title"
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Thumbnail URL</label>
                  <input
                    type="text"
                    value={videoFormThumbnail}
                    onChange={(e) => setVideoFormThumbnail(e.target.value)}
                    placeholder="Image link"
                    className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-3 py-2.5 rounded-lg border border-white/5 focus:border-purple-500/40 focus:outline-none transition-all"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 tracking-wide uppercase">Redirect Link (URL)</label>
                  <input
                    type="text"
                    value={videoFormUrl}
                    onChange={(e) => setVideoFormUrl(e.target.value)}
                    placeholder="https://youtube.com/watch?v=..."
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
                  ) : editingVideo ? (
                    'Save Changes'
                  ) : (
                    <>
                      <Plus size={14} /> Add Video
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* 2. Videos Grid/List */}
            <div className="lg:col-span-2 bg-zinc-900/30 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
                <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-400">
                  Videos Collection ({videos.length})
                </h2>
                <div className="text-[10px] bg-purple-500/10 text-purple-400 px-3 py-1 rounded-full border border-purple-500/10 font-bold">
                  Featured: {videos.length}/3
                </div>
              </div>

              {videosLoading ? (
                <div className="py-12 flex flex-col items-center gap-2 text-zinc-500 text-xs">
                  <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                  <span>Loading database...</span>
                </div>
              ) : (
                <div className="space-y-2 pr-1">
                  {videos.map((item, index) => (
                    <div 
                      key={item.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-white/5 bg-zinc-950/20 hover:border-white/10 transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className="text-[10px] font-mono text-zinc-500 font-bold bg-zinc-950/50 px-2 py-1 rounded-md">Order {index + 1}</span>
                        <div className="truncate">
                          <h4 className="text-xs font-bold text-white truncate">{item.title}</h4>
                          <p className="text-[10px] text-zinc-500 truncate mt-0.5 max-w-[280px]">
                            {item.url}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {/* Reorder Buttons */}
                        <button
                          disabled={index === 0 || actionLoading}
                          onClick={(e) => { e.stopPropagation(); handleMoveVideo(index, 'up'); }}
                          className="px-2 py-1 text-xs rounded bg-zinc-950/40 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Up"
                        >
                          ▲
                        </button>
                        <button
                          disabled={index === videos.length - 1 || actionLoading}
                          onClick={(e) => { e.stopPropagation(); handleMoveVideo(index, 'down'); }}
                          className="px-2 py-1 text-xs rounded bg-zinc-950/40 border border-white/5 text-zinc-400 hover:text-white disabled:opacity-30 cursor-pointer"
                          title="Move Down"
                        >
                          ▼
                        </button>
                        
                        <button
                          onClick={(e) => { e.stopPropagation(); handleEditVideoClick(item); }}
                          className="p-2 rounded-lg bg-zinc-950/40 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-900 transition-all cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteVideo(item.id); }}
                          className="p-2 rounded-lg bg-red-500/5 border border-red-500/10 text-red-400 hover:text-white hover:bg-red-500 transition-all cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                  ))}

                  {videos.length === 0 && (
                    <div className="py-12 text-center text-zinc-500 text-xs">
                      No custom videos added to database.
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
                        className={`text-[9px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer capitalize ${
                          projFormStatusColor === c
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
                        <label className="text-[9px] font-bold text-zinc-600 uppercase">Image / YouTube URL</label>
                        <input type="text" value={projFormQvImgUrl} onChange={(e) => setProjFormQvImgUrl(e.target.value)}
                          placeholder="https://... or YouTube link"
                          className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-2 py-2 rounded-lg border border-white/5 focus:outline-none" />
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
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-white/3 border border-white/8 gap-2">
                            <span className="text-[10px] text-zinc-400 truncate flex-1">{img.url}</span>
                            <button type="button" onClick={() => handleRemoveImage(i)}
                              className="text-red-400 hover:text-red-300 cursor-pointer flex-shrink-0"><Trash2 size={11} /></button>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="p-3 rounded-xl bg-zinc-950/40 border border-white/5 space-y-2">
                      <input type="text" value={projFormImgUrl} onChange={(e) => setProjFormImgUrl(e.target.value)}
                        placeholder="Image URL or YouTube link"
                        className="w-full bg-zinc-950/50 text-white placeholder-zinc-700 text-xs px-2 py-2 rounded-lg border border-white/5 focus:outline-none" />
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

                {/* Featured */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-white/2 border border-white/5">
                  <span className="text-xs font-bold text-zinc-200">Featured on Homepage</span>
                  <input type="checkbox" checked={projFormFeatured} onChange={(e) => setProjFormFeatured(e.target.checked)}
                    className="h-4 w-4 rounded border-white/5 bg-zinc-950 text-purple-600 focus:ring-0 cursor-pointer" />
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
                            {proj.featured && (
                              <span className="text-[8px] font-extrabold text-purple-400 bg-purple-500/10 px-1 rounded border border-purple-500/10">★ FEATURED</span>
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

        {/* TAB CONTENT: USERS LIST */}
        {activeTab === 'users' && (
          <div className="bg-zinc-900/30 border border-white/5 rounded-2xl p-6 backdrop-blur-md">
            <div className="flex items-center justify-between pb-3 border-b border-white/5 mb-4">
              <h2 className="text-sm font-bold tracking-wide uppercase text-zinc-400">
                Registered Streamers & Viewers ({users.length})
              </h2>
              <span className="text-[10px] text-zinc-500 uppercase tracking-widest">Firestore synchronized</span>
            </div>

            {usersLoading ? (
              <div className="py-12 flex flex-col items-center gap-2 text-zinc-500 text-xs">
                <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
                <span>Loading users...</span>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 text-zinc-500 font-bold uppercase tracking-wider">
                      <th className="py-3 px-4">User</th>
                      <th className="py-3 px-4">Email</th>
                      <th className="py-3 px-4">Connected via</th>
                      <th className="py-3 px-4">Platform Role</th>
                      <th className="py-3 px-4">Firebase UID</th>
                      <th className="py-3 px-4 text-right">Last Login</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u) => (
                      <tr key={u.id} className="border-b border-white/5 hover:bg-white/2 transition-colors">
                        <td className="py-3 px-4 flex items-center gap-2.5">
                          <img src={u.avatar} alt={u.username} className="h-8 w-8 rounded-lg border border-white/10 bg-zinc-950" />
                          <span className="font-bold text-white">{u.username}</span>
                        </td>
                        <td className="py-3 px-4 text-zinc-300 font-medium">{u.email || <span className="text-zinc-600 font-italic">N/A</span>}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${u.platform === 'twitch' ? 'bg-[#9146ff]/10 text-[#a970ff]' : u.platform === 'discord' ? 'bg-[#5865f2]/10 text-[#7289da]' : 'bg-purple-500/10 text-purple-400'}`}>
                            {u.platform}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-zinc-400 font-semibold">{u.role}</td>
                        <td className="py-3 px-4 font-mono text-zinc-500 text-[10px] select-all">{u.userId}</td>
                        <td className="py-3 px-4 text-zinc-400 text-right">
                          {u.lastLogin ? new Date(u.lastLogin).toLocaleString() : 'N/A'}
                        </td>
                      </tr>
                    ))}

                    {users.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-zinc-500">
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
