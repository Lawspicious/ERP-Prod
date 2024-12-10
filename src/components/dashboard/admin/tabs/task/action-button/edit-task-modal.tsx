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
import { IInvoice, IRE, IService } from '@/types/invoice';
import { today } from '@/lib/utils/todayDate';
import { useInvoice } from '@/hooks/useInvoiceHook';
import { useAuth } from '@/context/user/userContext';

const TaskEditModal = ({ taskId }: { taskId: string }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [lawyers, setLawyers] = useState<IUser[]>([]);
  const { loading, setLoading } = useLoading();
  const { getTaskById, updateTask, task } = useTask();
  const { getAllTeam } = useTeam();
  const { role } = useAuth();
  const [formData, setFormData] = useState<{
    endDate: string;
    taskStatus: string;
    priority: string;
    lawyerDetails: ILawyer[];
    amount: number;
    payable: boolean;
  }>({
    endDate: '',
    taskStatus: '',
    priority: '',
    lawyerDetails: [],
    amount: 0,
    payable: false,
  });
  const [selectedLawyerIds, setSelectedLawyerIds] = useState<string[]>([]);
  const { createInvoice } = useInvoice();

  const handleFetchTask = async () => {
    try {
      const task = await getTaskById(taskId);
      if (task) {
        setFormData({
          endDate: task.endDate,
          taskStatus: task.taskStatus,
          priority: task.priority,
          lawyerDetails: task.lawyerDetails,
          payable: task?.payable as boolean,
          amount: task?.amount as number,
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

  // const handleCreateInvoice = async () => {
  //   if (!task?.payable) {
  //     return;
  //   }

  //   const invoiceData: IInvoice = {
  //     createdAt: today,
  //     billTo: 'organization',
  //     dueDate: '',
  //     services: [
  //       {
  //         name: task?.taskName,
  //         description: task?.taskDescription,
  //         amount: formData.amount || 0,
  //       },
  //     ] as IService[],
  //     paymentStatus: 'unpaid',
  //     totalAmount: formData.amount || task.amount || 0,
  //     RE: [{ caseId: task?.caseDetails.caseId }] as IRE[],
  //     teamMember: task?.lawyerDetails,
  //     gstNote: '',
  //     panNo: '',
  //     paymentDate: '',
  //     clientDetails: null,
  //   };
  //   console.log(invoiceData);
  //   await createInvoice(invoiceData);
  // };

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
      await updateTask(
        taskId,
        updatedFormData as ITask,
        task?.taskName as string,
      );
      onClose();
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
        <ModalContent mx={4} minWidth="fit-content">
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
                {formData.payable && (
                  <FormControl mb={4}>
                    <FormLabel>Amount</FormLabel>
                    <Input
                      type="number"
                      name="amount"
                      value={formData.amount || task?.amount || 0}
                      placeholder="Enter task Amount"
                      onChange={handleInputChange}
                      readOnly={role !== 'SUPERADMIN' && task?.amount !== 0}
                    />
                  </FormControl>
                )}

                <FormControl mb={4}>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    value={formData.priority}
                    name="priority"
                    onChange={handleInputChange}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </Select>
                </FormControl>

                <FormControl mb={4}>
                  <FormLabel>Select Lawyers</FormLabel>
                  <Select
                    placeholder="Select team member"
                    onChange={handleSelectLawyer}
                  >
                    {/* Group for Lawyers */}
                    <optgroup label="Lawyers">
                      {lawyers
                        .filter((team: IUser) => team.role === 'LAWYER')
                        .map((lawyer: IUser) => (
                          <option key={lawyer.id} value={lawyer.id}>
                            {lawyer.name}
                          </option>
                        ))}
                    </optgroup>

                    {/* Group for Admins */}
                    <optgroup label="Admins">
                      {lawyers
                        .filter((team: IUser) => team.role === 'ADMIN')
                        .map((admin: IUser) => (
                          <option key={admin.id} value={admin.id}>
                            {admin.name}
                          </option>
                        ))}
                    </optgroup>
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
