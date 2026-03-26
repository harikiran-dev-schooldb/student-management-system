import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schooldb.app',
  appName: 'SchoolSync',

  webDir: 'public', // can stay, but won't be used when server.url is set

  server: {
    url: 'https://schooldb.co.in/app', // ✅ IMPORTANT (no www)
    cleartext: false,
    allowNavigation: ['schooldb.co.in', '*.schooldb.co.in']
  },

  
};

export default config;