import React, { useState, useEffect } from 'react';
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
  Select,
  Tag,
  TagLabel,
  TagCloseButton,
  VStack,
  useDisclosure,
} from '@chakra-ui/react';
import { IUser } from '@/types/user';
import LoaderComponent from '@/components/ui/loader';
import { ITask } from '@/types/task';
import { useTask } from '@/hooks/useTaskHooks';
import { ILawyer } from '@/types/case';
import { useTeam } from '@/hooks/useTeamHook';
import { useLoading } from '@/context/loading/loadingContext';

const TaskEditModalLawyer = ({ taskId }: { taskId: string }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [lawyers, setLawyers] = useState<IUser[]>([]);
  const { loading, setLoading } = useLoading();
  const { getTaskById, updateTask } = useTask();
  const { getAllTeam } = useTeam();
  const [formData, setFormData] = useState<{
    endDate: string;
    taskStatus: string;
    priority: string;
  }>({
    endDate: '',
    taskStatus: '',
    priority: '',
  });

  const handleFetchTask = async () => {
    try {
      const task = await getTaskById(taskId);
      if (task) {
        setFormData({
          endDate: task.endDate,
          taskStatus: task.taskStatus,
          priority: task.priority,
        });
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleFetch = async () => {
      await handleFetchTask();
      const res = await getAllTeam();
      setLawyers(res as IUser[]);
    };

    setLoading(true);
    handleFetch();
    setLoading(false);
  }, [taskId]);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const updatedFormData = {
        ...formData,
      };
      await updateTask(taskId, updatedFormData as ITask);
    } catch (error) {
      console.log(error);
    }
  };

  return (
    <>
      <Button colorScheme="purple" onClick={onOpen} className="w-full">
        Edit
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent mx={4}>
          {loading ? (
            <LoaderComponent />
          ) : (
            <>
              <ModalHeader>Edit Task Details</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl mb={4}>
                  <FormLabel>End Date</FormLabel>
                  <Input
                    readOnly
                    type="date"
                    name="endDate"
                    value={formData.endDate}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="taskStatus"
                    value={formData.taskStatus}
                    onChange={handleInputChange}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                    <option value="IN_PROGRESS">In Progress</option>
                  </Select>
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    isReadOnly
                    value={formData.priority}
                    name="priority"
                    onChange={handleInputChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Select>
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button colorScheme="purple" mr={3} onClick={handleSubmit}>
                  Save
                </Button>
                <Button onClick={onClose}>Cancel</Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default TaskEditModalLawyer;
