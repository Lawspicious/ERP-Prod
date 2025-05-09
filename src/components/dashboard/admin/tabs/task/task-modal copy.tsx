'use client';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';
import { useCases } from '@/hooks/useCasesHook';
import { useClient } from '@/hooks/useClientHook';
import { useInvoice } from '@/hooks/useInvoiceHook';
import { useTask } from '@/hooks/useTaskHooks';
import { useTeam } from '@/hooks/useTeamHook';
import { today } from '@/lib/utils/todayDate';
import { dayAfterTomorrow } from '@/lib/utils/dayAfterTomorrowDate';
import { ICase } from '@/types/case';
import { IClient, IClientProspect } from '@/types/client';
import { IRE, IService } from '@/types/invoice';
import { ITask } from '@/types/task';
import { IUser } from '@/types/user';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  Select,
  VStack,
  Grid,
  GridItem,
  Spinner,
  Tag,
  TagCloseButton,
  TagLabel,
  Checkbox,
  FormHelperText,
} from '@chakra-ui/react';
import React from 'react';
import { useEffect, useState } from 'react';

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const initialData = {
  taskName: '',
  startDate: today,
  endDate: dayAfterTomorrow,
  taskStatus: 'PENDING',
  priority: 'LOW',
  lawyerIds: [] as string[],
  caseId: '',
  taskDescription: '',
  otherRelatedTo: '',
  timeLimit: '48 hours',
  payable: false,
};

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose }) => {
  const [formInputs, setFormInputs] = useState(initialData);
  const [useCaseId, setUseCaseId] = useState(true);
  const { allTeam, getAllTeam } = useTeam();
  const { createTask } = useTask();
  const { loading, setLoading } = useLoading();
  const { getCaseById } = useCases();
  const [selectedLawyers, setSelectedLawyers] = useState<IUser[]>([]);
  const { allCases, fetchCasesByStatus } = useCases();
  const { allClients } = useClient();
  const [selectedClientId, setSelectedClientId] = useState('');
  const { authUser } = useAuth();
  useEffect(() => {
    const handleFetch = async () => {
      setLoading(true);
      await getAllTeam();
      await fetchCasesByStatus('RUNNING');
      setLoading(false);
    };

    handleFetch();
  }, []);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormInputs((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleLawyerSelection = (lawyerId: string) => {
    const lawyer = allTeam.find((member) => member.id === lawyerId);
    if (lawyer && !formInputs.lawyerIds.includes(lawyerId)) {
      setFormInputs((prev) => ({
        ...prev,
        lawyerIds: [...prev.lawyerIds, lawyerId],
      }));
      setSelectedLawyers((prev) => [...prev, lawyer]);
    }
  };

  const removeSelectedLawyer = (lawyerId: string) => {
    setFormInputs((prev) => ({
      ...prev,
      lawyerIds: prev.lawyerIds.filter((id) => id !== lawyerId),
    }));
    setSelectedLawyers((prev) =>
      prev.filter((lawyer) => lawyer.id !== lawyerId),
    );
  };

  const generateTaskCreateData = async () => {
    var caseDetails: any = {};
    if (useCaseId && formInputs.caseId !== '') {
      const fetchedCase = (await getCaseById(
        formInputs.caseId as string,
      )) as ICase;
      if (fetchedCase) {
        caseDetails.caseId = fetchedCase.caseId;
        caseDetails.caseType = fetchedCase.caseType;
        caseDetails.petition = fetchedCase.petition;
        caseDetails.respondent = fetchedCase.respondent;
        caseDetails.courtName = fetchedCase.courtName;
        caseDetails.caseNo = fetchedCase.caseNo;
      }
    }

    const lawyerDetails = selectedLawyers.map((lawyer) => ({
      id: lawyer?.id?.toString() || '',
      email: lawyer?.email || '',
      phoneNumber: lawyer?.phoneNumber || '',
      name: lawyer?.name || '',
    }));

    let clientDetails = null;

    if (selectedClientId !== '') {
      const selectedClient = allClients.find(
        (client) => (client.id = selectedClientId),
      );
      clientDetails = {
        id: selectedClient?.id as string,
        name: selectedClient?.name as string,
        email: selectedClient?.email as string,
        mobile: selectedClient?.mobile as string,
      };
    }

    const createTaskData: ITask = {
      payable: formInputs.payable,
      amount: 0,
      taskName: formInputs.taskName,
      startDate: formInputs.startDate,
      endDate: formInputs.endDate,
      taskStatus: formInputs.taskStatus as 'PENDING' | 'COMPLETED',
      priority: formInputs.priority as 'LOW' | 'MEDIUM' | 'HIGH',
      lawyerDetails: lawyerDetails, // Array of lawyer details
      caseDetails: caseDetails,
      clientDetails: clientDetails ? clientDetails : null,
      taskDescription: formInputs.taskDescription,
      timeLimit: formInputs.timeLimit,
      createdBy: {
        id: authUser?.uid as string,
        name: authUser?.displayName as string,
      },
      taskType:
        formInputs.otherRelatedTo?.length !== 0
          ? formInputs.otherRelatedTo
          : caseDetails.caseType,
    };

    return createTaskData;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await generateTaskCreateData();
      await createTask(data);
      setFormInputs(initialData);
      setSelectedLawyers([]);
    } catch (error) {
      console.log(error);
    }
    setLoading(false);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent mx={'auto'} my={'auto'} minWidth="fit-content">
        {loading ? (
          <div className="flex h-full min-h-[20rem] w-full items-center justify-center">
            <Spinner colorScheme="purple" />
          </div>
        ) : (
          <>
            <ModalHeader className="heading-secondary">
              Create New Task
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <form onSubmit={handleSubmit} className="md:w-[60vw] lg:w-[50vw]">
                <div className="flex gap-4">
                  <div>
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-300">
                      1
                    </div>
                  </div>
                  {/* Task Name (spans 2 columns on larger screens) */}
                  <FormControl isRequired>
                    <FormLabel>Task Name</FormLabel>
                    <Input
                      name="taskName"
                      placeholder="Enter task name"
                      value={formInputs.taskName}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  {/* Lawyer Details - Multiple Lawyers */}

                  <FormControl>
                    <FormLabel>Select Members</FormLabel>
                    <Select
                      placeholder="Select team member"
                      onChange={(e) => handleLawyerSelection(e.target.value)}
                    >
                      {/* Group for Lawyers */}
                      <optgroup label="Lawyers">
                        {allTeam
                          .filter((team: IUser) => team.role === 'LAWYER')
                          .map((lawyer: IUser) => (
                            <option key={lawyer.id} value={lawyer.id}>
                              {lawyer.name}
                            </option>
                          ))}
                      </optgroup>

                      {/* Group for Admins */}
                      <optgroup label="Admins">
                        {allTeam
                          .filter((team: IUser) => team.role === 'ADMIN')
                          .map((admin: IUser) => (
                            <option key={admin.id} value={admin.id}>
                              {admin.name}
                            </option>
                          ))}
                      </optgroup>
                    </Select>

                    {/* Display selected lawyers */}
                    <VStack align="start" mt={2}>
                      {selectedLawyers.map((lawyer) => (
                        <Tag
                          size="md"
                          key={lawyer.id}
                          borderRadius="full"
                          variant="solid"
                          colorScheme="purple"
                        >
                          <TagLabel>{lawyer.name}</TagLabel>
                          <TagCloseButton
                            onClick={() =>
                              removeSelectedLawyer(lawyer.id as string)
                            }
                          />
                        </Tag>
                      ))}
                    </VStack>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Select Client</FormLabel>
                    <Select
                      placeholder="Select Client"
                      onChange={(e) => setSelectedClientId(e.target.value)}
                    >
                      {allClients.map((client: IClient | IClientProspect) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      name="taskDescription"
                      placeholder="Enter task description"
                      value={formInputs.taskDescription}
                      onChange={handleInputChange}
                    />
                  </FormControl>
                </div>
              </form>
            </ModalBody>

            <ModalFooter>
              <Button mr={3} onClick={onClose}>
                Close
              </Button>
              <Button colorScheme="purple" onClick={handleSubmit}>
                Create Task
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default TaskModal;
