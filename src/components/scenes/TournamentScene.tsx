'use client';

import React from 'react';
import type { Tournament, PublicTournamentState } from '@/lib/types';

interface TournamentSceneProps {
  tournament: Tournament | null;
  publicState: PublicTournamentState;
  registrationCount: number;
  onRegister?: () => void;
}

export function TournamentScene({ tournament, publicState, registrationCount, onRegister }: TournamentSceneProps) {
  const renderContent = () => {
    if (publicState === 'NO_EVENT' || !tournament) {
      return (
        <div>
          <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">NO OPEN TOURNAMENT</h2>
          <div className="font-mono text-[#666666] uppercase tracking-widest text-sm">
            <div>NEXT EVENT</div>
            <div>COMING SOON</div>
          </div>
        </div>
      );
    }

    if (publicState === 'REGISTRATION_OPEN') {
      return (
        <div>
          <div className="font-mono text-[#666666] uppercase tracking-widest text-sm mb-4">NEXT EVENT</div>
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-4">{tournament.name}</h2>
          <div className="space-y-1 mb-8 font-mono text-sm uppercase text-[#ededed]">
            <div>{tournament.game?.name || 'UNKNOWN GAME'}</div>
            <div>{tournament.max_players} PLAYERS</div>
            {tournament.entry_fee_mad && <div>{tournament.entry_fee_mad} MAD ENTRY</div>}
          </div>
          
          <div className="mb-8">
            <div className="font-mono text-[#00ff88] font-bold mb-2 tracking-widest">REGISTRATION OPEN</div>
            <div className="font-mono text-sm text-[#ededed]">
              {registrationCount} / {tournament.max_players} PLAYERS
            </div>
          </div>
          
          <button 
            onClick={onRegister}
            className="inline-block border border-[#00ff88] text-[#00ff88] hover:bg-[#00ff88] hover:text-[#0a0a0a] transition-colors px-8 py-4 font-mono text-sm tracking-widest uppercase"
          >
            REGISTER
          </button>
        </div>
      );
    }

    if (publicState === 'REGISTRATION_CLOSED') {
      return (
        <div>
          <h2 className="text-5xl md:text-7xl font-display font-bold mb-4">{tournament.name}</h2>
          <div className="font-mono text-[#666666] tracking-widest uppercase mb-4">REGISTRATION CLOSED</div>
          <div className="font-mono text-[#ededed]">{registrationCount} PLAYERS REGISTERED</div>
        </div>
      );
    }

    return (
      <div>
        <h2 className="text-5xl md:text-7xl font-display font-bold mb-4">{tournament.name}</h2>
        <div className="font-mono text-[#00ff88] tracking-widest uppercase mb-4">EVENT {publicState}</div>
        <button 
          onClick={() => {
            const id = publicState === 'LIVE' ? 'live' : 'results';
            document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="inline-block border border-[#1a1a1a] hover:border-[#00ff88] hover:text-[#00ff88] transition-colors px-6 py-3 font-mono text-sm tracking-widest uppercase"
        >
          VIEW {publicState === 'LIVE' ? 'LIVE MATCHES' : 'RESULTS'}
        </button>
      </div>
    );
  };

  return (
    <section id="tournament" className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#0a0a0a] text-[#ededed] relative">
      <div className="relative z-10 max-w-3xl">
        {renderContent()}
      </div>
    </section>
  );
}
