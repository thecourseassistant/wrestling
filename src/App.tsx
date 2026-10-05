import React, { useState, useEffect, useRef } from 'react';
import { WrestlingMatchEngine } from './game/wrestlingEngine';
import { WRESTLER_ROSTER, Wrestler } from './data/wrestlers';
import { DEFAULT_VOCABULARY, WordItem } from './data/words';
import { sound } from './utils/audio';

import { WrestleCanvas } from './components/WrestleCanvas';
import { WrestleHUD } from './components/WrestleHUD';
import { VocabOverlay } from './components/VocabOverlay';
import { TouchControls } from './components/TouchControls';
import { OrientationBanner } from './components/OrientationBanner';
import { MatchResultsModal } from './components/MatchResultsModal';
import { RoundIntroModal } from './components/RoundIntroModal';
import { TeacherSettingsModal } from './components/TeacherSettingsModal';
import { GitHubModal } from './components/GitHubModal';

import { Play, Settings, Github, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { MatchResultData } from './services/googleSheets';

type GameState = 'TITLE_MENU' | 'PLAYING' | 'MATCH_OVER';

export default function App() {
  const [gameState, setGameState] = useState<GameState>('TITLE_MENU');
  
  const playerWrestler: Wrestler = WRESTLER_ROSTER[0];
  const opponentWrestler: Wrestler = WRESTLER_ROSTER[1];

  const [showScanlines, setShowScanlines] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState<boolean>(false);

  const engineRef = useRef<WrestlingMatchEngine | null>(null);
  const [, setTick] = useState<number>(0);
  const [vocabIndex, setVocabIndex] = useState<number>(0);
  const [currentWord, setCurrentWord] = useState<WordItem>(DEFAULT_VOCABULARY[0]);
  const [showVocabOverlay, setShowVocabOverlay] = useState<boolean>(false);

  const [matchResultData, setMatchResultData] = useState<MatchResultData | null>(null);

  const startMatch = () => {
    engineRef.current = new WrestlingMatchEngine(
      playerWrestler,
      opponentWrestler,
      () => {
        setShowVocabOverlay(true);
      },
      (type: string) => {
        if (type === 'punch') sound.playPunchSound();
        if (type === 'thud') sound.playMatThudSound();
        if (type === 'rope') sound.playRopeBounceSound();
        if (type === 'bell') sound.playRingBellSound();
        if (type === 'super_full') sound.playSuperGaugeFullSound();
        if (type === 'correct') sound.playCorrectAnswerSound();
        if (type === 'incorrect') sound.playIncorrectAnswerSound();
      }
    );

    setVocabIndex(0);
    setCurrentWord(DEFAULT_VOCABULARY[0]);
    setShowVocabOverlay(false);
    setGameState('PLAYING');

    sound.startBGM();
  };

  useEffect(() => {
    let animId: number;
    let lastTime = performance.now();

    const loop = (time: number) => {
      const dt = (time - lastTime) / 1000;
      lastTime = time;

      if (gameState === 'PLAYING' && engineRef.current) {
        engineRef.current.update(dt);

        if (engineRef.current.isMatchOver) {
          sound.stopBGM();

          const totalQ = engineRef.current.totalVocabularyCount;
          const correctQ = engineRef.current.correctCount;
          const scorePct = Math.round((correctQ / (totalQ || 1)) * 100);

          setMatchResultData({
            studentName: playerWrestler.name,
            score: scorePct,
            timeSpentSeconds: Math.round(engineRef.current.matchTimeSpent),
            correctAnswersCount: correctQ,
            incorrectAnswersCount: engineRef.current.incorrectCount,
            matchResult: engineRef.current.matchResultType === 'KNOCK OUT WIN' ? 'WIN' : 'LOSS',
            wrestlerUsed: playerWrestler.name,
            opponentDefeated: opponentWrestler.name,
            timestamp: new Date().toISOString()
          });

          setGameState('MATCH_OVER');
        }

        setTick((t) => t + 1);
      }

      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [gameState]);

  const handleJoystickMove = (move: { x: number; y: number }) => {
    if (engineRef.current) {
      engineRef.current.handleJoystickMove(move.x, move.y);
    }
  };

  const handleButtonPress = (action: 'dodge' | 'smack' | 'pin', isPressed: boolean) => {
    if (engineRef.current) {
      engineRef.current.handleButtonPress(action, isPressed);
    }
  };

  const handleVocabAnswerSubmit = (isCorrect: boolean, chosenWord: string) => {
    if (!engineRef.current) return;

    if (isCorrect) {
      engineRef.current.executeCorrectVocabCombo(currentWord.word);
    } else {
      engineRef.current.executeIncorrectVocabCombo();
    }

    setShowVocabOverlay(false);

    const nextIdx = (vocabIndex + 1) % DEFAULT_VOCABULARY.length;
    setVocabIndex(nextIdx);
    setCurrentWord(DEFAULT_VOCABULARY[nextIdx]);
  };

  const toggleMute = () => {
    const newMuteState = !isMuted;
    setIsMuted(newMuteState);
    sound.setMuted(newMuteState);
  };

  return (
    <div className="relative w-full h-full bg-slate-950 text-slate-100 overflow-hidden font-sans select-none">
      <OrientationBanner />

      {/* TITLE MENU (CLEAN & STREAMLINED) */}
      {gameState === 'TITLE_MENU' && (
        <div className="relative w-full h-full flex flex-col items-center justify-between p-4 md:p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 overflow-y-auto">
          <div className="w-full max-w-4xl flex items-center justify-between">
            <span className="font-arcade text-xs text-amber-400 bg-amber-500/10 border border-amber-400/40 px-3 py-1 rounded-full">
              ARCADE VOCABULARY EDITION
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={toggleMute}
                className="p-2.5 bg-slate-900 border border-slate-700 hover:border-amber-400 rounded-xl text-slate-300 hover:text-amber-400 transition"
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4 text-emerald-400" />}
              </button>

              <button
                onClick={() => setIsGitHubOpen(true)}
                className="p-2.5 bg-slate-900 border border-slate-700 hover:border-amber-400 rounded-xl text-slate-300 hover:text-amber-400 transition"
              >
                <Github className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2.5 bg-slate-900 border border-amber-500/40 hover:border-amber-400 rounded-xl text-amber-400 hover:text-amber-300 transition"
                title="Teacher & Frame Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* MAIN HERO TITLE */}
          <div className="flex flex-col items-center text-center my-auto max-w-2xl">
            <div className="relative mb-6">
              <h1 className="text-4xl md:text-6xl font-black font-arcade text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)] tracking-tight">
                WRESTLEFEST
              </h1>
              <p className="text-xs md:text-sm font-arcade text-amber-300 tracking-widest uppercase mt-2">
                VOCABULARY CHAMPIONSHIP
              </p>
            </div>

            {/* PRESS START BUTTON */}
            <button
              onClick={startMatch}
              className="group relative px-10 py-5 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-500 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-arcade text-base md:text-xl font-black rounded-2xl shadow-[0_10px_30px_rgba(245,158,11,0.4)] hover:shadow-[0_15px_40px_rgba(245,158,11,0.6)] active:scale-95 transition-all flex items-center gap-3 border-2 border-yellow-200"
            >
              <Play className="w-6 h-6 fill-slate-950" />
              <span>PRESS START</span>
            </button>
          </div>

          <div className="text-slate-500 text-[10px] font-mono">
            © 2026 AI Studio Arcade Vocabulary Championship
          </div>
        </div>
      )}

      {/* GAMEPLAY CANVAS & HUD */}
      {gameState === 'PLAYING' && engineRef.current && (
        <div className="relative w-full h-full">
          <WrestleHUD engine={engineRef.current} />

          <WrestleCanvas
            engine={engineRef.current}
            showScanlines={showScanlines}
          />

          <TouchControls
            onJoystickMove={handleJoystickMove}
            onButtonPress={handleButtonPress}
          />

          {showVocabOverlay && (
            <VocabOverlay
              currentWord={currentWord}
              allWords={DEFAULT_VOCABULARY}
              onAnswerSubmit={handleVocabAnswerSubmit}
            />
          )}

          <RoundIntroModal
            isOpen={engineRef.current.isRoundIntroActive}
            roundNumber={engineRef.current.roundNumber}
            questionsAnsweredCount={engineRef.current.questionsAnsweredCount}
            totalVocabularyCount={engineRef.current.totalVocabularyCount}
            reasonMessage={engineRef.current.roundReasonMessage}
            onStartRound={() => engineRef.current?.startNextRound()}
          />
        </div>
      )}

      {/* MATCH OVER / REPORT CARD */}
      {gameState === 'MATCH_OVER' && matchResultData && (
        <MatchResultsModal
          resultData={matchResultData}
          onPlayAgain={startMatch}
          onReturnToMenu={() => setGameState('TITLE_MENU')}
        />
      )}

      <TeacherSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />

      <GitHubModal
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
      />
    </div>
  );
}
