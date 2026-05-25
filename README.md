# MusicRewards

MusicRewards is a React Native prototype built for the Belong platform that turns music listening into a reward experience. The core idea: users are presented with music challenges — each one a track worth a set number of points. They tap Play, listen through the audio, and earn points automatically as they progress. Hit 90% of the track and the challenge is marked complete.

The app proves out the full reward loop end-to-end: **browse challenges → play audio → track progress in real time → award points → persist everything across sessions**. It runs on iOS using `react-native-track-player` for native audio with background playback and lock-screen controls, Zustand for state management, and Expo Router for navigation. The UI is built around a frosted-glass design system using Belong's brand colors.

---

---

## Requirements

- Node.js 18+
- Xcode 15+ (iOS)
- CocoaPods
- Expo CLI — `npm install -g expo-cli`

---

## Setup

```bash
# 1. Install dependencies
npm install

# 2. Install iOS pods
cd ios && pod install && cd ..

# 3. Run on iOS
expo run:ios
```

> **Note:** `react-native-track-player` requires a native build — `expo start` (Expo Go) will not work. Always use `expo run:ios`.

---

## Running the app

```bash
# iOS simulator
expo run:ios

# iOS physical device
expo run:ios --device

# Start Metro bundler only (after native build exists)
expo start
```

---

## Project structure

```
src/
├── app/                        # Expo Router screens
│   ├── _layout.tsx             # Root layout — TrackPlayer init, providers, splash
│   ├── (tabs)/
│   │   ├── index.tsx           # Home — challenge list
│   │   └── profile.tsx         # Profile — points and progress summary
│   └── (modals)/
│       ├── challenge-detail.tsx # Challenge info and Play CTA
│       └── player.tsx           # Full-screen audio player
├── components/
│   ├── challenge/              # ChallengeCard, ChallengeList
│   └── ui/                     # GlassCard, GlassButton, PointsCounter, ErrorBoundary
├── contexts/
│   └── MusicPlayerContext.tsx  # Singleton hook context
├── hooks/
│   ├── useMusicPlayer.ts       # TrackPlayer integration + store sync
│   ├── useChallenges.ts        # Challenge data access
│   └── usePointsCounter.ts     # Live points accumulation
├── services/
│   ├── audioService.ts         # TrackPlayer setup
│   └── playbackService.ts      # Background playback event handlers
├── stores/
│   ├── musicStore.ts           # Challenges + playback state (Zustand)
│   └── userStore.ts            # Points + completed IDs (Zustand + AsyncStorage)
├── constants/
│   └── theme.ts                # Design tokens + sample challenge data
└── types/
    └── index.ts                # Shared TypeScript interfaces
```

---

## Architecture

Two Zustand stores handle all state:

- **`musicStore`** — challenge list, current track, playback position. Only the challenges array is persisted; playback state resets on restart.
- **`userStore`** — total points and completed challenge IDs. Fully persisted to AsyncStorage.

`useMusicPlayer` is instantiated once at the root layout via `MusicPlayerContext`, so progress tracking runs continuously regardless of which screen is visible. All screens read playback state from store selectors; only the player modal writes to it via the context.

Points are awarded when a track reaches 90% completion, guarded by a `useRef<Set>` to prevent duplicate awards across progress ticks.

See `ARCHITECTURE.md` for full detail.

---

## Known limitations

- **iOS only** — Android has not been tested. TrackPlayer and CocoaPods are configured for iOS; Android Gradle setup is present but unverified.
- **Sample data** — challenges are hardcoded in `constants/theme.ts`. The `useChallenges` hook is structured for an API swap but no backend exists.
- **No authentication** — user identity is not implemented; all state is local to the device.
