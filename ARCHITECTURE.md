# Architecture Overview — MusicRewards

## Tech Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | React Native + Expo (v54) | Cross-platform, fast iteration, managed workflow |
| Navigation | Expo Router (file-based) | Matches Belong's routing patterns, modal-first architecture |
| State | Zustand + AsyncStorage | Lightweight, selector-based, minimal boilerplate vs Redux |
| Audio | react-native-track-player | Background playback, native controls, lock screen support |
| Styling | StyleSheet + expo-blur + expo-linear-gradient | Glass design system with blur/gradient effects |
| Language | TypeScript (strict) | Type safety across stores, hooks, and components |

---

## State Management

Two domain-focused Zustand stores, following Belong's selector pattern.

### `musicStore`
Owns all challenge and playback state:
- `challenges` — array of `MusicChallenge` with live progress and completion status
- `currentTrack` — the track currently loaded into TrackPlayer
- `isPlaying`, `currentPosition` — playback state synced from TrackPlayer

Persistence: only `challenges` is persisted to AsyncStorage via `partialize`. Playback state intentionally resets on app restart — the queue is always cleared by TrackPlayer on kill.

### `userStore`
Owns user progress:
- `totalPoints` — cumulative points earned across all challenges
- `completedChallenges` — array of completed challenge IDs

Persistence: entire store persisted. Points and completions survive app restarts.

### Selector pattern
All store reads use granular selectors to prevent unnecessary re-renders:
```ts
const totalPoints = useUserStore(selectTotalPoints);  // re-renders only when points change
```

---

## Audio Architecture

### Single hook instance via context

`useMusicPlayer` is instantiated once at the root layout level via `MusicPlayerContext`. All screens consume it through `useMusicPlayerContext()`.

This solves a key problem: if the hook ran inside individual screens (e.g. the player modal), unmounting that screen would stop progress tracking. By lifting it to the root, `updateProgress` runs continuously regardless of which screen is visible — so the challenge list and detail screens reflect live progress even when the player modal is closed.

```
RootLayout
└── MusicPlayerProvider        ← single useMusicPlayer instance
    └── Stack (screens)
        ├── (tabs)/index       ← reads progress from store
        ├── (modals)/challenge-detail  ← reads progress from store
        └── (modals)/player    ← consumes MusicPlayerContext for actions
```

### TrackPlayer lifecycle
- `registerPlaybackService` is called at module level in `_layout.tsx` (before app mounts) — required by RNTP v4
- `setupPlayer` runs in a `useEffect` on first mount, guarded against double-init on hot reload
- Background playback events (remote play/pause/seek) are handled in `playbackService.ts`

### Completion detection
Points are awarded when playback reaches 90% of the track duration. A `useRef<Set<string>>` guards against the completion firing multiple times before the store update propagates:
```ts
if (progressPercentage >= 90 && !awardedChallenges.current.has(currentTrack.id)) {
  awardedChallenges.current.add(currentTrack.id);  // synchronous guard
  markChallengeComplete(currentTrack.id);
  addPoints(currentTrack.points);
}
```
90% rather than 100% accounts for TrackPlayer timing inconsistencies near the end of a track.

---

## Hook Architecture

| Hook | Responsibility |
|---|---|
| `useMusicPlayer` | TrackPlayer integration, progress tracking, points award, store sync |
| `usePointsCounter` | Live animated points counter driven by `useProgress()` |
| `useChallenges` | Challenge list with loading/error states, wraps store access |

Hooks orchestrate store actions and async operations. Components stay presentational — they receive data via props or read from hooks, never interact with stores directly.

---

## Navigation Structure

```
app/
├── _layout.tsx              # Root Stack, TrackPlayer init, MusicPlayerProvider
├── (tabs)/
│   ├── _layout.tsx          # Tab bar (Challenges, Profile)
│   ├── index.tsx            # Challenge list
│   └── profile.tsx          # Points, progress, achievements
└── (modals)/
    ├── _layout.tsx          # Modal Stack
    ├── challenge-detail.tsx # Challenge info, stats, play button
    └── player.tsx           # Full-screen audio player
```

**Navigation flow:** Home → Challenge Detail (modal) → Player (modal)

Challenge Detail and Player are stacked modals within the `(modals)` group. Both screens are mounted simultaneously when the player is open, which is why `useMusicPlayer` must live in a single shared context rather than being called in both screens.

---

## Component Architecture

### Glass design system
Three reusable primitives cover the entire UI:

- **`GlassCard`** — `BlurView` + `LinearGradient` layered with an absolute-fill border overlay. Accepts `gradientColors` to switch between card, primary (purple), and secondary (white) variants.
- **`GlassButton`** — wraps `GlassCard` with a `TouchableOpacity`, supports loading state via `ActivityIndicator`
- **`PointsCounter`** — animated counter driven by `react-native-reanimated`. Progress bar animates via `withTiming`, points value springs on increment

### Challenge components
- **`ChallengeCard`** — displays challenge metadata, progress bar, difficulty badge, and play button. Highlights with primary gradient when it's the currently loaded track.
- **`ChallengeList`** — `FlatList` wrapper with loading, error, and empty states. Accepts all state as props, keeping it purely presentational.

### Error handling
- **`ErrorBoundary`** — class component wrapping the root Stack. Catches any unhandled JS error in the tree and renders a recoverable error UI with a "Try Again" button.

---

## Data Flow

```
TrackPlayer (native)
    │
    ├── useProgress() ──────────────► useMusicPlayer (context)
    │                                      │
    ├── usePlaybackState() ─────────────── │
    │                                      ▼
    └── useTrackPlayerEvents() ──► Zustand stores (musicStore, userStore)
                                           │
                                    React components
                                    (re-render via selectors)
```

---

## Key Design Decisions

**Zustand over Redux** — The app has two focused domains (music, user) with no complex cross-domain derived state. Zustand's minimal API and direct selector subscriptions are sufficient and avoid Redux boilerplate.

**Context for the player hook** — Lifting `useMusicPlayer` to a context ensures a single TrackPlayer event listener and a single source of truth for playback state, preventing the competing `useEffect` conflicts that arise when multiple screens instantiate the hook simultaneously.

**90% completion threshold** — Avoids edge cases where TrackPlayer's `PlaybackQueueEnded` event fires before `useProgress` reports exactly 100%, which can cause completion to be missed entirely.

**`partialize` for persistence** — Persisting only `challenges` (not playback state) keeps the AsyncStorage footprint small and avoids stale playback state on restart. Progress percentages and points survive restarts; the audio queue does not.

---

## React Native Patterns Reference

Patterns used in this project that are worth knowing.

### Controlled splash screen lifecycle

Call `SplashScreen.preventAutoHideAsync()` at module level (before the root component mounts) to hold the native splash open, then `SplashScreen.hideAsync()` once async initialization is complete. This eliminates the white flash between the OS-level splash and the first React render.

```ts
SplashScreen.preventAutoHideAsync(); // holds the native splash

useEffect(() => {
  async function init() {
    await setupTrackPlayer();        // do async work
    await SplashScreen.hideAsync();  // release splash only when ready
    setReady(true);
  }
  init();
}, []);
```

Pair this with an in-app loading screen (rendered when `ready === false`) so the transition is seamless rather than jumping straight into the main UI.

---

### `onLayout` for dynamic measurements

When a component's rendered size is unknown at write time (different screen widths, font scaling, orientation), use `onLayout` to capture the real dimensions after layout is computed:

```ts
const [seekBarWidth, setSeekBarWidth] = useState(1);

<View onLayout={(e: LayoutChangeEvent) => setSeekBarWidth(e.nativeEvent.layout.width)} />
```

Used here to make the seek bar tap-to-seek accurate across all device widths. A hardcoded constant would be wrong on any device that doesn't match the one it was tuned on.

---

### `useRef<Set>` as a render-safe deduplication guard

When a `useEffect` fires on every state update (e.g. every progress tick) but the action inside should only happen once, a `useRef<Set>` is the right guard — it persists across renders without triggering re-renders:

```ts
const awardedChallenges = useRef<Set<string>>(new Set());

if (progress >= 90 && !awardedChallenges.current.has(id)) {
  awardedChallenges.current.add(id); // synchronous — blocks the next tick immediately
  addPoints(points);
}
```

Using `useState` here would cause a re-render, which would re-run the effect, defeating the guard. `useRef` updates are synchronous and invisible to React's render cycle.

---

### `adjustsFontSizeToFit` for responsive button labels

When button width is constrained and labels include emoji + text, the text can wrap to a second line. Set `numberOfLines={1}` with `adjustsFontSizeToFit` and `minimumFontScale` to let the label shrink to fit rather than wrap:

```tsx
<Text
  numberOfLines={1}
  adjustsFontSizeToFit
  minimumFontScale={0.7}
>
  ⏪ -10s
</Text>
```

`minimumFontScale={0.7}` caps how small the text will shrink (70% of the base size), so it never becomes unreadable.

---

### `contentStyle` escape hatch on composite components

When a component wraps content in a container with fixed padding, inner layout can become constrained in ways callers can't override via the outer `style` prop alone. Adding a `contentStyle` prop exposes the inner container:

```tsx
// GlassCard: exposes inner padding override
<View style={[styles.contentContainer, contentStyle]}>
  {children}
</View>

// GlassButton: zeroes vertical padding so the button fills its full height
<GlassCard contentStyle={{ paddingVertical: 0, paddingHorizontal: 4 }}>
```

This pattern avoids duplicating the component for edge cases while keeping the default behavior intact for all other usages.

---

### `ScrollView` with `gap` for viewport-adaptive layouts

Replacing `justifyContent: 'space-between'` on a fixed `View` with a `ScrollView` + `gap` makes layouts work across all screen sizes:

```tsx
// Fragile: clips content on short screens, over-spaces on tall ones
<View style={{ flex: 1, justifyContent: 'space-between' }}>

// Robust: scrolls if needed, consistent spacing everywhere
<ScrollView contentContainerStyle={{ gap: 16, padding: 24, paddingBottom: 32 }}>
```

`space-between` distributes whatever space is available — it compresses cards on small screens and spreads them too far on large ones. `gap` keeps spacing predictable regardless of viewport height.
