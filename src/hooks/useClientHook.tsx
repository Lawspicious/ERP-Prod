import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/config/firebase.config';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import { IClient, IClientProspect } from '@/types/client';
import { useAuth } from '@/context/user/userContext';
import { useToastHook } from './shared/useToastHook';
import { useLoading } from '@/context/loading/loadingContext';
import { useLog, ILogEventInterface } from './shared/useLog';

const collectionName = 'clients';

export const useClient = () => {
  const [allClients, setAllClients] = useState<(IClient | IClientProspect)[]>(
    [],
  );
  const [normalClient, setNormalClient] = useState<IClient[]>([]);
  const [prospectClient, setProspectClient] = useState<IClientProspect[]>([]);
  const [client, setClient] = useState<IClient | IClientProspect | null>(null);
  const { authUser, role } = useAuth();
  const [state, newToast] = useToastHook();
  const { setLoading, loading } = useLoading();
  const { createLogEvent } = useLog();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        const updatedClients: (IClient | IClientProspect)[] = snapshot.docs.map(
          (doc) => ({
            ...(doc.data() as IClient | IClientProspect),
            id: doc.id,
          }),
        );
        setAllClients(updatedClients);
        setLoading(false);
      },
      (error) => {
        console.error('Error fetching clients:', error);
        setLoading(false);
        newToast({
          message: 'Could not fetch Clients',
          status: 'error',
        });
      },
    );

    // Cleanup listener on component unmount
    return () => unsubscribe();
  }, []);

  const getAllClients = useCallback(async () => {
    try {
      const clientsCollection = collection(db, collectionName);
      const clientSnapshot = await getDocs(clientsCollection);
      const clientList = clientSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as IClient | IClientProspect),
      }));
      setAllClients(clientList as (IClient | IClientProspect)[]);
    } catch (error) {
      newToast({
        message: 'Could not fetch Clients',
        status: 'error',
      });
    }
  }, [setAllClients]);

  const getClientByType = useCallback(
    async (clientType: 'normal' | 'prospect') => {
      try {
        const clientCollectionRef = collection(db, collectionName);
        const q = query(
          clientCollectionRef,
          where('clientType', '==', clientType),
        );
        const querySnapshot = await getDocs(q);

        const clientList = querySnapshot.docs.map((doc) => {
          const clientData = doc.data() as IClient | IClientProspect;
          return { ...clientData, id: doc.id };
        });

        if (clientType === 'normal') {
          setNormalClient(clientList as IClient[]);
        } else {
          setProspectClient(clientList as IClientProspect[]);
        }
      } catch (error) {
        console.error(error);
        newToast({
          message: `Could not fetch ${clientType} clients`,
          status: 'error',
        });
      }
    },
    [],
  );

  //fetch client by type using listener snapshot
  useEffect(() => {
    const unsubscribeNormal = onSnapshot(
      query(
        collection(db, collectionName),
        where('clientType', '==', 'normal'),
      ),
      (snapshot) => {
        const normalClients: IClient[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as IClient),
          id: doc.id,
        }));
        setNormalClient(normalClients);
      },
      (error) => {
        console.error('Error fetching normal clients:', error);
        newToast({
          message: 'Could not fetch normal clients',
          status: 'error',
        });
      },
    );

    const unsubscribeProspect = onSnapshot(
      query(
        collection(db, collectionName),
        where('clientType', '==', 'prospect'),
      ),
      (snapshot) => {
        const prospectClients: IClientProspect[] = snapshot.docs.map((doc) => ({
          ...(doc.data() as IClientProspect),
          id: doc.id,
        }));
        setProspectClient(prospectClients);
      },
      (error) => {
        console.error('Error fetching prospect clients:', error);
        newToast({
          message: 'Could not fetch prospect clients',
          status: 'error',
        });
      },
    );

    // Cleanup listeners on component unmount
    return () => {
      unsubscribeNormal();
      unsubscribeProspect();
    };
  }, []);

  const getClientById = useCallback(
    async (id: string) => {
      try {
        const docRef = doc(db, collectionName, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setClient(docSnap.data() as IClient);
        } else {
          newToast({
            message: 'Could not find Client',
            status: 'error',
          });
        }
      } catch (error) {
        console.error('Error getting client:', error);
        newToast({
          message: 'Could not find Client',
          status: 'error',
        });
      }
    },
    [setClient],
  );

  const createClient = useCallback(
    async (data: IClient | IClientProspect) => {
      if (!authUser || role === 'LAWYER') {
        newToast({
          message: 'Permission Denied',
          status: 'error',
        });
        return;
      }
      try {
        const docRef = doc(collection(db, collectionName));
        await setDoc(docRef, data);
        newToast({
          message: 'Client Created Successfully',
          status: 'success',
        });
        if (authUser) {
          await createLogEvent({
            userId: authUser?.uid,
            action: 'CREATE',
            eventDetails: `New Client ${data.name} Created`,
            user: {
              name: authUser?.displayName,
              email: authUser?.email,
              role: role,
            },
          } as ILogEventInterface);
        }
      } catch (error) {
        console.error('Error adding client:', error);
        newToast({
          message: 'Could not create client',
          status: 'error',
        });
      }
    },
    [authUser, role],
  );

  const updateClient = useCallback(
    async (id: string, updatedData: Partial<IClient | IClientProspect>) => {
      if (!authUser || role === 'LAWYER') {
        newToast({
          message: 'Permission Denied',
          status: 'error',
        });
        return;
      }

      try {
        const docRef = doc(db, collectionName, id);
        await updateDoc(docRef, updatedData);
        newToast({
          message: 'Client Updated Successfully',
          status: 'success',
        });
        if (authUser) {
          await createLogEvent({
            userId: authUser?.uid,
            action: 'UPDATE',
            eventDetails: `Client ${id || ''} Updated`,
            user: {
              name: authUser?.displayName,
              email: authUser?.email,
              role: role,
            },
          } as ILogEventInterface);
        }
      } catch (error) {
        console.error('Error updating client:', error);
        newToast({
          message: 'Could not update client',
          status: 'error',
        });
      }
    },
    [authUser, role],
  );

  const deleteClient = useCallback(
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
          message: 'Client Deleted Successfully',
          status: 'success',
        });
        if (authUser) {
          await createLogEvent({
            userId: authUser?.uid,
            action: 'DELETE',
            eventDetails: `Client ${id} Deleted`,
            user: {
              name: authUser?.displayName,
              email: authUser?.email,
              role: role,
            },
          } as ILogEventInterface);
        }
      } catch (error) {
        console.error('Error deleting client:', error);
        newToast({
          message: 'Could not Deleted client',
          status: 'error',
        });
      }
    },
    [authUser, role],
  );

  return {
    allClients,
    client,
    normalClient,
    prospectClient,
    getAllClients,
    getClientById,
    createClient,
    updateClient,
    deleteClient,
    getClientByType,
  };
};
