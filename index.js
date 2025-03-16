// Import initializations first
import './src/utils/polyfills';
import './src/utils/reanimated';
import './src/utils/gestureHandler';
import './src/utils/safeAreaContext';
import './src/utils/screens';
import { registerRootComponent } from 'expo';
import App from './App';

// Register the main component
registerRootComponent(App); 