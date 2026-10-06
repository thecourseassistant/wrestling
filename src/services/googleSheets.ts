export interface MatchResultData {
  studentName: string;
  studentId?: string;
  className?: string;
  score: number;
  correctAnswersCount: number;
  incorrectAnswersCount: number;
  timeSpentSeconds: number;
  matchResult: 'WIN' | 'LOSS' | 'DRAW';
  wrestlerUsed: string;
  opponentDefeated: string;
  timestamp: string;
  vocabularySummary?: { word: string; wasCorrect: boolean }[];
}

const APPS_SCRIPT_URL_KEY = 'wrestlefest_apps_script_url';
const LOCAL_HISTORY_KEY = 'wrestlefest_match_results_history';

// 🌍 DEFAULT GLOBAL APPS SCRIPT WEB APP URL
export const DEFAULT_GLOBAL_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbz_SAMPLE_GLOBAL_URL/exec';

export function getStoredAppsScriptUrl(): string {
  return localStorage.getItem(APPS_SCRIPT_URL_KEY) || DEFAULT_GLOBAL_APPS_SCRIPT_URL;
}

export function setStoredAppsScriptUrl(url: string) {
  localStorage.setItem(APPS_SCRIPT_URL_KEY, url.trim());
}

export function saveMatchResultLocally(result: MatchResultData) {
  const existingStr = localStorage.getItem(LOCAL_HISTORY_KEY);
  const existing: MatchResultData[] = existingStr ? JSON.parse(existingStr) : [];
  existing.unshift(result);
  localStorage.setItem(LOCAL_HISTORY_KEY, JSON.stringify(existing.slice(0, 100)));
}

export function getLocalMatchResults(): MatchResultData[] {
  const existingStr = localStorage.getItem(LOCAL_HISTORY_KEY);
  return existingStr ? JSON.parse(existingStr) : [];
}

export async function submitToGoogleSheets(data: MatchResultData, overrideUrl?: string): Promise<{ success: boolean; message: string }> {
  const scriptUrl = overrideUrl || getStoredAppsScriptUrl();

  // Save locally always as backup
  saveMatchResultLocally(data);

  if (!scriptUrl || scriptUrl.includes('SAMPLE_GLOBAL_URL')) {
    return {
      success: false,
      message: 'No active Google Apps Script URL configured. Results saved locally!'
    };
  }

  const payloadString = JSON.stringify(data);

  // Try sendBeacon first for maximum reliability across page unloads & cross-origin limits
  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    try {
      const blob = new Blob([payloadString], { type: 'text/plain;charset=utf-8' });
      const sent = navigator.sendBeacon(scriptUrl, blob);
      if (sent) {
        return { success: true, message: 'Successfully delivered result to Google Sheet!' };
      }
    } catch {
      // Fallback to mode: 'no-cors' fetch
    }
  }

  // mode: 'no-cors' fetch directly prevents CORS preflight errors with Google Apps Script
  try {
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      cache: 'no-cache',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: payloadString,
    });

    return { success: true, message: 'Result delivered to Google Sheet!' };
  } catch (err: unknown) {
    return {
      success: false,
      message: 'Could not connect to Google Apps Script. Results saved locally.'
    };
  }
}

export function generateCSVExport(results: MatchResultData[]): string {
  const headers = ['Timestamp', 'Student Name', 'Student ID', 'Class', 'Score', 'Correct Answers', 'Incorrect Answers', 'Time (Sec)', 'Match Result', 'Wrestler Used'];
  const rows = results.map(r => [
    `"${r.timestamp}"`,
    `"${r.studentName || 'Anonymous'}"`,
    `"${r.studentId || 'N/A'}"`,
    `"${r.className || 'N/A'}"`,
    r.score,
    r.correctAnswersCount,
    r.incorrectAnswersCount,
    r.timeSpentSeconds,
    `"${r.matchResult}"`,
    `"${r.wrestlerUsed}"`
  ]);

  return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
}
