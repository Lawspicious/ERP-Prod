import { Timestamp } from 'firebase/firestore';

export interface AttendanceLog {
  id: string;
  userId: string;
  userEmail: string;
  username: string;
  eventType: 'login' | 'logout';
  timestamp: Date;
}

export interface AttendanceOverride {
  id?: string;
  userId: string;
  date: string; // ISO date string for the day being overridden
  status: 'present' | 'absent';
  overriddenBy: string; // Admin user ID or name
  timestamp: Timestamp; // Firestore timestamp
  notes?: string; // Optional notes about the override
}

export interface UserAttendanceData {
  userId: string;
  username: string;
  userEmail: string;
  lastLogin: Date | null;
  status: 'present' | 'absent';
  statusOverridden: boolean;
}
