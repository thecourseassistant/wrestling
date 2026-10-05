import { WrestlerState } from './wrestlingEngine';
import { getPlayerFrameMapping, getOpponentFrameMapping } from './frameMapping';
import redjacketSheetImg from '../assets/images/redjacket_referee_sheet_1791181033322.jpg';
import heavyBrawlerSheetImg from '../assets/images/heavyweight_brawler_spritesheet_1791181703571.jpg';

// Preload Sprite Sheet Images
const playerSpriteImage = new Image();
playerSpriteImage.src = redjacketSheetImg;

const opponentSpriteImage = new Image();
opponentSpriteImage.src = heavyBrawlerSheetImg;

let processedPlayerCanvas: HTMLCanvasElement | null = null;
let processedOpponentCanvas: HTMLCanvasElement | null = null;

playerSpriteImage.onload = () => {
  processedPlayerCanvas = processChromaKeyClean(playerSpriteImage);
};

opponentSpriteImage.onload = () => {
  processedOpponentCanvas = processChromaKeyClean(opponentSpriteImage);
};

function processChromaKeyClean(img: HTMLImageElement): HTMLCanvasElement | null {
  if (!img.complete || img.naturalWidth === 0) return null;

  const canvas = document.createElement('canvas');
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0);
  const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const data = imgData.data;

  const totalCols = 4;
  const totalRows = 4;
  const frameW = canvas.width / totalCols;
  const frameH = canvas.height / totalRows;

  for (let y = 0; y < canvas.height; y++) {
    for (let x = 0; x < canvas.width; x++) {
      const idx = (y * canvas.width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];

      const localX = x % frameW;
      const localY = y % frameH;
      const isNearCellBorder = localX <= 3 || localX >= frameW - 3 || localY <= 3 || localY >= frameH - 3;

      const isWhiteOrGray = (r > 175 && g > 175 && b > 175) || (Math.abs(r - g) < 12 && Math.abs(g - b) < 12 && r > 160);

      if (isWhiteOrGray || isNearCellBorder) {
        data[idx + 3] = 0; // Transparent
      }
    }
  }

  ctx.putImageData(imgData, 0, 0);
  return canvas;
}

export function drawDetailedWrestleFestSprite(
  ctx: CanvasRenderingContext2D,
  w: WrestlerState,
  opponent?: WrestlerState
) {
  if (w.isPlayer && !processedPlayerCanvas && playerSpriteImage.complete) {
    processedPlayerCanvas = processChromaKeyClean(playerSpriteImage);
  }
  if (!w.isPlayer && !processedOpponentCanvas && opponentSpriteImage.complete) {
    processedOpponentCanvas = processChromaKeyClean(opponentSpriteImage);
  }

  let sourceImg: CanvasImageSource | null = null;

  if (w.isPlayer) {
    sourceImg = processedPlayerCanvas || playerSpriteImage;
  } else {
    sourceImg = processedOpponentCanvas || opponentSpriteImage || processedPlayerCanvas || playerSpriteImage;
  }

  const checkImg = sourceImg as HTMLImageElement;
  if (!sourceImg || (checkImg.naturalWidth !== undefined && checkImg.naturalWidth === 0)) {
    return;
  }

  ctx.save();

  const drawX = w.x;
  const drawY = w.y + w.airY;

  ctx.translate(drawX, drawY);

  if (w.rotation !== 0 && w.action !== 'DOWN') {
    ctx.rotate(w.rotation);
  }

  if (w.facingLeft) {
    ctx.scale(-1, 1);
  }

  const mapping = w.isPlayer ? getPlayerFrameMapping() : getOpponentFrameMapping();

  let frameIndex = 0;
  const subFrame = w.actionFrame;

  switch (w.action) {
    case 'IDLE':
      frameIndex = (Math.floor(subFrame / 24) % 2 === 0) ? mapping.idleFrames[0] : mapping.idleFrames[1];
      break;
    case 'WALKING':
      frameIndex = (Math.floor(subFrame / 18) % 2 === 0) ? mapping.walkFrames[0] : mapping.walkFrames[1];
      break;
    case 'RUNNING':
      frameIndex = mapping.walkFrames[1];
      break;
    case 'PUNCH':
      frameIndex = (subFrame < 10) ? mapping.punchFrames[0] : mapping.punchFrames[1];
      break;
    case 'KICK':
      frameIndex = (subFrame < 10) ? mapping.kickFrames[0] : mapping.kickFrames[1];
      break;
    case 'SMACKING':
      frameIndex = (subFrame < 10) ? mapping.smackFrames[0] : mapping.smackFrames[1];
      break;
    case 'DODGING':
      if (subFrame < 8) frameIndex = mapping.dodgeFrames[0];
      else if (subFrame < 16) frameIndex = mapping.dodgeFrames[1];
      else frameIndex = mapping.dodgeFrames[2];
      break;
    case 'FINISHER':
    case 'ROPE_REBOUND_FINISHER':
    case 'SUPLEX':
      frameIndex = (subFrame < 14) ? mapping.smackFrames[0] : mapping.smackFrames[1];
      break;
    case 'VICTORY':
      // 🏆 OPPONENT VICTORY TAUNT: CYCLES FRAMES 12 & 13!
      frameIndex = (Math.floor(subFrame / 20) % 2 === 0) ? 12 : 13;
      break;
    case 'HURT':
      frameIndex = mapping.hurtFrame;
      break;
    case 'FLOWN_OFF':
      frameIndex = mapping.smackFrames[0];
      break;
    case 'DOWN':
    case 'BEING_PINNED':
      frameIndex = mapping.downFrame;
      break;
    default:
      frameIndex = mapping.idleFrames[0];
      break;
  }

  // 4x4 Grid Calculation
  const totalCols = 4;
  const totalRows = 4;
  const imgW = (sourceImg as any).width || 800;
  const imgH = (sourceImg as any).height || 800;

  const rawFrameW = imgW / totalCols;
  const rawFrameH = imgH / totalRows;

  const col = frameIndex % totalCols;
  const row = Math.floor(frameIndex / totalCols);

  const inset = 3;
  const sx = col * rawFrameW + inset;
  const sy = row * rawFrameH + inset;
  const srcFrameW = rawFrameW - inset * 2;
  const srcFrameH = rawFrameH - inset * 2;

  const targetW = w.isPlayer ? 115 : 150;
  const targetH = w.isPlayer ? 120 : 135;

  ctx.drawImage(
    sourceImg,
    sx,
    sy,
    srcFrameW,
    srcFrameH,
    -targetW / 2,
    -targetH + 12,
    targetW,
    targetH
  );

  ctx.restore();
}
