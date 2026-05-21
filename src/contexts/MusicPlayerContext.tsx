import React, { createContext, useContext } from 'react';
import { useMusicPlayer } from '../hooks/useMusicPlayer';
import type { UseMusicPlayerReturn } from '../types';

const MusicPlayerContext = createContext<UseMusicPlayerReturn | null>(null);

export const MusicPlayerProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const player = useMusicPlayer();
  return (
    <MusicPlayerContext.Provider value={player}>
      {children}
    </MusicPlayerContext.Provider>
  );
};

export const useMusicPlayerContext = (): UseMusicPlayerReturn => {
  const ctx = useContext(MusicPlayerContext);
  if (!ctx) throw new Error('useMusicPlayerContext must be used within MusicPlayerProvider');
  return ctx;
};
