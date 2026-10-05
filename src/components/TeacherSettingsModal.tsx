import React, { useState, useEffect } from 'react';
import {
  CharacterFrameMapping,
  getPlayerFrameMapping,
  getOpponentFrameMapping,
  savePlayerFrameMapping,
  saveOpponentFrameMapping,
  resetFrameMappings
} from '../game/frameMapping';
import {
  WordItem,
  getStoredVocabulary,
  saveStoredVocabulary,
  resetStoredVocabularyToDefault
} from '../data/words';
import {
  getStoredAppsScriptUrl,
  setStoredAppsScriptUrl,
  submitToGoogleSheets,
  MatchResultData
} from '../services/googleSheets';

import redjacketSheetImg from '../assets/images/redjacket_referee_sheet_1791181033322.jpg';
import heavyBrawlerSheetImg from '../assets/images/heavyweight_brawler_spritesheet_1791181703571.jpg';
import { Plus, Trash2, Edit2, Save, RefreshCw, Send, CheckCircle2, Link2, BookOpen, Layers, Copy, Check, Code } from 'lucide-react';

interface TeacherSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TeacherSettingsModal: React.FC<TeacherSettingsModalProps> = ({ isOpen, onClose }) => {
  const [password, setPassword] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [passwordError, setPasswordError] = useState(false);

  const [activeTab, setActiveTab] = useState<'vocab' | 'appscript' | 'player_frames' | 'opponent_frames'>('vocab');

  // Google Apps Script States
  const [appsScriptUrl, setAppsScriptUrl] = useState<string>('');
  const [appsScriptSaveSuccess, setAppsScriptSaveSuccess] = useState<boolean>(false);
  const [testPayloadStatus, setTestPayloadStatus] = useState<string | null>(null);
  const [copiedScript, setCopiedScript] = useState<boolean>(false);

  // Vocabulary States
  const [vocabList, setVocabList] = useState<WordItem[]>([]);
  const [newWord, setNewWord] = useState('');
  const [newDefinition, setNewDefinition] = useState('');
  const [newCategory, setNewCategory] = useState('General');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editWord, setEditWord] = useState('');
  const [editDefinition, setEditDefinition] = useState('');

  // Frame Mapping States
  const [playerMapping, setPlayerMapping] = useState<CharacterFrameMapping>(getPlayerFrameMapping());
  const [opponentMapping, setOpponentMapping] = useState<CharacterFrameMapping>(getOpponentFrameMapping());
  const [selectedMove, setSelectedMove] = useState<keyof CharacterFrameMapping>('idleFrames');
  const [selectedMoveIndex, setSelectedMoveIndex] = useState<number>(0);

  const appsScriptCodeSnippet = `
// 📌 PASTE YOUR GOOGLE SHEET LINK BETWEEN THE QUOTES BELOW:
var GOOGLE_SHEET_URL = "PASTE_YOUR_GOOGLE_SHEET_URL_HERE";

function getTargetSheet() {
  if (GOOGLE_SHEET_URL && GOOGLE_SHEET_URL.indexOf("http") === 0) {
    return SpreadsheetApp.openByUrl(GOOGLE_SHEET_URL).getActiveSheet();
  }
  return SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
}

function doPost(e) {
  try {
    var sheet = getTargetSheet();
    
    // Auto-create header row if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        "Timestamp",
        "Student Name",
        "Score (%)",
        "Correct Answers",
        "Incorrect Answers",
        "Time Spent (Sec)",
        "Match Result",
        "Wrestler Used",
        "Opponent Defeated"
      ]);
      
      var headerRange = sheet.getRange(1, 1, 1, 9);
      headerRange.setBackground("#1e293b");
      headerRange.setFontColor("#f59e0b");
      headerRange.setFontWeight("bold");
    }
    
    var data = JSON.parse(e.postData.contents);
    var formattedDate = data.timestamp ? new Date(data.timestamp).toLocaleString() : new Date().toLocaleString();
    
    sheet.appendRow([
      formattedDate,
      data.studentName || "Anonymous Student",
      data.score !== undefined ? data.score + "%" : "0%",
      data.correctAnswersCount || 0,
      data.incorrectAnswersCount || 0,
      data.timeSpentSeconds || 0,
      data.matchResult || "WIN",
      data.wrestlerUsed || "Ultimate Warrior",
      data.opponentDefeated || "Heavyweight Colossus"
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ result: "success" }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    return ContentService
      .createTextOutput(JSON.stringify({ result: "error", error: error.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("WrestleFest Webhook is Active!");
}
  `.trim();

  useEffect(() => {
    if (isOpen) {
      setPlayerMapping(getPlayerFrameMapping());
      setOpponentMapping(getOpponentFrameMapping());
      setVocabList(getStoredVocabulary());
      setAppsScriptUrl(getStoredAppsScriptUrl());
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

  const handleSaveAppsScriptUrl = () => {
    setStoredAppsScriptUrl(appsScriptUrl);
    setAppsScriptSaveSuccess(true);
    setTimeout(() => setAppsScriptSaveSuccess(false), 3000);
  };

  const handleCopyAppsScriptCode = () => {
    navigator.clipboard.writeText(appsScriptCodeSnippet);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 3000);
  };

  const handleTestAppsScriptPayload = async () => {
    if (!appsScriptUrl.trim()) {
      setTestPayloadStatus('❌ Please enter a valid Apps Script URL first.');
      return;
    }

    setTestPayloadStatus('⏳ Sending test payload to Google Sheet...');

    const sampleResult: MatchResultData = {
      studentName: 'Test Student',
      score: 100,
      correctAnswersCount: 5,
      incorrectAnswersCount: 0,
      timeSpentSeconds: 45,
      matchResult: 'WIN',
      wrestlerUsed: 'Ultimate Warrior',
      opponentDefeated: 'Heavyweight Colossus',
      timestamp: new Date().toISOString()
    };

    const res = await submitToGoogleSheets(sampleResult, appsScriptUrl);
    if (res.success) {
      setTestPayloadStatus('✅ Test payload sent successfully! Check your Google Sheet.');
    } else {
      setTestPayloadStatus(`⚠️ ${res.message}`);
    }
  };

  // Vocabulary Actions
  const handleAddWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newDefinition.trim()) return;

    const item: WordItem = {
      id: 'w_' + Date.now(),
      word: newWord.trim(),
      definition: newDefinition.trim(),
      category: newCategory.trim() || 'General'
    };

    const updated = [...vocabList, item];
    setVocabList(updated);
    saveStoredVocabulary(updated);

    setNewWord('');
    setNewDefinition('');
  };

  const handleDeleteWord = (id: string) => {
    const updated = vocabList.filter(w => w.id !== id);
    setVocabList(updated);
    saveStoredVocabulary(updated);
  };

  const handleStartEdit = (item: WordItem) => {
    setEditingId(item.id);
    setEditWord(item.word);
    setEditDefinition(item.definition);
  };

  const handleSaveEdit = (id: string) => {
    const updated = vocabList.map(w => {
      if (w.id === id) {
        return { ...w, word: editWord.trim(), definition: editDefinition.trim() };
      }
      return w;
    });

    setVocabList(updated);
    saveStoredVocabulary(updated);
    setEditingId(null);
  };

  const handleResetVocabDefaults = () => {
    const defaults = resetStoredVocabularyToDefault();
    setVocabList(defaults);
  };

  // Frame Mapper Actions
  const currentMapping = activeTab === 'player_frames' ? playerMapping : opponentMapping;
  const currentSheetImg = activeTab === 'player_frames' ? redjacketSheetImg : heavyBrawlerSheetImg;

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

    if (activeTab === 'player_frames') {
      setPlayerMapping(updated);
      savePlayerFrameMapping(updated);
    } else {
      setOpponentMapping(updated);
      saveOpponentFrameMapping(updated);
    }
  };

  const handleResetFrames = () => {
    resetFrameMappings();
    setPlayerMapping(getPlayerFrameMapping());
    setOpponentMapping(getOpponentFrameMapping());
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4">
      <div className="relative w-full max-w-3xl bg-slate-900 border-2 border-amber-500/60 rounded-xl shadow-2xl p-6 text-slate-100 overflow-y-auto max-h-[90vh]">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white font-bold text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-arcade font-bold text-amber-400 mb-2 flex items-center gap-2">
          ⚙️ TEACHER & FRAME MAPPER SETTINGS
        </h2>

        {!isUnlocked ? (
          <form onSubmit={handlePasswordSubmit} className="mt-6 flex flex-col gap-4 max-w-md mx-auto">
            <p className="text-sm text-slate-300 text-center font-sans">
              Enter Password to Access Teacher Settings:
            </p>
            <input
              type="password"
              autoComplete="off"
              placeholder="••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="px-4 py-3 bg-slate-950 border border-amber-500/40 rounded-lg font-mono text-center text-lg text-amber-300 focus:outline-none focus:border-amber-400"
            />
            {passwordError && (
              <p className="text-xs text-red-400 text-center font-bold">
                ❌ Incorrect Password! (Default: 147852)
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
            {/* UNIFIED TABS */}
            <div className="flex gap-2 border-b border-slate-800 pb-3 flex-wrap">
              <button
                onClick={() => setActiveTab('vocab')}
                className={`px-3 py-2 font-arcade text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'vocab'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                📚 VOCABULARY LIST ({vocabList.length})
              </button>
              <button
                onClick={() => setActiveTab('appscript')}
                className={`px-3 py-2 font-arcade text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'appscript'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Code className="w-3.5 h-3.5" />
                📊 GOOGLE APPS SCRIPT
              </button>
              <button
                onClick={() => setActiveTab('player_frames')}
                className={`px-3 py-2 font-arcade text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'player_frames'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                🥊 PLAYER FRAMES
              </button>
              <button
                onClick={() => setActiveTab('opponent_frames')}
                className={`px-3 py-2 font-arcade text-xs rounded-lg transition-colors flex items-center gap-1.5 ${
                  activeTab === 'opponent_frames'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                🏋️ OPPONENT FRAMES
              </button>
            </div>

            {/* TAB CONTENT 1: FULL VOCABULARY LIST EDITOR */}
            {activeTab === 'vocab' && (
              <div className="flex flex-col gap-4 text-xs">
                {/* ADD NEW WORD FORM */}
                <form onSubmit={handleAddWord} className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex flex-col gap-2">
                  <span className="font-bold text-amber-300 font-arcade text-xs">➕ ADD NEW VOCABULARY ITEM</span>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <input
                      type="text"
                      placeholder="Word (e.g., champion)"
                      value={newWord}
                      onChange={(e) => setNewWord(e.target.value)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                    <input
                      type="text"
                      placeholder="Definition / Hint"
                      value={newDefinition}
                      onChange={(e) => setNewDefinition(e.target.value)}
                      className="px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      type="submit"
                      className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-arcade text-xs font-bold rounded flex items-center justify-center gap-1"
                    >
                      <Plus className="w-4 h-4" /> ADD WORD
                    </button>
                  </div>
                </form>

                {/* WORD LIST TABLE */}
                <div className="flex flex-col gap-2 max-h-60 overflow-y-auto pr-1">
                  {vocabList.map((item) => {
                    const isEditing = editingId === item.id;
                    return (
                      <div
                        key={item.id}
                        className="bg-slate-950/80 p-2.5 rounded border border-slate-800 flex items-center justify-between gap-2"
                      >
                        {isEditing ? (
                          <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2">
                            <input
                              type="text"
                              value={editWord}
                              onChange={(e) => setEditWord(e.target.value)}
                              className="px-2 py-1 bg-slate-900 border border-amber-400 rounded text-amber-300 font-bold"
                            />
                            <input
                              type="text"
                              value={editDefinition}
                              onChange={(e) => setEditDefinition(e.target.value)}
                              className="px-2 py-1 bg-slate-900 border border-amber-400 rounded text-slate-200"
                            />
                          </div>
                        ) : (
                          <div className="flex-1 flex flex-col md:flex-row md:items-center gap-1 md:gap-4">
                            <span className="font-bold text-amber-300 font-mono text-sm min-w-[120px]">
                              {item.word}
                            </span>
                            <span className="text-slate-300 font-sans italic flex-1">
                              "{item.definition}"
                            </span>
                          </div>
                        )}

                        <div className="flex items-center gap-1 shrink-0">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveEdit(item.id)}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-500 rounded text-white"
                              title="Save Edit"
                            >
                              <Save className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleStartEdit(item)}
                              className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded text-amber-300"
                              title="Edit Word"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteWord(item.id)}
                            className="p-1.5 bg-slate-800 hover:bg-red-900/80 rounded text-red-400 hover:text-red-200"
                            title="Delete Word"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                  <span className="text-slate-400 text-[10px]">
                    Total Active Words: <strong className="text-amber-300">{vocabList.length}</strong>
                  </span>
                  <button
                    onClick={handleResetVocabDefaults}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-arcade text-[10px] rounded flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3 text-amber-400" /> RESET TO DEFAULTS
                  </button>
                </div>
              </div>
            )}

            {/* TAB CONTENT 2: GOOGLE APPS SCRIPT WEB APP URL INPUT & CODE SNIPPET */}
            {activeTab === 'appscript' && (
              <div className="flex flex-col gap-4 text-xs">
                {/* CODE SNIPPET BOX */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col gap-2">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-amber-300 font-arcade text-xs flex items-center gap-1.5">
                      <Code className="w-4 h-4 text-emerald-400" /> GOOGLE APPS SCRIPT CODE (Code.gs)
                    </span>
                    <button
                      onClick={handleCopyAppsScriptCode}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-amber-300 font-arcade text-[10px] rounded flex items-center gap-1"
                    >
                      {copiedScript ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
                      {copiedScript ? 'COPIED!' : 'COPY CODE'}
                    </button>
                  </div>

                  <p className="text-[11px] text-slate-300">
                    Line 2 below contains <code className="bg-slate-900 text-amber-300 px-1 rounded">GOOGLE_SHEET_URL</code>. Paste your Google Sheet URL into it!
                  </p>

                  <pre className="bg-slate-900 border border-slate-800 p-3 rounded font-mono text-[10px] text-emerald-400 max-h-48 overflow-y-auto overflow-x-auto leading-relaxed">
                    {appsScriptCodeSnippet}
                  </pre>
                </div>

                {/* WEB APP URL INPUT BOX */}
                <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 flex flex-col gap-3">
                  <span className="font-bold text-amber-300 font-arcade text-xs flex items-center gap-1.5">
                    <Link2 className="w-4 h-4 text-cyan-400" /> DEPLOYED WEB APP URL
                  </span>

                  <div className="flex flex-col md:flex-row gap-2">
                    <input
                      type="url"
                      placeholder="https://script.google.com/macros/s/.../exec"
                      value={appsScriptUrl}
                      onChange={(e) => setAppsScriptUrl(e.target.value)}
                      className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={handleSaveAppsScriptUrl}
                      className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-xs font-bold rounded flex items-center justify-center gap-1 shrink-0"
                    >
                      <Save className="w-3.5 h-3.5" /> SAVE URL
                    </button>
                  </div>

                  {appsScriptSaveSuccess && (
                    <p className="text-emerald-400 text-[11px] font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Web App URL Saved to Configuration!
                    </p>
                  )}

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800">
                    <button
                      onClick={handleTestAppsScriptPayload}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-300 font-arcade text-xs rounded flex items-center gap-1.5"
                    >
                      <Send className="w-3.5 h-3.5 text-cyan-400" /> SEND TEST PAYLOAD
                    </button>
                  </div>

                  {testPayloadStatus && (
                    <div className="p-2.5 bg-slate-900 rounded border border-slate-800 text-[11px] font-mono text-amber-300">
                      {testPayloadStatus}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* TAB CONTENT 3 & 4: SPRITE FRAME MAPPER */}
            {(activeTab === 'player_frames' || activeTab === 'opponent_frames') && (
              <div className="flex flex-col gap-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  {[
                    { key: 'idleFrames', label: 'IDLE' },
                    { key: 'walkFrames', label: 'WALKING' },
                    { key: 'punchFrames', label: 'PUNCH' },
                    { key: 'kickFrames', label: 'KICK' },
                    { key: 'smackFrames', label: 'FLYING SMACK' },
                    { key: 'dodgeFrames', label: 'GROUND ROLL' },
                    { key: 'hurtFrame', label: 'HURT' },
                    { key: 'downFrame', label: 'DOWN' },
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
                          {JSON.stringify(currentMapping[move.key as keyof CharacterFrameMapping])}
                        </span>
                      </button>
                    );
                  })}
                </div>

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

                <div>
                  <p className="text-xs text-amber-300 mb-2 font-bold">
                    Click Frame (0-15) below to assign to {String(selectedMove)}:
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

                <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={handleResetFrames}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-arcade text-xs rounded-lg"
                  >
                    Reset Defaults
                  </button>
                </div>
              </div>
            )}

            <div className="flex justify-end mt-2 pt-2 border-t border-slate-800">
              <button
                onClick={onClose}
                className="px-6 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-arcade text-xs font-bold rounded-lg"
              >
                CLOSE
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
