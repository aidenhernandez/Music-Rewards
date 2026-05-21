import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { GlassCard, GlassButton } from '../../components/ui/GlassCard';
import { useMusicPlayer } from '../../hooks/useMusicPlayer';
import { useMusicStore, selectChallenges } from '../../stores/musicStore';
import { THEME } from '../../constants/theme';

export default function ChallengeDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challenges = useMusicStore(selectChallenges);
  const challenge = challenges.find((c) => c.id === id);
  const { play, currentTrack, isPlaying } = useMusicPlayer();

  if (!challenge) {
    return (
      <SafeAreaView style={styles.container}>
        <GlassCard style={styles.errorCard}>
          <Text style={styles.errorText}>Challenge not found</Text>
        </GlassCard>
      </SafeAreaView>
    );
  }

  const isCurrentTrack = currentTrack?.id === challenge.id;

  const formatDuration = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return THEME.colors.secondary;
      case 'medium': return THEME.colors.accent;
      case 'hard': return THEME.colors.primary;
      default: return THEME.colors.text.secondary;
    }
  };

  const getPlayButtonTitle = () => {
    if (challenge.completed) return 'Completed ✓';
    if (isCurrentTrack && isPlaying) return '⏸ Pause';
    if (isCurrentTrack && !isPlaying) return '▶ Resume';
    return '▶ Play Challenge';
  };

  const handlePlayPress = async () => {
    if (isCurrentTrack && isPlaying) {
      router.push('/(modals)/player');
      return;
    }
    await play(challenge);
    router.push('/(modals)/player');
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <GlassCard
          style={styles.headerCard}
          gradientColors={isCurrentTrack
            ? THEME.glass.gradientColors.primary
            : THEME.glass.gradientColors.card}
        >
          <View style={styles.titleRow}>
            <View style={styles.titleSection}>
              <Text style={styles.title}>{challenge.title}</Text>
              <Text style={styles.artist}>{challenge.artist}</Text>
            </View>
            <View style={[styles.difficultyBadge, { backgroundColor: getDifficultyColor(challenge.difficulty) }]}>
              <Text style={styles.difficultyText}>{challenge.difficulty.toUpperCase()}</Text>
            </View>
          </View>

          {challenge.completed && (
            <View style={styles.completedBanner}>
              <Text style={styles.completedText}>✅ Challenge Completed</Text>
            </View>
          )}
        </GlassCard>

        {/* Stats */}
        <GlassCard style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{formatDuration(challenge.duration)}</Text>
              <Text style={styles.statLabel}>Duration</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: THEME.colors.accent }]}>
                {challenge.points}
              </Text>
              <Text style={styles.statLabel}>Points</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(challenge.progress)}%</Text>
              <Text style={styles.statLabel}>Progress</Text>
            </View>
          </View>

          {challenge.progress > 0 && (
            <View style={styles.progressContainer}>
              <View style={styles.progressTrack}>
                <View style={[styles.progressFill, { width: `${challenge.progress}%` }]} />
              </View>
            </View>
          )}
        </GlassCard>

        {/* Description */}
        <GlassCard style={styles.descriptionCard}>
          <Text style={styles.sectionTitle}>About this challenge</Text>
          <Text style={styles.description}>{challenge.description}</Text>
        </GlassCard>

        {/* Rewards */}
        <GlassCard style={styles.rewardsCard} gradientColors={THEME.glass.gradientColors.primary}>
          <Text style={styles.sectionTitle}>Reward</Text>
          <View style={styles.rewardRow}>
            <Text style={styles.rewardIcon}>🏆</Text>
            <View>
              <Text style={styles.rewardPoints}>{challenge.points} points</Text>
              <Text style={styles.rewardSubtext}>Earned upon completion</Text>
            </View>
          </View>
        </GlassCard>

        {/* Play Button */}
        <GlassButton
          title={getPlayButtonTitle()}
          onPress={handlePlayPress}
          disabled={challenge.completed}
          variant="primary"
          style={styles.playButton}
        />

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scrollContent: {
    padding: THEME.spacing.lg,
    paddingBottom: THEME.spacing.xxl,
  },
  errorCard: {
    margin: THEME.spacing.xl,
    alignItems: 'center',
  },
  errorText: {
    color: THEME.colors.text.secondary,
    fontSize: THEME.fonts.sizes.md,
  },
  headerCard: {
    marginBottom: THEME.spacing.md,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  titleSection: {
    flex: 1,
    marginRight: THEME.spacing.md,
  },
  title: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.xs,
  },
  artist: {
    fontSize: THEME.fonts.sizes.lg,
    color: THEME.colors.text.secondary,
  },
  difficultyBadge: {
    paddingHorizontal: THEME.spacing.sm,
    paddingVertical: THEME.spacing.xs,
    borderRadius: THEME.borderRadius.sm,
  },
  difficultyText: {
    fontSize: THEME.fonts.sizes.xs,
    fontWeight: 'bold',
    color: THEME.colors.background,
  },
  completedBanner: {
    marginTop: THEME.spacing.md,
    paddingVertical: THEME.spacing.sm,
    backgroundColor: 'rgba(52, 203, 118, 0.15)',
    borderRadius: THEME.borderRadius.sm,
    alignItems: 'center',
  },
  completedText: {
    color: THEME.colors.secondary,
    fontWeight: '600',
    fontSize: THEME.fonts.sizes.md,
  },
  statsCard: {
    marginBottom: THEME.spacing.md,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: THEME.colors.border,
  },
  statValue: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.xs,
  },
  statLabel: {
    fontSize: THEME.fonts.sizes.xs,
    color: THEME.colors.text.tertiary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  progressContainer: {
    marginTop: THEME.spacing.md,
  },
  progressTrack: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: 3,
  },
  descriptionCard: {
    marginBottom: THEME.spacing.md,
  },
  sectionTitle: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  description: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
    lineHeight: 24,
  },
  rewardsCard: {
    marginBottom: THEME.spacing.lg,
  },
  rewardRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: THEME.spacing.md,
  },
  rewardIcon: {
    fontSize: THEME.fonts.sizes.xxl,
  },
  rewardPoints: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.accent,
  },
  rewardSubtext: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
  playButton: {
    height: 56,
  },
});
