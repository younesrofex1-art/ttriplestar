'use client';

import React, { useMemo } from 'react';
import type { Tournament, TournamentMatch } from '@/lib/types';

interface ResultsSceneProps {
  tournament: Tournament | null;
  matches: TournamentMatch[];
}

export function ResultsScene({ tournament, matches }: ResultsSceneProps) {
  const results = useMemo(() => {
    if (!tournament || tournament.status !== 'COMPLETED' || matches.length === 0) {
      return null;
    }
    
    // Simple heuristic for single elimination:
    // Highest round number is final.
    const maxRound = Math.max(...matches.map(m => m.round_number || 1));
    const finalMatch = matches.find(m => m.round_number === maxRound);
    
    let winner = null;
    let runnerUp = null;
    let thirdPlace = null; // We might not have a 3rd place match, fallback to semi-final losers

    if (finalMatch) {
      if (finalMatch.winner_id === finalMatch.player1_id) {
        winner = finalMatch.player1;
        runnerUp = finalMatch.player2;
      } else if (finalMatch.winner_id === finalMatch.player2_id) {
        winner = finalMatch.player2;
        runnerUp = finalMatch.player1;
      }
    }

    const semiFinals = matches.filter(m => m.round_number === maxRound - 1);
    const semiLosers = semiFinals.map(m => {
      if (m.winner_id === m.player1_id) return m.player2;
      if (m.winner_id === m.player2_id) return m.player1;
      return null;
    }).filter(Boolean);
    
    if (semiLosers.length > 0) {
      thirdPlace = semiLosers[0]; // just picking the first for simplicity
    }

    return { winner, runnerUp, thirdPlace };
  }, [tournament, matches]);

  const scrollToBracket = () => {
    document.getElementById('bracket')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (!tournament || tournament.status !== 'COMPLETED' || !results) {
    return (
      <section id="results" className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#0a0a0a] text-[#ededed]">
        <h2 className="text-4xl md:text-6xl font-display font-bold mb-4">RESULTS</h2>
        <div className="font-mono text-[#666666] tracking-widest mb-8">NOT AVAILABLE</div>
        <div className="font-sans text-sm text-[#ededed]">Tournament results will appear after the event concludes.</div>
      </section>
    );
  }

  const { winner, runnerUp, thirdPlace } = results;

  return (
    <section id="results" className="w-full h-full flex flex-col justify-center px-8 md:px-16 lg:px-24 bg-[#0a0a0a] text-[#ededed] relative">
      <div className="relative z-10 max-w-4xl w-full">
        <div className="font-mono text-[#00ff88] tracking-widest uppercase mb-4 text-sm font-bold">
          TOURNAMENT COMPLETE
        </div>
        <h2 className="text-5xl md:text-7xl font-display font-bold mb-16">{tournament.name}</h2>
        
        <div className="space-y-12 mb-16">
          {winner && (
            <div className="flex items-center space-x-6">
              <div className="font-mono text-[#00ff88] text-6xl md:text-8xl font-bold leading-none w-24 md:w-32">1ST</div>
              <div className="font-display text-4xl md:text-6xl font-bold truncate flex-1">{winner.display_name}</div>
            </div>
          )}
          
          {runnerUp && (
            <div className="flex items-center space-x-6">
              <div className="font-mono text-[#666666] text-4xl md:text-5xl font-bold leading-none w-24 md:w-32">2ND</div>
              <div className="font-display text-2xl md:text-4xl font-bold truncate flex-1 text-[#ededed]">{runnerUp.display_name}</div>
            </div>
          )}
          
          {thirdPlace && (
            <div className="flex items-center space-x-6">
              <div className="font-mono text-[#666666] text-3xl md:text-4xl font-bold leading-none w-24 md:w-32">3RD</div>
              <div className="font-display text-xl md:text-3xl font-bold truncate flex-1 text-[#ededed]">{thirdPlace.display_name}</div>
            </div>
          )}
        </div>
        
        <button 
          onClick={scrollToBracket}
          className="inline-block border border-[#1a1a1a] hover:border-[#ededed] transition-colors px-6 py-3 font-mono text-sm tracking-widest uppercase"
        >
          VIEW FULL BRACKET
        </button>
      </div>
    </section>
  );
}
