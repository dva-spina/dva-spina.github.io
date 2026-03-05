import React, { useState, useEffect, useCallback } from 'react';
import { CrystalLogo } from './components/CrystalLogo';
import { Theme } from './types';
import { LinkFooters } from './components/linkfooters';

const MOUNT_POINT = "https://azurecast.d5cfbc9179a7f4e999a86d20bd0ef465.duckdns.org/listen/%D0%B4%D0%B2%D0%B0_%D1%81%D0%BF%D0%B8%D0%BD%D0%B0/radio.mp3";

const globalAudio = new Audio();
globalAudio.preload = "auto";

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [isMuted, setIsMuted] = useState(true);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleMute = useCallback(() => {
    const nextMuted = !isMuted;
    
    globalAudio.muted = nextMuted;
    setIsMuted(nextMuted);
    
    if (!nextMuted && globalAudio.paused) {
      globalAudio.play().catch(() => {
        console.warn("Playback blocked by browser policy.");
      });
    }
  }, [isMuted]);

  // theme change
  useEffect(() => {
    document.body.className = theme === 'light' ? 'bg-white text-black' : 'bg-black text-white';

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  // audio setup
  useEffect(() => {
    if (globalAudio.src !== MOUNT_POINT) {
      globalAudio.src = MOUNT_POINT;
    }

    globalAudio.muted = isMuted;

    const startPlayback = async () => {
      try {
        await globalAudio.play();
      } catch (err) {
        console.log("Autoplay waiting for user interaction");
      }
    };

    startPlayback();

    return () => {
    };
  }, []);

  useEffect(() => {
    globalAudio.muted = isMuted;
    
    if (!isMuted && globalAudio.paused) {
        globalAudio.play().catch(() => {});
    }
  }, [isMuted]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-8 transition-colors duration-700">
      <header className="w-full max-w-4xl flex justify-end items-center z-10">
        <button 
          onClick={toggleTheme}
          className="text-[10px] border border-current px-2 py-0.5 rounded-full hover:opacity-50 transition-opacity uppercase tracking-widest opacity-30"
        >
          {theme === 'light' ? 'dark' : 'light'}
        </button>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center w-full relative">
        <CrystalLogo theme={theme} isMuted={isMuted} onClick={toggleMute} />
      </main>

      <LinkFooters />

      <div className={`fixed inset-0 pointer-events-none opacity-[0.03] transition-opacity duration-1000 noise-overlay ${theme === 'light' ? 'bg-black' : 'bg-white'}`} />
    </div>
  );
};

export default App;