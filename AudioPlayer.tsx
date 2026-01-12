import React, { useState, useRef, useImperativeHandle, forwardRef, useEffect } from 'react';

// New Track: "Lobby Time" - Smooth, classy, unobtrusive background jazz
const MUSIC_URL = "https://cdn.pixabay.com/audio/2022/11/22/audio_febc508520.mp3";

export interface AudioPlayerHandle {
  playMusic: () => void;
  stopMusic: () => void;
}

const AudioPlayer = forwardRef<AudioPlayerHandle, {}>((props, ref) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useImperativeHandle(ref, () => ({
    playMusic: () => {
      const audio = audioRef.current;
      if (audio) {
        audio.play()
          .then(() => setIsPlaying(true))
          .catch(e => console.warn("Audio play failed (interaction needed):", e));
      }
    },
    stopMusic: () => {
        const audio = audioRef.current;
        if (audio) {
            audio.pause();
            setIsPlaying(false);
        }
    }
  }));

  const togglePlay = () => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        audio.pause();
      } else {
        audio.play().catch(e => console.error(e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  useEffect(() => {
    if (audioRef.current) {
        audioRef.current.volume = 0.5;
    }
  }, []);

  return (
    <div className="fixed top-4 right-4 z-50">
      <audio ref={audioRef} src={MUSIC_URL} loop preload="auto" />
      <button
        onClick={togglePlay}
        className="glass-panel text-amber-400 p-3 rounded-full hover:bg-red-900/50 transition-all duration-300 border border-amber-400/30 shadow-lg shadow-orange-900/20 group"
        title={isPlaying ? "Pause Music" : "Play Jazz"}
      >
        {isPlaying ? (
          <div className="flex space-x-1 items-end h-4 w-4 justify-center">
             <div className="w-1 h-2 bg-amber-400 animate-[bounce_1s_infinite]"></div>
             <div className="w-1 h-4 bg-amber-400 animate-[bounce_1.2s_infinite]"></div>
             <div className="w-1 h-3 bg-amber-400 animate-[bounce_0.8s_infinite]"></div>
          </div>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:scale-110 transition-transform">
             <path d="M9 18V5l12-2v13"></path>
             <circle cx="6" cy="18" r="3"></circle>
             <circle cx="18" cy="16" r="3"></circle>
          </svg>
        )}
      </button>
    </div>
  );
});

export default AudioPlayer;