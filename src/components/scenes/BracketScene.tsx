'use client';

import React, { useMemo } from 'react';
import type { Tournament, TournamentMatch, TournamentRound } from '@/lib/types';

interface BracketSceneProps {
  tournament: Tournament | null;
  matches: TournamentMatch[];
  rounds: TournamentRound[];
}

function BracketMatch({ match }: { match: TournamentMatch }) {
  const p1Winner = match.winner_id === match.player1_id && match.player1_id != null;
  const p2Winner = match.winner_id === match.player2_id && match.player2_id != null;
  const isLive = match.status === 'live';

  return (
    <div className={`relative flex flex-col w-64 border ${isLive ? 'border-[#ff3333]' : 'border-[#1a1a1a]'} bg-[#111111] overflow-hidden`}>
      {isLive && (
        <div className="absolute top-0 right-0 w-full h-0.5 bg-[#ff3333] animate-pulse" />
      )}
      
      {/* Player 1 */}
      <div className={`flex justify-between items-center px-3 py-2 border-b border-[#1a1a1a] ${p1Winner ? 'bg-[#00ff88]/10' : ''}`}>
        <span className={`font-sans text-sm truncate pr-2 ${p1Winner ? 'text-[#00ff88]' : 'text-[#ededed]'}`}>
          {match.player1?.display_name || 'TBD'}
        </span>
        <span className={`font-mono text-sm font-bold ${p1Winner ? 'text-[#00ff88]' : 'text-[#666666]'}`}>
          {match.player1_score ?? '-'}
        </span>
      </div>
      
      {/* Player 2 */}
      <div className={`flex justify-between items-center px-3 py-2 ${p2Winner ? 'bg-[#00ff88]/10' : ''}`}>
        <span className={`font-sans text-sm truncate pr-2 ${p2Winner ? 'text-[#00ff88]' : 'text-[#ededed]'}`}>
          {match.player2?.display_name || 'TBD'}
        </span>
        <span className={`font-mono text-sm font-bold ${p2Winner ? 'text-[#00ff88]' : 'text-[#666666]'}`}>
          {match.player2_score ?? '-'}
        </span>
      </div>
    </div>
  );
}

export function BracketScene({ tournament, matches, rounds }: BracketSceneProps) {
  const matchesByRound = useMemo(() => {
    const grouped = new Map<number, TournamentMatch[]>();
    matches.forEach(m => {
      const round = m.round_number || 1;
      if (!grouped.has(round)) {
        grouped.set(round, []);
      }
      grouped.get(round)!.push(m);
    });
    
    return Array.from(grouped.entries()).sort(([a], [b]) => a - b);
  }, [matches]);

  if (!tournament || matches.length === 0) {
    return (
      <section id="bracket" className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#0a0a0a] text-[#ededed]">
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">BRACKET</h2>
        <div className="font-mono text-[#666666] tracking-widest mb-8">NOT AVAILABLE</div>
        <div className="font-sans text-sm text-[#ededed]">Tournament bracket will appear when matches are generated.</div>
      </section>
    );
  }

  return (
    <section id="bracket" className="w-full h-full flex flex-col pt-24 pb-12 px-8 md:px-16 lg:px-24 bg-[#0a0a0a] text-[#ededed]">
      <div className="mb-8 shrink-0">
        <h2 className="text-4xl md:text-5xl font-display font-bold">{tournament.name}</h2>
        <div className="font-mono text-[#666666] tracking-widest uppercase text-sm mt-1">OFFICIAL BRACKET</div>
      </div>
      
      <div className="flex-1 overflow-x-auto overflow-y-auto min-h-0 relative">
        <div className="flex flex-row space-x-12 min-w-max h-full pb-8 items-center">
          {matchesByRound.map(([roundNumber, roundMatches]) => {
            const roundInfo = rounds.find(r => r.round_number === roundNumber);
            const roundName = roundInfo?.name || `ROUND ${roundNumber}`;
            
            return (
              <div key={roundNumber} className="flex flex-col space-y-8 h-full justify-around relative">
                <div className="absolute -top-10 left-0 w-full text-center font-mono text-[#666666] text-xs font-bold tracking-widest uppercase">
                  {roundName}
                </div>
                
                {roundMatches.sort((a, b) => (a.match_number || 0) - (b.match_number || 0)).map(match => (
                  <div key={match.id} className="relative z-10">
                    <BracketMatch match={match} />
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
