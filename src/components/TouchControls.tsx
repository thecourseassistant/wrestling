import React, { useRef, useState, useEffect } from 'react';

interface TouchControlsProps {
  onJoystickMove: (move: { x: number; y: number }) => void;
  onButtonPress: (action: 'dodge' | 'smack' | 'pin', isPressed: boolean) => void;
}

export const TouchControls: React.FC<TouchControlsProps> = ({
  onJoystickMove,
  onButtonPress
}) => {
  const joystickRef = useRef<HTMLDivElement | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [knobPos, setKnobPos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  const activePointerIdRef = useRef<number | null>(null);

  const handlePointerDown = (e: React.PointerEvent) => {
    setIsDragging(true);
    activePointerIdRef.current = e.pointerId;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback
    }
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!isDragging) return;
    if (activePointerIdRef.current !== null && e.pointerId !== activePointerIdRef.current) return;
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (activePointerIdRef.current !== null && e.pointerId === activePointerIdRef.current) {
      try {
        e.currentTarget.releasePointerCapture(e.pointerId);
      } catch {
        // Fallback
      }
      activePointerIdRef.current = null;
    }
    setIsDragging(false);
    setKnobPos({ x: 0, y: 0 });
    onJoystickMove({ x: 0, y: 0 });
  };

  const updateJoystick = (clientX: number, clientY: number) => {
    if (!joystickRef.current) return;
    const rect = joystickRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const maxRadius = rect.width / 2 - 15;
    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);

    let normX = dx;
    let normY = dy;

    if (dist > maxRadius) {
      normX = (dx / dist) * maxRadius;
      normY = (dy / dist) * maxRadius;
    }

    setKnobPos({ x: normX, y: normY });

    onJoystickMove({
      x: normX / maxRadius,
      y: normY / maxRadius
    });
  };

  // Keyboard bindings
  useEffect(() => {
    const keys = { up: false, down: false, left: false, right: false };

    const updateKeyboardJoystick = () => {
      let x = 0;
      let y = 0;
      if (keys.left) x -= 1;
      if (keys.right) x += 1;
      if (keys.up) y -= 1;
      if (keys.down) y += 1;

      if (x !== 0 && y !== 0) {
        x *= 0.7071;
        y *= 0.7071;
      }

      onJoystickMove({ x, y });
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.repeat) return;
      switch (e.key) {
        case 'ArrowLeft': case 'a': case 'A': keys.left = true; updateKeyboardJoystick(); break;
        case 'ArrowRight': case 'd': case 'D': keys.right = true; updateKeyboardJoystick(); break;
        case 'ArrowUp': case 'w': case 'W': keys.up = true; updateKeyboardJoystick(); break;
        case 'ArrowDown': case 's': case 'S': keys.down = true; updateKeyboardJoystick(); break;
        case ' ': case 'z': case 'Z': case 'j': case 'J': onButtonPress('dodge', true); break;
        case 'x': case 'X': case 'k': case 'K': case 'c': case 'C': onButtonPress('smack', true); break;
        case 'v': case 'V': case 'l': case 'L': onButtonPress('pin', true); break;
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft': case 'a': case 'A': keys.left = false; updateKeyboardJoystick(); break;
        case 'ArrowRight': case 'd': case 'D': keys.right = false; updateKeyboardJoystick(); break;
        case 'ArrowUp': case 'w': case 'W': keys.up = false; updateKeyboardJoystick(); break;
        case 'ArrowDown': case 's': case 'S': keys.down = false; updateKeyboardJoystick(); break;
        case ' ': case 'z': case 'Z': case 'j': case 'J': onButtonPress('dodge', false); break;
        case 'x': case 'X': case 'k': case 'K': case 'c': case 'C': onButtonPress('smack', false); break;
        case 'v': case 'V': case 'l': case 'L': onButtonPress('pin', false); break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="absolute inset-0 pointer-events-none flex justify-between items-end p-2 md:p-6 z-20">
      {/* ANALOG JOYSTICK */}
      <div
        ref={joystickRef}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        className="pointer-events-auto relative w-32 h-32 md:w-40 md:h-40 bg-slate-900/80 rounded-full border-4 border-amber-500/60 backdrop-blur-md shadow-2xl flex items-center justify-center touch-none cursor-pointer"
      >
        <div className="w-16 h-16 rounded-full border border-amber-500/20" />
        <div
          className="absolute w-14 h-14 md:w-16 md:h-16 rounded-full bg-gradient-to-b from-amber-400 to-yellow-600 border-2 border-yellow-200 shadow-2xl flex items-center justify-center transition-transform duration-75"
          style={{ transform: `translate(${knobPos.x}px, ${knobPos.y}px)` }}
        >
          <div className="w-5 h-5 rounded-full bg-slate-950/40 border border-amber-200" />
        </div>
      </div>

      {/* ACTION BUTTONS: ATTACK & DODGE ONLY */}
      <div className="pointer-events-auto flex items-center gap-3">
        {/* ATTACK BUTTON */}
        <button
          onPointerDown={(e) => { e.preventDefault(); onButtonPress('smack', true); }}
          onPointerUp={(e) => { e.preventDefault(); onButtonPress('smack', false); }}
          className="w-22 h-22 md:w-26 md:h-26 bg-gradient-to-br from-red-600 to-amber-600 active:from-red-500 active:to-amber-500 text-white font-arcade text-sm md:text-base font-bold rounded-full border-4 border-amber-300 shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
        >
          <span>Attack</span>
        </button>

        {/* DODGE BUTTON */}
        <button
          onPointerDown={(e) => { e.preventDefault(); onButtonPress('dodge', true); }}
          onPointerUp={(e) => { e.preventDefault(); onButtonPress('dodge', false); }}
          className="w-22 h-22 md:w-26 md:h-26 bg-gradient-to-r from-sky-500 to-cyan-400 active:from-sky-400 active:to-cyan-300 text-slate-950 font-arcade text-sm md:text-base font-black rounded-full border-4 border-cyan-200 shadow-2xl flex items-center justify-center active:scale-95 transition-transform"
        >
          <span>Dodge</span>
        </button>
      </div>
    </div>
  );
};
