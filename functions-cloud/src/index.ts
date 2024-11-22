import { initializeApp } from 'firebase-admin/app';

export {
  createUserCloud,
  deleteUserCloud,
  resetUserPasswordCloud,
  updateUserCredCloud,
} from './modules/user/index';

export { createCaseCloud } from './modules/case/index';
export { onCaseWritten } from './modules/case/triggers';
export { createTaskCloud } from './modules/task/index';
export { onTaskWritten } from './modules/task/triggers';
export { onAppointmentWritten } from './modules/appointment/triggers';
export { scheduledDeadlineCheck } from './modules/task/scheduler';
export { scheduledDeadlineCheckAppointments } from './modules/appointment/scheduler';
export {
  createSessionCookie,
  revokeSessionCookie,
  verifySessionCookie,
} from './modules/session/index';
export { scheduledDeadlineCheckCases } from './modules/case/scheduler';
export { deleteOldNotifications } from './modules/notifications/deleteOldScheduler';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSEGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASURMENT_ID,
};

initializeApp(firebaseConfig);
