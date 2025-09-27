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
  status: 'present' | 'absent' | 'early_leave';
  overriddenBy: string; // Admin user ID or name
  timestamp: Timestamp; // Firestore timestamp
  notes?: string; // Optional notes about the override
}

export interface IEarlyLeave {
  id?: string;
  userId: string;
  name: string;
  date: string;
  loginTime: string;
  exitTime: string;
  workingHours: string;
  reason: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string;
}

export interface UserAttendanceData {
  userId: string;
  username: string;
  userEmail: string;
  lastLogin: Date | null;
  status: 'present' | 'absent' | 'early_leave';
  statusOverridden: boolean;
}
