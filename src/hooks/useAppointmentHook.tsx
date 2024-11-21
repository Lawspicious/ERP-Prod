import { IAppointment } from '@/types/appointments';
import { useEffect, useState } from 'react';
import { useToastHook } from './shared/useToastHook';
import { logEvent } from 'firebase/analytics';

import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';
import { useLog, ILogEventInterface } from './shared/useLog';

const collectionName = 'appointments';

export const useAppointment = () => {
  const [allAppointments, setAllAppointments] = useState<IAppointment[]>([]);
  const [allAppointmentsLawyer, setAllAppointmentsLawyer] = useState<
    IAppointment[]
  >([]);
  const [appointment, setAppointment] = useState<IAppointment | null>(null);
  const [state, newToast] = useToastHook();
  const { setLoading } = useLoading();
  const { authUser, role } = useAuth();
  const { createLogEvent } = useLog();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const updatedAppointments: IAppointment[] = snapshot.docs.map(
          (doc) => ({
            ...(doc.data() as IAppointment),
            id: doc.id,
          }),
        );
        setAllAppointments(updatedAppointments);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching clients:', error);
        setLoading(false);
        newToast({
          message: 'Error Fetching Appointment',
          status: 'error',
        });
      },
    );

    return () => unsubscribe();
  }, []);

  const createAppointment = async (data: IAppointment) => {
    try {
      await addDoc(collection(db, collectionName), { ...data });
      newToast({
        message: 'New Appointment Created',
        status: 'success',
      });
      if (authUser) {
        await createLogEvent({
          userId: authUser?.uid,
          action: 'CREATE',
          eventDetails: `New appointment created`,
          user: {
            name: authUser?.displayName,
            email: authUser?.email,
            role: role,
          },
        } as ILogEventInterface);
      }
    } catch (e) {
      console.error('Error adding appointment: ', e);
      newToast({
        message: 'Error Creating Appointment',
        status: 'error',
      });
    }
  };

  const getAppointmentById = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAppointment(docSnap.data() as IAppointment);
      } else {
        console.log('No such document!');
      }
    } catch (e) {
      console.error('Error fetching appointment: ', e);
      newToast({
        message: 'No Appointment found!',
        status: 'error',
      });
    }
  };

  const deleteAppointment = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);

      newToast({
        message: 'Appointment Deleted Successfully',
        status: 'success',
      });
      if (authUser) {
        await createLogEvent({
          userId: authUser?.uid,
          action: 'DELETE',
          eventDetails: `Appointment Deleted`,
          user: {
            name: authUser?.displayName,
            email: authUser?.email,
            role: role,
          },
        } as ILogEventInterface);
      }
    } catch (e) {
      console.error('Error deleting appointment: ', e);
      newToast({
        message: 'Could not delete Appointment',
        status: 'error',
      });
    }
  };

  const updateAppointment = async (id: string, data: Partial<IAppointment>) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, { ...data });
      newToast({
        message: 'Appointment Updated Successfully',
        status: 'success',
      });
      if (authUser) {
        await createLogEvent({
          userId: authUser?.uid,
          action: 'UPDATE',
          eventDetails: `Appointment Updated`,
          user: {
            name: authUser?.displayName,
            email: authUser?.email,
            role: role,
          },
        } as ILogEventInterface);
      }
    } catch (e) {
      console.error('Error updating appointment: ', e);
      newToast({
        message: 'Could not update Appointment',
        status: 'error',
      });
    }
  };

  const getAppointmentByDate = async (
    date: string,
    limitNumber: number = 10,
  ) => {
    try {
      const appointmentCollectionRef = collection(db, collectionName);
      const appointmentQuery = query(
        appointmentCollectionRef,
        where('date', '==', date),
        limit(limitNumber),
      );
      const querySnapshot = await getDocs(appointmentQuery);

      const appointmentList: IAppointment[] = querySnapshot.docs.map((doc) => {
        const appointmentData = doc.data() as IAppointment;
        return { ...appointmentData, id: doc.id };
      });

      return appointmentList;
    } catch (error) {
      console.error('Error fetching cases by upcoming hearing date: ', error);
      newToast({
        message: 'Could not get Appointment Data',
        status: 'error',
      });
    }
  };

  const getAppointmentsByLawyerId = async (id: string) => {
    try {
      const appointmentCollectionRef = collection(db, collectionName);
      const appointmentQuery = query(
        appointmentCollectionRef,
        where('lawyerDetails.id', '==', id),
      );
      const querySnapshot = await getDocs(appointmentQuery);

      const appointmentList: IAppointment[] = querySnapshot.docs.map((doc) => {
        const appointmentData = doc.data() as IAppointment;
        return { ...appointmentData, id: doc.id };
      });
      setAllAppointmentsLawyer(appointmentList);
      return appointmentList;
    } catch (error) {
      console.error('Error fetching cases by upcoming hearing date: ', error);
      newToast({
        message: 'Could not get Appointment Data',
        status: 'error',
      });
    }
  };

  return {
    appointment,
    allAppointments,
    allAppointmentsLawyer,
    getAppointmentById,
    createAppointment,
    deleteAppointment,
    updateAppointment,
    getAppointmentByDate,
    setAppointment,
    setAllAppointments,
    getAppointmentsByLawyerId,
  };
};
