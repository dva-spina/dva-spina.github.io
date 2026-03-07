import React, { useState, useEffect, useCallback, useRef } from 'react';
import { CrystalLogo } from './components/CrystalLogo';
import { Theme } from './types';
import { LinkFooters } from './components/linkfooters';

const MOUNT_POINT = "https://azurecast.d5cfbc9179a7f4e999a86d20bd0ef465.duckdns.org/listen/%D0%B4%D0%B2%D0%B0_%D1%81%D0%BF%D0%B8%D0%BD%D0%B0/radio.mp3";
const DEFAULT_VOLUME = 0.35;

type SharedAudioState = {
  audio: HTMLAudioElement | null;
  consumers: number;
};

type PlaybackBroadcastMessage = {
  type: 'played';
  tabId: string;
};

declare global {
  interface Window {
    __dvaRadioSharedAudio?: SharedAudioState;
  }
}

const getSharedAudioState = (): SharedAudioState | null => {
  if (typeof window === 'undefined') {
    return null;
  }

  if (!window.__dvaRadioSharedAudio) {
    window.__dvaRadioSharedAudio = {
      audio: null,
      consumers: 0,
    };
  }

  return window.__dvaRadioSharedAudio;
};

const hardStopAudio = (audio: HTMLAudioElement): void => {
  audio.muted = true;
  audio.pause();
  audio.removeAttribute('src');
  audio.load();
};

const acquireSharedAudio = (): HTMLAudioElement | null => {
  const state = getSharedAudioState();
  if (!state) {
    return null;
  }

  if (!state.audio) {
    const audio = new Audio(MOUNT_POINT);
    audio.preload = "auto";
    audio.volume = DEFAULT_VOLUME;
    audio.muted = true;
    state.audio = audio;
  }

  state.consumers += 1;
  return state.audio;
};

const releaseSharedAudio = (): void => {
  const state = getSharedAudioState();
  if (!state) {
    return;
  }

  state.consumers = Math.max(0, state.consumers - 1);

  if (state.consumers === 0 && state.audio) {
    hardStopAudio(state.audio);
    state.audio = null;
  }
};

const App: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasAudioLeaseRef = useRef(false);
  const channelRef = useRef<BroadcastChannel | null>(null);
  const tabIdRef = useRef<string>(`tab-${Math.random().toString(36).slice(2)}-${Date.now()}`);

  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return 'light';
  });

  const [isMuted, setIsMuted] = useState(true);

  const ensureAudioLease = useCallback((): HTMLAudioElement | null => {
    if (audioRef.current) {
      return audioRef.current;
    }

    const audio = acquireSharedAudio();
    if (!audio) {
      return null;
    }

    hasAudioLeaseRef.current = true;
    audioRef.current = audio;

    return audio;
  }, []);

  const releaseAudioLease = useCallback((shouldHardStop: boolean): void => {
    const audio = audioRef.current;
    if (audio && shouldHardStop) {
      hardStopAudio(audio);
    }

    audioRef.current = null;

    if (hasAudioLeaseRef.current) {
      hasAudioLeaseRef.current = false;
      releaseSharedAudio();
    }
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(prev => (prev === 'light' ? 'dark' : 'light'));
  }, []);

  const toggleMute = useCallback(() => {
    setIsMuted(prevMuted => {
      const nextMuted = !prevMuted;
      if (nextMuted) {
        const currentAudio = audioRef.current;
        if (currentAudio) {
          currentAudio.muted = true;
        }

        return true;
      }

      const currentAudio = ensureAudioLease();
      if (!currentAudio) {
        return prevMuted;
      }

      currentAudio.muted = false;

      if (currentAudio.paused) {
        currentAudio.play().catch(() => {
          console.warn("Playback blocked by browser policy.");
        });
      }

      channelRef.current?.postMessage({
        type: 'played',
        tabId: tabIdRef.current,
      } satisfies PlaybackBroadcastMessage);

      return false;
    });
  }, [ensureAudioLease]);

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

  // audio lifecycle
  useEffect(() => {
    const handlePageLeave = () => {
      releaseAudioLease(true);
    };

    const handleBroadcastMessage = (event: MessageEvent<PlaybackBroadcastMessage>) => {
      const data = event.data;
      if (data?.type !== 'played') {
        return;
      }

      if (data.tabId === tabIdRef.current) {
        return;
      }

      releaseAudioLease(true);
      setIsMuted(true);
    };

    if ('BroadcastChannel' in window) {
      const channel = new BroadcastChannel('dva_radio_audio_player');
      channel.addEventListener('message', handleBroadcastMessage);
      channelRef.current = channel;
    }

    window.addEventListener('pagehide', handlePageLeave);
    window.addEventListener('beforeunload', handlePageLeave);

    return () => {
      window.removeEventListener('pagehide', handlePageLeave);
      window.removeEventListener('beforeunload', handlePageLeave);
      if (channelRef.current) {
        channelRef.current.removeEventListener('message', handleBroadcastMessage);
        channelRef.current.close();
        channelRef.current = null;
      }

      releaseAudioLease(true);
    };
  }, [releaseAudioLease]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    audio.muted = isMuted;
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