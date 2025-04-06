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
} from '@chakra-ui/react';
import { IUser } from '@/types/user';
import LoaderComponent from '@/components/ui/loader';
import { ITask } from '@/types/task';
import { useTask } from '@/hooks/useTaskHooks';
import { ILawyer } from '@/types/case';
import { useTeam } from '@/hooks/useTeamHook';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';
import { useClient } from '@/hooks/useClientHook';
import { IClient, IClientProspect } from '@/types/client';
import { useCases } from '@/hooks/useCasesHook';

interface IClientDetails {
  id: string;
  name: string;
  email: string;
  mobile: string;
}

const TaskEditModal = ({ taskId }: { taskId: string }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [lawyers, setLawyers] = useState<IUser[]>([]);
  const { loading, setLoading } = useLoading();
  const { getTaskById, updateTask, task } = useTask();
  const { getAllTeam } = useTeam();
  const { role } = useAuth();
  const { allClients } = useClient();
  const { allCases, fetchCasesByStatus } = useCases();
  const [useCaseId, setUseCaseId] = useState(true);

  const [formData, setFormData] = useState<{
    taskName: string;
    lawyerDetails: ILawyer[];
    clientId: string;
    caseId: string;
    otherRelatedTo: string;
  }>({
    taskName: '',
    lawyerDetails: [],
    clientId: '',
    caseId: '',
    otherRelatedTo: '',
  });
  const [selectedLawyerIds, setSelectedLawyerIds] = useState<string[]>([]);

  const handleFetchTask = async () => {
    try {
      const task = await getTaskById(taskId);
      if (task) {
        setFormData({
          taskName: task.taskName,
          lawyerDetails: task.lawyerDetails,
          clientId: task.clientDetails?.id || '',
          caseId: task.caseDetails?.caseId || '',
          otherRelatedTo: task.taskType || '',
        });
        const lawyerIds = task.lawyerDetails.map(
          (lawyer: ILawyer) => lawyer.id,
        );
        setSelectedLawyerIds(lawyerIds);
        setUseCaseId(!!task.caseDetails?.caseId);
      }
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const handleFetch = async () => {
      setLoading(true);
      await handleFetchTask();
      const res = await getAllTeam();
      setLawyers(res as IUser[]);
      await fetchCasesByStatus('RUNNING');
      setLoading(false);
    };

    handleFetch();
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

  const toggleRelatedField = () => {
    setUseCaseId((prev) => !prev);
    setFormData((prev) => ({
      ...prev,
      caseId: '',
      otherRelatedTo: '',
    }));
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    try {
      const selectedLawyers = lawyers
        .filter((lawyer) => selectedLawyerIds.includes(lawyer.id as string))
        .map((lawyer) => ({
          id: lawyer.id as string,
          name: lawyer.name,
          email: lawyer.email,
          phoneNumber: lawyer.phoneNumber,
        }));

      // Get client details
      let clientDetails: IClientDetails | null = null;
      if (formData.clientId) {
        const selectedClient = allClients.find(
          (client) => client.id === formData.clientId,
        );
        if (selectedClient) {
          clientDetails = {
            id: selectedClient.id as string,
            name: selectedClient.name,
            email: selectedClient.email,
            mobile: selectedClient.mobile,
          };
        }
      }

      // Get case details or prepare task type
      let updatedData: Partial<ITask> = {
        taskName: formData.taskName,
        lawyerDetails: selectedLawyers as ILawyer[],
        clientDetails: clientDetails,
      };

      if (useCaseId && formData.caseId) {
        // Use existing case details but update the caseId
        if (task?.caseDetails) {
          updatedData.caseDetails = {
            ...task.caseDetails,
            caseId: formData.caseId,
          };
        }
      } else if (formData.otherRelatedTo) {
        updatedData.taskType = formData.otherRelatedTo as any;
        // Remove case details completely if using otherRelatedTo
        updatedData.caseDetails = undefined;
      }

      await updateTask(taskId, updatedData as ITask, task?.taskName as string);
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
                <form
                  className="grid grid-cols-1 gap-6 md:w-[60vw] md:grid-cols-2 lg:w-[40vw]"
                  onSubmit={handleSubmit}
                >
                  <FormControl isRequired mb={4}>
                    <FormLabel>Task Name</FormLabel>
                    <Input
                      name="taskName"
                      value={formData.taskName}
                      onChange={handleInputChange}
                    />
                  </FormControl>

                  <FormControl mb={4}>
                    <FormLabel>Select Members</FormLabel>
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

                  <FormControl mb={4}>
                    <FormLabel>Select Client</FormLabel>
                    <Select
                      placeholder="Select Client"
                      name="clientId"
                      value={formData.clientId}
                      onChange={handleInputChange}
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
                            value={formData.caseId}
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
                          value={formData.otherRelatedTo}
                          onChange={handleInputChange}
                        />
                      </FormControl>
                    )}
                  </div>
                </form>
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
