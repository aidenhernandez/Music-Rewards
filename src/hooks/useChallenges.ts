import { useState, useCallback } from 'react';
import { useMusicStore } from '../stores/musicStore';
import { useUserStore } from '../stores/userStore';
import type { UseChallengesReturn } from '../types';

export const useChallenges = (): UseChallengesReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const challenges = useMusicStore((state) => state.challenges);
  const loadChallenges = useMusicStore((state) => state.loadChallenges);
  const markChallengeComplete = useMusicStore((state) => state.markChallengeComplete);

  const completedChallenges = useUserStore((state) => state.completedChallenges);
  const completeChallengInUserStore = useUserStore((state) => state.completeChallenge);
  const addPoints = useUserStore((state) => state.addPoints);

  const refreshChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      loadChallenges();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load challenges');
    } finally {
      setLoading(false);
    }
  }, [loadChallenges]);

  const completeChallenge = useCallback(async (challengeId: string) => {
    try {
      setError(null);
      const challenge = challenges.find((c) => c.id === challengeId);
      if (!challenge) throw new Error('Challenge not found');

      markChallengeComplete(challengeId);
      completeChallengInUserStore(challengeId);
      addPoints(challenge.points);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete challenge');
    }
  }, [challenges, markChallengeComplete, completeChallengInUserStore, addPoints]);

  return {
    challenges,
    completedChallenges,
    loading,
    error,
    refreshChallenges,
    completeChallenge,
  };
};
