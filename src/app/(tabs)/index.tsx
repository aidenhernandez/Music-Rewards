// Home screen - Challenge list (Expo Router)
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router } from 'expo-router';
import { ChallengeList } from '../../components/challenge/ChallengeList';
import { useMusicStore, selectChallenges, selectCurrentTrack, selectIsPlaying } from '../../stores/musicStore';
import { THEME } from '../../constants/theme';
import type { MusicChallenge } from '../../types';

export default function HomeScreen() {
  const challenges = useMusicStore(selectChallenges);
  const currentTrack = useMusicStore(selectCurrentTrack);
  const isPlaying = useMusicStore(selectIsPlaying);

  const handlePlayChallenge = (challenge: MusicChallenge) => {
    router.push(`/(modals)/challenge-detail?id=${challenge.id}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Music Challenges</Text>
      <Text style={styles.subtitle}>
        Complete listening challenges to earn points and unlock achievements
      </Text>
      <ChallengeList
        challenges={challenges}
        currentTrackId={currentTrack?.id}
        isPlaying={isPlaying}
        onPlay={handlePlayChallenge}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    paddingHorizontal: THEME.spacing.md,
    paddingTop: THEME.spacing.lg,
  },
  header: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
});
