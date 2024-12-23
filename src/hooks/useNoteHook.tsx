import { INote } from '@/types/note';
import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/config/firebase.config';
import {
  collection,
  addDoc,
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
import { useAuth } from '@/context/user/userContext';

const collectionName = 'notes';

export const useNoteHook = () => {
  const [notes, setNotes] = useState<INote[]>([]);
  const [createdNoteId, setCreatedNoteId] = useState<string>('');
  const [fetched, setFetched] = useState<boolean>(false);
  const [state, newToast] = useToastHook();
  const { authUser } = useAuth();

  const createNoteFunction = async (note: Partial<INote>) => {
    try {
      const noteRef = await addDoc(collection(db, collectionName), {
        ...note,
        createdAt: new Date().toISOString(),
        createdBy: authUser?.uid || 'anonymous',
      });
      console.log('Note Created', noteRef.id);
      return noteRef.id;
    } catch (error) {
      console.error('Error creating Note:', error);
      newToast({
        message: 'Could not create Note',
        status: 'error',
      });
      throw error;
    }
  };

  const getAllNotesFunction = async () => {
    try {
      if (!authUser?.uid) {
        console.error('No authenticated user found');
        newToast({
          message: 'You must be logged in to fetch notes',
          status: 'error',
        });
        return;
      }

      const querySnapshot = await getDocs(
        query(
          collection(db, 'notes'),
          where('createdBy', '==', authUser.uid),
          orderBy('sortOrder'),
        ),
      );

      const fetchedNotes: INote[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as unknown as INote[];

      setNotes(fetchedNotes);
      setFetched(true);
    } catch (error) {
      console.error('Error fetching Notes:', error);
      newToast({
        message: 'Could not fetch Notes',
        status: 'error',
      });
    }
  };

  const updateNoteFunction = async (note: INote) => {
    try {
      await updateDoc(doc(db, collectionName, note.id), {
        ...note,
        updatedAt: new Date().toISOString(),
      });
      console.log('Note Updated', note.id);
    } catch (error) {
      console.error('Error updating Note:', error);
      newToast({
        message: 'Could not update Note',
        status: 'error',
      });
    }
  };

  const deleteNoteFunction = async (noteId: string) => {
    try {
      await deleteDoc(doc(db, collectionName, noteId));
      console.log('Note Deleted', noteId);
    } catch (error) {
      console.error('Error deleting Note:', error);
      newToast({
        message: 'Could not delete Note',
        status: 'error',
      });
    }
  };

  const persistSortOrder = async (notes: INote[]) => {
    try {
      const promises = notes.map((note, index) =>
        updateDoc(doc(db, 'notes', note.id), {
          sortOrder: note.sortOrder,
        }),
      );
      await Promise.all(promises);
      console.log('Sort order updated in Firestore');
    } catch (error) {
      console.error('Error updating note order:', error);
      newToast({
        title: 'Error',
        description: 'Failed to update note order',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return {
    createNoteFunction,
    getAllNotesFunction,
    updateNoteFunction,
    deleteNoteFunction,
    persistSortOrder,
    serverNotes: notes,
    createdNoteId,
    fetched,
  };
};
