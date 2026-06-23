'use client';

import React from 'react';
import Navbar from '@/components/Navbar';
import { Monitor, Cpu, HardDrive, Keyboard, Mouse, Mic } from 'lucide-react';

export default function StreamSetupPage() {
  const peripherals = [
    { name: 'Mouse', model: 'Razer Deathadder V2 Pro', detail: 'Wireless, 20K DPI, Focus+ Optical Sensor', icon: <Mouse size={20} /> },
    { name: 'Keyboard', model: 'Wooting 60HE', detail: 'Analog input, rapid trigger, linear switches', icon: <Keyboard size={20} /> },
    { name: 'Microphone', model: 'Fifine AM8', detail: 'Dynamic USB/XLR mic with RGB lighting', icon: <Mic size={20} /> },
    { name: 'Monitor', model: 'ASUS ROG Swift PG279QM', detail: '27" 1440p 240Hz Fast IPS', icon: <Monitor size={20} /> }
  ];

  const pcComponents = [
    { part: 'CPU', name: 'Intel Core i9-14900K', spec: '24 Cores / 32 Threads, up to 6.0 GHz', icon: <Cpu size={18} /> },
    { part: 'GPU', name: 'NVIDIA GeForce RTX 4090', spec: '24GB GDDR6X, DLSS 3.0', icon: <Cpu size={18} /> },
    { part: 'RAM', name: '64GB G.Skill Trident Z5 DDR5', spec: '6000MHz CL30 (2x32GB)', icon: <HardDrive size={18} /> },
    { part: 'Storage', name: '4TB Samsung 990 Pro NVMe', spec: 'PCIe Gen4, up to 7450 MB/s', icon: <HardDrive size={18} /> }
  ];

  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <div className="border-b border-white/5 pb-4">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">Gaming Peripherals</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {peripherals.map((item) => (
            <div key={item.name} className="group p-5 rounded-3xl glass-panel glass-panel-hover flex items-center gap-5 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-purple-500/20 to-transparent" />
              <div className="h-12 w-12 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform duration-300">
                {item.icon}
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">{item.name}</span>
                <h3 className="text-base font-black text-white mt-0.5">{item.model}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{item.detail}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="border-b border-white/5 pb-4">
          <h2 className="text-2xl font-black tracking-tight text-white uppercase">PC Components</h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {pcComponents.map((item) => (
            <div key={item.part} className="group p-5 rounded-3xl glass-panel glass-panel-hover flex items-center gap-5 relative overflow-hidden shadow-xl">
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-linear-to-r from-transparent via-cyan-500/20 to-transparent" />
              <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-105 transition-transform duration-300">
                {item.icon}
              </div>
              <div>
                <span className="text-[10px] font-bold text-zinc-500 tracking-wider uppercase">{item.part}</span>
                <h3 className="text-base font-black text-white mt-0.5">{item.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{item.spec}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
