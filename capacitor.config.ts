import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'africa.sentill.app',
  appName: 'Sentill',
  webDir: 'public', // Unused when server.url is active
  server: {
    url: 'https://sentill.africa', // Pointing directly to the live production server
    cleartext: true
  },
  plugins: {
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    }
  }
};

export default config;
