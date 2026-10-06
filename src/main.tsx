import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// 🍎 Prevent iOS Safari gesture pinch-zoom and double-tap zoom
if (typeof window !== 'undefined') {
  document.addEventListener('gesturestart', (e) => e.preventDefault());
  document.addEventListener('gesturechange', (e) => e.preventDefault());
  document.addEventListener('gestureend', (e) => e.preventDefault());

  let lastTouchEnd = 0;
  document.addEventListener(
    'touchend',
    (e) => {
      const now = Date.now();
      if (now - lastTouchEnd <= 300) {
        e.preventDefault();
      }
      lastTouchEnd = now;
    },
    { passive: false }
  );
}

createRoot(document.getElementById('root')!).render(<App />);
