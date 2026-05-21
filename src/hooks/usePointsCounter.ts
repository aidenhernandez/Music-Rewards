import { useState, useEffect, useCallback } from 'react';
import { useProgress } from 'react-native-track-player';
import type { PointsCounterConfig, UsePointsCounterReturn } from '../types';

export const usePointsCounter = (): UsePointsCounterReturn => {
  const [pointsEarned, setPointsEarned] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [config, setConfig] = useState<PointsCounterConfig | null>(null);

  const progress = useProgress();

  useEffect(() => {
    if (!isActive || !config || !progress.duration) return;

    const progressPercentage = (progress.position / progress.duration) * 100;
    const earned = Math.floor((progressPercentage / 100) * config.totalPoints);

    if (earned > pointsEarned) {
      setPointsEarned(earned);
    }
  }, [progress.position, progress.duration, isActive, config, pointsEarned]);

  const startCounting = useCallback((newConfig: PointsCounterConfig) => {
    setConfig(newConfig);
    setIsActive(true);
    setPointsEarned(0);
  }, []);

  const stopCounting = useCallback(() => {
    setIsActive(false);
  }, []);

  const resetProgress = useCallback(() => {
    setPointsEarned(0);
    setIsActive(false);
    setConfig(null);
  }, []);

  return {
    currentPoints: pointsEarned,
    pointsEarned,
    progress: config && progress.duration ? (progress.position / progress.duration) * 100 : 0,
    isActive,
    startCounting,
    stopCounting,
    resetProgress,
  };
};
