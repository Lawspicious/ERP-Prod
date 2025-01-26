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
} from '@chakra-ui/react';
import { ArrowUp, ArrowDown, MoreVertical } from 'lucide-react';
import Pagination from '@/components/dashboard/shared/Pagination';
import { useTeam } from '@/hooks/useTeamHook';
import { IUser } from '@/types/user';

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
  actionButton: (id: string, deleteName: string) => ReactElement[];
  onBulkUpdate: (selectedTasks: Set<string>, field: string, value: any) => void;
  onDeleteTasks: (ids: string[]) => void;
}

enum SortOrder {
  ASC = 'asc',
  DESC = 'desc',
}

const TasksTable: React.FC<TasksTableProps> = ({
  data,
  columns,
  tabField,
  actionButton,
  onBulkUpdate,
  onDeleteTasks,
}) => {
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
  const [newEndDate, setNewEndDate] = useState<string>('');
  const rowsPerPage = 10;

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

  const getRowColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-red-100';
      case 'medium':
        return 'bg-yellow-100';
      case 'low':
        return 'bg-green-100';
      default:
        return '';
    }
  };

  const handleApplyNewDate = () => {
    if (newEndDate) {
      onBulkUpdate(selectedTasks, 'endDate', newEndDate);
      setNewEndDate('');
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
            <Tr key={index} className={getRowColor(row.priority)}>
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
                    {actionButton(row.id, row.deleteName).map((action, i) => (
                      <MenuItem as="div" key={i}>
                        {action}
                      </MenuItem>
                    ))}
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
                <Button
                  colorScheme="blue"
                  onClick={() =>
                    onBulkUpdate(selectedTasks, 'taskStatus', 'COMPLETED')
                  }
                >
                  Mark as Completed
                </Button>
                <Button
                  colorScheme="yellow"
                  onClick={() =>
                    onBulkUpdate(selectedTasks, 'taskStatus', 'PENDING')
                  }
                >
                  Mark as Pending
                </Button>
              </Flex>
            </Flex>
          )}
        </Flex>
        {selectedTasks.size > 0 && (
          <>
            <Flex align="center" gap={2} wrap="wrap">
              <Input
                type="date"
                value={newEndDate}
                onChange={(e) => setNewEndDate(e.target.value)}
                maxW={['100%', '150px']}
              />
              <Button colorScheme="teal" onClick={handleApplyNewDate}>
                Apply End Date
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
            onPageChange={setCurrentPage}
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
