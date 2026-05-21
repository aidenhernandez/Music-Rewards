// Root layout for Expo Router
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import TrackPlayer from 'react-native-track-player';
import { setupTrackPlayer } from '../services/audioService';
import { ErrorBoundary } from '../components/ui/ErrorBoundary';
import { MusicPlayerProvider } from '../contexts/MusicPlayerContext';

TrackPlayer.registerPlaybackService(() => require('../services/playbackService'));

export default function RootLayout() {
  useEffect(() => {
    setupTrackPlayer().catch((error) => {
      console.error('Failed to setup TrackPlayer:', error);
    });
  }, []);

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