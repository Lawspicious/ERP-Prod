export interface INotifications {
  id?: string; // Optional: Firestore document ID
  type: 'Task' | 'Appointment' | 'Case'; // Type of the notification
  taskId?: string; // For task-related notifications
  appointmentId?: string; // For appointment-related notifications
  caseId?: string; // For case-related notifications
  taskName?: string; // Name of the task (if applicable)
  appointmentName?: string; // Name of the appointment (if applicable)
  caseNo?: string; // Case number (if applicable)
  lawyerIds: string[]; // Array of lawyer IDs related to the notification
  notificationName: string; // Description of the notification
  endDate?: string; // End date for tasks or appointments
  nextHearing?: string | 'Not Scheduled'; // Next hearing date for cases
  createdAt: FirebaseFirestore.Timestamp; // Firestore timestamp for when the notification was created
  lawyerName?: string; // Name of the lawyer associated with the notification
  clientDetails?: IClientDetails;
  location?: string;
  status: 'unseen' | 'seen';
  seenBy: string[];
  clearedBy: string[];
}
