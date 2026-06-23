'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { Copy, Check, Loader2, Sparkles } from 'lucide-react';
import { db } from '@/utils/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

interface ChatCommand {
  id: string;
  name: string;
  permission: 'everyone' | 'moderator';
  response: string;
  aliases?: string[];
}

export default function StreamCommandsPage() {
  const [search, setSearch] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [commands, setCommands] = useState<ChatCommand[]>([]);
  const [loading, setLoading] = useState(true);

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

  const filteredCommands = commands.filter(c => 
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
          {filteredCommands.length > 0 ? (
            <div className="divide-y divide-white/5">
              {filteredCommands.map((item) => {
                const hasAliases = item.aliases && item.aliases.length > 0;
                return (
                  <div 
                    key={item.id} 
                    className="grid grid-cols-1 md:grid-cols-12 items-center py-4 px-6 gap-4 hover:bg-white/[0.01] transition-colors"
                  >
                    {/* Command & Aliases */}
                    <div className="md:col-span-3 flex items-center gap-2">
                      <span 
                        onClick={() => handleCopy(item.name)}
                        className="text-sm font-black text-cyan-400 font-mono cursor-pointer hover:text-cyan-300 transition-colors"
                      >
                        {item.name}
                      </span>
                      
                      {hasAliases && (
                        <div className="relative group/tooltip inline-block">
                          <span className="text-[10px] text-zinc-500 hover:text-zinc-300 transition-colors cursor-help font-bold select-none">
                            +{item.aliases!.length}
                          </span>
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover/tooltip:block bg-zinc-950/90 border border-white/10 px-3 py-1.5 rounded-xl text-[10px] font-mono text-zinc-300 whitespace-nowrap z-50 shadow-2xl select-all">
                            {item.aliases!.join(' ')}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Permission Badge */}
                    <div className="md:col-span-2 flex justify-start md:justify-center">
                      <span 
                        className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider border select-none ${
                          item.permission === 'moderator' 
                            ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                            : 'bg-white/5 text-zinc-400 border-white/5'
                        }`}
                      >
                        {item.permission}
                      </span>
                    </div>

                    {/* Response Text */}
                    <div className="md:col-span-6 text-xs text-zinc-300 font-mono leading-relaxed break-words">
                      {item.response}
                    </div>

                    {/* Copy Action Button */}
                    <div className="md:col-span-1 flex justify-end">
                      <button
                        onClick={() => handleCopy(item.name)}
                        className="h-8 w-8 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all cursor-pointer"
                        title="Copy Command Name"
                      >
                        {copiedId === item.name ? (
                          <Check size={14} className="text-emerald-400" />
                        ) : (
                          <Copy size={14} />
                        )}
                      </button>
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
