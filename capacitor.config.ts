import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schooldb.app',
  appName: 'SchoolSync',

  webDir: 'public',

  server: {
    url: 'https://schooldb.co.in/select-school',
    cleartext: false,
    allowNavigation: ['schooldb.co.in', '*.schooldb.co.in']
  }, 
};

export default config;