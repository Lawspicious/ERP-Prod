import { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc } from 'firebase/firestore';
import { auth, db } from '@/lib/config/firebase.config'; // Ensure you import your initialized Firestore instance
import { useAuth } from '@/context/user/userContext';
import { useToast } from '@chakra-ui/react'; // To show notifications

interface ICalendarEvent {
  title: string;
  start: string;
  resourceId: string;
  color?: string;
  url: string;
  lawyerId?: string;
  lawyerName?: string;
}

const useCalendarEvents = () => {
  const [calendarEvents, setCalendarEvents] = useState<ICalendarEvent[]>([]);
  const [adminCalendarEvents, setAdminCalendarEvents] = useState<
    ICalendarEvent[]
  >([]);

  const { authUser, role } = useAuth();
  const userId = authUser?.uid;
  const toast = useToast();

  const createNewEvent = useCallback(
    async (event: Partial<ICalendarEvent>) => {
      if (!userId) return;

      try {
        const eventsCollectionRef = collection(db, `users/${userId}/events`);
        await addDoc(eventsCollectionRef, {
          title: event.title,
          start: event.start,
        });

        // Show success notification
        toast({
          title: 'Event Created',
          description: 'Your new event has been successfully created.',
          status: 'success',
          duration: 4000,
          isClosable: true,
        });
      } catch (error) {
        console.error('Error creating new event:', error);
        toast({
          title: 'Error',
          description: 'Error creating the event.',
          status: 'error',
          duration: 4000,
          isClosable: true,
        });
      }
    },
    [userId, toast],
  );
  const fetchLawyerCalendarEvents = useCallback(async () => {
    if (!userId || role !== 'LAWYER') return;

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('lawyerDetails.id', '==', userId),
    );
    const casesQuery = query(
      collection(db, 'cases'),
      where('lawyer.id', '==', userId),
      where('caseStatus', '==', 'RUNNING'),
    );

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('lawyerDetails.id', '==', userId),
      where('status', '==', 'PENDING'),
    );

    const eventsQuery = query(collection(db, `users/${userId}/events`));

    try {
      // Fetch tasks
      const tasksSnapshot = await getDocs(tasksQuery);
      const taskEvents = tasksSnapshot.docs.map((doc) => ({
        title: 'Task Deadline',
        start: doc.data().endDate, // Assuming endDate is a Firestore Timestamp
        resourceId: doc.id,
        url: `/task/${doc.id}`,
        color: 'blue',
      }));

      // Fetch cases
      const casesSnapshot = await getDocs(casesQuery);
      const caseEvents = casesSnapshot.docs.map((doc) => ({
        title: 'Next Hearing',
        start: doc.data().nextHearing, // Assuming nextHearing is a Firestore Timestamp
        resourceId: doc.id,
        color: 'green',
        url: `/case/${doc.id}`,
      }));

      //Fetch appointments
      const appointmentSnapshot = await getDocs(appointmentsQuery);
      const appointmentEvents = appointmentSnapshot.docs.map((doc) => ({
        title: 'Appointment',
        start: doc.data().date, // Assuming date is a Firestore Timestamp
        resourceId: doc.id,
        color: 'purple',
        url: `/http://erp.lawspicious/dashboard/lawyer/workspace-lawyer#appointment`,
      }));
      //Fetch other events
      const eventsSnapshot = await getDocs(eventsQuery);
      const otherEvents = eventsSnapshot.docs.map((doc) => ({
        title: doc.data().title,
        start: doc.data().start, // Assuming date is a Firestore Timestamp
        resourceId: doc.id,
        color: 'orange',
        url: `/http://erp.lawspicious/dashboard/lawyer/workspace-lawyer#task`,
      }));
      // Set the events state
      setCalendarEvents([
        ...taskEvents,
        ...caseEvents,
        ...appointmentEvents,
        ...otherEvents,
      ]);
    } catch (error) {
      console.error('Error fetching events: ', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchLawyerCalendarEvents();
  }, [fetchLawyerCalendarEvents]);

  const fetchAdminCalendarEvents = useCallback(async () => {
    if (!userId || (role !== 'ADMIN' && role !== 'SUPERADMIN')) return;

    const tasksQuery = query(
      collection(db, 'tasks'),
      where('taskStatus', '==', 'PENDING'),
    );
    const casesQuery = query(
      collection(db, 'cases'),
      where('caseStatus', '==', 'RUNNING'),
    );

    const appointmentsQuery = query(
      collection(db, 'appointments'),
      where('status', '==', 'PENDING'),
    );

    const invoicesQuery = query(
      collection(db, 'invoices'),
      where('paymentStatus', '==', 'pending'),
    );
    const eventsQuery = query(collection(db, `/users/${userId}/events`));

    try {
      // Fetch tasks
      const tasksSnapshot = await getDocs(tasksQuery);
      const taskEvents = tasksSnapshot.docs.map((doc) => ({
        title: `Deadline task: ${doc.data().taskName} `,
        start: doc.data().endDate, // Assuming endDate is a Firestore Timestamp
        resourceId: doc.id,
        url: `/task/${doc.id}`,
        color: 'red',
        lawyerId: doc.data().lawyerDetails.id,
        lawyerName: doc.data().lawyerDetails.name,
      }));

      // Fetch cases
      const casesSnapshot = await getDocs(casesQuery);
      const caseEvents = casesSnapshot.docs.map((doc) => ({
        title: `Next Hearing For Case : ${doc.data().nextHearing}`,
        start: doc.data().nextHearing, // Assuming nextHearing is a Firestore Timestamp
        resourceId: doc.id,
        color: 'green',
        url: `/case/${doc.id}`,
      }));

      //Fetch appointments
      const appointmentSnapshot = await getDocs(appointmentsQuery);
      const appointmentEvents = appointmentSnapshot.docs.map((doc) => ({
        title: `Appointment with Client : ${doc.data().clientDetails.name}`,
        start: doc.data().date, // Assuming date is a Firestore Timestamp
        resourceId: doc.id,
        color: 'purple',
        url: `/http://erp.lawspicious/dashboard/admin/workspace-admin#appointment`,
      }));

      //Fetch Invoices
      const invoiceSnapshot = await getDocs(invoicesQuery);
      const invoiceEvents = invoiceSnapshot.docs.map((doc) => ({
        title: `Due Date of Invoice : Rupees ${doc.data().totalAmount}`,
        start: doc.data().dueDate, // Assuming date is a Firestore Timestamp
        resourceId: doc.id,
        color: 'blue',
        url: `/http://erp.lawspicious/dashboard/admin/workspace-admin#invoice`,
      }));

      //Fetch other events
      const eventsSnapshot = await getDocs(eventsQuery);
      const otherEvents = eventsSnapshot.docs.map((doc) => ({
        title: doc.data().title,
        start: doc.data().start, // Assuming date is a Firestore Timestamp
        resourceId: doc.id,
        color: 'orange',
        url: `/http://erp.lawspicious/dashboard/admin/workspace-admin#task`,
      }));
      // Set the events state
      setAdminCalendarEvents([
        ...taskEvents,
        ...caseEvents,
        ...appointmentEvents,
        ...invoiceEvents,
        ...otherEvents,
      ]);
    } catch (error) {
      console.error('Error fetching events: ', error);
    }
  }, [userId]);

  useEffect(() => {
    fetchAdminCalendarEvents();
  }, [fetchAdminCalendarEvents, createNewEvent]);

  return { calendarEvents, adminCalendarEvents, createNewEvent };
};

export default useCalendarEvents;
