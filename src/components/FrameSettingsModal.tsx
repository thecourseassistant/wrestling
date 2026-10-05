import React, { useState, useEffect } from 'react';
import {
  CharacterFrameMapping,
  getPlayerFrameMapping,
  getOpponentFrameMapping,
  savePlayerFrameMapping,
  saveOpponentFrameMapping,
  resetFrameMappings
} from '../game/frameMapping';
import redjacketSheetImg from '../assets/images/redjacket_referee_sheet_1791181033322.jpg';
import heavyBrawlerSheetImg from '../assets/images/heavyweight_brawler_spritesheet_1791181703571.jpg';

interface FrameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FrameSettingsModal: React.FC<FrameSettingsModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [activeTab, setActiveTab] = useState<'player' | 'opponent'>('player');
  const [playerMapping, setPlayerMapping] = useState<CharacterFrameMapping>(getPlayerFrameMapping());
  const [opponentMapping, setOpponentMapping] = useState<CharacterFrameMapping>(getOpponentFrameMapping());

  const [selectedMove, setSelectedMove] = useState<keyof CharacterFrameMapping>('idleFrames');
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number>(0);

  useEffect(() => {
    if (isOpen) {
      setPlayerMapping(getPlayerFrameMapping());
      setOpponentMapping(getOpponentFrameMapping());
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === '147852') {
      setIsUnlocked(true);
      setPasswordError(false);
    } else {
      setPasswordError(true);
    }
  };

  const currentMapping = activeTab === 'player' ? playerMapping : opponentMapping;
  const currentSheetImg = activeTab === 'player' ? redjacketSheetImg : heavyBrawlerSheetImg;

  const handleSelectFrame = (frameNum: number) => {
    const updated = { ...currentMapping };
    const val = updated[selectedMove];

    if (Array.isArray(val)) {
      const arr = [...val] as number[];
      arr[selectedMoveIndex] = frameNum;
      (updated as any)[selectedMove] = arr;
    } else {
      (updated as any)[selectedMove] = frameNum;
    }

    if (activeTab === 'player') {
      setPlayerMapping(updated);
      savePlayerFrameMapping(updated);
    } else {
      setOpponentMapping(updated);
      saveOpponentFrameMapping(updated);
    }
  };

  const handleReset = () => {
    resetFrameMappings();
    setPlayerMapping(getPlayerFrameMapping());
    setOpponentMapping(getOpponentFrameMapping());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-2xl bg-slate-900 border-2 border-amber-500/60 rounded-xl shadow-2xl p-6 text-slate-100 overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-arcade font-bold text-amber-400 mb-2 flex items-center gap-2">
          ⚙️ SECRET FRAME MAPPER
        </h2>

        {!isUnlocked ? (
          <form onSubmit={handlePasswordSubmit} className="mt-6 flex flex-col gap-4 max-w-md mx-auto">
            <p className="text-sm text-slate-300">
              Enter developer access password to customize character sprite frame mappings:
            </p>
            <input
              type="password"
              placeholder="Enter Password (147852)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 bg-slate-950 border border-amber-500/40 rounded-lg font-mono text-center text-lg text-amber-300 focus:outline-none focus:border-amber-400"
            />
            {passwordError && (
              <p className="text-xs text-red-400 text-center font-bold">
                ❌ Incorrect Password! Try again.
              </p>
            )}
            <button
              type="submit"
              className="py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-sm font-bold rounded-lg transition-colors"
            >
              UNLOCK SETTINGS
            </button>
          </form>
        ) : (
          <div className="flex flex-col gap-4 mt-4">
            {/* TABS: PLAYER VS OPPONENT */}
            <div className="flex gap-3 border-b border-slate-800 pb-3">
              <button
                onClick={() => setActiveTab('player')}
                className={`px-4 py-2 font-arcade text-xs rounded-lg transition-colors ${
                  activeTab === 'player'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                PLAYER (Red Jacket)
              </button>
              <button
                onClick={() => setActiveTab('opponent')}
                className={`px-4 py-2 font-arcade text-xs rounded-lg transition-colors ${
                  activeTab === 'opponent'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                OPPONENT (Heavy Brawler)
              </button>
            </div>

            {/* MOVE SELECTOR */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
              {[
                { key: 'idleFrames', label: 'IDLE (2 Frames)' },
                { key: 'walkFrames', label: 'WALKING (2 Frames)' },
                { key: 'punchFrames', label: 'PUNCH (2 Frames)' },
                { key: 'kickFrames', label: 'KICK (2 Frames)' },
                { key: 'smackFrames', label: 'FLYING SMACK (2 Frames)' },
                { key: 'dodgeFrames', label: 'GROUND ROLL (3 Frames)' },
                { key: 'hurtFrame', label: 'HURT (1 Frame)' },
                { key: 'downFrame', label: 'DOWN (1 Frame)' },
              ].map((move) => {
                const isSel = selectedMove === move.key;
                return (
                  <button
                    key={move.key}
                    onClick={() => {
                      setSelectedMove(move.key as any);
                      setSelectedMoveIndex(0);
                    }}
                    className={`p-2 rounded border text-left flex flex-col justify-between ${
                      isSel
                        ? 'border-amber-400 bg-amber-500/20 text-amber-300'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span className="font-bold text-[10px]">{move.label}</span>
                    <span className="text-[9px] text-slate-300 font-mono mt-1">
                      Value: {JSON.stringify(currentMapping[move.key as keyof CharacterFrameMapping])}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* IF MULTI-FRAME MOVE, PICK SUB-INDEX */}
            {Array.isArray(currentMapping[selectedMove]) && (
              <div className="flex items-center gap-2 text-xs bg-slate-950 p-2 rounded border border-slate-800">
                <span className="text-slate-400">Select Slot:</span>
                {(currentMapping[selectedMove] as number[]).map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedMoveIndex(idx)}
                    className={`px-3 py-1 rounded text-xs font-mono font-bold ${
                      selectedMoveIndex === idx
                        ? 'bg-amber-500 text-slate-950'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    Slot {idx + 1}
                  </button>
                ))}
              </div>
            )}

            {/* 4x4 VISUAL GRID THUMBNAIL SELECTOR */}
            <div>
              <p className="text-xs text-amber-300 mb-2 font-bold">
                Click any frame (0-15) below to assign to {String(selectedMove)} [Slot {selectedMoveIndex + 1}]:
              </p>
              <div className="grid grid-cols-4 gap-2 bg-slate-950 p-3 rounded-lg border border-slate-800">
                {Array.from({ length: 16 }).map((_, frameNum) => {
                  const col = frameNum % 4;
                  const row = Math.floor(frameNum / 4);

                  return (
                    <button
                      key={frameNum}
                      onClick={() => handleSelectFrame(frameNum)}
                      className="group relative flex flex-col items-center justify-center p-2 rounded border border-slate-800 hover:border-amber-400 bg-slate-900 hover:bg-amber-500/10 transition-colors"
                    >
                      <span className="text-[10px] font-mono text-amber-400 font-bold mb-1">
                        Frame {frameNum}
                      </span>
                      <div
                        className="w-16 h-16 bg-no-repeat rounded overflow-hidden"
                        style={{
                          backgroundImage: `url(${currentSheetImg})`,
                          backgroundSize: '400% 400%',
                          backgroundPosition: `${col * 33.333}% ${row * 33.333}%`,
                        }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-800">
              <button
                onClick={handleReset}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-arcade text-xs rounded-lg"
              >
                Reset Defaults
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-xs font-bold rounded-lg"
              >
                APPLY & CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
