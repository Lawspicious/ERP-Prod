import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/config/firebase.config';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { IInvoice } from '@/types/invoice';
import { useAuth } from '@/context/user/userContext';
import { useToastHook } from './shared/useToastHook';
import { useLoading } from '@/context/loading/loadingContext';

const collectionName = 'invoices';

export const useInvoice = () => {
  const [allInvoices, setAllInvoices] = useState<IInvoice[]>([]);
  const [invoice, setInvoice] = useState<IInvoice | null>(null);
  const [invoicesByBill, setInvoicesByBill] = useState<IInvoice[]>([]);
  const [state, newToast] = useToastHook();
  const { authUser, role } = useAuth();
  const { setLoading } = useLoading();

  const prefix = `LAWSP-${new Date().getFullYear()}-`;

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'invoices'),
      (snapshot) => {
        const updatedInvoices: IInvoice[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...(doc.data() as IInvoice),
        }));
        setAllInvoices(updatedInvoices);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching invoices:', error);
        setLoading(false);
        newToast({
          message: 'Could not fetch Invoice',
          status: 'error',
        });
      },
    );

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  const getAllInvoices = useCallback(async () => {
    try {
      const invoicesCollection = collection(db, collectionName);
      const invoiceSnapshot = await getDocs(invoicesCollection);
      const invoiceList = invoiceSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as IInvoice),
      }));

      return invoiceList;
    } catch (error) {
      console.error('Error getting invoices:', error);
      newToast({
        message: 'Could not fetch Invoices',
        status: 'error',
      });
    }
  }, [setAllInvoices]);

  const getInvoiceById = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setInvoice({ id: docSnap.id, ...(docSnap.data() as IInvoice) });
      } else {
        console.log('No such document!');
        newToast({
          message: 'Could not find Invoice',
          status: 'error',
        });
      }
    } catch (error) {
      console.error('Error getting invoice:', error);
      newToast({
        message: 'Could not fetch Invoice',
        status: 'error',
      });
    }
  };

  const createNextDocId = async () => {
    try {
      const collectionRef = collection(db, collectionName);

      const q = query(collectionRef, orderBy('__name__', 'desc'), limit(1));

      const querySnapshot = await getDocs(q);

      let lastNumber = 0;

      querySnapshot.forEach((doc) => {
        const lastDocId = doc.id;
        const numberPart = lastDocId.split('-').pop();
        lastNumber = parseInt(numberPart as string, 10);
      });

      const newNumber = (lastNumber + 1).toString().padStart(3, '0');

      return `${prefix}${newNumber}`;
    } catch (error) {
      newToast({
        message: 'Error Creating Invoice Id',
        status: 'error',
      });
      return null;
    }
  };

  const createInvoice = useCallback(
    async (data: IInvoice) => {
      if (!authUser || role === 'LAWYER') {
        newToast({
          message: 'Permission Denied',
          status: 'error',
        });
        return;
      }

      try {
        const docId = await createNextDocId();
        if (!docId) {
          return;
        }
        const docRef = doc(db, collectionName, docId);
        await setDoc(docRef, data);
        newToast({
          message: 'Invoice Created Successfully',
          status: 'success',
        });
      } catch (error) {
        console.error('Error adding invoice:', error);
        newToast({
          message: 'Could not create Invoice',
          status: 'error',
        });
      }
    },
    [authUser, role],
  );

  const updateInvoice = useCallback(
    async (id: string, data: Partial<IInvoice>) => {
      if (!authUser || role === 'LAWYER') {
        newToast({
          message: 'Permission Denied',
          status: 'error',
        });
        return;
      }
      try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, { ...data });
        newToast({
          message: 'Invoice Updated Successfully',
          status: 'success',
        });
      } catch (error) {
        console.error('Error updating invoice:', error);
        newToast({
          message: 'Could not Update Invoice',
          status: 'error',
        });
      }
    },
    [authUser, role],
  );

  const deleteInvoice = useCallback(
    async (id: string) => {
      if (!authUser || role === 'LAWYER') {
        newToast({
          message: 'Permission Denied',
          status: 'error',
        });
        return;
      }

      try {
        const docRef = doc(db, collectionName, id);
        await deleteDoc(docRef);
        newToast({
          message: 'Invoice Deleted Successfully',
          status: 'success',
        });
      } catch (error) {
        newToast({
          message: 'Could not Delete Invoice',
          status: 'error',
        });
      }
    },
    [authUser, role],
  );

  const getInvoiceByBill = useCallback(async (billTo: string) => {
    try {
      const invoiceCollectionRef = collection(db, collectionName);
      const invoiceQuery = query(
        invoiceCollectionRef,
        where('billTo', '==', billTo),
      );
      const querySnapshot = await getDocs(invoiceQuery);

      const invoiceList: IInvoice[] = querySnapshot.docs.map((doc) => {
        const invoiceData = doc.data() as IInvoice;
        return { ...invoiceData, id: doc.id };
      });
      setInvoicesByBill(invoiceList);
      return invoiceList;
    } catch (error) {
      console.error('Error fetching invoices: ', error);
      newToast({
        message: 'Could not fetch invoice',
        status: 'error',
      });
    }
  }, []);

  const getInvoiceByPaymentDate = useCallback(async (date: string) => {
    try {
      const invoiceCollectionRef = collection(db, collectionName);
      const invoiceQuery = query(
        invoiceCollectionRef,
        where('paymentDate', '==', date),
      );
      const querySnapshot = await getDocs(invoiceQuery);

      const invoiceList: IInvoice[] = querySnapshot.docs.map((doc) => {
        const invoiceData = doc.data() as IInvoice;
        return { ...invoiceData, id: doc.id };
      });
      setInvoicesByBill(invoiceList);
      return invoiceList;
    } catch (error) {
      console.error('Error fetching invoices: ', error);
      newToast({
        message: 'Could not fetch invoice',
        status: 'error',
      });
    }
  }, []);

  const getInvoiceByCaseId = useCallback(async (id: string) => {
    try {
      const allInvoiceFetched = await getAllInvoices();
      console.log(allInvoiceFetched);
      if (allInvoiceFetched) {
        const invoiceList = allInvoiceFetched.filter((invoice) =>
          invoice.RE.find((REData) => REData.caseId === id),
        );
        return invoiceList ? invoiceList : [];
      }
      return [];
    } catch (error) {
      console.error('Error fetching invoices: ', error);
      newToast({
        message: 'Could not fetch invoice',
        status: 'error',
      });
    }
  }, []);

  return {
    allInvoices,
    invoice,
    invoicesByBill,
    getAllInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    getInvoiceById,
    createNextDocId,
    getInvoiceByBill,
    getInvoiceByCaseId,
    getInvoiceByPaymentDate,
  };
};
