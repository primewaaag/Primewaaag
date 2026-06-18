'use client';

import React, { useState } from 'react';
import { Search, X, HelpCircle } from 'lucide-react';
import { useExtensions } from '@/hooks/useExtensions';

interface ExtensionsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ExtensionsModal({ isOpen, onClose }: ExtensionsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const { extensions, isLoading } = useExtensions();

  if (!isOpen) return null;

  const filteredExtensions = extensions.filter((ext) =>
    ext.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/80 backdrop-blur-md p-4 sm:p-6 md:p-10">
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative w-full max-w-7xl h-full max-h-[85vh] bg-zinc-900/40 border border-white/5 rounded-2xl flex flex-col p-6 overflow-hidden shadow-2xl backdrop-blur-xl">
        
        {/* SEARCH BAR HEADER */}
        <div className="flex items-center gap-3 w-full mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              placeholder="Search by name, keyword or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-950/50 text-white placeholder-zinc-500 text-sm pl-12 pr-4 py-3.5 rounded-xl border border-purple-500/10 focus:border-purple-500/40 focus:outline-none transition-all"
            />
          </div>
          <button 
            onClick={onClose}
            className="p-3.5 rounded-xl bg-zinc-950/50 border border-white/5 text-zinc-400 hover:text-white hover:bg-zinc-950 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* CORE GRID */}
        <div className="flex-1 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {isLoading ? (
              [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((n) => (
                <div key={n} className="aspect-square bg-zinc-950/30 border border-white/5 rounded-xl animate-pulse flex flex-col items-center justify-center p-4">
                  <div className="h-8 w-8 rounded-lg bg-white/5 mb-3" />
                  <div className="h-3 w-16 bg-white/5 rounded" />
                </div>
              ))
            ) : (
              filteredExtensions.map((item) => (
                <div
                  key={item.id}
                  className="group relative aspect-square flex flex-col items-center justify-center p-4 bg-zinc-950/30 border border-white/5 rounded-xl transition-all duration-200 cursor-pointer hover:bg-zinc-900/40 hover:border-white/10 active:scale-[0.98]"
                >
                  {item.badge === 'NEW' && (
                    <span className="absolute top-3 right-3 text-[9px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                      NEW
                    </span>
                  )}

                  {/* Grid Icon Placeholder */}
                  <div className="h-10 w-10 rounded-lg bg-white/[0.02] border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:scale-105 transition-all mb-3">
                    💡
                  </div>

                  <h4 className="text-[11px] font-bold tracking-wider text-center text-zinc-300 group-hover:text-white transition-colors">
                    {item.name}
                  </h4>
                </div>
              ))
            )}

            {!isLoading && extensions.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center text-zinc-500 gap-2">
                <HelpCircle size={32} className="stroke-[1.5]" />
                <p className="text-sm">No extensions available at the moment. Stay tuned!</p>
              </div>
            ) : !isLoading && filteredExtensions.length === 0 ? (
              <div className="col-span-full py-16 flex flex-col items-center text-zinc-500 gap-2">
                <HelpCircle size={32} className="stroke-[1.5]" />
                <p className="text-sm">No items match your search.</p>
              </div>
            ) : null}
          </div>
        </div>

      </div>
    </div>
  );
}