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

const TaskEditModal = ({ taskId }: { taskId: string }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [lawyers, setLawyers] = useState<IUser[]>([]);
  const { loading, setLoading } = useLoading();
  const { getTaskById, updateTask } = useTask();
  const { getAllTeam } = useTeam();
  const [formData, setFormData] = useState<{
    endDate: string;
    taskStatus: string;
    priority: string;
    lawyerDetails: ILawyer[];
  }>({
    endDate: '',
    taskStatus: '',
    priority: '',
    lawyerDetails: [],
  });
  const [selectedLawyerIds, setSelectedLawyerIds] = useState<string[]>([]);

  const handleFetchTask = async () => {
    try {
      const task = await getTaskById(taskId);
      if (task) {
        setFormData({
          endDate: task.endDate,
          taskStatus: task.taskStatus,
          priority: task.priority,
          lawyerDetails: task.lawyerDetails,
        });
        const lawyerIds = task.lawyerDetails.map(
          (lawyer: ILawyer) => lawyer.id,
        );
        setSelectedLawyerIds(lawyerIds);
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

  const handleSelectLawyer = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedLawyerId = e.target.value;
    if (!selectedLawyerIds.includes(selectedLawyerId)) {
      setSelectedLawyerIds([...selectedLawyerIds, selectedLawyerId]);
    }
  };

  const handleRemoveLawyer = (lawyerId: string) => {
    setSelectedLawyerIds(selectedLawyerIds.filter((id) => id !== lawyerId));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const selectedLawyers = lawyers
        .filter((lawyer) => selectedLawyerIds.includes(lawyer.id as string))
        .map((lawyer) => ({
          id: lawyer.id,
          name: lawyer.name,
          email: lawyer.email,
          phoneNumber: lawyer.phoneNumber,
        }));
      const updatedFormData = {
        ...formData,
        lawyerDetails: selectedLawyers,
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
                  </Select>
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    value={formData.priority}
                    name="priority"
                    onChange={handleInputChange}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </Select>
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Select Lawyers</FormLabel>
                  <Select
                    placeholder="Select lawyer"
                    onChange={handleSelectLawyer}
                  >
                    {lawyers.map((lawyer) => (
                      <option key={lawyer.id} value={lawyer.id}>
                        {lawyer.name}
                      </option>
                    ))}
                  </Select>

                  <VStack mt={2} align="start">
                    {selectedLawyerIds.map((lawyerId) => {
                      const selectedLawyer = lawyers.find(
                        (lawyer) => lawyer.id === lawyerId,
                      );
                      return (
                        <Tag key={lawyerId} size="lg" colorScheme="teal">
                          <TagLabel>{selectedLawyer?.name}</TagLabel>
                          <TagCloseButton
                            onClick={() => handleRemoveLawyer(lawyerId)}
                          />
                        </Tag>
                      );
                    })}
                  </VStack>
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

export default TaskEditModal;
