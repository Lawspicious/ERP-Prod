import { db } from '@/lib/config/firebase.config';
import { collection, getCountFromServer } from 'firebase/firestore';

export const useDocument = () => {
  const getDocumentCount = async (collectionName: string) => {
    const coll = collection(db, collectionName);
    const snapshot = await getCountFromServer(coll);
    const count = snapshot.data().count;

    if (typeof count === 'number') {
      return count;
    } else {
      return false;
    }
  };
  return {
    getDocumentCount,
  };
};
