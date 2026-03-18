import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schooldb.app',
  appName: 'SchoolSync',
  webDir: 'public',
  plugins: {
    StatusBar: {
      overlaysWebView: false
    }
  }
};

export default config;