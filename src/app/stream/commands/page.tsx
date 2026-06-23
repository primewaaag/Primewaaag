'use client';

import React, { useState, useEffect } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import { db } from '@/utils/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface ChatCommand {
  id: string;
  name: string;
  permission: 'everyone' | 'moderator';
  response: string;
  aliases?: string[];
  kind?: 'general' | 'socials' | 'games' | 'fun';
}

export default function StreamCommandsPage() {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [commands, setCommands] = useState<ChatCommand[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'general' | 'socials' | 'games' | 'fun'>('all');

  useEffect(() => {
    const cmdCol = collection(db, 'commands');
    const unsubscribe = onSnapshot(cmdCol, (snapshot) => {
      const list: ChatCommand[] = [];
      snapshot.forEach(doc => {
        list.push({ id: doc.id, ...(doc.data() as any) });
      });
      // Sort alphabetically by name (case-insensitive)
      list.sort((a, b) => (a.name || '').toLowerCase().localeCompare((b.name || '').toLowerCase()));
      setCommands(list);
      setLoading(false);
    }, (err) => {
      console.error('Error fetching commands:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleCopy = (cmdName: string) => {
    navigator.clipboard.writeText(cmdName);
    setCopiedId(cmdName);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allCount = commands.length;
  const generalCount = commands.filter(c => (c.kind || 'general') === 'general').length;
  const socialsCount = commands.filter(c => c.kind === 'socials').length;
  const gamesCount = commands.filter(c => c.kind === 'games').length;
  const funCount = commands.filter(c => c.kind === 'fun').length;

  const filteredCommands = commands
    .filter(c => {
      if (activeTab === 'general') return (c.kind || 'general') === 'general';
      if (activeTab === 'socials') return c.kind === 'socials';
      if (activeTab === 'games') return c.kind === 'games';
      if (activeTab === 'fun') return c.kind === 'fun';
      return true;
    })
    .filter(c => 
      c.name.toLowerCase().includes(search.toLowerCase()) || 
      (c.aliases && c.aliases.some(a => a.toLowerCase().includes(search.toLowerCase()))) ||
      c.response.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div className="space-y-8">
      <div className="space-y-4">
        <div className="border-b border-white/5 pb-4">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase flex items-center gap-2">
            <Sparkles className="text-cyan-400 h-5 w-5 animate-pulse" />
            Twitch Chat Commands
          </h2>
          <p className="text-xs text-zinc-400 mt-1">Explore custom chat triggers and bot responses in real-time.</p>
        </div>

        {/* Dynamic counts tabs */}
        <div className="flex flex-wrap gap-4 sm:gap-6 border-b border-white/5 pb-0.5">
          {[
            { id: 'all', label: 'All commands', count: allCount },
            { id: 'general', label: 'General', count: generalCount },
            { id: 'socials', label: 'Socials', count: socialsCount },
            { id: 'games', label: 'Games', count: gamesCount },
            { id: 'fun', label: 'Fun', count: funCount }
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className="pb-3 text-xs sm:text-sm font-bold uppercase tracking-wider relative transition-all cursor-pointer whitespace-nowrap text-white"
              >
                {tab.label} <span className={`font-mono text-xs ml-1 ${isActive ? 'text-purple-300' : 'text-zinc-300'}`}>({tab.count})</span>
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-purple-500 rounded-full" />
                )}
              </button>
            );
          })}
        </div>
        
        <input
          type="text"
          placeholder="Search commands or aliases..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-zinc-950/40 text-white text-sm px-4 py-3 rounded-2xl border border-white/5 focus:border-cyan-500/40 focus:outline-none transition-all placeholder:text-zinc-600"
        />
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center gap-3 text-zinc-500 text-sm">
          <Loader2 className="h-8 w-8 animate-spin text-cyan-400" />
          <span>Fetching commands database...</span>
        </div>
      ) : (
        <div className="bg-zinc-900/30 border border-white/5 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-md">
          {/* Table Headers */}
          <div className="grid grid-cols-12 border-b border-white/10 py-4 px-6 text-[10px] font-bold text-zinc-400 uppercase tracking-widest bg-white/[0.01]">
            <div className="col-span-4 md:col-span-3 flex items-center gap-1">
              COMMAND <span className="text-[8px] text-zinc-600">♢</span>
            </div>
            <div className="col-span-4 md:col-span-3 flex items-center justify-start md:justify-center gap-1">
              PERMISSIONS <span className="text-[8px] text-zinc-600">♢</span>
            </div>
            <div className="col-span-4 md:col-span-6">
              RESPONSE
            </div>
          </div>

          {filteredCommands.length > 0 ? (
            <div className="divide-y divide-white/5">
              {filteredCommands.map((item) => {
                const hasAliases = item.aliases && item.aliases.length > 0;
                return (
                  <div 
                    key={item.id} 
                    className="grid grid-cols-12 items-center py-4 px-6 gap-3 hover:bg-white/[0.01] transition-colors"
                  >
                    {/* Command & Aliases */}
                    <div className="col-span-4 md:col-span-3 flex items-center gap-2">
                      <span 
                        onClick={() => handleCopy(item.name)}
                        className="text-sm font-black text-white font-mono cursor-pointer hover:text-purple-300 transition-colors"
                        title={copiedId === item.name ? "Copied!" : "Click to Copy Command"}
                      >
                        {item.name}
                      </span>
                      
                      {hasAliases && (
                        <div className="relative group/tooltip inline-block">
                          <span className="text-[10px] font-black text-zinc-500 hover:text-zinc-300 transition-colors bg-white/[0.03] hover:bg-white/[0.08] px-1.5 py-0.5 rounded border border-white/5 cursor-help select-none">
                            +{item.aliases!.length}
                          </span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-zinc-950/90 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-mono text-zinc-300 whitespace-nowrap z-50 shadow-2xl select-all">
                            {item.aliases!.join(' ')}
                          </div>
                        </div>
                      )}
                      
                      {copiedId === item.name && (
                        <span className="text-[9px] text-emerald-400 font-bold animate-pulse font-sans">
                          Copied!
                        </span>
                      )}
                    </div>

                    {/* Permission Badge */}
                    <div className="col-span-4 md:col-span-3 flex justify-start md:justify-center">
                      <span 
                        className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider select-none border ${
                          item.permission === 'moderator' 
                            ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                            : 'bg-zinc-800/80 text-zinc-400 border-zinc-700/30'
                        }`}
                      >
                        {item.permission}
                      </span>
                    </div>

                    {/* Response Text */}
                    <div className="col-span-4 md:col-span-6">
                      <div className="text-xs text-zinc-300 font-mono leading-relaxed break-all md:break-words">
                        {item.response}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-20 text-center text-zinc-500 text-sm font-semibold">
              No matching chat commands found.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
