// Player modal - Full-screen audio player (Expo Router modal)
import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  Alert,
  LayoutChangeEvent,
} from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { GlassCard, GlassButton } from '../../components/ui/GlassCard';
import { PointsCounter } from '../../components/ui/PointsCounter';
import { useMusicPlayerContext } from '../../contexts/MusicPlayerContext';
import { usePointsCounter } from '../../hooks/usePointsCounter';
import { useMusicStore, selectChallenges } from '../../stores/musicStore';
import { THEME } from '../../constants/theme';

export default function PlayerModal() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const challenges = useMusicStore(selectChallenges);

  const {
    currentTrack,
    isPlaying,
    currentPosition,
    duration,
    play,
    pause,
    resume,
    seekTo,
    loading,
    error
  } = useMusicPlayerContext();

  const { currentPoints, progress: pointsProgress, isActive, startCounting, stopCounting } = usePointsCounter();
  const [seekBarWidth, setSeekBarWidth] = useState(1);

  useEffect(() => {
    if (!id) return;
    if (currentTrack?.id === id) return;
    const challenge = challenges.find((c) => c.id === id);
    if (challenge) play(challenge);
  }, [id]);

  useEffect(() => {
    if (error) {
      Alert.alert('Playback Error', error);
    }
  }, [error]);

  useEffect(() => {
    if (currentTrack) {
      startCounting({
        totalPoints: currentTrack.points,
        durationSeconds: currentTrack.duration,
        challengeId: currentTrack.id,
      });
    } else {
      stopCounting();
    }
  }, [currentTrack?.id]);

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgress = (): number => {
    if (!duration || duration === 0) return 0;
    return (currentPosition / duration) * 100;
  };

  const handleSeek = (percentage: number) => {
    if (duration) {
      const newPosition = (percentage / 100) * duration;
      seekTo(newPosition);
    }
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      pause();
    } else {
      if (currentTrack) {
        resume();
      }
    }
  };

  if (!currentTrack) {
    return (
      <SafeAreaView style={styles.container}>
        <GlassCard style={styles.noTrackCard}>
          <Text style={styles.noTrackText}>No track selected</Text>
          <Text style={styles.noTrackSubtext}>
            Go back and select a challenge to start playing music
          </Text>
        </GlassCard>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Track Info */}
        <GlassCard style={styles.trackInfoCard}>
          <Text style={styles.trackTitle}>{currentTrack.title}</Text>
          <Text style={styles.trackArtist}>{currentTrack.artist}</Text>
          <Text style={styles.trackDescription}>{currentTrack.description}</Text>
          
          <PointsCounter
            currentPoints={currentPoints}
            totalPoints={currentTrack.points}
            progress={pointsProgress}
            isActive={isActive && isPlaying}
          />
        </GlassCard>

        {/* Progress Section */}
        <GlassCard style={styles.progressCard}>
          <Text style={styles.progressLabel}>Listening Progress</Text>
          
          {/* Progress Bar */}
          <TouchableOpacity
            style={styles.progressTrack}
            onPress={(event) => {
              const percentage = (event.nativeEvent.locationX / seekBarWidth) * 100;
              handleSeek(Math.min(100, Math.max(0, percentage)));
            }}
          >
            <View
              style={styles.progressBackground}
              onLayout={(e: LayoutChangeEvent) => setSeekBarWidth(e.nativeEvent.layout.width)}
            >
              <View
                style={[styles.progressFill, { width: `${getProgress()}%` }]}
              />
            </View>
          </TouchableOpacity>

          {/* Time Display */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{formatTime(currentPosition)}</Text>
            <Text style={styles.timeText}>{formatTime(duration)}</Text>
          </View>

          {/* Progress Percentage */}
          <Text style={styles.progressPercentage}>
            {Math.round(getProgress())}% Complete
          </Text>
        </GlassCard>

        {/* Controls */}
        <GlassCard style={styles.controlsCard}>
          <View style={styles.controlsRow}>
            <GlassButton
              title="⏪ -10s"
              onPress={() => handleSeek(Math.max(0, getProgress() - (10 / duration) * 100))}
              variant="secondary"
              style={styles.controlButton}
            />
            
            <GlassButton
              title={loading ? "..." : isPlaying ? "⏸️ Pause" : "▶️ Play"}
              onPress={handlePlayPause}
              variant="primary"
              style={styles.mainControlButton}
              loading={loading}
            />
            
            <GlassButton
              title="⏩ +10s"
              onPress={() => handleSeek(Math.min(100, getProgress() + (10 / duration) * 100))}
              variant="secondary"
              style={styles.controlButton}
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorIcon}>⚠️</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}
        </GlassCard>

        {/* Challenge Progress */}
        <GlassCard style={styles.challengeCard}>
          <Text style={styles.challengeLabel}>Challenge Status</Text>
          <View style={styles.challengeInfo}>
            <Text style={[
              styles.challengeStatus,
              { color: currentTrack.completed ? THEME.colors.secondary : THEME.colors.accent }
            ]}>
              {currentTrack.completed ? '✅ Completed' : '🎧 In Progress'}
            </Text>
            <Text style={styles.challengeProgress}>
              {Math.round(getProgress())}% of challenge complete
            </Text>
          </View>
        </GlassCard>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.colors.background,
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: THEME.spacing.lg,
    gap: THEME.spacing.md,
    paddingBottom: THEME.spacing.xl,
  },
  noTrackCard: {
    margin: THEME.spacing.xl,
    alignItems: 'center',
  },
  noTrackText: {
    fontSize: THEME.fonts.sizes.xl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    marginBottom: THEME.spacing.sm,
  },
  noTrackSubtext: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
    textAlign: 'center',
  },
  trackInfoCard: {
    alignItems: 'center',
  },
  trackTitle: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    textAlign: 'center',
    marginBottom: THEME.spacing.xs,
  },
  trackArtist: {
    fontSize: THEME.fonts.sizes.lg,
    color: THEME.colors.text.secondary,
    marginBottom: THEME.spacing.md,
  },
  trackDescription: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.tertiary,
    textAlign: 'center',
    marginBottom: THEME.spacing.lg,
  },
  progressCard: {
    // Card styling handled by GlassCard
  },
  progressLabel: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
    color: THEME.colors.text.primary,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  progressTrack: {
    marginBottom: THEME.spacing.md,
  },
  progressBackground: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: 4,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: THEME.spacing.sm,
  },
  timeText: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
  progressPercentage: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    textAlign: 'center',
  },
  controlsCard: {
    // Card styling handled by GlassCard
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  controlButton: {
    flex: 0.25,
    marginHorizontal: THEME.spacing.xs,
  },
  mainControlButton: {
    flex: 0.4,
    marginHorizontal: THEME.spacing.xs,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    gap: THEME.spacing.xs,
    marginTop: THEME.spacing.md,
    paddingHorizontal: THEME.spacing.sm,
  },
  errorIcon: {
    fontSize: THEME.fonts.sizes.sm,
    lineHeight: THEME.fonts.sizes.sm * 1.4,
  },
  errorText: {
    flex: 1,
    color: '#FF6B6B',
    fontSize: THEME.fonts.sizes.sm,
    textAlign: 'center',
  },
  challengeCard: {
    // Card styling handled by GlassCard
  },
  challengeLabel: {
    fontSize: THEME.fonts.sizes.md,
    fontWeight: '600',
    color: THEME.colors.text.primary,
    textAlign: 'center',
    marginBottom: THEME.spacing.md,
  },
  challengeInfo: {
    alignItems: 'center',
  },
  challengeStatus: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'bold',
    marginBottom: THEME.spacing.xs,
  },
  challengeProgress: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
  },
});