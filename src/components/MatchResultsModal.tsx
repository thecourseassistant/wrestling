import React, { useState } from 'react';
import { MatchResultData, submitToGoogleSheets, generateCSVExport } from '../services/googleSheets';
import { Trophy, CheckCircle2, XCircle, Send, Download, RotateCcw, Award } from 'lucide-react';

interface MatchResultsModalProps {
  resultData: MatchResultData;
  onPlayAgain: () => void;
  onReturnToMenu: () => void;
}

export const MatchResultsModal: React.FC<MatchResultsModalProps> = ({
  resultData,
  onPlayAgain,
  onReturnToMenu
}) => {
  const [studentName, setStudentName] = useState<string>(resultData.studentName || '');
  const [studentId, setStudentId] = useState<string>('');
  const [className, setClassName] = useState<string>('');
  const [submitStatus, setSubmitStatus] = useState<{ loading: boolean; message: string | null; success: boolean | null }>({
    loading: false,
    message: null,
    success: null
  });

  const handleSheetsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitStatus({ loading: true, message: 'Submitting to Google Sheets...', success: null });

    const updatedData: MatchResultData = {
      ...resultData,
      studentName: studentName.trim() || 'Anonymous Student',
      studentId: studentId.trim(),
      className: className.trim()
    };

    const res = await submitToGoogleSheets(updatedData);
    setSubmitStatus({
      loading: false,
      message: res.message,
      success: res.success
    });
  };

  const handleDownloadCSV = () => {
    const csvStr = generateCSVExport([resultData]);
    const blob = new Blob([csvStr], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `WrestleFest_Result_${studentName || 'Student'}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-3 md:p-6 overflow-y-auto">
      <div className="w-full max-w-2xl bg-slate-900 border-4 border-amber-400 rounded-2xl p-4 md:p-6 shadow-2xl relative my-auto">
        {/* HEADER VICTORY BANNER */}
        <div className="text-center mb-4 border-b border-slate-800 pb-3">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-400 text-amber-300 font-arcade text-xs px-3 py-1 rounded-full mb-2">
            <Trophy className="w-4 h-4 text-amber-400" />
            MATCH FINISHED! REPORT CARD
          </div>
          <h1 className="font-teko text-4xl md:text-5xl font-black text-amber-400 tracking-wider uppercase">
            {resultData.matchResult === 'WIN' ? '🏆 CHAMPION VICTORY! 🏆' : 'DEFEATED - GOOD TRY!'}
          </h1>
        </div>

        {/* MARKS SCORE & VOCAB METRICS GRID */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-slate-950 border border-amber-500/40 rounded-xl p-3 text-center">
            <span className="text-slate-400 text-[10px] font-arcade block uppercase mb-1">TOTAL MARKS</span>
            <span className="font-teko text-3xl font-bold text-amber-400">{resultData.score}</span>
          </div>
          <div className="bg-slate-950 border border-emerald-500/40 rounded-xl p-3 text-center">
            <span className="text-emerald-400 text-[10px] font-arcade block uppercase mb-1">CORRECT</span>
            <span className="font-teko text-3xl font-bold text-emerald-400">
              {resultData.correctAnswersCount}
            </span>
          </div>
          <div className="bg-slate-950 border border-red-500/40 rounded-xl p-3 text-center">
            <span className="text-red-400 text-[10px] font-arcade block uppercase mb-1">INCORRECT</span>
            <span className="font-teko text-3xl font-bold text-red-400">
              {resultData.incorrectAnswersCount}
            </span>
          </div>
        </div>

        {/* STUDENT DETAILS & GOOGLE SHEETS FORM */}
        <form onSubmit={handleSheetsSubmit} className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4">
          <h3 className="font-arcade text-xs text-amber-300 mb-3 flex items-center gap-2">
            <Award className="w-4 h-4 text-amber-400" />
            STUDENT IDENTIFICATION & RESULT REPORTING
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
            <div>
              <label className="text-slate-400 text-[11px] font-sans-body block mb-1">Student Name</label>
              <input
                type="text"
                required
                placeholder="e.g. Alex Wong"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] font-sans-body block mb-1">Student ID / No.</label>
              <input
                type="text"
                placeholder="e.g. S12345"
                value={studentId}
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
            <div>
              <label className="text-slate-400 text-[11px] font-sans-body block mb-1">Class / Grade</label>
              <input
                type="text"
                placeholder="e.g. Class 5B"
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center gap-3 justify-between">
            <button
              type="submit"
              disabled={submitStatus.loading}
              className="w-full md:w-auto bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-arcade text-xs px-5 py-2.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              {submitStatus.loading ? 'SENDING...' : 'SEND TO GOOGLE SHEET'}
            </button>

            <button
              type="button"
              onClick={handleDownloadCSV}
              className="w-full md:w-auto bg-slate-800 hover:bg-slate-700 text-slate-200 font-arcade text-xs px-4 py-2.5 rounded-xl border border-slate-600 flex items-center justify-center gap-2 transition"
            >
              <Download className="w-4 h-4 text-cyan-400" />
              DOWNLOAD CSV
            </button>
          </div>

          {submitStatus.message && (
            <div className={`mt-3 p-2.5 rounded-lg text-xs font-sans-body flex items-center gap-2 ${
              submitStatus.success ? 'bg-emerald-950/80 border border-emerald-500 text-emerald-300' : 'bg-amber-950/80 border border-amber-500 text-amber-300'
            }`}>
              {submitStatus.success ? <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" /> : <XCircle className="w-4 h-4 text-amber-400 shrink-0" />}
              <span>{submitStatus.message}</span>
            </div>
          )}
        </form>

        {/* ACTION BUTTONS */}
        <div className="flex items-center gap-3 justify-end pt-2">
          <button
            onClick={onReturnToMenu}
            className="bg-slate-800 hover:bg-slate-700 text-slate-300 font-arcade text-xs px-4 py-3 rounded-xl border border-slate-700 transition"
          >
            MAIN MENU
          </button>
          <button
            onClick={onPlayAgain}
            className="bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-arcade text-xs px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-xl active:scale-95 transition"
          >
            <RotateCcw className="w-4 h-4" />
            PLAY AGAIN
          </button>
        </div>
      </div>
    </div>
  );
};
