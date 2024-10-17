'use client';
import { useLoading } from '@/context/loading/loadingContext';
import { useCases } from '@/hooks/useCasesHook';
import { useTask } from '@/hooks/useTaskHooks';
import { useTeam } from '@/hooks/useTeamHook';
import { ICase } from '@/types/case';
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
  startDate: '',
  endDate: '',
  taskStatus: 'PENDING',
  priority: 'LOW',
  lawyerIds: [] as string[], // Array for multiple lawyer IDs
  caseId: '',
  taskDescription: '',
  otherRelatedTo: '',
  timeLimit: '',
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

  const toggleRelatedField = () => {
    setUseCaseId((prev) => !prev);
    setFormInputs((prev) => ({
      ...prev,
      caseId: '',
      otherRelatedTo: '',
    }));
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

    const createTaskData: ITask = {
      taskName: formInputs.taskName,
      startDate: formInputs.startDate,
      endDate: formInputs.endDate,
      taskStatus: formInputs.taskStatus as 'PENDING' | 'COMPLETED',
      priority: formInputs.priority as 'LOW' | 'MEDIUM' | 'HIGH',
      lawyerDetails: lawyerDetails, // Array of lawyer details
      caseDetails: caseDetails,
      taskDescription: formInputs.taskDescription,
      timeLimit: formInputs.timeLimit,
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
      <ModalContent mx={4} minWidth="fit-content">
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
              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 gap-6 md:w-[60vw] md:grid-cols-2 lg:w-[40vw]"
              >
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
                  <FormLabel>Select Lawyers</FormLabel>
                  <Select
                    placeholder="Select lawyers"
                    onChange={(e) => handleLawyerSelection(e.target.value)}
                  >
                    {allTeam.map((team: IUser) => (
                      <option key={team.id} value={team.id}>
                        {team.name}
                      </option>
                    ))}
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

                {/* Task Status */}

                <FormControl isRequired>
                  <FormLabel>Task Status</FormLabel>
                  <Select
                    name="taskStatus"
                    placeholder="Enter task status"
                    value={formInputs.taskStatus}
                    onChange={handleInputChange}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                  </Select>
                </FormControl>

                {/* Priority */}

                <FormControl isRequired>
                  <FormLabel>Priority</FormLabel>
                  <Select
                    name="priority"
                    placeholder="Enter task priority"
                    value={formInputs.priority}
                    onChange={handleInputChange}
                  >
                    <option value="LOW">LOW</option>
                    <option value="MEDIUM">MEDIUM</option>
                    <option value="HIGH">HIGH</option>
                  </Select>
                </FormControl>

                {/* Start Date and End Date (side by side) */}

                <FormControl isRequired>
                  <FormLabel>Start Date</FormLabel>
                  <Input
                    type="date"
                    name="startDate"
                    value={formInputs.startDate}
                    onChange={handleInputChange}
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>End Date</FormLabel>
                  <Input
                    type="date"
                    name="endDate"
                    value={formInputs.endDate}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl isRequired>
                  <FormLabel>Time Limit</FormLabel>
                  <Input
                    type="time"
                    name="timeLimit"
                    value={formInputs.timeLimit}
                    onChange={handleInputChange}
                  />
                </FormControl>

                {/* Toggle between Case ID and Other Related To */}
                <div>
                  <Checkbox
                    isChecked={useCaseId}
                    mb={6}
                    onChange={toggleRelatedField}
                  >
                    Use Case ID
                  </Checkbox>

                  {/* Conditionally show either Case ID or Other Related To */}
                  {useCaseId ? (
                    <FormControl>
                      <FormLabel>Case ID</FormLabel>
                      <Select
                        name="caseId"
                        placeholder="Enter case ID"
                        value={formInputs.caseId}
                        onChange={handleInputChange}
                      >
                        {allCases.map((individualCase) => (
                          <option
                            key={individualCase.caseId}
                            value={individualCase.caseId}
                          >
                            {individualCase.caseNo}
                          </option>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <FormControl>
                      <FormLabel>Other Related To</FormLabel>
                      <Input
                        name="otherRelatedTo"
                        placeholder="Enter related details"
                        value={formInputs.otherRelatedTo}
                        onChange={handleInputChange}
                      />
                    </FormControl>
                  )}
                </div>

                {/* Task Description */}

                <FormControl>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="taskDescription"
                    placeholder="Enter task description"
                    value={formInputs.taskDescription}
                    onChange={handleInputChange}
                  />
                </FormControl>
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
