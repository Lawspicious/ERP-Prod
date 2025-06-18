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
  Checkbox,
  Spinner,
} from '@chakra-ui/react';
import { IUser } from '@/types/user';
import { ITask } from '@/types/task';
import { useTask } from '@/hooks/useTaskHooks';
import { useTeam } from '@/hooks/useTeamHook';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';
import { useCases } from '@/hooks/useCasesHook';
import { useClient } from '@/hooks/useClientHook';
import { IClient, IClientProspect } from '@/types/client';
import { today } from '@/lib/utils/todayDate';
import { dayAfterTomorrow } from '@/lib/utils/dayAfterTomorrowDate';
import { ICase } from '@/types/case';

const CloneTaskModal = ({ taskId }: { taskId: string }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { loading, setLoading } = useLoading();
  const { getTaskById, createTask } = useTask();
  const { getAllTeam, allTeam } = useTeam();
  const { authUser } = useAuth();
  const { getCaseById } = useCases();
  const { allCases, fetchCasesByStatus } = useCases();
  const { allClients } = useClient();

  const [formInputs, setFormInputs] = useState({
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
  });

  const [useCaseId, setUseCaseId] = useState(true);
  const [selectedLawyers, setSelectedLawyers] = useState<IUser[]>([]);
  const [selectedClientId, setSelectedClientId] = useState('');
  const [originalTask, setOriginalTask] = useState<ITask | null>(null);

  useEffect(() => {
    const handleFetch = async () => {
      try {
        setLoading(true);
        await getAllTeam();
        await fetchCasesByStatus('RUNNING');

        const task = await getTaskById(taskId);
        if (task) {
          setOriginalTask(task);

          // Pre-fill form with task data
          setFormInputs({
            taskName: task.taskName,
            startDate: today,
            endDate: dayAfterTomorrow,
            taskStatus: 'PENDING',
            priority: task.priority,
            lawyerIds: [],
            caseId: task.caseDetails?.caseId || '',
            taskDescription: task.taskDescription || '',
            otherRelatedTo: task.taskType || '',
            timeLimit: '48 hours',
            payable: task.payable || false,
          });

          // Set client if exists
          if (task.clientDetails) {
            setSelectedClientId(task.clientDetails.id);
          }

          // Set useCaseId based on whether task has a case or not
          setUseCaseId(!!task.caseDetails?.caseId);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    handleFetch();
  }, [taskId]);

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

    let clientDetails = null;

    if (selectedClientId !== '') {
      const selectedClient = allClients.find(
        (client) => client.id === selectedClientId,
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
      lawyerDetails: lawyerDetails,
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
    try {
      setLoading(true);
      const data = await generateTaskCreateData();
      await createTask(data);
      setFormInputs({
        taskName: '',
        startDate: today,
        endDate: dayAfterTomorrow,
        taskStatus: 'PENDING',
        priority: 'LOW',
        lawyerIds: [],
        caseId: '',
        taskDescription: '',
        otherRelatedTo: '',
        timeLimit: '48 hours',
        payable: false,
      });
      setSelectedLawyers([]);
      onClose();
    } catch (error) {
      console.error('Error creating cloned task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Button colorScheme="teal" onClick={onOpen} className="w-full">
        Clone
      </Button>
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
                Clone Task
              </ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <form
                  onSubmit={handleSubmit}
                  className="grid grid-cols-1 gap-6 md:w-[60vw] md:grid-cols-2 lg:w-[40vw]"
                >
                  <FormControl isRequired>
                    <FormLabel>Task Name</FormLabel>
                    <Input
                      name="taskName"
                      placeholder="Enter task name"
                      value={formInputs.taskName}
                      onChange={handleInputChange}
                    />
                  </FormControl>

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
                      <optgroup label="HRs">
                        {allTeam
                          .filter((team: IUser) => team.role === 'HR')
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
                      value={selectedClientId}
                      onChange={(e) => setSelectedClientId(e.target.value)}
                    >
                      {allClients.map((client: IClient | IClientProspect) => (
                        <option key={client.id} value={client.id}>
                          {client.name}
                        </option>
                      ))}
                    </Select>
                  </FormControl>

                  <div>
                    {/* Conditionally show either Case ID or Other Related To */}
                    {useCaseId ? (
                      <>
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
                                {individualCase.caseNo}-{' '}
                                {individualCase.petition.petitioner} vs{' '}
                                {individualCase.respondent.respondentee}
                              </option>
                            ))}
                          </Select>
                        </FormControl>
                        <Checkbox
                          isChecked={useCaseId}
                          mt={3}
                          onChange={toggleRelatedField}
                        >
                          Use Case ID
                        </Checkbox>
                      </>
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
                </form>
              </ModalBody>

              <ModalFooter>
                <Button mr={3} onClick={onClose}>
                  Close
                </Button>
                <Button colorScheme="purple" onClick={handleSubmit}>
                  Create Clone Task
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CloneTaskModal;
