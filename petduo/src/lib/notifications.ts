import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export async function ensureNotificationPermissions() {
  const { status } = await Notifications.getPermissionsAsync();
  if (status !== 'granted') {
    await Notifications.requestPermissionsAsync();
  }
}

export async function scheduleReminderNotification(title: string, body: string, trigger: Notifications.NotificationTriggerInput) {
  if (Platform.OS === 'web') return;
  await ensureNotificationPermissions();
  return Notifications.scheduleNotificationAsync({
    content: { title, body },
    trigger,
  });
}

