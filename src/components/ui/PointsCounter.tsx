import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
  Easing,
} from 'react-native-reanimated';
import { THEME } from '../../constants/theme';

interface PointsCounterProps {
  currentPoints: number;
  totalPoints: number;
  progress: number; // 0-100
  isActive: boolean;
}

export const PointsCounter: React.FC<PointsCounterProps> = ({
  currentPoints,
  totalPoints,
  progress,
  isActive,
}) => {
  const progressAnim = useSharedValue(0);
  const scaleAnim = useSharedValue(1);
  const prevPoints = useSharedValue(currentPoints);

  useEffect(() => {
    progressAnim.value = withTiming(progress / 100, {
      duration: 600,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  useEffect(() => {
    if (currentPoints > prevPoints.value) {
      scaleAnim.value = withSpring(1.25, { damping: 4, stiffness: 200 }, () => {
        scaleAnim.value = withSpring(1, { damping: 8, stiffness: 200 });
      });
    }
    prevPoints.value = currentPoints;
  }, [currentPoints]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${interpolate(progressAnim.value, [0, 1], [0, 100])}%`,
  }));

  const pointsTextStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleAnim.value }],
  }));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.label}>Points Earned</Text>
        {isActive && <View style={styles.activeDot} />}
      </View>

      <Animated.Text style={[styles.pointsValue, pointsTextStyle]}>
        {currentPoints}
        <Text style={styles.totalPoints}> / {totalPoints}</Text>
      </Animated.Text>

      <View style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, progressBarStyle]} />
      </View>

      <Text style={styles.progressLabel}>{Math.round(progress)}% complete</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: THEME.spacing.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: THEME.spacing.xs,
    gap: THEME.spacing.sm,
  },
  label: {
    fontSize: THEME.fonts.sizes.sm,
    color: THEME.colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: THEME.colors.secondary,
  },
  pointsValue: {
    fontSize: THEME.fonts.sizes.xxl,
    fontWeight: 'bold',
    color: THEME.colors.accent,
    marginBottom: THEME.spacing.md,
  },
  totalPoints: {
    fontSize: THEME.fonts.sizes.lg,
    fontWeight: 'normal',
    color: THEME.colors.text.secondary,
  },
  progressTrack: {
    width: '100%',
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: THEME.spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: THEME.colors.accent,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: THEME.fonts.sizes.xs,
    color: THEME.colors.text.tertiary,
  },
});
