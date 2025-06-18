import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';
import { useToastHook } from './shared/useToastHook';
import { differenceInHours } from 'date-fns';
import { sendFollowUpEmail } from '../lib/utils/sendFollowUpEmail';
import { useTask } from './useTaskHooks';

export interface FollowUp {
  id: string;
  taskId: string;
  userId: string;
  userName: string;
  assignedTo: string[];
  assignedToEmails: string[];
  assignedToName: string[];
  message: string;
  timestamp: Timestamp;
}

export const useFollowUp = () => {
  const [state, newToast] = useToastHook();
  const followUpRef = collection(db, 'follow_ups');
  const taskRef = collection(db, 'tasks');
  const { getTaskById } = useTask();

  const createFollowUp = async ({
    taskId,
    userId,
    userName,
  }: {
    taskId: string;
    userId: string;
    userName: string;
  }) => {
    try {
      const task = await getTaskById(taskId);

      const lastFollowUpAt = task?.lastFollowUpAt?.toDate?.();

      if (lastFollowUpAt) {
        const hoursSinceLast = differenceInHours(
          new Date(),
          lastFollowUpAt as Date,
        );
        if (hoursSinceLast < 3) {
          newToast({
            message: `Follow-up already taken within last ${3 - hoursSinceLast} hour(s).`,
            status: 'warning',
          });
          return;
        }
      }

      const assignedTo = task?.lawyerDetails.map((item) => item.id);
      const assignedtoNames = task?.lawyerDetails.map((item) => item.name);
      const assignedToEmails = task?.lawyerDetails.map((item) => item.email);

      await addDoc(followUpRef, {
        taskId,
        taskTitle: task?.taskName,
        userId,
        userName,
        assignedTo: assignedTo || [],
        assignedtoNames: assignedtoNames || [],
        assignedToEmails: assignedToEmails || [],
        message: `following up with you for the following task: ${task?.taskName}`,
        timestamp: serverTimestamp(),
      });

      await updateDoc(doc(taskRef, taskId), {
        lastFollowUpAt: serverTimestamp(),
      });

      if (assignedToEmails) {
        for (const to_email of assignedToEmails) {
          await sendFollowUpEmail({
            to_email,
            taskTitle: task?.taskName as string,
            fromUserName: userName,
          });
        }
      }

      newToast({
        message: 'Follow-up recorded and email sent to all assignees',
        status: 'success',
      });
    } catch (err) {
      console.error(err);
      newToast({ message: 'Failed to record follow-up', status: 'error' });
    }
  };

  const getFollowUpsByTaskId = async (taskId: string): Promise<FollowUp[]> => {
    try {
      const followUpRef = collection(db, 'follow_ups');
      const q = query(
        followUpRef,
        where('taskId', '==', taskId),
        orderBy('timestamp', 'desc'),
      );

      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as FollowUp[];
    } catch (error) {
      console.error('Error fetching follow-ups:', error);
      return [];
    }
  };
  return { createFollowUp, getFollowUpsByTaskId };
};
