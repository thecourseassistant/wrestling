import React from 'react';
import { ShieldAlert, Zap, Flame, Trophy } from 'lucide-react';

interface RoundIntroModalProps {
  isOpen: boolean;
  roundNumber: number;
  questionsAnsweredCount: number;
  totalVocabularyCount: number;
  reasonMessage: string;
  onStartRound: () => void;
}

export const RoundIntroModal: React.FC<RoundIntroModalProps> = ({
  isOpen,
  roundNumber,
  questionsAnsweredCount,
  totalVocabularyCount,
  reasonMessage,
  onStartRound
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900 border-4 border-amber-400 rounded-2xl p-6 shadow-2xl text-center relative animate-fadeIn">
        {/* ROUND BANNER */}
        <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400 text-amber-300 font-arcade text-xs px-4 py-1.5 rounded-full mb-3 shadow">
          <Flame className="w-4 h-4 text-amber-400 animate-bounce" />
          CHAMPIONSHIP MATCH
        </div>

        <h1 className="font-teko text-6xl font-black text-amber-400 tracking-wider uppercase leading-none mb-1 drop-shadow-lg">
          ROUND {roundNumber}
        </h1>

        <p className="font-arcade text-cyan-300 text-xs uppercase mb-4 tracking-wide">
          {reasonMessage}
        </p>

        {/* PROGRESS METRICS BOX */}
        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-5 space-y-2">
          <div className="flex items-center justify-between text-xs font-sans-body">
            <span className="text-slate-400">Vocabulary Questions:</span>
            <span className="font-arcade text-emerald-400 font-bold">
              {questionsAnsweredCount} / {totalVocabularyCount} Completed
            </span>
          </div>

          <div className="w-full bg-slate-900 h-2.5 rounded-full overflow-hidden border border-slate-800">
            <div
              className="bg-emerald-500 h-full transition-all duration-500"
              style={{ width: `${(questionsAnsweredCount / totalVocabularyCount) * 100}%` }}
            />
          </div>

          <p className="text-[11px] text-slate-400 italic pt-1">
            Dodge opponent strikes to build Super Gauge & restore HP on correct answers!
          </p>
        </div>

        {/* FIGHT BUTTON */}
        <button
          onClick={onStartRound}
          className="w-full bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-arcade text-sm py-4 rounded-xl font-bold shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 border-2 border-yellow-200"
        >
          <Zap className="w-5 h-5 fill-current text-slate-950" />
          READY... FIGHT ROUND {roundNumber}!
        </button>
      </div>
    </div>
  );
};
