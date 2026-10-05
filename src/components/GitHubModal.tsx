import React, { useState } from 'react';
import { Github, Check, Copy, Terminal, ExternalLink, AlertTriangle } from 'lucide-react';

interface GitHubModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GitHubModal: React.FC<GitHubModalProps> = ({ isOpen, onClose }) => {
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (!isOpen) return null;

  const gitCommands = `
# Step 1: Initialize Git Repository & Commit
git init
git add .
git commit -m "Initial commit: WrestleFest Vocabulary Championship"

# Step 2: Link to your GitHub Repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPOSITORY.git
git branch -M main
git push -u origin main

# Step 3 (Optional): Build and Deploy to GitHub Pages (No 404 Error)
npm run build
npx gh-pages -d dist
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
            <h2 className="font-arcade text-lg font-bold tracking-wider uppercase">
              PUSH TO GITHUB & PREVENT 404 ERRORS
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white font-arcade text-xs px-3 py-1 bg-slate-800 rounded-lg"
          >
            CLOSE
          </button>
        </div>

        {/* 🛠️ 404 FIX NOTICE */}
        <div className="bg-amber-500/10 border border-amber-500/40 rounded-xl p-3 mb-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-200 leading-relaxed">
            <p className="font-bold text-amber-300 mb-1">
              Why 404 Errors Happen on GitHub Pages:
            </p>
            <p>
              GitHub Pages hosts repositories under subpaths like <code className="bg-slate-950 px-1 rounded text-emerald-300">/your-repo-name/</code>.
              We configured <code className="bg-slate-950 px-1 rounded text-amber-300">base: './'</code> in <code className="bg-slate-950 px-1 rounded text-amber-300">vite.config.ts</code> and added <code className="bg-slate-950 px-1 rounded text-emerald-300">public/404.html</code> so all assets load with relative paths!
            </p>
          </div>
        </div>

        <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="font-mono text-xs font-bold text-amber-300 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              Terminal Git Commands
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
          <p className="font-bold text-slate-200">✅ Configured for 0-Configuration Deployments:</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>Relative asset pathing (<code className="text-amber-300">base: './'</code>) in <code className="text-amber-300">vite.config.ts</code></li>
            <li>GitHub Pages SPA fallback route (<code className="text-amber-300">public/404.html</code>)</li>
            <li>Direct Vercel / Netlify / GitHub Pages deployment compatible</li>
          </ul>
        </div>
      </div>
    </div>
  );
};
