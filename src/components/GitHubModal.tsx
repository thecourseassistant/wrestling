import React, { useState } from 'react';
import { Github, Check, Copy, Terminal, ExternalLink } from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (!isOpen) return null;

  const gitCommands = `
# Step 1: Initialize Git Repository
git init

# Step 2: Add all files & commit
git add .
git commit -m "Initial commit: WWF WrestleFest Vocabulary Arcade Game"

# Step 3: Link to your GitHub Repository
git remote add origin https://github.com/YOUR_USERNAME/wrestlefest-vocabulary-game.git
git branch -M main
git push -u origin main
  `.trim();

  const handleCopy = () => {
    navigator.clipboard.writeText(gitCommands);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-slate-900 border-2 border-slate-700 rounded-2xl p-6 shadow-2xl relative my-auto text-slate-100">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2 text-amber-400">
            <Github className="w-6 h-6" />
            <h2 className="font-teko text-2xl font-bold tracking-wider uppercase">
              PUSH TO GITHUB INSTRUCTIONS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-arcade text-xs px-3 py-1 bg-slate-800 rounded-lg"
          >
            CLOSE
          </button>
        </div>

        <p className="font-sans-body text-slate-300 text-xs mb-4 leading-relaxed">
          This project is structured as a standard Vite + React + TypeScript repository. You can push it directly to GitHub or deploy it for free on GitHub Pages / Vercel!
        </p>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-sans-body text-xs font-bold text-amber-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Terminal Commands
            </span>
            <button
              onClick={handleCopy}
              className="bg-slate-800 hover:bg-slate-700 text-slate-200 font-arcade text-[10px] px-3 py-1 rounded flex items-center gap-1"
            >
              {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3 text-amber-400" />}
              {copiedCode ? 'COPIED!' : 'COPY COMMANDS'}
            </button>
          </div>

          <pre className="bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-emerald-400 font-mono overflow-x-auto">
            {gitCommands}
          </pre>
        </div>

        <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3 text-[11px] text-slate-400 space-y-1">
          <p className="font-bold text-slate-200">✅ Included Features:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Standard <code className="text-amber-300">package.json</code> with Vite build scripts</li>
            <li>Rotated multi-touch mobile landscape auto-fit</li>
            <li>Google Apps Script Web App payload integration</li>
            <li>Local Storage CSV fallback for offline classroom use</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
