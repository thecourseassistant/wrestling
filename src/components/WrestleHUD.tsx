import React from 'react';
import { WrestlingMatchEngine } from '../game/wrestlingEngine';

interface WrestleHUDProps {
  engine: WrestlingMatchEngine;
}

export const WrestleHUD: React.FC<WrestleHUDProps> = ({ engine }) => {
  const player = engine.player;
  const opponent = engine.opponent;

  const playerHpPct = Math.max(0, Math.min(100, player.hp));
  const opponentHpPct = Math.max(0, Math.min(100, (opponent.hp / 150) * 100)); // Normalized to 150 HP

  const isOpponentPhase2 = engine.opponentLifePhase === 2;

  return (
    <div className="absolute top-0 left-0 right-0 p-3 md:p-5 pointer-events-none z-10 flex flex-col justify-between h-full">
      {/* TOP HUD: PLAYER VS OPPONENT HEALTH BARS */}
      <div className="flex items-center justify-between gap-4 max-w-5xl mx-auto w-full">
        {/* PLAYER HUD (LEFT) */}
        <div className="flex flex-col gap-1.5 flex-1 max-w-[340px]">
          <div className="flex items-center gap-3 bg-slate-900/90 border-2 border-amber-500/60 p-2.5 rounded-xl shadow-2xl backdrop-blur-md">
            <div className="relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border-2 border-amber-400 bg-slate-950 shrink-0">
              <img
                src={player.wrestlerData.avatarImage}
                alt={player.wrestlerData.name}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="flex flex-col flex-1">
              <div className="flex justify-between items-center mb-1">
                <span className="font-arcade text-[10px] md:text-xs font-bold text-amber-400 truncate">
                  {player.wrestlerData.name}
                </span>
                <span className="font-mono text-xs font-bold text-emerald-400">
                  {Math.ceil(playerHpPct)} HP
                </span>
              </div>

              {/* PLAYER HP BAR */}
              <div className="w-full h-3.5 bg-slate-950 rounded-full border border-slate-700 overflow-hidden p-0.5">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-200"
                  style={{ width: `${playerHpPct}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* VS LOGO & ROUND NUMBER */}
        <div className="hidden sm:flex flex-col items-center justify-center shrink-0">
          <div className="bg-gradient-to-b from-amber-400 to-yellow-600 text-slate-950 font-arcade text-xs font-extrabold px-3 py-1 rounded-full shadow-lg border border-yellow-200">
            ROUND {engine.roundNumber}
          </div>
        </div>

        {/* OPPONENT HUD (RIGHT - 2 LIFE BARS) */}
        <div className="flex items-center gap-3 bg-slate-900/90 border-2 border-amber-500/60 p-2.5 rounded-xl shadow-2xl backdrop-blur-md flex-1 max-w-[340px]">
          <div className="flex flex-col flex-1 text-right">
            <div className="flex justify-between items-center mb-1">
              <span className={`font-arcade text-[9px] px-1.5 py-0.5 rounded font-bold ${isOpponentPhase2 ? 'bg-purple-600 text-purple-100' : 'bg-red-900/80 text-amber-300'}`}>
                {isOpponentPhase2 ? 'LIFE 2 RAGE' : 'LIFE 1'}
              </span>
              <span className="font-arcade text-[10px] md:text-xs font-bold text-amber-400 truncate">
                {opponent.wrestlerData.name}
              </span>
            </div>

            {/* OPPONENT HP BAR WITH COLOR SHIFT FOR PHASE 2 */}
            <div className="w-full h-3.5 bg-slate-950 rounded-full border border-slate-700 overflow-hidden p-0.5">
              <div
                className={`h-full rounded-full transition-all duration-200 ${
                  isOpponentPhase2
                    ? 'bg-gradient-to-r from-purple-600 via-fuchsia-500 to-pink-500 shadow-purple-500/50 shadow-lg'
                    : 'bg-gradient-to-r from-red-600 to-amber-500'
                }`}
                style={{ width: `${opponentHpPct}%` }}
              />
            </div>
          </div>

          <div className={`relative w-12 h-12 md:w-14 md:h-14 rounded-lg overflow-hidden border-2 bg-slate-950 shrink-0 ${isOpponentPhase2 ? 'border-purple-400 ring-2 ring-purple-500/50' : 'border-red-500'}`}>
            <img
              src={opponent.wrestlerData.avatarImage}
              alt={opponent.wrestlerData.name}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
};
