# MusicRewards Test App

This is the recommended project structure for the Belong React Native assessment. Use this as your starting point!

## 🚀 Setup Instructions

**📖 See [../SETUP.md](../SETUP.md) for complete setup instructions**

This test-app folder contains the complete starter code structure for your MusicRewards implementation. Don't run setup commands from here - follow the main setup guide above.

**Quick Reference:**
```bash
# From the parent react-native/ folder:
cp -r test-app ~/MusicRewards
cd ~/MusicRewards
npx create-expo-app . --template typescript
npm install
npx expo start
```

## 📁 Project Structure

This structure follows Belong's mobile app architecture patterns:

```
src/
├── app/                    # Expo Router pages
│   ├── (tabs)/
│   │   ├── index.tsx       # Home screen with challenge list
│   │   ├── profile.tsx     # Profile with user progress
│   │   └── _layout.tsx     # Tab navigation setup
│   ├── (modals)/
│   │   ├── player.tsx      # Full-screen audio player
│   │   └── _layout.tsx     # Modal navigation setup
│   └── _layout.tsx         # Root layout
├── components/
│   ├── ui/                 # Glass design system components
│   │   ├── GlassCard.tsx
│   │   ├── GlassButton.tsx
│   │   └── PointsCounter.tsx
│   └── challenge/          # Challenge-specific components
│       ├── ChallengeCard.tsx
│       └── ChallengeList.tsx
├── hooks/                  # Business logic hooks
│   ├── useMusicPlayer.ts
│   ├── usePointsCounter.ts
│   └── useChallenges.ts
├── stores/                 # Zustand stores
│   ├── musicStore.ts
│   └── userStore.ts
├── services/               # External services
│   └── audioService.ts
├── constants/              # Theme and configuration
│   └── theme.ts
└── types/                  # TypeScript definitions
    └── index.ts
```

## 🎵 Audio Files

The assessment uses these pre-hosted tracks:
- **Track 1:** Camo & Krooked - All Night (3:39, 150 points)
- **Track 2:** Roni Size - New Forms (7:44, 300 points)

URLs and sample data are in [`../assets/audio/README.md`](../assets/audio/README.md)

## 🎯 Implementation Order

1. **Set up basic navigation structure**
2. **Create Zustand stores (musicStore.ts, userStore.ts)**
3. **Build glass design components (GlassCard, GlassButton)**
4. **Implement useMusicPlayer hook with TrackPlayer**
5. **Create challenge list and player modal UI**
6. **Add points counter and progress tracking**
7. **Test on both platforms and add error handling**

## 📖 Reference

See the main [README.md](../README.md) for detailed technical requirements and evaluation criteria.

Good luck! 🚀🎵