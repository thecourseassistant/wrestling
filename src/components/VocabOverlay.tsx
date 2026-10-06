import React, { useState, useEffect } from 'react';
import { WordItem, getRandomWordChoices } from '../data/words';
import { CheckCircle2, XCircle } from 'lucide-react';

interface VocabOverlayProps {
  currentWord: WordItem;
  allWords: WordItem[];
  onAnswerSubmit: (isCorrect: boolean, chosenWord: string) => void;
}

export const VocabOverlay: React.FC<VocabOverlayProps> = ({
  currentWord,
  allWords,
  onAnswerSubmit
}) => {
  const [choices, setChoices] = useState<string[]>([]);
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(12);

  useEffect(() => {
    const generatedChoices = getRandomWordChoices(currentWord, allWords, 4);
    setChoices(generatedChoices);
    setSelectedWord(null);
    setIsAnswered(false);
    setIsCorrect(null);
    setTimeLeft(12);
  }, [currentWord, allWords]);

  useEffect(() => {
    if (isAnswered) return;
    if (timeLeft <= 0) {
      handleChoice('TIME_EXPIRED');
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, isAnswered]);

  const handleChoice = (word: string) => {
    if (isAnswered) return;

    setIsAnswered(true);
    setSelectedWord(word);

    const correct = word.toLowerCase() === currentWord.word.toLowerCase();
    setIsCorrect(correct);

    setTimeout(() => {
      onAnswerSubmit(correct, word);
    }, 1200);
  };

  return (
    <div className="absolute inset-0 z-50 flex flex-col items-center justify-center p-3 md:p-6 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      {/* DEFINITION DISPLAY BOX (Without "DEFINITION ON THE TOP SCREEN" label) */}
      <div className="w-full max-w-2xl bg-slate-900 border-2 border-amber-400/80 rounded-2xl p-5 md:p-6 shadow-2xl mb-4 text-center relative overflow-hidden">
        {/* Timer Bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-800">
          <div
            className="h-full bg-amber-400 transition-all duration-1000"
            style={{ width: `${(timeLeft / 12) * 100}%` }}
          />
        </div>

        <h2 className="font-sans-body text-xl md:text-3xl font-black text-amber-300 tracking-wide italic leading-relaxed py-2">
          "{currentWord.definition}"
        </h2>
      </div>

      {/* WORD CHOICE BUTTONS GRID */}
      <div className="w-full max-w-2xl grid grid-cols-2 gap-3 md:gap-4">
        {choices.map((choice, idx) => {
          let btnStyle = "bg-slate-900 border-2 border-slate-700 text-slate-100 hover:border-amber-400 hover:bg-slate-800";
          
          if (isAnswered) {
            if (choice.toLowerCase() === currentWord.word.toLowerCase()) {
              btnStyle = "bg-emerald-600 border-2 border-emerald-300 text-white shadow-lg scale-105";
            } else if (choice === selectedWord) {
              btnStyle = "bg-red-600 border-2 border-red-300 text-white opacity-80";
            } else {
              btnStyle = "bg-slate-950 border-2 border-slate-800 text-slate-500 opacity-50";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleChoice(choice)}
              disabled={isAnswered}
              className={`p-3 md:p-4 rounded-xl font-teko text-2xl md:text-3xl font-bold tracking-wider uppercase transition-all duration-150 flex items-center justify-between shadow-xl ${btnStyle}`}
            >
              <span className="flex items-center gap-2">
                <span className="font-arcade text-xs text-amber-400">[{idx + 1}]</span>
                {choice}
              </span>

              {isAnswered && choice.toLowerCase() === currentWord.word.toLowerCase() && (
                <CheckCircle2 className="w-6 h-6 text-emerald-300" />
              )}
              {isAnswered && choice === selectedWord && choice.toLowerCase() !== currentWord.word.toLowerCase() && (
                <XCircle className="w-6 h-6 text-red-300" />
              )}
            </button>
          );
        })}
      </div>

      {/* FEEDBACK STATUS */}
      {isAnswered && (
        <div className="mt-4 font-arcade text-sm flex items-center gap-2 animate-bounce">
          {isCorrect ? (
            <span className="text-emerald-400 bg-emerald-950 border border-emerald-500 px-4 py-2 rounded-lg">
              🔥 PERFECT! +100 MARKS! FINISHER UNLEASHED!
            </span>
          ) : (
            <span className="text-red-400 bg-red-950 border border-red-500 px-4 py-2 rounded-lg">
              ❌ REVERSED! -50 MARKS! OPPONENT COUNTERS!
            </span>
          )}
        </div>
      )}
    </div>
  );
};
