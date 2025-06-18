import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Input,
  IconButton,
  Checkbox,
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Select,
  Box,
  VStack,
  Tag,
  TagLabel,
  TagCloseButton,
  useToast,
} from '@chakra-ui/react';
import { ArrowUp, ArrowDown, MoreVertical, ChevronDown } from 'lucide-react';
import Pagination from '@/components/dashboard/shared/Pagination';
import { useTeam } from '@/hooks/useTeamHook';
import { IUser } from '@/types/user';
import CloneTaskModal from './action-button/clone-task-modal';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '@/lib/config/firebase.config';

interface Column {
  key: string;
  label: string;
  sortable?: boolean;
  width?: string;
}

interface TableData {
  [key: string]: any;
}

interface TasksTableProps {
  data: TableData[];
  columns: Column[];
  tabField: string;
  actionButton: (id: string, deleteName: string, data?: any) => ReactElement[];
  onBulkUpdate: (selectedTasks: Set<string>, field: string, value: any) => void;
  onDeleteTasks: (ids: string[]) => void;
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

const TasksTable = ({
  data,
  columns,
  tabField,
  actionButton,
  onBulkUpdate,
  onDeleteTasks,
}: TasksTableProps): JSX.Element => {
  const { getAllTeam } = useTeam();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [lawyers, setLawyers] = useState<IUser[]>([]);
  const [selectedLawyers, setSelectedLawyers] = useState<IUser[]>([]);
  const [priorityFilter, setPriorityFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: SortOrder | null;
  }>({ key: '', direction: null });
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedTasks, setSelectedTasks] = useState<Set<string>>(new Set());
  const [extensionDays, setExtensionDays] = useState<number>(1);
  const [isExtending, setIsExtending] = useState<boolean>(false);
  const rowsPerPage = 10;
  const toast = useToast();

  const handleSort = (key: string) => {
    let direction = SortOrder.ASC;
    if (sortConfig.key === key && sortConfig.direction === SortOrder.ASC) {
      direction = SortOrder.DESC;
    }
    setSortConfig({ key, direction });
  };

  const sortedData = useMemo(() => {
    let sortableData = [...data];
    if (sortConfig.key) {
      sortableData.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue < bValue) {
          return sortConfig.direction === SortOrder.ASC ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === SortOrder.ASC ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableData;
  }, [sortConfig, data]);

  const filteredData = useMemo(() => {
    return sortedData.filter((item) => {
      const matchesSearch = Object.values(item).some((value) =>
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
      );
      const matchesPriority =
        !priorityFilter || item.priority.toLowerCase() === priorityFilter;
      const matchesStatus =
        statusFilter === 'all' || item.status.toLowerCase() === statusFilter;

      return matchesSearch && matchesPriority && matchesStatus;
    });
  }, [searchTerm, sortedData, priorityFilter, statusFilter]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, priorityFilter, statusFilter]);

  useEffect(() => {
    const fetchLawyers = async () => {
      const res = await getAllTeam();
      setLawyers(res as IUser[]);
    };
    fetchLawyers();
  }, []);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [currentPage, filteredData]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const handleSelectAll = () => {
    const taskIds = paginatedData.map((task) => task.id);
    const allSelected = taskIds.every((id) => selectedTasks.has(id));

    setSelectedTasks((prev) => {
      const newSelection = new Set(prev);
      if (allSelected) {
        taskIds.forEach((id) => newSelection.delete(id));
      } else {
        taskIds.forEach((id) => newSelection.add(id));
      }
      return newSelection;
    });
  };

  const getRowColor = (status: string, isMyTask: boolean) => {
    if (isMyTask) return 'bg-blue-200';
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100';
      case 'completed':
        return 'bg-green-100';
      default:
        return '';
    }
  };

  const calculateHours = (taskId: string, newEndDate: string): string => {
    const task = data.find((item) => item.id === taskId);
    if (!task) return '24 hours'; // Default fallback

    // Get the start date from the task
    const startDate = new Date(task.startDate);
    const endDate = new Date(newEndDate);

    // Calculate the difference in hours
    const diffInMs = endDate.getTime() - startDate.getTime();
    const diffInHours = Math.ceil(diffInMs / (1000 * 60 * 60));

    return `${diffInHours} hours`;
  };

  const calculateNewEndDate = (
    taskId: string,
    daysToAdd: number,
  ): string | null => {
    const task = data.find((item) => item.id === taskId);
    if (!task) return null;

    const currentEndDate = new Date(task.endDate);
    if (isNaN(currentEndDate.getTime())) {
      const today = new Date();
      today.setDate(today.getDate() + daysToAdd);
      return today.toISOString().split('T')[0];
    }

    currentEndDate.setDate(currentEndDate.getDate() + daysToAdd);
    return currentEndDate.toISOString().split('T')[0];
  };

  const directUpdateTask = async (
    taskId: string,
    endDate: string,
    timeLimit: string,
  ) => {
    try {
      const taskRef = doc(db, 'tasks', taskId);

      await updateDoc(taskRef, {
        endDate: endDate,
        timeLimit: timeLimit,
      });

      toast({
        title: 'Task Updated',
        description: `End date extended for task`,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });

      return true;
    } catch (error) {
      console.error('Error updating task:', error);

      toast({
        title: 'Update Failed',
        description: 'Could not update task end date',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });

      return false;
    }
  };

  const extendEndDate = async () => {
    if (extensionDays <= 0 || selectedTasks.size === 0) {
      return;
    }

    setIsExtending(true);

    try {
      const taskIds = Array.from(selectedTasks);

      for (const taskId of taskIds) {
        const newEndDate = calculateNewEndDate(taskId, extensionDays);

        if (newEndDate) {
          // Calculate time limit based on start date and new end date
          const newTimeLimit = calculateHours(taskId, newEndDate);
          await directUpdateTask(taskId, newEndDate, newTimeLimit);
        }
      }
    } catch (error) {
      console.error('Error in bulk end date extension:', error);
      toast({
        title: 'Error',
        description: 'Failed to extend end dates for all tasks',
        status: 'error',
        duration: 3000,
        isClosable: true,
        position: 'top',
      });
    } finally {
      setIsExtending(false);
    }
  };

  const handleApplyLawyers = () => {
    if (selectedLawyers.length > 0) {
      const selectedLawyerDetails = selectedLawyers.map((lawyer) => ({
        id: lawyer.id,
        name: lawyer.name,
        email: lawyer.email,
        phoneNumber: lawyer.phoneNumber,
      }));
      onBulkUpdate(selectedTasks, 'lawyerDetails', selectedLawyerDetails);
      setSelectedLawyers([]);
    }
  };

  const renderTable = (tableData: TableData[]) => (
    <TableContainer>
      <Table variant="striped" colorScheme="blackAlpha" size="sm">
        <Thead>
          <Tr>
            <Th width="50px">
              <Checkbox
                className="cursor-pointer border-black"
                isChecked={paginatedData.every((task) =>
                  selectedTasks.has(task.id),
                )}
                onChange={handleSelectAll}
              />
            </Th>
            {columns.map((col) => (
              <Th key={col.key} width={col.width || 'auto'}>
                {col.label}
                {col.sortable && (
                  <IconButton
                    ml={2}
                    size="sm"
                    icon={
                      sortConfig.key === col.key &&
                      sortConfig.direction === SortOrder.ASC ? (
                        <ArrowUp />
                      ) : (
                        <ArrowDown />
                      )
                    }
                    onClick={() => handleSort(col.key)}
                    aria-label={`Sort by ${col.label}`}
                  />
                )}
              </Th>
            ))}
            <Th width="100px">Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {tableData.map((row, index) => (
            <Tr key={index} className={getRowColor(row.status, row.isMyTask)}>
              <Td>
                <Checkbox
                  className="cursor-pointer border-black"
                  isChecked={selectedTasks.has(row.id)}
                  onChange={() => {
                    setSelectedTasks((prev) => {
                      const newSelection = new Set(prev);
                      if (newSelection.has(row.id)) {
                        newSelection.delete(row.id);
                      } else {
                        newSelection.add(row.id);
                      }
                      return newSelection;
                    });
                  }}
                />
              </Td>
              {columns.map((col) => (
                <Td key={col.key}>{row[col.key]}</Td>
              ))}
              <Td>
                <Menu>
                  <MenuButton
                    as={IconButton}
                    aria-label="Options"
                    icon={<MoreVertical />}
                    variant="outline"
                  />
                  <MenuList zIndex={50} maxWidth={100}>
                    {actionButton(row.id, row.deleteName, row).map(
                      (action, i) => (
                        <MenuItem as="div" key={i}>
                          {action}
                        </MenuItem>
                      ),
                    )}
                  </MenuList>
                </Menu>
              </Td>
            </Tr>
          ))}
        </Tbody>
      </Table>
    </TableContainer>
  );

  return (
    <div>
      <Flex justify="space-between" wrap="wrap" mb={4} gap={4}>
        <Input
          placeholder="Search tasks..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          maxW={['100%', '200px']}
        />
        <Select
          placeholder="Filter by Priority"
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value)}
          maxW={['100%', '200px']}
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </Select>
        <Select
          placeholder="Filter by Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          maxW={['100%', '200px']}
        >
          <option value="all">All</option>
          <option value="pending">Pending</option>
          <option value="completed">Completed</option>
        </Select>
      </Flex>
      <Flex
        flexDirection={'column'}
        justify="space-between"
        wrap="wrap"
        gap={4}
        mb={4}
      >
        <Flex gap={2} wrap="wrap">
          {selectedTasks.size > 0 && (
            <Flex flexDirection={['column', 'row']} gap={2}>
              <Flex align="center" gap={2} wrap="wrap">
                <Button
                  colorScheme="red"
                  onClick={() => onDeleteTasks(Array.from(selectedTasks))}
                >
                  Delete Selected
                </Button>

                {/* Status Dropdown Menu */}
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDown />}
                    colorScheme="blue"
                  >
                    Change Status
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() =>
                        onBulkUpdate(selectedTasks, 'taskStatus', 'COMPLETED')
                      }
                    >
                      Mark as Completed
                    </MenuItem>
                    <MenuItem
                      onClick={() =>
                        onBulkUpdate(selectedTasks, 'taskStatus', 'PENDING')
                      }
                    >
                      Mark as Pending
                    </MenuItem>
                  </MenuList>
                </Menu>

                {/* Priority Dropdown Menu */}
                <Menu>
                  <MenuButton
                    as={Button}
                    rightIcon={<ChevronDown />}
                    colorScheme="orange"
                  >
                    Change Priority
                  </MenuButton>
                  <MenuList>
                    <MenuItem
                      onClick={() =>
                        onBulkUpdate(selectedTasks, 'priority', 'LOW')
                      }
                    >
                      Set to Low
                    </MenuItem>
                    <MenuItem
                      onClick={() =>
                        onBulkUpdate(selectedTasks, 'priority', 'MEDIUM')
                      }
                    >
                      Set to Medium
                    </MenuItem>
                    <MenuItem
                      onClick={() =>
                        onBulkUpdate(selectedTasks, 'priority', 'HIGH')
                      }
                    >
                      Set to High
                    </MenuItem>
                  </MenuList>
                </Menu>

                {selectedTasks.size === 1 && (
                  <Box width="120px">
                    <CloneTaskModal taskId={Array.from(selectedTasks)[0]} />
                  </Box>
                )}
              </Flex>
            </Flex>
          )}
        </Flex>
        {selectedTasks.size > 0 && (
          <>
            <Flex align="center" gap={2} wrap="wrap">
              <Select
                value={extensionDays}
                onChange={(e) => setExtensionDays(Number(e.target.value))}
                maxW={['100%', '150px']}
                isDisabled={isExtending}
              >
                <option value={1}>Extend by 1 day</option>
                <option value={2}>Extend by 2 days</option>
                <option value={3}>Extend by 3 days</option>
                <option value={4}>Extend by 4 days</option>
                <option value={5}>Extend by 5 days</option>
                <option value={6}>Extend by 6 days</option>
                <option value={7}>Extend by 7 days</option>
              </Select>
              <Button
                colorScheme="teal"
                onClick={() => extendEndDate()}
                isLoading={isExtending}
                loadingText="Extending"
              >
                Extend End Date
              </Button>
            </Flex>
            <Flex align="center" gap={2} wrap="wrap" mt={4}>
              <Box>
                <Select
                  placeholder="Select Lawyers"
                  onChange={(e) => {
                    const selectedLawyer = lawyers.find(
                      (lawyer) => lawyer.id === e.target.value,
                    );
                    if (
                      selectedLawyer &&
                      !selectedLawyers.some(
                        (lawyer) => lawyer.id === selectedLawyer.id,
                      )
                    ) {
                      setSelectedLawyers([...selectedLawyers, selectedLawyer]);
                    }
                  }}
                  maxW={['100%', '300px']}
                >
                  {lawyers.map((lawyer) => (
                    <option key={lawyer.id} value={lawyer.id}>
                      {lawyer.name}
                    </option>
                  ))}
                </Select>
                <VStack mt={2} align="start">
                  {selectedLawyers.map((lawyer) => (
                    <Tag
                      key={lawyer.id}
                      size="lg"
                      colorScheme="teal"
                      borderRadius="full"
                    >
                      <TagLabel>{lawyer.name}</TagLabel>
                      <TagCloseButton
                        onClick={() =>
                          setSelectedLawyers(
                            selectedLawyers.filter((l) => l.id !== lawyer.id),
                          )
                        }
                      />
                    </Tag>
                  ))}
                </VStack>
                <Button
                  colorScheme="purple"
                  mt={2}
                  onClick={handleApplyLawyers}
                  isDisabled={selectedLawyers.length === 0}
                >
                  Assign Lawyers
                </Button>
              </Box>
            </Flex>
          </>
        )}
      </Flex>
      {paginatedData.length > 0 ? (
        <>
          {renderTable(paginatedData)}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(page) => {
              if (page >= 1 && page <= totalPages) {
                setCurrentPage(page);
              }
            }}
            pagesWithContent={Array.from(
              { length: totalPages },
              (_, i) => i + 1,
            )}
          />
        </>
      ) : (
        <h1 className="heading-secondary text-center">No Tasks Found</h1>
      )}
    </div>
  );
};

export default TasksTable;
