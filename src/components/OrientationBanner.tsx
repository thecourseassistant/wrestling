import React, { useState, useEffect } from 'react';
import { RotateCw, Maximize2 } from 'lucide-react';

export const OrientationBanner: React.FC = () => {
  const [isPortrait, setIsPortrait] = useState<boolean>(false);

  useEffect(() => {
    const checkOrientation = () => {
      if (window.innerWidth < 768 && window.innerHeight > window.innerWidth) {
        setIsPortrait(true);
      } else {
        setIsPortrait(false);
      }
    };

    checkOrientation();
    window.addEventListener('resize', checkOrientation);
    window.addEventListener('orientationchange', checkOrientation);

    return () => {
      window.removeEventListener('resize', checkOrientation);
      window.removeEventListener('orientationchange', checkOrientation);
    };
  }, []);

  const handleFullscreenLandscape = async () => {
    try {
      const elem = document.documentElement as any;
      if (!document.fullscreenElement) {
        if (elem.requestFullscreen) {
          await elem.requestFullscreen();
        } else if (elem.webkitRequestFullscreen) {
          await elem.webkitRequestFullscreen();
        } else if (elem.msRequestFullscreen) {
          await elem.msRequestFullscreen();
        }

        // Lock screen orientation horizontally
        if (screen.orientation && (screen.orientation as any).lock) {
          await (screen.orientation as any).lock('landscape').catch(() => {});
        }
      }
    } catch {
      // Fallback
    }
  };

  if (!isPortrait) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/95 flex flex-col items-center justify-center p-6 text-center text-amber-300 backdrop-blur-lg">
      <div className="w-20 h-20 rounded-full bg-amber-500/10 border-2 border-amber-400 flex items-center justify-center animate-bounce mb-6">
        <RotateCw className="w-10 h-10 text-amber-400 animate-spin" />
      </div>

      <h2 className="font-teko text-3xl font-bold uppercase tracking-wider text-amber-400 mb-2">
        PLEASE ROTATE YOUR PHONE HORIZONTALLY
      </h2>

      <p className="font-sans-body text-slate-300 text-sm max-w-sm mb-6 leading-relaxed">
        WrestleFest Arcade is designed for horizontal landscape touchscreens. Turn your phone sideways and click below!
      </p>

      <button
        onClick={handleFullscreenLandscape}
        className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-400 text-slate-950 font-arcade text-xs px-6 py-3.5 rounded-xl font-bold shadow-2xl active:scale-95 transition-all border-2 border-yellow-200"
      >
        <Maximize2 className="w-4 h-4" />
        ENTER FULLSCREEN LANDSCAPE
      </button>
    </div>
  );
};
