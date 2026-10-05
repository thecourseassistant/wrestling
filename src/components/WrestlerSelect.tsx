import React, { useState } from 'react';
import { WRESTLER_ROSTER, Wrestler } from '../data/wrestlers';
import { Trophy, ChevronRight } from 'lucide-react';

interface WrestlerSelectProps {
  onSelectComplete: (playerWrestler: Wrestler, opponentWrestler: Wrestler) => void;
  onBackToMenu: () => void;
}

export const WrestlerSelect: React.FC<WrestlerSelectProps> = ({
  onSelectComplete,
  onBackToMenu
}) => {
  const [selectedPlayer, setSelectedPlayer] = useState<Wrestler>(WRESTLER_ROSTER[0]);
  const [selectedOpponent, setSelectedOpponent] = useState<Wrestler>(WRESTLER_ROSTER[1]);
  const [selectionStep, setSelectionStep] = useState<'PLAYER' | 'OPPONENT'>('PLAYER');

  const handleSelectWrestler = (w: Wrestler) => {
    if (selectionStep === 'PLAYER') {
      setSelectedPlayer(w);
      const other = WRESTLER_ROSTER.find(item => item.id !== w.id) || WRESTLER_ROSTER[1];
      setSelectedOpponent(other);
      setSelectionStep('OPPONENT');
    } else {
      setSelectedOpponent(w);
    }
  };

  const handleStartMatch = () => {
    onSelectComplete(selectedPlayer, selectedOpponent);
  };

  return (
    <div className="relative w-full h-full bg-slate-950 text-slate-100 flex flex-col justify-between p-3 md:p-6 overflow-y-auto">
      {/* HEADER BANNER */}
      <div className="text-center mb-2">
        <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400 text-amber-300 font-arcade text-xs px-3 py-1 rounded-full mb-1">
          <Trophy className="w-4 h-4 text-amber-400" />
          WWF WRESTLEFEST ROSTER SELECT
        </div>
        <h1 className="font-teko text-3xl md:text-5xl font-black text-amber-400 tracking-wider uppercase drop-shadow-md">
          {selectionStep === 'PLAYER' ? 'SELECT YOUR WRESTLER HERO' : 'SELECT YOUR OPPONENT'}
        </h1>
      </div>

      {/* MATCHUP VERSUS CARD SHOWCASE */}
      <div className="grid grid-cols-12 gap-3 items-center max-w-4xl mx-auto w-full mb-3">
        {/* P1 CARD */}
        <div className={`col-span-5 bg-slate-900 border-2 rounded-2xl p-3 md:p-4 shadow-2xl transition-all flex items-center gap-3 ${
          selectionStep === 'PLAYER' ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-slate-800'
        }`}>
          {selectedPlayer.avatarImage && (
            <img
              src={selectedPlayer.avatarImage}
              alt={selectedPlayer.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border-2 border-amber-400 shrink-0 shadow-lg"
            />
          )}
          <div className="overflow-hidden">
            <span className="font-arcade text-[10px] text-amber-400 block mb-0.5">P1 HERO</span>
            <h3 className="font-teko text-2xl font-bold text-amber-300 uppercase leading-none truncate">
              {selectedPlayer.name}
            </h3>
            <p className="font-sans-body text-[11px] text-slate-400 italic truncate mb-1">
              "{selectedPlayer.nickname}"
            </p>
            <div className="text-[10px] font-arcade text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded truncate">
              {selectedPlayer.finisherName}
            </div>
          </div>
        </div>

        {/* VS ICON */}
        <div className="col-span-2 text-center">
          <span className="font-teko text-4xl font-black text-amber-400 tracking-widest block">VS</span>
        </div>

        {/* OPPONENT CARD */}
        <div className={`col-span-5 bg-slate-900 border-2 rounded-2xl p-3 md:p-4 shadow-2xl transition-all flex items-center justify-end gap-3 text-right ${
          selectionStep === 'OPPONENT' ? 'border-red-400 ring-2 ring-red-400/50' : 'border-slate-800'
        }`}>
          <div className="overflow-hidden">
            <span className="font-arcade text-[10px] text-red-400 block mb-0.5">CPU OPPONENT</span>
            <h3 className="font-teko text-2xl font-bold text-red-400 uppercase leading-none truncate">
              {selectedOpponent.name}
            </h3>
            <p className="font-sans-body text-[11px] text-slate-400 italic truncate mb-1">
              "{selectedOpponent.nickname}"
            </p>
            <div className="text-[10px] font-arcade text-red-300 bg-red-950/60 border border-red-800/80 px-2 py-0.5 rounded truncate">
              {selectedOpponent.finisherName}
            </div>
          </div>
          {selectedOpponent.avatarImage && (
            <img
              src={selectedOpponent.avatarImage}
              alt={selectedOpponent.name}
              className="w-16 h-16 md:w-20 md:h-20 rounded-xl object-cover border-2 border-red-400 shrink-0 shadow-lg"
            />
          )}
        </div>
      </div>

      {/* ROSTER GRID SELECTION */}
      <div className="max-w-4xl mx-auto w-full grid grid-cols-2 md:grid-cols-3 gap-3 mb-3">
        {WRESTLER_ROSTER.map(w => {
          const isPlayerSel = selectedPlayer.id === w.id;
          const isOpponentSel = selectedOpponent.id === w.id;

          return (
            <button
              key={w.id}
              onClick={() => handleSelectWrestler(w)}
              className={`p-2.5 rounded-xl border-2 text-left transition-all duration-150 flex items-center justify-between gap-2 shadow-lg ${
                isPlayerSel
                  ? 'bg-amber-950/80 border-amber-400 ring-2 ring-amber-400/50'
                  : isOpponentSel
                  ? 'bg-red-950/80 border-red-400 ring-2 ring-red-400/50'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-600'
              }`}
            >
              <div className="flex items-center gap-2 overflow-hidden">
                {w.avatarImage && (
                  <img
                    src={w.avatarImage}
                    alt={w.name}
                    className="w-10 h-10 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                )}
                <div className="overflow-hidden">
                  <h4 className="font-teko text-xl font-bold text-slate-100 uppercase leading-none truncate">
                    {w.name}
                  </h4>
                  <p className="font-sans-body text-[10px] text-slate-400 italic truncate mt-0.5">
                    {w.finisherName}
                  </p>
                </div>
              </div>

              {isPlayerSel && <span className="font-arcade text-[10px] text-amber-400 font-bold shrink-0">P1</span>}
              {isOpponentSel && <span className="font-arcade text-[10px] text-red-400 font-bold shrink-0">CPU</span>}
            </button>
          );
        })}
      </div>

      {/* NAVIGATION FOOTER */}
      <div className="flex items-center justify-between max-w-4xl mx-auto w-full border-t border-slate-800 pt-3">
        <button
          onClick={selectionStep === 'OPPONENT' ? () => setSelectionStep('PLAYER') : onBackToMenu}
          className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-arcade text-xs px-4 py-2.5 rounded-xl border border-slate-700 transition"
        >
          {selectionStep === 'OPPONENT' ? '◄ CHANGE P1' : 'MAIN MENU'}
        </button>

        <button
          onClick={handleStartMatch}
          className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-arcade text-xs px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl active:scale-95 transition"
        >
          START ARENA MATCH
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
