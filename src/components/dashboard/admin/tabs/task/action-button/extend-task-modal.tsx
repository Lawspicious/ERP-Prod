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
import { useState } from 'react';
import { doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';
import { useAuth } from '@/context/user/userContext';
import { ITaskTimeline } from '@/types/task';

interface ExtendTaskModalProps {
  taskId: string;
  currentEndDate: string;
  onExtend?: () => void;
}

const ExtendTaskModal = ({
  taskId,
  currentEndDate,
  onExtend,
}: ExtendTaskModalProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newEndDate, setNewEndDate] = useState('');
  const [comment, setComment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const { authUser } = useAuth();

  const handleSubmit = async () => {
    if (!newEndDate || !comment.trim()) {
      toast({
        title: 'Error',
        description: 'Please fill in both the new end date and comment',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    setIsLoading(true);
    try {
      const taskRef = doc(db, 'tasks', taskId);

      const timelineEntry: ITaskTimeline = {
        date: new Date().toISOString().split('T')[0],
        activity: 'EXTENDED',
        dateExtendedTo: newEndDate,
        oldEndDate: currentEndDate,
        reason: comment,
        createdBy: {
          id: authUser?.uid || '',
          name: authUser?.displayName || 'Unknown',
        },
      };

      await updateDoc(taskRef, {
        endDate: newEndDate,
        isExtended: true,
        timeline: [...(await getTaskTimeline(taskId)), timelineEntry],
      });

      toast({
        title: 'Success',
        description: 'Task end date extended successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      onExtend?.();
      onClose();
      setNewEndDate('');
      setComment('');
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to extend task',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getTaskTimeline = async (taskId: string): Promise<ITaskTimeline[]> => {
    try {
      const taskRef = doc(db, 'tasks', taskId);
      const taskDoc = await getDoc(taskRef);
      return taskDoc.data()?.timeline || [];
    } catch {
      return [];
    }
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="orange" size="sm" width="100%">
        Extend End Date
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Extend Task End Date</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl isRequired mb={4}>
              <FormLabel>New End Date</FormLabel>
              <Input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                min={new Date().toISOString().split('T')[0]}
              />
            </FormControl>
            <FormControl isRequired>
              <FormLabel>Comment (Reason for Extension)</FormLabel>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Please provide a reason for extending the task..."
                rows={4}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
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

export default ExtendTaskModal;
