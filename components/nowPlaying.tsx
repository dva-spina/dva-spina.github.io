import React, { useState, useEffect } from 'react';

export const NowPlaying: React.FC = () => {
  const [currentTitle, setCurrentTitle] = useState<string>('Loading...');
  // Добавляем недостающий стейт, чтобы не было ошибки "is not defined"
  const [currentArtist, setCurrentArtist] = useState<string>('');

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        // Убедись, что в AzuraCast включен HTTPS и заголовок CORS "*"
        const response = await fetch('https://azurecast.d5cfbc9179a7f4e999a86d20bd0ef465.duckdns.org/api/nowplaying/1');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        // Правильная навигация по объекту AzuraCast API
        const song = data.now_playing?.song;
        const title = song?.title || 'Unknown Title';
        const artist = song?.artist || '';

        setCurrentTitle(title);
        setCurrentArtist(artist);
      } catch (error) {
        console.error('Failed to fetch now playing:', error);
        setCurrentTitle('Unable to load');
      }
    };

    fetchNowPlaying();
    const interval = setInterval(fetchNowPlaying, 10000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-[11px] tracking-[0.2em] transition-all duration-1000 uppercase opacity-30">
      Now Playing: {currentArtist ? `${currentArtist} - ` : ''}{currentTitle}
    </div>
  );
};