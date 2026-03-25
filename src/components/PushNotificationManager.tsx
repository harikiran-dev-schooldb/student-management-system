'use client';

import { useEffect } from 'react';
import { Capacitor } from '@capacitor/core';

export default function PushNotificationManager() {
  useEffect(() => {

    const init = async () => {
      if (!Capacitor.isNativePlatform()) return;

      // 🔥 Load plugin dynamically (fixes your error)
      const { PushNotifications } = await import('@capacitor/push-notifications');

      try {
        const perm = await PushNotifications.requestPermissions();

        if (perm.receive === 'granted') {
          await PushNotifications.register();
        }

        PushNotifications.addListener('registration', token => {
          console.log('🔥 FCM TOKEN:', token.value);
        });

      } catch (err) {
        console.error(err);
      }
    };

    // delay ensures bridge ready
    setTimeout(init, 1500);

  }, []);

  return null;
}