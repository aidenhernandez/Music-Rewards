// Root layout for Expo Router
import { Stack } from 'expo-router';
import { useEffect } from 'react';
import TrackPlayer from 'react-native-track-player';
import { setupTrackPlayer } from '../services/audioService';

TrackPlayer.registerPlaybackService(() => require('../services/playbackService'));

export default function RootLayout() {
  useEffect(() => {
    setupTrackPlayer().catch((error) => {
      console.error('Failed to setup TrackPlayer:', error);
    });
  }, []);

  return (
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
  );
}