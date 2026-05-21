import React from 'react';
import { FlatList, View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { ChallengeCard } from './ChallengeCard';
import { THEME } from '../../constants/theme';
import type { MusicChallenge } from '../../types';

interface ChallengeListProps {
  challenges: MusicChallenge[];
  currentTrackId?: string;
  isPlaying?: boolean;
  loading?: boolean;
  error?: string | null;
  onPlay: (challenge: MusicChallenge) => void;
}

export const ChallengeList: React.FC<ChallengeListProps> = ({
  challenges,
  currentTrackId,
  isPlaying = false,
  loading = false,
  error = null,
  onPlay,
}) => {
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={THEME.colors.primary} />
        <Text style={styles.loadingText}>Loading challenges...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (challenges.length === 0) {
    return (
      <View style={styles.centered}>
        <Text style={styles.emptyText}>No challenges available</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={challenges}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <ChallengeCard
          challenge={item}
          onPlay={onPlay}
          isCurrentTrack={currentTrackId === item.id}
          isPlaying={isPlaying}
        />
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
    />
  );
};

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: THEME.spacing.xl,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: THEME.spacing.xxl,
  },
  loadingText: {
    marginTop: THEME.spacing.md,
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
  },
  errorText: {
    fontSize: THEME.fonts.sizes.md,
    color: '#FF6B6B',
    textAlign: 'center',
    paddingHorizontal: THEME.spacing.lg,
  },
  emptyText: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.tertiary,
    fontStyle: 'italic',
  },
});
