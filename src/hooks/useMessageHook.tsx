import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  where,
  orderBy,
  serverTimestamp,
  Timestamp,
  limit,
  writeBatch,
  increment,
  DocumentData,
  getDoc,
} from 'firebase/firestore';
import { useToastHook } from './shared/useToastHook';
import { db } from '@/lib/config/firebase.config';

interface User {
  id: string;
  name: string;
  photoURL: string;
  lastMessage: Message | null;
  unseenCount: number;
}

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: Timestamp;
  isDeleted: boolean;
  isEdited: boolean;
  isSeen: boolean;
  participants: string[];
}

export const useMessageHook = () => {
  const [state, newToast] = useToastHook();

  const getAllUsersForMessage = async (
    currentUserId: string,
  ): Promise<User[]> => {
    try {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const users = usersSnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
              lastMessage: null,
              unseenCount: 0,
            }) as User,
        )
        .filter((user) => user.id !== currentUserId);

      const messagesPromises = users.map(async (user) => {
        // Fetch unseen messages
        const unseenMessagesQuery = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', currentUserId),
          where('senderId', '==', user.id),
          where('isSeen', '==', false), // Fetch only unseen messages
        );

        const unseenMessagesSnapshot = await getDocs(unseenMessagesQuery);
        const unseenMessagesCount = unseenMessagesSnapshot.size;

        // Fetch last message sent by the user to the current user
        const lastMessageQuerySender = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', currentUserId),
          where('senderId', '==', user.id),
          orderBy('timestamp', 'desc'),
          limit(1),
        );

        const lastMessageQueryReceiver = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', user.id),
          where('senderId', '==', currentUserId),
          orderBy('timestamp', 'desc'),
          limit(1),
        );

        const lastMessageSnapshotSender = await getDocs(lastMessageQuerySender);
        const lastMessageSnapshotReceiver = await getDocs(
          lastMessageQueryReceiver,
        );

        let lastMessageForSender: Message | null = null;
        let lastMessageForReceiver: Message | null = null;

        if (!lastMessageSnapshotSender.empty) {
          lastMessageForSender =
            lastMessageSnapshotSender.docs[0].data() as Message;
        }

        if (!lastMessageSnapshotReceiver.empty) {
          lastMessageForReceiver =
            lastMessageSnapshotReceiver.docs[0].data() as Message;
        }

        // Determine the final last message
        let finalLastMessage: Message | null = null;

        if (lastMessageForReceiver && !lastMessageForSender) {
          finalLastMessage = lastMessageForReceiver;
        } else if (lastMessageForSender && !lastMessageForReceiver) {
          finalLastMessage = lastMessageForSender;
        } else if (lastMessageForReceiver && lastMessageForSender) {
          finalLastMessage =
            lastMessageForReceiver.timestamp.toMillis() >
            lastMessageForSender.timestamp.toMillis()
              ? lastMessageForReceiver
              : lastMessageForSender;
        }

        // Update the user object
        user.unseenCount = unseenMessagesCount; // Update unseen count
        user.lastMessage = finalLastMessage; // Update last message

        return user;
      });

      const updatedUsers = await Promise.all(messagesPromises);

      // Sort users
      return updatedUsers.sort((a, b) => {
        // If neither user has a lastMessage, sort alphabetically by name
        if (!a.lastMessage && !b.lastMessage) {
          return a.name.localeCompare(b.name);
        }

        // If one user has a lastMessage, that user comes first
        if (!a.lastMessage) return 1;
        if (!b.lastMessage) return -1;

        // Otherwise, sort by last message timestamp (descending)
        return (
          b.lastMessage.timestamp.toMillis() -
          a.lastMessage.timestamp.toMillis()
        );
      });
    } catch (error) {
      console.log('error', error);
      newToast({
        status: 'error',
        message: 'Failed to fetch users',
      });
      return [];
    }
  };

  const sendMessage = async (
    senderId: string,
    receiverId: string,
    messageContent: {
      content: string;
      fileURL?: string;
      fileName?: string;
      fileType?: string;
    },
  ): Promise<void> => {
    try {
      await addDoc(collection(db, 'messages'), {
        senderId,
        receiverId,
        ...messageContent,
        timestamp: serverTimestamp(),
        isDeleted: false,
        isEdited: false,
        isSeen: false,
        participants: [senderId, receiverId],
      });
    } catch (error) {
      newToast({
        status: 'error',
        message: 'Failed to send message',
      });
    }
  };

  const deleteMessage = async (messageId: string): Promise<void> => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, { isDeleted: true });
    } catch (error) {
      newToast({
        status: 'error',
        message: 'Failed to delete message',
      });
    }
  };

  const editMessage = async (
    messageId: string,
    newContent: string,
  ): Promise<void> => {
    try {
      const messageRef = doc(db, 'messages', messageId);
      await updateDoc(messageRef, { content: newContent, isEdited: true });
    } catch (error) {
      newToast({
        status: 'error',
        message: 'Failed to edit message',
      });
    }
  };

  const markMessagesAsSeen = async (
    senderId: string,
    receiverId: string,
  ): Promise<void> => {
    try {
      const q = query(
        collection(db, 'messages'),
        where('senderId', '==', senderId),
        where('receiverId', '==', receiverId),
        where('isSeen', '==', false),
      );
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);
      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, { isSeen: true });
      });
      await batch.commit();
    } catch (error) {
      newToast({
        status: 'error',
        message: 'Failed to mark messages as seen',
      });
    }
  };

  const subscribeToMessages = (
    currentUserId: string,
    otherUserId: string,
    callback: (messages: Message[]) => void,
  ) => {
    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', currentUserId),
      orderBy('timestamp', 'asc'),
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs
        .map(
          (doc) =>
            ({
              id: doc.id,
              ...doc.data(),
            }) as Message,
        )
        .filter(
          (message) =>
            (message.senderId === currentUserId &&
              message.receiverId === otherUserId) ||
            (message.senderId === otherUserId &&
              message.receiverId === currentUserId),
        );
      callback(messages);
    });
  };

  const subscribeToUserUpdates = (
    currentUserId: string,
    callback: (users: User[]) => void,
  ) => {
    const q = query(
      collection(db, 'messages'),
      where('participants', 'array-contains', currentUserId),
      orderBy('timestamp', 'desc'),
    );

    return onSnapshot(q, async () => {
      const users = await getAllUsersForMessage(currentUserId);
      callback(users);
    });
  };

  const getUnseenMessages = async (
    currentUserId: string,
  ): Promise<DocumentData[]> => {
    try {
      const q = query(
        collection(db, 'messages'),
        where('receiverId', '==', currentUserId),
        where('isSeen', '==', false),
        orderBy('timestamp', 'desc'),
      );

      const querySnapshot = await getDocs(q);
      const unseenMessages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DocumentData[];

      const messagesWithSenders = await Promise.all(
        unseenMessages.map(async (message) => {
          const senderDoc = await getDoc(doc(db, 'users', message.senderId));
          return {
            ...message,
            senderName: senderDoc.exists()
              ? senderDoc.data().name
              : 'Unknown User',
          };
        }),
      );

      return messagesWithSenders;
    } catch (error) {
      console.error('Failed to fetch unseen messages:', error);
      newToast({
        status: 'error',
        message: 'Failed to fetch unseen messages',
      });
      return [];
    }
  };

  const subscribeToUnseenMessages = (
    currentUserId: string,
    callback: (messages: DocumentData[]) => void,
  ) => {
    const q = query(
      collection(db, 'messages'),
      where('receiverId', '==', currentUserId),
      where('isSeen', '==', false),
      orderBy('timestamp', 'desc'),
    );

    return onSnapshot(q, async (querySnapshot) => {
      const unseenMessages = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as DocumentData[];

      const messagesWithSenders = await Promise.all(
        unseenMessages.map(async (message) => {
          const senderDoc = await getDoc(doc(db, 'users', message.senderId));
          return {
            ...message,
            senderName: senderDoc.exists()
              ? senderDoc.data().name
              : 'Unknown User',
          };
        }),
      );

      callback(messagesWithSenders);
    });
  };

  return {
    getAllUsersForMessage,
    sendMessage,
    deleteMessage,
    editMessage,
    markMessagesAsSeen,
    subscribeToMessages,
    subscribeToUserUpdates,
    getUnseenMessages,
    subscribeToUnseenMessages,
  };
};
