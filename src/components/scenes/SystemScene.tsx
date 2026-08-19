'use client';

import React from 'react';

export function SystemScene() {
  return (
    <section id="system" className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#0a0a0a] text-[#ededed] relative overflow-hidden">
      {/* Grid pattern background */}
      <div 
        className="absolute inset-0 opacity-20 pointer-events-none" 
        style={{
          backgroundImage: 'repeating-linear-gradient(to right, transparent, transparent 49px, #1a1a1a 49px, #1a1a1a 50px), repeating-linear-gradient(to bottom, transparent, transparent 49px, #1a1a1a 49px, #1a1a1a 50px)'
        }} 
      />
      
      <div className="relative z-10 max-w-3xl">
        <div className="mb-8">
          <h1 className="text-6xl md:text-8xl font-display font-bold tracking-tight mb-2">TRIPLE STARS</h1>
          <h2 className="text-2xl md:text-4xl font-display text-[#666666] mb-1">GAMING STATION</h2>
          <h3 className="text-sm md:text-base font-mono text-[#666666] tracking-widest">TOURNAMENT SYSTEM</h3>
        </div>
        
        <div className="h-px w-full bg-[#1a1a1a] my-8" />
        
        <div className="mb-12">
          <div className="text-xs font-mono text-[#666666] mb-2">SYSTEM STATUS</div>
          <div className="flex items-center space-x-3">
            <div className="w-3 h-3 rounded-full bg-[#00ff88] animate-pulse" />
            <span className="font-mono text-[#00ff88] tracking-widest text-sm">ONLINE</span>
          </div>
        </div>
        
        <button 
          onClick={() => {
            document.getElementById('tournament')?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-flex items-center border border-[#1a1a1a] hover:border-[#00ff88] hover:text-[#00ff88] transition-colors px-6 py-3 font-mono text-sm tracking-widest uppercase"
        >
          ENTER SYSTEM
        </button>
      </div>
    </section>
  );
}
