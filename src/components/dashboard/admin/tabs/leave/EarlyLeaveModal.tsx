import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
  useToast,
} from '@chakra-ui/react';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/user/userContext';
import { useEarlyLeave } from '@/hooks/useEarlyLeave';
import { db } from '@/lib/config/firebase.config';
import { collection, query, where, getDocs } from 'firebase/firestore';

const EarlyLeaveModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [exitTime, setExitTime] = useState('');
  const [reason, setReason] = useState('');
  const [loginTime, setLoginTime] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { authUser } = useAuth();
  const { requestEarlyLeave } = useEarlyLeave();

  const today = new Date().toISOString().split('T')[0];

  useEffect(() => {
    // Get today's login time from attendance logs
    const fetchLoginTime = async () => {
      try {
        const attendanceRef = collection(db, 'attendance');
        const q = query(
          attendanceRef,
          where('userId', '==', authUser?.uid),
          where('eventType', '==', 'login'),
        );
        const snapshot = await getDocs(q);

        // Find today's login
        const todayLogin = snapshot.docs.find((doc) => {
          const timestamp = doc.data().timestamp?.toDate();
          return (
            timestamp && timestamp.toDateString() === new Date().toDateString()
          );
        });

        if (todayLogin) {
          const loginTimestamp = todayLogin.data().timestamp.toDate();
          const loginTimeString = loginTimestamp.toTimeString().slice(0, 5);
          setLoginTime(loginTimeString);
        } else {
          setLoginTime('09:00'); // Default if no login found
        }
      } catch (error) {
        console.error('Error fetching login time:', error);
        setLoginTime('09:00'); // Default fallback
      }
    };

    if (isOpen) {
      fetchLoginTime();
    }
  }, [isOpen, authUser]);

  const calculateWorkingHours = (login: string, exit: string): string => {
    const loginDate = new Date(`${today}T${login}`);
    const exitDate = new Date(`${today}T${exit}`);
    const diffMs = exitDate.getTime() - loginDate.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHours}h ${diffMinutes}m`;
  };

  const handleSubmit = async () => {
    if (!exitTime || !reason.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const workingHours = calculateWorkingHours(loginTime, exitTime);

      await requestEarlyLeave({
        userId: authUser?.uid || '',
        name: authUser?.displayName || '',
        date: today,
        loginTime,
        exitTime,
        workingHours,
        reason,
      });

      toast({
        title: 'Success',
        description: 'Early leave request submitted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onClose();
      setExitTime('');
      setReason('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to submit early leave request',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="orange">
        Early Leave
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Request Early Leave</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Date</FormLabel>
              <Input type="date" value={today} isReadOnly />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Login Time</FormLabel>
              <Input type="time" value={loginTime} isReadOnly />
            </FormControl>

            <FormControl isRequired mb={4}>
              <FormLabel>Time of Exit</FormLabel>
              <Input
                type="time"
                value={exitTime}
                onChange={(e) => setExitTime(e.target.value)}
              />
            </FormControl>

            {loginTime && exitTime && (
              <FormControl mb={4}>
                <FormLabel>Working Hours</FormLabel>
                <Input
                  value={calculateWorkingHours(loginTime, exitTime)}
                  isReadOnly
                />
              </FormControl>
            )}

            <FormControl isRequired>
              <FormLabel>Reason</FormLabel>
              <Textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please provide a reason for early leave..."
                rows={4}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="orange"
              mr={3}
              onClick={handleSubmit}
              isLoading={isLoading}
            >
              Submit
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EarlyLeaveModal;
