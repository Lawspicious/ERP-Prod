import { analytics } from '@/lib/config/firebase.config';
import { getAnalytics, logEvent } from 'firebase/analytics';

export const logCustomEvent = async (event: string) => {
  if (!analytics) return;

  logEvent(getAnalytics(), event, { platform: 'web' });
};
