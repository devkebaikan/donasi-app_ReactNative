import './global.css';
import {AppRegistry, LogBox} from 'react-native';
import {configureReanimatedLogger, ReanimatedLogLevel} from 'react-native-reanimated';
import {App} from './src/app/App';
import {name as appName} from './app.json';

// Matikan strict mode Reanimated agar tidak memunculkan warning membaca .value saat render
configureReanimatedLogger({
  strict: false,
  level: ReanimatedLogLevel.warn,
});

// Sembunyikan warning deprecation deep import modul internal Text/TextInput
LogBox.ignoreLogs([
  "Deep imports from the 'react-native' package are deprecated",
]);

AppRegistry.registerComponent(appName, () => App);
