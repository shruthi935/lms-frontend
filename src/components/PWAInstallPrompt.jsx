// src/components/PWAInstallPrompt.jsx
// Drop this anywhere in your App.jsx — it shows a banner to install the app on mobile

import { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Detect iOS
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    setIsIOS(ios);

    // Listen for Android/Chrome install prompt
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };
    window.addEventListener('beforeinstallprompt', handler);

    // Show iOS instructions after 3 seconds
    if (ios && !localStorage.getItem('pwa_ios_dismissed')) {
      setTimeout(() => setShowBanner(true), 3000);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') setShowBanner(false);
      setDeferredPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem('pwa_ios_dismissed', '1');
  };

  if (isInstalled || !showBanner) return null;

  // ── iOS Instructions Banner ──
  if (isIOS) {
    return (
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-indigo-900 text-white px-4 py-4 shadow-2xl">
        <div className="max-w-lg mx-auto">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-sm font-black flex-shrink-0">
                LMS
              </div>
              <div>
                <p className="font-bold text-sm">Add to Home Screen</p>
                <p className="text-indigo-300 text-xs mt-0.5">
                  Tap <span className="font-bold text-white">Share</span> then{' '}
                  <span className="font-bold text-white">"Add to Home Screen"</span> to install
                </p>
              </div>
            </div>
            <button onClick={handleDismiss} className="text-indigo-300 hover:text-white text-lg font-bold flex-shrink-0">✕</button>
          </div>
          {/* Arrow pointing to Safari share button */}
          <div className="mt-2 flex items-center gap-2 text-indigo-300 text-xs">
            <span>↓ Look for</span>
            <span className="bg-indigo-700 px-2 py-0.5 rounded font-mono">⬆ Share</span>
            <span>button in Safari toolbar</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Android/Chrome Install Banner ──
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 max-w-sm mx-auto">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        <div className="bg-indigo-600 px-4 py-2 flex items-center gap-2">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center text-white text-[10px] font-black">LMS</div>
          <span className="text-white text-xs font-bold uppercase tracking-wider">Install App</span>
        </div>
        <div className="p-4">
          <p className="font-black text-gray-900 text-base">Open Academy LMS</p>
          <p className="text-gray-500 text-sm mt-1">
            Install for faster access, offline support, and a full-screen experience.
          </p>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleInstall}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl text-sm transition"
            >
              📲 Install Now
            </button>
            <button
              onClick={handleDismiss}
              className="px-4 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold py-2.5 rounded-xl text-sm transition"
            >
              Later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
