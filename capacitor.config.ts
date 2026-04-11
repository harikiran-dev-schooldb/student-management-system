import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.schooldb.com',      // unique per school
  appName: 'Test School',          // branding
  webDir: '.next',

  server: {
    url: 'https://schooldb.co.in/testing_school',
    cleartext: false,
    allowNavigation: ['schooldb.co.in', '*.schooldb.co.in']
  },
};

export default config;