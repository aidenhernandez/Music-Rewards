// Root layout for Expo Router
import { Stack } from 'expo-router';
import { useEffect, useState } from 'react';
import { View, Text, StyleSheet, LogBox } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

LogBox.ignoreLogs([
  'getSleepTimerProgress',
  'setSleepTimer',
  'sleepWhenActiveTrackReachesEnd',
  'clearSleepTimer',
]);
import TrackPlayer from 'react-native-track-player';
import { setupTrackPlayer } from '../services/audioService';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { MusicPlayerProvider } from '../contexts/MusicPlayerContext';
import { THEME } from '../constants/theme';

SplashScreen.preventAutoHideAsync();

TrackPlayer.registerPlaybackService(() => require('../services/playbackService'));

export default function RootLayout() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    async function init() {
      try {
        await setupTrackPlayer();
      } catch (error) {
        console.error('Failed to setup TrackPlayer:', error);
      } finally {
        await SplashScreen.hideAsync();
        setReady(true);
      }
    }
    init();
  }, []);

  if (!ready) {
    return (
      <View style={styles.loadingScreen}>
        <Text style={styles.appName}>MusicRewards</Text>
        <Text style={styles.tagline}>Earn while you listen</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary fallbackMessage="The app encountered an unexpected error. Please restart.">
      <MusicPlayerProvider>
        <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen
            name="(modals)"
            options={{
              presentation: 'modal',
              headerShown: false
            }}
          />
        </Stack>
      </MusicPlayerProvider>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  loadingScreen: {
    flex: 1,
    backgroundColor: THEME.colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  appName: {
    fontSize: 36,
    fontWeight: 'bold',
    color: THEME.colors.text.primary,
    letterSpacing: 1,
  },
  tagline: {
    fontSize: THEME.fonts.sizes.md,
    color: THEME.colors.text.secondary,
    letterSpacing: 0.5,
  },
});