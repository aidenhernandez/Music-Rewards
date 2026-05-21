// Register the playback service for react-native-track-player
import { AppRegistry } from 'react-native';
import TrackPlayer from 'react-native-track-player';

// Import your main app component
import App from './App';

// Register the main application
AppRegistry.registerComponent('main', () => App);

// Register the playback service
TrackPlayer.registerPlaybackService(() => require('./src/services/playbackService'));