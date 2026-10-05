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

export function getStoredAppsScriptUrl(): string {
  return localStorage.getItem(APPS_SCRIPT_URL_KEY) || '';
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

  // Save locally always
  saveMatchResultLocally(data);

  if (!scriptUrl) {
    return {
      success: false,
      message: 'No Google Apps Script URL configured. Results saved locally!'
    };
  }

  try {
    // Standard Google Apps Script POST with text/plain to avoid CORS preflight issues
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      return { success: true, message: 'Successfully sent result to Google Sheet!' };
    } else {
      // Sometimes Apps Script redirects with 302/200; mode no-cors as fallback
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: {
          'Content-Type': 'text/plain;charset=utf-8',
        },
        body: JSON.stringify(data),
      });
      return { success: true, message: 'Sent result to Google Sheet!' };
    }
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.warn('Google Sheets submission error, trying fallback no-cors:', errorMsg);
    try {
      await fetch(scriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        body: JSON.stringify(data),
      });
      return { success: true, message: 'Sent to Google Sheet (no-cors mode)!' };
    } catch (e2) {
      return {
        success: false,
        message: 'Could not connect to Google Apps Script. Results saved locally.'
      };
    }
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

export const APPS_SCRIPT_TEMPLATE = `
// ==========================================
// WWF WRESTLEFEST VOCABULARY APPS SCRIPT
// Paste this code into Google Sheets -> Extensions -> Apps Script
// Then deploy as "Web App" (Execute as Me, Access: Anyone)
// ==========================================

function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp", 
        "Student Name", 
        "Student ID", 
        "Class", 
        "Score", 
        "Correct Answers", 
        "Incorrect Answers", 
        "Time Spent (sec)", 
        "Match Result", 
        "Wrestler Used", 
        "Opponent"
      ]);
      sheet.getRange(1, 1, 1, 11).setFontWeight("bold").setBackground("#1e293b").setFontColor("#ffffff");
    }
    
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.studentName || "Anonymous Student",
      data.studentId || "N/A",
      data.className || "N/A",
      data.score || 0,
      data.correctAnswersCount || 0,
      data.incorrectAnswersCount || 0,
      data.timeSpentSeconds || 0,
      data.matchResult || "WIN",
      data.wrestlerUsed || "The Hulkster",
      data.opponentDefeated || "CPU"
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ status: "success", message: "Result recorded!" }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("WrestleFest Google Apps Script Endpoint is Active!");
}
`;
