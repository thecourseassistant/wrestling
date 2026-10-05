import React, { useEffect, useRef } from 'react';
import { WrestlingMatchEngine, WrestlerState } from '../game/wrestlingEngine';
import { drawDetailedWrestleFestSprite } from '../game/spriteRenderer';

interface WrestleCanvasProps {
  engine: WrestlingMatchEngine;
  showScanlines: boolean;
}

export const WrestleCanvas: React.FC<WrestleCanvasProps> = ({ engine, showScanlines }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    let animationFrameId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.save();

      // Camera Screen Shake Offset!
      if (engine.screenShake > 0) {
        const shakeX = (Math.random() - 0.5) * engine.screenShake * 1.5;
        const shakeY = (Math.random() - 0.5) * engine.screenShake * 1.5;
        ctx.translate(shakeX, shakeY);
      }

      // Clear Canvas
      ctx.fillStyle = '#020617';
      ctx.fillRect(-20, -20, canvas.width + 40, canvas.height + 40);

      // 1. Draw Arena Crowd & Stadium Lighting
      drawCrowd(ctx, canvas.width, canvas.height, engine);

      // 2. Draw WrestleFest Ring Canvas, Apron Skirt, Turnbuckles & Ropes
      drawRing(ctx, canvas.width, canvas.height);

      // 3. Draw Shockwaves (When wrestlers crash down onto canvas!)
      engine.shockwaves.forEach(s => {
        ctx.save();
        ctx.strokeStyle = '#facc15';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(s.x, s.y, s.radius * 1.5, s.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });

      // 4. Draw Shadows
      drawShadow(ctx, engine.player);
      drawShadow(ctx, engine.opponent);

      // 5. Draw Animated Wrestlers

      // 6. Draw Animated Wrestlers
      const wrestlers = [engine.player, engine.opponent].sort((a, b) => a.y - b.y);
      wrestlers.forEach(w => {
        const opp = w.id === engine.player.id ? engine.opponent : engine.player;
        drawDetailedWrestleFestSprite(ctx, w, opp);
      });

      // 7. Draw Foreground Ropes Overlay
      drawForegroundRopes(ctx);

      // 8. Draw Floating Text Particles (WHAM!, FLOWN OFF!, BOOM!)
      engine.particles.forEach(p => {
        ctx.save();
        const scale = p.scale || 1.0;
        ctx.font = `bold ${Math.round(16 * scale)}px "Press Start 2P", monospace`;
        ctx.fillStyle = p.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 4;
        ctx.strokeText(p.text, p.x - 40, p.y);
        ctx.fillText(p.text, p.x - 40, p.y);
        ctx.restore();
      });

      ctx.restore();

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [engine]);

  return (
    <div className="relative w-full h-full flex items-center justify-center overflow-hidden bg-slate-950">
      <canvas
        ref={canvasRef}
        width={800}
        height={450}
        className="w-full h-full object-contain max-w-[1280px] max-h-[720px] rounded-md shadow-2xl border-2 border-amber-500/30"
      />
      {showScanlines && <div className="absolute inset-0 crt-scanlines pointer-events-none" />}
    </div>
  );
};

// --- DRAWING FUNCTIONS ---

function drawCrowd(ctx: CanvasRenderingContext2D, width: number, height: number, engine: WrestlingMatchEngine) {
  const gradient = ctx.createLinearGradient(0, 0, 0, 160);
  gradient.addColorStop(0, '#020617');
  gradient.addColorStop(0.6, '#0f172a');
  gradient.addColorStop(1, '#1e293b');
  ctx.fillStyle = gradient;
  ctx.fillRect(-20, -20, width + 40, 180);

  ctx.fillStyle = '#334155';
  for (let x = 10; x < width; x += 16) {
    for (let y = 10; y < 110; y += 14) {
      const size = (y / 110) * 8;
      ctx.beginPath();
      ctx.arc(x + ((y % 28 === 0) ? 6 : 0), y, size, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // Camera Flashes
  engine.flashes.forEach(f => {
    ctx.save();
    ctx.fillStyle = '#ffffff';
    ctx.shadowColor = '#38bdf8';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(f.x, f.y, f.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  });

  // WrestleFest Header
  ctx.font = 'bold 12px "Press Start 2P", monospace';
  ctx.fillStyle = '#facc15';
  ctx.fillText('WWF WRESTLEFEST', 280, 25);
  ctx.fillStyle = '#ef4444';
  ctx.fillText('VOCABULARY CHAMPIONSHIP', 230, 45);

  // Spotlights
  [80, 240, 560, 720].forEach(lx => {
    ctx.fillStyle = '#fef08a';
    ctx.beginPath();
    ctx.arc(lx, 60, 14, 0, Math.PI * 2);
    ctx.fill();

    const lightCone = ctx.createLinearGradient(lx, 60, lx, 280);
    lightCone.addColorStop(0, 'rgba(254, 240, 138, 0.2)');
    lightCone.addColorStop(1, 'rgba(254, 240, 138, 0.0)');
    ctx.fillStyle = lightCone;
    ctx.beginPath();
    ctx.moveTo(lx - 10, 60);
    ctx.lineTo(lx + 10, 60);
    ctx.lineTo(lx + 90, 320);
    ctx.lineTo(lx - 90, 320);
    ctx.closePath();
    ctx.fill();
  });
}

function drawRing(ctx: CanvasRenderingContext2D, width: number, height: number) {
  ctx.save();

  // Ring Mat Canvas
  ctx.fillStyle = '#94a3b8';
  ctx.beginPath();
  ctx.moveTo(120, 160);
  ctx.lineTo(680, 160);
  ctx.lineTo(730, 370);
  ctx.lineTo(70, 370);
  ctx.closePath();
  ctx.fill();

  // Yellow Corner Mat Box
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.moveTo(600, 200);
  ctx.lineTo(670, 200);
  ctx.lineTo(710, 350);
  ctx.lineTo(620, 350);
  ctx.closePath();
  ctx.fill();

  // Blue Stripes
  ctx.fillStyle = '#2563eb';
  ctx.fillRect(630, 220, 16, 110);
  ctx.fillRect(660, 220, 16, 110);

  // Blue Apron Skirt
  ctx.fillStyle = '#1d4ed8';
  ctx.beginPath();
  ctx.moveTo(70, 370);
  ctx.lineTo(730, 370);
  ctx.lineTo(730, 400);
  ctx.lineTo(70, 400);
  ctx.closePath();
  ctx.fill();

  // Posts
  drawPost(ctx, 120, 160, '#ef4444');
  drawPost(ctx, 680, 160, '#3b82f6');
  drawPost(ctx, 70, 370, '#facc15');
  drawPost(ctx, 730, 370, '#10b981');

  // 🥊 4-SIDED RING ROPES & BANDS (NORTH, WEST, EAST)
  ctx.lineWidth = 4;

  const ropeColors = ['#ef4444', '#f8fafc', '#3b82f6']; // Red, White, Blue

  ropeColors.forEach((col, idx) => {
    ctx.strokeStyle = col;
    const offset = idx * 12;

    // 1. North Ropes (Back)
    ctx.beginPath();
    ctx.moveTo(120, 130 + offset);
    ctx.lineTo(680, 130 + offset);
    ctx.stroke();

    // 2. West Ropes (Left Side)
    ctx.beginPath();
    ctx.moveTo(120, 130 + offset);
    ctx.lineTo(70, 340 + offset);
    ctx.stroke();

    // 3. East Ropes (Right Side)
    ctx.beginPath();
    ctx.moveTo(680, 130 + offset);
    ctx.lineTo(730, 340 + offset);
    ctx.stroke();
  });

  ctx.restore();
}

function drawForegroundRopes(ctx: CanvasRenderingContext2D) {
  ctx.save();
  ctx.lineWidth = 4;

  const ropeColors = ['#ef4444', '#f8fafc', '#3b82f6'];

  // 4. South Ropes (Front)
  ropeColors.forEach((col, idx) => {
    ctx.strokeStyle = col;
    const offset = idx * 12;

    ctx.beginPath();
    ctx.moveTo(70, 340 + offset);
    ctx.lineTo(730, 340 + offset);
    ctx.stroke();
  });

  ctx.restore();
}

function drawPost(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.fillStyle = '#475569';
  ctx.fillRect(x - 6, y - 50, 12, 50);

  ctx.fillStyle = color;
  ctx.fillRect(x - 10, y - 45, 20, 30);
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.strokeRect(x - 10, y - 45, 20, 30);
  ctx.restore();
}

function drawShadow(ctx: CanvasRenderingContext2D, w: WrestlerState) {
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.45)';
  ctx.beginPath();
  ctx.ellipse(w.x, w.y + 12, 28, 9, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}


