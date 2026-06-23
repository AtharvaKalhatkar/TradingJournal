import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.tradingjournal.app',
  appName: 'Trading Journal',
  webDir: 'dist',
  server: { androidScheme: 'https' }
};

export default config;
