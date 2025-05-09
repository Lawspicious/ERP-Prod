import { ITask } from '@/types/task';
import { useState, useEffect, useCallback } from 'react';
import { app, db } from '@/lib/config/firebase.config';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { useToastHook } from './shared/useToastHook';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { useAuth } from '@/context/user/userContext';
import { useLog, ILogEventInterface } from './shared/useLog';
import { useToast } from '@chakra-ui/react';

const collectionName = 'tasks';

export const useTask = () => {
  const [allTask, setAllTask] = useState<ITask[]>([]);
  const [allTaskLawyer, setAllTaskLawyer] = useState<ITask[]>([]);
  const [task, setTask] = useState<ITask | null>(null);
  const [state, newToast] = useToastHook();
  const functions = getFunctions(app, 'asia-south1');
  const createTaskAndSendEmail = httpsCallable(functions, 'createTaskCloud');
  const [loading, setLoading] = useState(true);
  const [payableTasks, setPayableTasks] = useState<ITask[]>([]);
  const [clientTasks, setClientTasks] = useState<ITask[]>([]);
  const { authUser, role } = useAuth();
  const { createLogEvent } = useLog();
  const toast = useToast();

  const createTask = async (data: Partial<ITask>) => {
    try {
      const result = await createTaskAndSendEmail({ ...data });
      console.log('Task Created and Email Sent -->', result.data);
      newToast({
        message: 'Task Created Successfully',
        status: 'success',
      });
      if (authUser) {
        await createLogEvent({
          userId: authUser?.uid,
          action: 'CREATE',
          eventDetails: `New task Created - ${data.taskName}`,
          user: {
            name: authUser?.displayName,
            email: authUser?.email,
            role: role,
          },
        } as ILogEventInterface);
      }
    } catch (error) {
      console.error('Error creating Task:', error);
      newToast({
        message: 'Could not create Task',
        status: 'error',
      });
    }
  };
  const getAllTask = useCallback(async () => {
    try {
      const tasksCollectionRef = query(
        collection(db, collectionName),
        orderBy('createdAt', 'desc'), // Order by 'date' field in descending order
      );
      const querySnapshot = await getDocs(tasksCollectionRef);

      const tasksList = querySnapshot.docs.map((doc) => ({
        ...(doc.data() as ITask),
        id: doc.id,
      }));

      setAllTask(tasksList as ITask[]);
      return tasksList;
    } catch (error) {
      console.error('Error fetching tasks: ', error);
      newToast({
        message: 'Could not fetch Tasks',
        status: 'error',
      });
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, collectionName), orderBy('createdAt', 'desc')), // Order by 'date' in useEffect as well
      (snapshot) => {
        const updatedTasks: ITask[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as ITask),
          id: doc.id,
        }));
        setAllTask(updatedTasks);
      },
      (error) => {
        console.error('Error fetching tasks:', error);
        newToast({
          message: 'Could not fetch Tasks',
          status: 'error',
        });
      },
    );

    return () => unsubscribe(); // Remember to unsubscribe on cleanup
  }, []); // Empty dependency array to fetch tasks on component mount
  // Cleanup listener on component unmount

  const getTaskById = async (id: string) => {
    try {
      const taskDocRef = doc(db, collectionName, id);
      const taskSnapshot = await getDoc(taskDocRef);

      if (taskSnapshot.exists()) {
        const taskData = taskSnapshot.data() as ITask;
        setTask(taskData);
        return taskData;
      } else {
        console.warn('No task found with the provided taskId');
        newToast({
          message: 'Could not find Task',
          status: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching task by taskId: ', error);
      newToast({
        message: 'There was an error',
        status: 'error',
      });
    }
  };

  const updateTask = async (
    id: string,
    data: Partial<ITask>,
    taskName: string,
  ) => {
    try {
      const taskDocRef = doc(db, collectionName, id);
      await updateDoc(taskDocRef, { ...data });
      toast({
        title: 'Task Updated Successfully',
        status: 'success',
        duration: 3000,
        position: 'top',
        isClosable: true,
      });
      if (authUser) {
        await createLogEvent({
          userId: authUser?.uid,
          action: 'UPDATE',
          eventDetails: `Task Updated - ${taskName}`,
          user: {
            name: authUser?.displayName,
            email: authUser?.email,
            role: role,
          },
        } as ILogEventInterface);
      }
    } catch (error) {
      console.error('Error updating task: ', error);
      newToast({
        message: 'Could not update Task',
        status: 'error',
      });
    }
  };

  const deleteTasks = async (id: string, taskName: string) => {
    try {
      const taskDocRef = doc(db, collectionName, id);
      await deleteDoc(taskDocRef);
      newToast({
        message: 'Task Deleted Successfullly!',
        status: 'success',
      });
      if (authUser) {
        await createLogEvent({
          userId: authUser?.uid,
          action: 'DELETE',
          eventDetails: `Task Deleted - ${taskName}`,
          user: {
            name: authUser?.displayName,
            email: authUser?.email,
            role: role,
          },
        } as ILogEventInterface);
      }
    } catch (error) {
      console.error('Error deleting task: ', error);
      newToast({
        message: 'Could not delete Task',
        status: 'error',
      });
    }
  };

  // const getTasksByLawyerId = useCallback(async (id: string) => {
  //   try {
  //     const allTaskData = await getAllTask();
  //     if (allTaskData && allTaskData.length > 0) {
  //       const _lawyerTasks = allTaskData.filter((task: ITask) =>
  //         task.lawyerDetails.find((lawyer) => lawyer.id === id),
  //       );
  //       setAllTask(_lawyerTasks);
  //       setAllTaskLawyer(_lawyerTasks)
  //     }
  //   } catch (error) {
  //     console.error('Error fetching tasks by lawyerId: ', error);
  //     newToast({
  //       message: 'Could not find Task',
  //       status: 'error',
  //     });
  //     return [];
  //   }
  // }, [allTaskLawyer]);

  const getTasksByLawyerId = useCallback(
    (id: string) => {
      const unsubscribe = onSnapshot(
        query(collection(db, collectionName), orderBy('createdAt', 'desc')),
        (snapshot) => {
          const allTaskData: ITask[] = snapshot.docs.map((doc) => ({
            ...(doc.data() as ITask),
            id: doc.id,
          }));
          const lawyerTasks = allTaskData.filter((task: ITask) =>
            task.lawyerDetails.find((lawyer) => lawyer.id === id),
          );
          setAllTask(lawyerTasks);
          setAllTaskLawyer(lawyerTasks);
        },
        (error) => {
          console.error(
            'Error fetching tasks by lawyerId in real-time:',
            error,
          );
          newToast({
            message: 'Could not fetch tasks in real-time.',
            status: 'error',
          });
        },
      );

      return () => unsubscribe(); // Return cleanup function to stop listening
    },
    [allTaskLawyer],
  );

  const getTasksByCaseId = useCallback(async (id: string) => {
    try {
      const taskCollectionRef = collection(db, collectionName);
      const tasksQuery = query(
        taskCollectionRef,
        where('caseDetails.caseId', '==', id),
      );
      const querySnapshot = await getDocs(tasksQuery);

      const taskList: ITask[] = querySnapshot.docs.map((doc) => {
        const taskData = doc.data() as ITask;
        return { ...taskData, taskId: doc.id };
      });

      return taskList;
    } catch (error) {
      console.error('Error fetching tasks by case', error);
      newToast({
        message: 'Could not fetch tasks',
        status: 'error',
      });
    }
  }, []);

  const getTasksByClientId = useCallback(async (id: string) => {
    try {
      const taskCollectionRef = collection(db, collectionName);
      const tasksQuery = query(
        taskCollectionRef,
        where('clientDetails.id', '==', id),
      );
      const querySnapshot = await getDocs(tasksQuery);

      const taskList: ITask[] = querySnapshot.docs.map((doc) => {
        const taskData = doc.data() as ITask;
        return { ...taskData, taskId: doc.id };
      });
      setClientTasks(taskList);
      return taskList;
    } catch (error) {
      console.error('Error fetching tasks by case', error);
      newToast({
        message: 'Could not fetch tasks',
        status: 'error',
      });
    }
  }, []);

  const getPayableTask = async () => {
    try {
      const taskCollectionRef = collection(db, collectionName);
      const taskQuery = query(
        taskCollectionRef,
        where('payable', '==', true),
        where('taskStatus', '==', 'COMPLETED'),
      );
      const querySnapshot = await getDocs(taskQuery);

      const taskList: ITask[] = querySnapshot.docs.map((doc) => {
        const taskData = doc.data() as ITask;
        return { ...taskData, id: doc.id };
      });
      return taskList;
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const taskCollectionRef = collection(db, collectionName);
    const taskQuery = query(
      taskCollectionRef,
      where('payable', '==', true),
      where('taskStatus', '==', 'COMPLETED'),
    );

    const unsubscribe = onSnapshot(
      taskQuery,
      (snapshot) => {
        const taskList: ITask[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as ITask),
          id: doc.id,
        }));
        setPayableTasks(taskList); // Assuming you have a state setter for payable tasks
      },
      (error) => {
        console.error('Error fetching payable tasks: ', error);
      },
    );

    // Cleanup the listener on component unmount
    return () => unsubscribe();
  }, [collectionName]);

  return {
    loading,
    allTask,
    task,
    allTaskLawyer,
    payableTasks,
    clientTasks,
    createTask,
    getAllTask,
    getTaskById,
    updateTask,
    deleteTasks,
    getTasksByLawyerId,
    getTasksByCaseId,
    getPayableTask,
    getTasksByClientId,
    setLoading,
  };
};
