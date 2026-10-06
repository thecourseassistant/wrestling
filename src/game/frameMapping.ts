export interface CharacterFrameMapping {
  idleFrames: [number, number];
  walkFrames: [number, number];
  punchFrames: [number, number];
  kickFrames: [number, number];
  smackFrames: [number, number];
  dodgeFrames: [number, number, number];
  hurtFrame: number;
  downFrame: number;
}

// 🌍 GLOBAL HARDCODED SOURCE DEFAULT FOR ALL DEVICES WORLDWIDE
export const DEFAULT_PLAYER_MAPPING: CharacterFrameMapping = {
  idleFrames: [0, 0],
  walkFrames: [1, 2],
  punchFrames: [4, 5],
  kickFrames: [6, 14],
  smackFrames: [13, 13],
  dodgeFrames: [8, 15, 8],
  hurtFrame: 10,
  downFrame: 11
};

export const DEFAULT_OPPONENT_MAPPING: CharacterFrameMapping = {
  idleFrames: [0, 2],
  walkFrames: [1, 2],
  punchFrames: [4, 6],
  kickFrames: [5, 5],
  smackFrames: [8, 8],
  dodgeFrames: [9, 9, 9],
  hurtFrame: 14,
  downFrame: 15
};

const STORAGE_KEY_PLAYER = 'wrestle_player_frame_mapping_v1';
const STORAGE_KEY_OPPONENT = 'wrestle_opponent_frame_mapping_v1';

export function getPlayerFrameMapping(): CharacterFrameMapping {
  applyUrlFrameMappingsIfPresent();
  try {
    const saved = localStorage.getItem(STORAGE_KEY_PLAYER);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(DEFAULT_PLAYER_MAPPING, parsed);
      return parsed;
    }
  } catch {
    // Fallback
  }
  return { ...DEFAULT_PLAYER_MAPPING };
}

export function getOpponentFrameMapping(): CharacterFrameMapping {
  applyUrlFrameMappingsIfPresent();
  try {
    const saved = localStorage.getItem(STORAGE_KEY_OPPONENT);
    if (saved) {
      const parsed = JSON.parse(saved);
      Object.assign(DEFAULT_OPPONENT_MAPPING, parsed);
      return parsed;
    }
  } catch {
    // Fallback
  }
  return { ...DEFAULT_OPPONENT_MAPPING };
}

export function savePlayerFrameMapping(mapping: CharacterFrameMapping) {
  Object.assign(DEFAULT_PLAYER_MAPPING, mapping);
  localStorage.setItem(STORAGE_KEY_PLAYER, JSON.stringify(mapping));
}

export function saveOpponentFrameMapping(mapping: CharacterFrameMapping) {
  Object.assign(DEFAULT_OPPONENT_MAPPING, mapping);
  localStorage.setItem(STORAGE_KEY_OPPONENT, JSON.stringify(mapping));
}

export function resetFrameMappings() {
  localStorage.removeItem(STORAGE_KEY_PLAYER);
  localStorage.removeItem(STORAGE_KEY_OPPONENT);
}

// 🌐 CROSS-DEVICE SYNC HELPERS
export function exportFrameMappingsJSON(): string {
  const p = getPlayerFrameMapping();
  const o = getOpponentFrameMapping();
  return JSON.stringify({ player: p, opponent: o }, null, 2);
}

export function importFrameMappingsJSON(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (data.player && data.opponent) {
      savePlayerFrameMapping(data.player);
      saveOpponentFrameMapping(data.opponent);
      return true;
    }
  } catch {
    // Error
  }
  return false;
}

export function generateShareableSyncUrl(): string {
  if (typeof window === 'undefined') return '';
  const p = getPlayerFrameMapping();
  const o = getOpponentFrameMapping();

  const encodedP = encodeURIComponent(JSON.stringify(p));
  const encodedO = encodeURIComponent(JSON.stringify(o));

  const url = new URL(window.location.href);
  url.searchParams.set('pf', encodedP);
  url.searchParams.set('of', encodedO);

  return url.toString();
}

let hasAppliedUrlParams = false;

export function applyUrlFrameMappingsIfPresent() {
  if (hasAppliedUrlParams || typeof window === 'undefined') return;
  hasAppliedUrlParams = true;

  try {
    const params = new URLSearchParams(window.location.search);
    const pf = params.get('pf');
    const of = params.get('of');

    if (pf) {
      const parsedP = JSON.parse(decodeURIComponent(pf));
      if (parsedP && parsedP.idleFrames) {
        savePlayerFrameMapping(parsedP);
      }
    }

    if (of) {
      const parsedO = JSON.parse(decodeURIComponent(of));
      if (parsedO && parsedO.idleFrames) {
        saveOpponentFrameMapping(parsedO);
      }
    }
  } catch {
    // Error parsing
  }
}
