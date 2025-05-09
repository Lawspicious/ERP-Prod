'use client';

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
  Tag,
  TagCloseButton,
  TagLabel,
  IconButton,
  Spinner,
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/user/userContext';
import { useTeam } from '@/hooks/useTeamHook';
import { useCases } from '@/hooks/useCasesHook';
import { useClient } from '@/hooks/useClientHook';
import { useTask } from '@/hooks/useTaskHooks';
import { useLoading } from '@/context/loading/loadingContext';
import { today } from '@/lib/utils/todayDate';
import { dayAfterTomorrow } from '@/lib/utils/dayAfterTomorrowDate';
import { ITask } from '@/types/task';
import { IUser } from '@/types/user';
import { IClient, IClientProspect } from '@/types/client';
import SelectSearch from 'react-select';

const initialRowData = {
  taskName: '',
  startDate: today,
  endDate: dayAfterTomorrow,
  taskStatus: 'PENDING',
  priority: 'LOW',
  lawyerIds: [] as string[],
  selectedLawyers: [] as IUser[],
  clientId: '',
  taskDescription: '',
};

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const TaskModal: React.FC<TaskModalProps> = ({ isOpen, onClose }) => {
  const [taskRows, setTaskRows] = useState([initialRowData]);
  const { allTeam, getAllTeam } = useTeam();
  const { fetchCasesByStatus } = useCases();
  const { allClients } = useClient();
  const { authUser } = useAuth();
  const { loading, setLoading } = useLoading();
  const { createTask } = useTask();
  const [btnLoading, setBtnLoading] = useState(false);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      await getAllTeam();
      await fetchCasesByStatus('RUNNING');
      setLoading(false);
    };
    fetch();
  }, []);

  const updateRow = (
    index: number,
    updated: Partial<typeof initialRowData>,
  ) => {
    const newRows = [...taskRows];
    newRows[index] = { ...newRows[index], ...updated };
    setTaskRows(newRows);
  };

  const addRow = () => {
    if (taskRows.length < 20) {
      setTaskRows([...taskRows, initialRowData]);
    }
  };

  const removeRow = (index: number) => {
    if (taskRows.length > 1) {
      setTaskRows(taskRows.filter((_, i) => i !== index));
    }
  };

  const handleLawyerSelection = (index: number, lawyerId: string) => {
    const lawyer = allTeam.find((member) => member.id === lawyerId);
    if (lawyer && !taskRows[index].lawyerIds.includes(lawyerId)) {
      const newLawyerIds = [...taskRows[index].lawyerIds, lawyerId];
      const newSelected = [...taskRows[index].selectedLawyers, lawyer];
      updateRow(index, {
        lawyerIds: newLawyerIds,
        selectedLawyers: newSelected,
      });
    }
  };

  const removeSelectedLawyer = (index: number, lawyerId: string) => {
    const filteredIds = taskRows[index].lawyerIds.filter(
      (id) => id !== lawyerId,
    );
    const filteredLawyers = taskRows[index].selectedLawyers.filter(
      (l) => l.id !== lawyerId,
    );
    updateRow(index, {
      lawyerIds: filteredIds,
      selectedLawyers: filteredLawyers,
    });
  };

  const handleCreateTasks = async () => {
    setBtnLoading(true);
    try {
      for (const row of taskRows) {
        const lawyerDetails = row.selectedLawyers.map((lawyer) => ({
          id: lawyer?.id?.toString() || '',
          email: lawyer?.email || '',
          phoneNumber: lawyer?.phoneNumber || '',
          name: lawyer?.name || '',
        }));

        let clientDetails = null;

        if (row.clientId !== '') {
          const selectedClient = allClients.find(
            (client) => client.id === row.clientId,
          );
          clientDetails = {
            id: selectedClient?.id as string,
            name: selectedClient?.name as string,
            email: selectedClient?.email as string,
            mobile: selectedClient?.mobile as string,
          };
        }

        const newTask: ITask = {
          payable: false,
          amount: 0,
          taskName: row.taskName,
          startDate: row.startDate,
          endDate: row.endDate,
          taskStatus: row.taskStatus as 'PENDING' | 'COMPLETED',
          priority: row.priority as 'LOW' | 'MEDIUM' | 'HIGH',
          lawyerDetails,
          clientDetails: clientDetails ? clientDetails : null,
          taskDescription: row.taskDescription,
          timeLimit: '48 hours',
          createdBy: {
            id: authUser?.uid ?? '',
            name: authUser?.displayName ?? '',
          },
          taskType: null,
          caseDetails: null,
        };

        await createTask(newTask);
      }

      setTaskRows([initialRowData]);
      onClose();
    } catch (err) {
      console.error(err);
    }
    setBtnLoading(false);
  };

  const clientOptions = allClients.map((client: IClient | IClientProspect) => ({
    value: client.id,
    label: client.name,
  }));

  const groupedTeamOptions = [
    {
      label: 'Lawyers',
      options: allTeam
        .filter((user) => user.role === 'LAWYER')
        .map((lawyer) => ({
          value: lawyer.id,
          label: lawyer.name,
        })),
    },
    {
      label: 'Admins',
      options: allTeam
        .filter((user) => user.role === 'ADMIN')
        .map((admin) => ({
          value: admin.id,
          label: admin.name,
        })),
    },
  ];

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="6xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Multiple Tasks</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          {loading ? (
            <div className="flex h-40 items-center justify-center">
              <Spinner />
            </div>
          ) : (
            <>
              {taskRows.map((row, index) => (
                <div
                  key={index}
                  className="relative z-20 mb-4 flex gap-3 rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex flex-col">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gray-200 font-bold">
                      {index + 1}
                    </div>

                    {taskRows.length > 1 && (
                      <IconButton
                        aria-label="Remove"
                        size="sm"
                        icon={<CloseIcon />}
                        colorScheme="red"
                        onClick={() => removeRow(index)}
                        className="mt-2"
                      />
                    )}
                  </div>
                  <FormControl isRequired>
                    <FormLabel>Task Name</FormLabel>
                    <Input
                      value={row.taskName}
                      onChange={(e) =>
                        updateRow(index, { taskName: e.target.value })
                      }
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Assign Team Member</FormLabel>
                    {/* <Select
                      placeholder="Select"
                      onChange={(e) =>
                        handleLawyerSelection(index, e.target.value)
                      }
                    >
                      <optgroup label="Lawyers">
                        {allTeam
                          .filter((t) => t.role === 'LAWYER')
                          .map((lawyer) => (
                            <option key={lawyer.id} value={lawyer.id}>
                              {lawyer.name}
                            </option>
                          ))}
                      </optgroup>
                      <optgroup label="Admins">
                        {allTeam
                          .filter((t) => t.role === 'ADMIN')
                          .map((admin) => (
                            <option key={admin.id} value={admin.id}>
                              {admin.name}
                            </option>
                          ))}
                      </optgroup>
                    </Select> */}

                    <SelectSearch
                      placeholder="Select"
                      options={groupedTeamOptions}
                      onChange={(option) => {
                        // This assumes your function accepts (index, id)
                        handleLawyerSelection(
                          index,
                          (option as unknown as { value: string })?.value || '',
                        );
                      }}
                    />

                    <VStack align="start" mt={2}>
                      {row.selectedLawyers.map((lawyer) => (
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
                              removeSelectedLawyer(index, lawyer.id as string)
                            }
                          />
                        </Tag>
                      ))}
                    </VStack>
                  </FormControl>

                  <FormControl>
                    <FormLabel>Select Client</FormLabel>

                    <SelectSearch
                      name="clientId"
                      placeholder="Enter Client details"
                      options={clientOptions}
                      value={clientOptions.find(
                        (option) => option.value === row.clientId,
                      )}
                      onChange={(option) =>
                        updateRow(index, { clientId: option?.value || '' })
                      }
                      isClearable
                    />
                  </FormControl>

                  <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Textarea
                      value={row.taskDescription}
                      onChange={(e) =>
                        updateRow(index, { taskDescription: e.target.value })
                      }
                    />
                  </FormControl>
                </div>
              ))}

              <Button
                onClick={addRow}
                leftIcon={<AddIcon />}
                colorScheme="blue"
                variant="outline"
                mb={4}
              >
                Add Task
              </Button>
            </>
          )}
        </ModalBody>

        <ModalFooter>
          <Button disabled={btnLoading} onClick={onClose} mr={3}>
            Cancel
          </Button>
          <Button
            disabled={btnLoading}
            colorScheme="purple"
            onClick={handleCreateTasks}
          >
            {btnLoading ? 'Creating...' : 'Create Tasks'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default TaskModal;
