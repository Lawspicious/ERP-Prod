import { ICase } from '@/types/case';
import { useCallback, useState } from 'react';
import { useAuth } from '@/context/user/userContext';
import { useToastHook } from './shared/useToastHook';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  orderBy,
  query,
  updateDoc,
  where,
} from 'firebase/firestore';
import { app, db } from '@/lib/config/firebase.config';
import { getFunctions, httpsCallable } from 'firebase/functions';

const collectionName = 'cases';

export const useCases = () => {
  const [inividualCase, setCase] = useState<ICase | null>(null);
  const [allCases, setAllCases] = useState<ICase[]>([]);
  const [allCasesLawyer, setAllCasesLawyer] = useState<ICase[]>([]);
  const { role, authUser } = useAuth();
  const [state, newToast] = useToastHook();
  const functions = getFunctions(app, 'asia-south1');
  const createCaseAndSendEmail = httpsCallable(functions, 'createCaseCloud');

  const getAllCases = useCallback(async () => {
    // if (role !== 'ADMIN') {
    //   newToast({
    //     message: 'Permission Denied',
    //     status: 'error',
    //   });
    //   return;
    // }
    try {
      const casesCollectionRef = collection(db, collectionName);
      const querySnapshot = await getDocs(casesCollectionRef);

      const caseList: ICase[] = querySnapshot.docs.map((doc) => ({
        caseId: doc.id,
        ...(doc.data() as ICase),
      }));
      setAllCases(caseList);
    } catch (error) {
      console.error('Error fetching cases: ', error);
      newToast({
        message: 'Could not fetch Cases',
        status: 'error',
      });
    }
  }, [authUser, role]);

  const getCaseById = useCallback(async (id: string) => {
    try {
      const caseDocRef = doc(db, collectionName, id);
      const caseSnapshot = await getDoc(caseDocRef);

      if (caseSnapshot.exists()) {
        setCase({ caseId: caseSnapshot.id, ...(caseSnapshot.data() as ICase) });
        return { caseId: caseSnapshot.id, ...(caseSnapshot.data() as ICase) };
      } else {
        console.warn('No case found with the provided caseId');
        newToast({
          message: 'Could not find Case',
          status: 'error',
        });
      }
    } catch (error) {
      console.error('Error fetching case by caseId: ', error);
      newToast({
        message: 'There was an error',
        status: 'error',
      });
    }
  }, []);

  const createCase = async (data: ICase) => {
    if (!authUser || role !== 'ADMIN') {
      newToast({
        message: 'Permission Denied',
        status: 'error',
      });
      return;
    }
    try {
      const result = await createCaseAndSendEmail({ ...data });
      console.log('Case Created and Email Sent -->', result.data);
      newToast({
        message: 'Case Created Successfully',
        status: 'success',
      });
      return result;
    } catch (error) {
      console.error('Error creating case:', error);
      newToast({
        message: 'Could not create case',
        status: 'error',
      });
    }
  };

  const deleteCase = async (id: string) => {
    if (!authUser || (role !== 'ADMIN' && role !== 'SUPERADMIN')) {
      newToast({
        message: 'Permission Denied',
        status: 'error',
      });
      return;
    }
    try {
      const caseDocRef = doc(db, 'cases', id);
      await deleteDoc(caseDocRef);
      newToast({
        message: 'Case Deleted Successfully',
        status: 'success',
      });
    } catch (error) {
      console.error('Error deleting case: ', error);
      newToast({
        message: 'Could not delete case',
        status: 'error',
      });
    }
  };

  const updateCase = async (id: string, data: Partial<ICase>) => {
    try {
      const caseDocRef = doc(db, collectionName, id);
      await updateDoc(caseDocRef, { ...data });
      newToast({
        message: 'Case Updated Successfully',
        status: 'success',
      });
    } catch (error) {
      console.error('Error updating case: ', error);
      newToast({
        message: 'Could not Update case',
        status: 'error',
      });
    }
  };

  const fetchCasesByLawyerId = async (lawyerId: string) => {
    try {
      const casesCollectionRef = collection(db, collectionName);
      const casesQuery = query(
        casesCollectionRef,
        where('lawyer.id', '==', lawyerId),
      );
      const querySnapshot = await getDocs(casesQuery);

      const casesList: ICase[] = querySnapshot.docs.map((doc) => {
        const caseData = doc.data() as ICase;
        return { ...caseData, caseId: doc.id };
      });
      setAllCasesLawyer(casesList);
      return casesList;
    } catch (error) {
      console.error('Error fetching cases by lawyerId: ', error);
      newToast({
        message: 'Could not fetch case',
        status: 'error',
      });
    }
  };

  const fetchCasesByUpcomingHearing = async (limitNumber: number = 10) => {
    try {
      const casesCollectionRef = collection(db, collectionName);
      const casesQuery = query(
        casesCollectionRef,
        orderBy('nextHearing', 'desc'),
        limit(limitNumber),
      );
      const querySnapshot = await getDocs(casesQuery);

      const casesList: ICase[] = querySnapshot.docs.map((doc) => {
        const caseData = doc.data() as ICase;
        return { ...caseData, caseId: doc.id };
      });

      return casesList;
    } catch (error) {
      console.error('Error fetching cases by upcoming hearing date: ', error);
      newToast({
        message: 'Could not fetch case',
        status: 'error',
      });
    }
  };

  const fetchCasesByDate = async (limitNumber: number = 10, date: string) => {
    try {
      const casesCollectionRef = collection(db, collectionName);
      const casesQuery = query(
        casesCollectionRef,
        where('nextHearing', '==', date),
        limit(limitNumber),
      );
      const querySnapshot = await getDocs(casesQuery);

      const casesList: ICase[] = querySnapshot.docs.map((doc) => {
        const caseData = doc.data() as ICase;
        return { ...caseData, caseId: doc.id };
      });

      setAllCases(casesList);
    } catch (error) {
      console.error('Error fetching cases by upcoming hearing date: ', error);
      newToast({
        message: 'Could not fetch case',
        status: 'error',
      });
    }
  };

  const fetchCasesByPriority = async (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    try {
      const casesCollectionRef = collection(db, collectionName);
      const casesQuery = query(
        casesCollectionRef,
        where('priority', '==', priority),
      );
      const querySnapshot = await getDocs(casesQuery);

      const casesList: ICase[] = querySnapshot.docs.map((doc) => {
        const caseData = doc.data() as ICase;
        return { ...caseData, caseId: doc.id };
      });

      setAllCases(casesList);
      return casesList;
    } catch (error) {
      console.error('Error fetching cases by priority date: ', error);
      newToast({
        message: 'Could not fetch case',
        status: 'error',
      });
    }
  };

  const fetchCasesByPriorityAndLawyerId = async (
    priority: 'HIGH' | 'MEDIUM' | 'LOW',
    id: string,
  ) => {
    try {
      const casesCollectionRef = collection(db, collectionName);
      const casesQuery = query(
        casesCollectionRef,
        where('priority', '==', priority),
        where('lawyer.id', '==', id),
      );
      const querySnapshot = await getDocs(casesQuery);

      const casesList: ICase[] = querySnapshot.docs.map((doc) => {
        const caseData = doc.data() as ICase;
        return { ...caseData, caseId: doc.id };
      });

      setAllCasesLawyer(casesList);
      return casesList;
    } catch (error) {
      console.error('Error fetching cases by priority date: ', error);
      newToast({
        message: 'Could not fetch case',
        status: 'error',
      });
    }
  };

  const fetchCasesByClientId = async (id: string) => {
    try {
      const casesCollectionRef = collection(db, collectionName);
      const casesQuery = query(
        casesCollectionRef,
        where('clientDetails.id', '==', id),
      );
      const querySnapshot = await getDocs(casesQuery);

      const casesList: ICase[] = querySnapshot.docs.map((doc) => {
        const caseData = doc.data() as ICase;
        return { ...caseData, caseId: doc.id };
      });
      setAllCases(casesList);
    } catch (error) {
      console.error('Error fetching cases by priority date: ', error);
      newToast({
        message: 'Could not fetch case',
        status: 'error',
      });
    }
  };

  const fetchCasesByLawyerIdAndDate = async (id: string, date: string) => {
    try {
      const casesCollectionRef = collection(db, collectionName);
      const casesQuery = query(
        casesCollectionRef,
        where('lawyer.id', '==', id),
        where('nextHearing', '==', date),
      );
      const querySnapshot = await getDocs(casesQuery);

      const casesList: ICase[] = querySnapshot.docs.map((doc) => {
        const caseData = doc.data() as ICase;
        return { ...caseData, caseId: doc.id };
      });
      setAllCasesLawyer(casesList);
      return casesList;
    } catch (error) {
      console.error('Error fetching cases by priority date: ', error);
      newToast({
        message: 'Could not fetch case',
        status: 'error',
      });
    }
  };

  const fetchCasesByStatus = async (
    caseStatus: 'RUNNING' | 'ABANDONED' | 'DECIDED',
  ) => {
    try {
      const casesCollectionRef = collection(db, collectionName);
      const casesQuery = query(
        casesCollectionRef,
        where('caseStatus', '==', caseStatus),
      );
      const querySnapshot = await getDocs(casesQuery);

      const casesList: ICase[] = querySnapshot.docs.map((doc) => {
        const caseData = doc.data() as ICase;
        return { ...caseData, caseId: doc.id };
      });
      setAllCases(casesList);
      return casesList;
    } catch (error) {
      console.error('Error fetching cases by priority date: ', error);
      newToast({
        message: 'Could not fetch case',
        status: 'error',
      });
    }
  };

  return {
    inividualCase,
    allCases,
    allCasesLawyer,
    getAllCases,
    getCaseById,
    createCase,
    deleteCase,
    updateCase,
    fetchCasesByDate,
    fetchCasesByLawyerId,
    fetchCasesByUpcomingHearing,
    fetchCasesByPriority,
    fetchCasesByClientId,
    fetchCasesByStatus,
    fetchCasesByLawyerIdAndDate,
    fetchCasesByPriorityAndLawyerId,
  };
};
