'use client';

import React from 'react';
import type { Tournament, TournamentMatch, Stream } from '@/lib/types';

interface LiveSceneProps {
  tournament: Tournament | null;
  liveMatch: TournamentMatch | null;
  liveStream: Stream | null;
}

export function LiveScene({ tournament, liveMatch, liveStream }: LiveSceneProps) {
  const scrollToBracket = () => {
    document.getElementById('bracket')?.scrollIntoView({ behavior: 'smooth' });
  };

  const renderContent = () => {
    if (!tournament) {
      return (
        <div>
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">LIVE TOURNAMENT</h2>
          <div className="font-mono text-[#666666] tracking-widest mb-8">NOT AVAILABLE</div>
          <div className="font-mono text-sm uppercase">NO ACTIVE TOURNAMENT</div>
        </div>
      );
    }

    if (!liveMatch) {
      return (
        <div>
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-3 h-3 rounded-full bg-[#ff3333] animate-pulse" />
            <span className="font-mono text-[#ff3333] tracking-widest text-sm">LIVE</span>
          </div>
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">{tournament.name}</h2>
          <div className="font-mono text-lg mb-2">NO MATCH IN PROGRESS</div>
          <div className="font-mono text-[#666666] tracking-widest text-sm">CHECK BACK SHORTLY</div>
        </div>
      );
    }

    return (
      <div className="w-full max-w-4xl">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-3 h-3 rounded-full bg-[#ff3333] animate-pulse" />
          <span className="font-mono text-[#ff3333] tracking-widest text-sm">LIVE NOW</span>
        </div>
        
        <div className="mb-8">
          <h2 className="text-2xl md:text-4xl font-display text-[#ededed] mb-1">{tournament.name}</h2>
          <div className="font-mono text-[#666666] tracking-widest text-sm uppercase">MATCH {liveMatch.match_number}</div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-8 items-center mb-12">
          {/* Player 1 */}
          <div className="flex flex-col">
            <div className="text-3xl md:text-5xl font-display font-bold mb-2 truncate">
              {liveMatch.player1?.display_name || 'TBD'}
            </div>
            <div className="text-5xl md:text-7xl font-mono font-bold text-[#ededed]">
              {liveMatch.player1_score ?? 0}
            </div>
          </div>
          
          {/* VS */}
          <div className="font-mono text-2xl text-[#666666] self-center py-4 md:py-0">
            VS
          </div>
          
          {/* Player 2 */}
          <div className="flex flex-col md:items-end md:text-right">
            <div className="text-3xl md:text-5xl font-display font-bold mb-2 truncate">
              {liveMatch.player2?.display_name || 'TBD'}
            </div>
            <div className="text-5xl md:text-7xl font-mono font-bold text-[#ededed]">
              {liveMatch.player2_score ?? 0}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4">
          {liveStream && (
            <a 
              href={liveStream.stream_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-block border border-[#ff3333] text-[#ff3333] hover:bg-[#ff3333] hover:text-white transition-colors px-6 py-3 font-mono text-sm tracking-widest uppercase"
            >
              WATCH LIVE
            </a>
          )}
          <button 
            onClick={scrollToBracket}
            className="inline-block border border-[#1a1a1a] hover:border-[#ededed] transition-colors px-6 py-3 font-mono text-sm tracking-widest uppercase"
          >
            VIEW BRACKET
          </button>
        </div>
      </div>
    );
  };

  return (
    <section id="live" className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#0a0a0a] text-[#ededed] relative">
      <div className="relative z-10 w-full">
        {renderContent()}
      </div>
    </section>
  );
}
