
import React, { useState, useRef, useEffect } from 'react';
import { CrystalLogo } from './components/CrystalLogo';
import { Theme } from './types';

const MOUNT_POINT = "http://azurecast.d5cfbc9179a7f4e999a86d20bd0ef465.duckdns.org/listen/%D0%B4%D0%B2%D0%B0_%D1%81%D0%BF%D0%B8%D0%BD%D0%B0/radio.mp3";

const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>('light');
  // the radio is kept playing in the background; we only toggle the muted state
  const [isMuted, setIsMuted] = useState(true);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleMute = () => {
    if (!audioRef.current) return;

    const nextMuted = !audioRef.current.muted;
    audioRef.current.muted = nextMuted;
    setIsMuted(nextMuted);

    // if we just unmuted and playback hasn't started yet, try to kick it off
    if (!nextMuted && audioRef.current.paused) {
      audioRef.current.play().catch(() => {});
    }
  };

  useEffect(() => {
    document.body.className = theme === 'light' ? 'bg-white text-black' : 'bg-black text-white';
  }, [theme]);

  // ensure the element has the source and begins playing muted on mount
  useEffect(() => {
    if (!audioRef.current) return;
    audioRef.current.src = MOUNT_POINT;
    audioRef.current.muted = isMuted;
    audioRef.current.play().catch(() => {});
  }, []);

  // keep element muted state in sync if it changes elsewhere
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.muted = isMuted;
    }
  }, [isMuted]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-8 transition-colors duration-700">
      {/* Header - Only theme switch, no text */}
      <header className="w-full max-w-4xl flex justify-end items-center z-10">
        <button 
          onClick={toggleTheme}
          className="text-[10px] border border-current px-2 py-0.5 rounded-full hover:opacity-50 transition-opacity uppercase tracking-widest opacity-30"
        >
          {theme === 'light' ? 'dark' : 'light'}
        </button>
      </header>

      {/* Main Content: Centered Logo */}
      <main className="flex-1 flex flex-col items-center justify-center w-full relative">
        <CrystalLogo theme={theme} isMuted={isMuted} onClick={toggleMute} />
      </main>

      {/* Hidden audio element; always kept connected, volume toggled via mute */}
      <audio
        ref={audioRef}
        src={MOUNT_POINT}
        preload="none"
        muted={isMuted}
        autoPlay
      />

      {/* Footer */}
      <footer className="w-full max-w-4xl flex justify-center items-center py-4">
        <a 
          href="https://t.me/dvaspina" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs tracking-widest hover:italic transition-all duration-300 opacity-30 hover:opacity-80"
        >
          telegram
        </a>
      </footer>

      {/* Minimal Visual Noise Overlay - using class from index.css */}
      <div className={`fixed inset-0 pointer-events-none opacity-[0.03] transition-opacity duration-1000 noise-overlay ${theme === 'light' ? 'bg-black' : 'bg-white'}`} />
    </div>
  );
};

export default App;
