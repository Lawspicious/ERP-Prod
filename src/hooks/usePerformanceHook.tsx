import { useToast } from '@chakra-ui/react';
import { useToastHook } from './shared/useToastHook';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';

export interface Task {
  lawyerDetails: any;
  id: string;
  taskName: string;
  taskStatus: string;
  taskType: string;
  priority: string;
  startDate: string;
  endDate: string;
  timeLimit: string;
}

export interface Case {
  lawyer: any;
  caseNo: string;
  caseStatus: string;
  caseType: string;
  regDate: string;
}

export interface Lawyer {
  id: string;
  name: string;
}

export interface UserWithDetails {
  lawyer: Lawyer;
  tasks: Task[];
  cases: Case[];
}

export const usePerformanceHook = () => {
  const [state, newToast] = useToastHook();

  const getUsersWithTasksAndCases = async (
    page: number,
    itemsPerPage: number,
  ): Promise<{
    data: UserWithDetails[];
    totalPages: number;
    pagesWithContent: number[];
  }> => {
    try {
      // Step 1: Fetch all users
      const usersQuerySnapshot = await getDocs(collection(db, 'users'));

      // Step 2: Fetch all tasks
      const tasksQuerySnapshot = await getDocs(collection(db, 'tasks'));

      const tasks: Task[] = tasksQuerySnapshot.docs.map((taskDoc) => ({
        id: taskDoc.id,
        taskName: taskDoc.data().taskName,
        taskStatus: taskDoc.data().taskStatus,
        taskType: taskDoc.data().taskType,
        priority: taskDoc.data().priority,
        startDate: taskDoc.data().startDate,
        endDate: taskDoc.data().endDate,
        timeLimit: taskDoc.data().timeLimit,
        lawyerDetails: taskDoc.data().lawyerDetails || [],
      }));

      // Step 3: Fetch all cases
      const casesQuerySnapshot = await getDocs(collection(db, 'cases'));

      const cases: Case[] = casesQuerySnapshot.docs.map((caseDoc) => ({
        caseNo: caseDoc.data().caseNo,
        caseStatus: caseDoc.data().caseStatus,
        caseType: caseDoc.data().caseType,
        lawyer: caseDoc.data().lawyer || {},
        regDate: caseDoc.data().regDate,
      }));

      // Step 4: Map users to their tasks and cases
      const usersWithDetails: UserWithDetails[] = usersQuerySnapshot.docs
        .map((userDoc) => {
          const userData = userDoc.data();
          const userId = userDoc.id;

          // Filter tasks for this user
          const userTasks = tasks.filter((task) =>
            task.lawyerDetails.some(
              (lawyer: { id: string }) => lawyer.id === userId,
            ),
          );

          // Filter cases for this user
          const userCases = cases.filter(
            (caseDoc) => caseDoc.lawyer?.id === userId,
          );

          // Include user only if they have at least one task or case
          if (userTasks.length > 0 || userCases.length > 0) {
            return {
              lawyer: { id: userId, name: userData.name },
              tasks: userTasks.map((task) => ({
                id: task.id,
                taskName: task.taskName,
                taskStatus: task.taskStatus,
                taskType: task.taskType,
                priority: task.priority,
                startDate: task.startDate,
                endDate: task.endDate,
                timeLimit: task.timeLimit,
              })),
              cases: userCases.map((caseDoc) => ({
                caseNo: caseDoc.caseNo,
                caseStatus: caseDoc.caseStatus,
                caseType: caseDoc.caseType,
              })),
            };
          }

          return null; // Exclude users without tasks or cases
        })
        .filter((entry) => entry !== null) as UserWithDetails[]; // Remove null entries

      // Step 5: Implement pagination
      const totalItems = usersWithDetails.length;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      const paginatedData = usersWithDetails.slice(startIndex, endIndex);

      // Pages with content (optional: show pages with existing content only)
      const pagesWithContent = Array.from(
        new Set(
          usersWithDetails.map((_, index) =>
            Math.ceil((index + 1) / itemsPerPage),
          ),
        ),
      );

      return {
        data: paginatedData,
        totalPages,
        pagesWithContent,
      };
    } catch (error) {
      console.error('Error fetching users with tasks and cases:', error);
      newToast({
        message: 'Could not fetch users with tasks and cases',
        status: 'error',
      });
      return {
        data: [],
        totalPages: 0,
        pagesWithContent: [],
      };
    }
  };

  const getUserPerformance = async (
    userId: string,
    tasksPage: number,
    casesPage: number,
    itemsPerPage: number,
    startDate?: string,
    endDate?: string,
    displayType?: string,
    taskStatus?: string,
    caseStatus?: string,
  ): Promise<{
    user: UserWithDetails | null;
    tasksPagination: {
      data: Task[];
      totalPages: number;
      pagesWithContent: number[];
    };
    casesPagination: {
      data: Case[];
      totalPages: number;
      pagesWithContent: number[];
    };
    completedTaskStats: {
      totalCompletedTasks: number;
      meanCompletionTime: number | null;
    }; // New field
    totalDecidedCases: number; // Existing field
  }> => {
    try {
      // Fetch user data
      const userDoc = await getDocs(query(collection(db, 'users')));
      const foundUserDoc = userDoc.docs.find((doc) => doc.id === userId);

      if (!foundUserDoc) {
        console.error('User not found');
        return {
          user: null,
          tasksPagination: { data: [], totalPages: 0, pagesWithContent: [] },
          casesPagination: { data: [], totalPages: 0, pagesWithContent: [] },
          completedTaskStats: {
            totalCompletedTasks: 0,
            meanCompletionTime: null,
          },
          totalDecidedCases: 0,
        };
      }

      const userData = foundUserDoc.data();

      // Helper to parse and validate date ranges
      const isWithinDateRange = (
        date: string | undefined,
        startDate?: string,
        endDate?: string,
      ): boolean => {
        if (!startDate || !endDate || !date) return true;
        const targetDate = new Date(date);
        const start = new Date(startDate);
        const end = new Date(endDate);
        return targetDate >= start && targetDate <= end;
      };

      // Helper to calculate completion time for a single task
      const calculateCompletionTime = (startDate: string, endDate: string) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
      };

      // Fetch and filter tasks
      const tasksSnapshot = await getDocs(collection(db, 'tasks'));
      const tasks: Task[] = tasksSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          taskName: doc.data().taskName,
          taskStatus: doc.data().taskStatus,
          taskType: doc.data().taskType,
          priority: doc.data().priority,
          startDate: doc.data().startDate,
          endDate: doc.data().endDate,
          timeLimit: doc.data().timeLimit,
          lawyerDetails: doc.data().lawyerDetails || [],
        }))
        .filter((task) => {
          const isRelevantToUser = task.lawyerDetails.some(
            (lawyer: { id: string }) => lawyer.id === userId,
          );

          // Check task-specific filters
          if (!isRelevantToUser) return false;
          if (displayType === 'tasks') {
            if (taskStatus && task.taskStatus !== taskStatus) return false;
            if (!isWithinDateRange(task.startDate, startDate, endDate))
              return false;
          }

          return true;
        });

      // Calculate completed task stats
      const completedTasks = tasks.filter(
        (task) => task.taskStatus === 'COMPLETED',
      );
      const totalCompletedTasks = completedTasks.length;

      const meanCompletionTime =
        totalCompletedTasks > 0
          ? completedTasks.reduce(
              (sum, task) =>
                sum + calculateCompletionTime(task.startDate, task.endDate),
              0,
            ) / totalCompletedTasks
          : null;

      // Paginate tasks
      const tasksTotalPages = Math.ceil(tasks.length / itemsPerPage);
      const tasksPagesWithContent = Array.from(
        { length: tasksTotalPages },
        (_, i) => i + 1,
      );
      const paginatedTasks = tasks.slice(
        (tasksPage - 1) * itemsPerPage,
        tasksPage * itemsPerPage,
      );

      // Fetch and filter cases
      const casesSnapshot = await getDocs(collection(db, 'cases'));
      const cases: Case[] = casesSnapshot.docs
        .map((doc) => ({
          caseNo: doc.data().caseNo,
          caseStatus: doc.data().caseStatus,
          caseType: doc.data().caseType,
          lawyer: doc.data().lawyer || {},
          regDate: doc.data().regDate,
        }))
        .filter((caseItem) => {
          const isRelevantToUser = caseItem.lawyer?.id === userId;

          // Check case-specific filters
          if (!isRelevantToUser) return false;
          if (displayType === 'cases') {
            if (caseStatus && caseItem.caseStatus !== caseStatus) return false;
            if (!isWithinDateRange(caseItem.regDate, startDate, endDate))
              return false;
          }

          return true;
        });

      // Calculate total decided cases
      const totalDecidedCases = cases.filter(
        (caseItem) => caseItem.caseStatus === 'DECIDED',
      ).length;

      // Paginate cases
      const casesTotalPages = Math.ceil(cases.length / itemsPerPage);
      const casesPagesWithContent = Array.from(
        { length: casesTotalPages },
        (_, i) => i + 1,
      );
      const paginatedCases = cases.slice(
        (casesPage - 1) * itemsPerPage,
        casesPage * itemsPerPage,
      );

      // Construct user object
      const user: UserWithDetails = {
        lawyer: { id: userId, name: userData.name },
        tasks,
        cases,
      };

      return {
        user,
        tasksPagination: {
          data: paginatedTasks,
          totalPages: tasksTotalPages,
          pagesWithContent: tasksPagesWithContent,
        },
        casesPagination: {
          data: paginatedCases,
          totalPages: casesTotalPages,
          pagesWithContent: casesPagesWithContent,
        },
        completedTaskStats: {
          totalCompletedTasks,
          meanCompletionTime,
        },
        totalDecidedCases,
      };
    } catch (error) {
      console.error('Error fetching user performance data:', error);
      return {
        user: null,
        tasksPagination: { data: [], totalPages: 0, pagesWithContent: [] },
        casesPagination: { data: [], totalPages: 0, pagesWithContent: [] },
        completedTaskStats: {
          totalCompletedTasks: 0,
          meanCompletionTime: null,
        },
        totalDecidedCases: 0,
      };
    }
  };

  return { getUsersWithTasksAndCases, getUserPerformance };
};
