import React, { useState, useEffect } from 'react';
import './CrystalLogo.css';

export const NowPlaying: React.FC = () => {
  const [currentTitle, setCurrentTitle] = useState<string>('Loading...');
  const [currentArtist, setCurrentArtist] = useState<string>('');

  useEffect(() => {
    const fetchNowPlaying = async () => {
      try {
        const response = await fetch('https://azurecast.d5cfbc9179a7f4e999a86d20bd0ef465.duckdns.org/api/nowplaying/1');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
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
    <div className="crystal-text">
      Now Playing: {currentTitle} – {currentArtist}
      {/* NOW LIVE FROM AFP */}
    </div>

    // <a className="crystal-text" href={'https://t.me/aktruepizza/790'} target="_blank">
    //   NOW LIVE FROM AFP
    // </a>
  );
};