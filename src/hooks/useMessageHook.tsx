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
  arrayUnion,
} from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';
import { useAuth } from '@/context/user/userContext';
import { useToastHook } from './shared/useToastHook';

interface User {
  id: string;
  name: string;
  photoURL: string;
  lastMessage: Message | null;
  unseenCount: number;
}

interface Group {
  id: string;
  name: string;
  photoURL?: string;
  createdBy: string;
  members: string[];
  createdAt: Timestamp;
}

interface Message {
  seenBy: any;
  id: string;
  senderId: string;
  receiverId?: string;
  groupId?: string;
  content: string;
  timestamp: Timestamp;
  isDeleted: boolean;
  isEdited: boolean;
  isSeen: boolean;
  participants: string[];
}

export const useMessageHook = () => {
  const [state, newToast] = useToastHook();
  const { role } = useAuth();

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
          where('type', '==', 'one-to-one'),
          where('isSeen', '==', false), // Fetch only unseen messages
        );

        const unseenMessagesSnapshot = await getDocs(unseenMessagesQuery);
        const unseenMessagesCount = unseenMessagesSnapshot.size;

        // Fetch last message sent by the user to the current user
        const lastMessageQuerySender = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', currentUserId),
          where('senderId', '==', user.id),
          where('type', '==', 'one-to-one'),
          orderBy('timestamp', 'desc'),
          limit(1),
        );

        const lastMessageQueryReceiver = query(
          collection(db, 'messages'),
          where('participants', 'array-contains', user.id),
          where('senderId', '==', currentUserId),
          where('type', '==', 'one-to-one'),
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
        type: 'one-to-one',
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

  const createGroup = async (
    name: string,
    memberIds: string[],
    createdBy: string,
    photoURL?: string,
  ) => {
    if (role !== 'HR' && role !== 'SUPERADMIN') {
      newToast({ status: 'error', message: 'Permission denied' });
      return;
    }

    const docRef = await addDoc(collection(db, 'groups'), {
      name,
      createdBy,
      members: memberIds,
      photoURL: photoURL || '',
      createdAt: serverTimestamp(),
    });

    return docRef.id;
  };

  const editGroup = async (
    groupId: string,
    updateData: Partial<Omit<Group, 'id' | 'createdAt'>>,
  ) => {
    if (role !== 'HR' && role !== 'SUPERADMIN') {
      newToast({ status: 'error', message: 'Permission denied' });
      return;
    }

    const groupRef = doc(db, 'groups', groupId);
    await updateDoc(groupRef, updateData);
  };

  const sendGroupMessage = async (
    senderId: string,
    groupId: string,
    messageContent: {
      content: string;
      fileURL?: string;
      fileName?: string;
      fileType?: string;
    },
  ) => {
    try {
      const groupDoc = await getDoc(doc(db, 'groups', groupId));
      const groupData = groupDoc.data() as Group;

      await addDoc(collection(db, 'messages'), {
        senderId,
        groupId,
        ...messageContent,
        timestamp: serverTimestamp(),
        isDeleted: false,
        isEdited: false,
        isSeen: false,
        participants: groupData.members,
        seenBy: [senderId],
        type: 'group',
      });
    } catch (error) {
      newToast({ status: 'error', message: 'Failed to send group message' });
    }
  };

  const subscribeToGroupMessages = (
    groupId: string,
    callback: (messages: Message[]) => void,
  ) => {
    const q = query(
      collection(db, 'messages'),
      where('groupId', '==', groupId),
      orderBy('timestamp', 'asc'),
    );

    return onSnapshot(q, (querySnapshot) => {
      const messages = querySnapshot.docs.map(
        (doc) => ({ id: doc.id, ...doc.data() }) as Message,
      );
      callback(messages);
    });
  };

  const getGroupsForUser = async (userId: string): Promise<Group[]> => {
    const groupsQuery = query(
      collection(db, 'groups'),
      where('members', 'array-contains', userId),
    );
    const snapshot = await getDocs(groupsQuery);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Group);
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
        where('type', '==', 'one-to-one'),
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
      where('type', '==', 'one-to-one'),
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
        where('type', '==', 'one-to-one'),
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
      where('type', '==', 'one-to-one'),
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

  const subscribeToGroupUnseenMessages = (
    groupId: string,
    currentUserId: string,
    callback: (messages: Message[]) => void,
  ) => {
    console.log(currentUserId);
    const q = query(
      collection(db, 'messages'),
      where('groupId', '==', groupId),
      where('seenBy', 'not-in', [currentUserId]),
      orderBy('timestamp', 'desc'),
    );

    return onSnapshot(q, (querySnapshot) => {
      const unseenMessages = querySnapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }) as Message)
        .filter((msg) => !msg.seenBy?.includes(currentUserId));
      callback(unseenMessages);
    });
  };

  const deleteGroup = async (groupId: string): Promise<void> => {
    if (role !== 'HR' && role !== 'SUPERADMIN' && role !== 'ADMIN') {
      newToast({ status: 'error', message: 'Permission denied' });
      return;
    }
    try {
      const groupRef = doc(db, 'groups', groupId);
      await deleteDoc(groupRef);
      newToast({ status: 'success', message: 'Group deleted successfully' });
    } catch (error) {
      newToast({ status: 'error', message: 'Failed to delete group' });
    }
  };

  // const markGroupMessagesAsSeen = async (groupId: string, userId: string): Promise<void> => {
  //   try {
  //     const q = query(
  //       collection(db, 'messages'),
  //       where('groupId', '==', groupId),
  //       where('participants', 'array-contains', userId),
  //       where('seenBy', 'not-in', [userId])
  //     );
  //     const querySnapshot = await getDocs(q);
  //     const batch = writeBatch(db);
  //     querySnapshot.forEach((doc) => {
  //       batch.update(doc.ref, { seenBy: increment(1) });
  //     });
  //     await batch.commit();
  //   } catch (error) {
  //     console.log(error)
  //     newToast({ status: 'error', message: 'Failed to mark group messages as seen' });
  //   }
  // };

  const markGroupMessagesAsSeen = async (
    groupId: string,
    userId: string,
  ): Promise<void> => {
    try {
      const q = query(
        collection(db, 'messages'),
        where('groupId', '==', groupId),
        where('seenBy', 'not-in', [userId]), // Only get messages not seen by the user
      );

      console.log(groupId);
      const querySnapshot = await getDocs(q);
      const batch = writeBatch(db);

      querySnapshot.forEach((doc) => {
        batch.update(doc.ref, {
          seenBy: arrayUnion(userId), // Add the userId to the seenBy array
        });
      });

      await batch.commit();
    } catch (error) {
      console.error(error);
      newToast({
        status: 'error',
        message: 'Failed to mark group messages as seen',
      });
    }
  };

  // Count unseen messages in a group for a user
  const countUnseenMessagesForGroup = async (
    groupId: string,
    currentUserId: string,
  ): Promise<number> => {
    const q = query(
      collection(db, 'messages'),
      where('groupId', '==', groupId),
      where('seenBy', 'not-in', [currentUserId]),
    );
    const snapshot = await getDocs(q);
    return snapshot.size;
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

    createGroup,
    editGroup,
    getGroupsForUser,
    sendGroupMessage,
    subscribeToGroupMessages,
    deleteGroup,

    markGroupMessagesAsSeen,
    countUnseenMessagesForGroup,
    subscribeToGroupUnseenMessages,
  };
};
