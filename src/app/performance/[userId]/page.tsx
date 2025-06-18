'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  usePerformanceHook,
  UserWithDetails,
  Task,
  Case,
} from '@/hooks/usePerformanceHook';
import { useEffect, useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Select,
  Flex,
  Text,
  Input,
  VStack,
  HStack,
  useColorModeValue,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Button,
} from '@chakra-ui/react';
import Pagination from '@/components/dashboard/shared/Pagination';
import LoaderComponent from '@/components/ui/loader';
import withAuth from '@/components/shared/hoc-middlware';
import PageLayout from '@/components/ui/page-layout';
import { useToastHook } from '@/hooks/shared/useToastHook';
import { ArrowLeft } from 'lucide-react';

const UserPerformance = ({ params }: { params: { userId: string } }) => {
  const { getUserPerformance } = usePerformanceHook();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [toast, newToast] = useToastHook();

  const [user, setUser] = useState<UserWithDetails | null>(null);
  const [displayType, setDisplayType] = useState<'tasks' | 'cases'>('tasks');
  const [taskStatus, setTaskStatus] = useState<'COMPLETED' | 'PENDING'>(
    'COMPLETED',
  );
  const [caseStatus, setCaseStatus] = useState<
    'DECIDED' | 'RUNNING' | 'PENDING'
  >('DECIDED');
  const [tasksPage, setTasksPage] = useState(1);
  const [casesPage, setCasesPage] = useState(1);
  const [tasksData, setTasksData] = useState<Task[]>([]);
  const [casesData, setCasesData] = useState<Case[]>([]);
  const [tasksTotalPages, setTasksTotalPages] = useState(1);
  const [casesTotalPages, setCasesTotalPages] = useState(1);
  const [tasksPagesWithContent, setTasksPagesWithContent] = useState<number[]>(
    [],
  );
  const [casesPagesWithContent, setCasesPagesWithContent] = useState<number[]>(
    [],
  );
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [filteredItems, setFilteredItems] = useState<(Task | Case)[]>([]);
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [totalTasks, setTotalTasks] = useState<number>(0);
  const [totalDecidedCases, setTotalDecidedCases] = useState<number>(0);
  const [meanCompletionTime, setMeanCompletionTime] = useState<number>(0);

  const itemsPerPage = 5;

  useEffect(() => {
    fetchUserData();
  }, [tasksPage, casesPage, dateRange]);

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('displayType');
    params.set('displayType', displayType);
    if (displayType === 'tasks') {
      params.delete('caseStatus');
      params.set('taskStatus', taskStatus);
    } else {
      params.delete('taskStatus');
      params.set('caseStatus', caseStatus);
    }
    params.delete('page');
    params.delete('startDate');
    params.delete('endDate');
    window.history.replaceState({}, '', `${pathname}?${params.toString()}`);
  }, [displayType]);

  useEffect(() => {
    const page = Number(searchParams.get('page')) || 1;
    const displayType = searchParams.get('displayType') || 'tasks';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';
    const taskStatus = searchParams.get('taskStatus') || 'COMPLETED';
    const caseStatus = searchParams.get('caseStatus') || 'DECIDED';

    if (displayType === 'tasks') {
      setTasksPage(page);
    } else if (displayType === 'cases') {
      setCasesPage(page);
    }

    setDisplayType(displayType as 'tasks' | 'cases');
    setStartDate(startDate);
    setEndDate(endDate);
    setTaskStatus(taskStatus as 'COMPLETED' | 'PENDING');
    setCaseStatus(caseStatus as 'DECIDED' | 'RUNNING' | 'PENDING');
    setDateRange({ start: startDate, end: endDate });
  }, [searchParams]);

  useEffect(() => {
    if (user) {
      setFilteredItems(displayType === 'tasks' ? tasksData : casesData);
    }
  }, [displayType, user, tasksData, casesData]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const textColor = useColorModeValue('gray.800', 'white');
  const TasksBg = useColorModeValue('gray.50', 'gray.700');
  const CasesBg = useColorModeValue('gray.50', 'gray.700');

  const fetchUserData = async () => {
    try {
      const {
        user,
        tasksPagination,
        casesPagination,
        completedTaskStats,
        totalDecidedCases,
      } = await getUserPerformance(
        params.userId,
        tasksPage,
        casesPage,
        itemsPerPage,
        dateRange.start,
        dateRange.end,
        displayType,
        taskStatus,
        caseStatus,
      );

      setUser(user);
      setTasksData(tasksPagination.data);
      setTasksTotalPages(tasksPagination.totalPages);
      setTasksPagesWithContent(tasksPagination.pagesWithContent);
      setTotalTasks(completedTaskStats.totalCompletedTasks);
      setMeanCompletionTime(
        completedTaskStats.meanCompletionTime
          ? completedTaskStats.meanCompletionTime
          : 0,
      );

      setCasesData(casesPagination.data);
      setCasesTotalPages(casesPagination.totalPages);
      setCasesPagesWithContent(casesPagination.pagesWithContent);
      setTotalDecidedCases(totalDecidedCases);
    } catch (error) {
      console.error('Error fetching user performance data:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateCompletionTime = (startDate: string, endDate: string) => {
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diffTime = Math.abs(end.getTime() - start.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', page.toString());
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const searchCriteria = () => {
    if (startDate && !endDate) {
      newToast({
        message: 'Please select an end date to filter by date range',
        status: 'error',
      });
      return;
    }
    if (!startDate && endDate) {
      newToast({
        message: 'Please select a start date to filter by date range',
        status: 'error',
      });
      return;
    }
    if (startDate > endDate) {
      newToast({
        message: 'Start date cannot be greater than end date',
        status: 'error',
      });
      return;
    }
    setLoading(true);
    setDateRange({ start: startDate, end: endDate });
    const params = new URLSearchParams(searchParams.toString());
    if (startDate && endDate) {
      params.set('startDate', startDate);
      params.set('endDate', endDate);
    } else {
      params.delete('startDate');
      params.delete('endDate');
    }
    if (displayType === 'tasks') {
      params.set('displayType', 'tasks');
      params.set('taskStatus', taskStatus);
      params.delete('caseStatus');
    } else {
      params.set('displayType', 'cases');
      params.set('caseStatus', caseStatus);
      params.delete('taskStatus');
    }
    params.set('page', '1'); // Reset to the first page
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  if (!user || loading) {
    return (
      <Box>
        <LoaderComponent />
      </Box>
    );
  }

  const RenderTasksTable = () => {
    return (
      <Box overflowX="auto" width="100%">
        <Table variant="simple" minWidth="650px">
          <Thead bg={TasksBg}>
            <Tr>
              <Th>Task Name</Th>
              <Th>Status</Th>
              <Th>Priority</Th>
              <Th>Start Date</Th>
              <Th>End Date</Th>
              <Th>Completion Time (Days)</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredItems.map((item) => {
              if ('taskName' in item) {
                const task = item as Task;
                return (
                  <Tr
                    key={task.id}
                    className={
                      task.taskStatus === 'COMPLETED'
                        ? 'bg-green-50'
                        : 'bg-yellow-50'
                    }
                  >
                    <Td>{task.taskName}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          task.taskStatus === 'COMPLETED' ? 'green' : 'yellow'
                        }
                      >
                        {task.taskStatus}
                      </Badge>
                    </Td>
                    <Td>{task.priority}</Td>
                    <Td>{task.startDate}</Td>
                    <Td>{task.endDate}</Td>
                    <Td>
                      {task.taskStatus === 'COMPLETED'
                        ? calculateCompletionTime(task.startDate, task.endDate)
                        : 'N/A'}
                    </Td>
                  </Tr>
                );
              }
              return null;
            })}
          </Tbody>
        </Table>
      </Box>
    );
  };

  const RenderCasesTable = () => {
    return (
      <Box overflowX="auto" width="100%">
        <Table variant="simple" minWidth="650px">
          <Thead bg={CasesBg}>
            <Tr>
              <Th>Case Number</Th>
              <Th>Regd Date</Th>
              <Th>Status</Th>
              <Th>Type</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredItems.map((item) => {
              if ('caseNo' in item) {
                const caseItem = item as Case;
                return (
                  <Tr
                    key={caseItem.caseNo}
                    className={
                      caseItem.caseStatus === 'DECIDED'
                        ? 'bg-purple-50'
                        : 'bg-blue-50'
                    }
                  >
                    <Td>{caseItem.caseNo || 'NA'}</Td>
                    <Td>{caseItem.regDate || 'NA'}</Td>
                    <Td>
                      <Badge
                        colorScheme={
                          caseItem.caseStatus === 'DECIDED' ? 'purple' : 'blue'
                        }
                      >
                        {caseItem.caseStatus || 'NA'}
                      </Badge>
                    </Td>
                    <Td>{caseItem.caseType || 'NA'}</Td>
                  </Tr>
                );
              }
              return null;
            })}
          </Tbody>
        </Table>
      </Box>
    );
  };

  return (
    <PageLayout screen="margined">
      <Container maxW="container.xl" py={8} px={4}>
        <VStack spacing={8} align="stretch">
          <Box>
            <Heading as="h1" size="xl" mb={2}>
              Performance Report for {user.lawyer.name}
            </Heading>
            <Text color={textColor}>
              This page provides a detailed view of the user's performance
              metrics. You can toggle between tasks and cases, filter completed
              tasks by date range, and view completion rates and times.
            </Text>
          </Box>
          <Flex
            justify="space-between"
            align="center"
            wrap="wrap"
            gap={4}
            mb={4}
          >
            <Select
              value={displayType}
              onChange={(e) => {
                setDisplayType(e.target.value as 'tasks' | 'cases');
                setLoading(true);
              }}
              w={['full', '200px']}
              mb={[4, 0]}
            >
              <option value="tasks">Tasks</option>
              <option value="cases">Cases</option>
            </Select>
            <HStack spacing={2} w={['full', 'auto']}>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </HStack>
            {displayType === 'tasks' ? (
              <Select
                value={taskStatus}
                onChange={(e) => {
                  setTaskStatus(e.target.value as 'COMPLETED' | 'PENDING');
                }}
                w={['full', '200px']}
                mb={[4, 0]}
              >
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
              </Select>
            ) : (
              <Select
                value={caseStatus}
                onChange={(e) => {
                  setCaseStatus(
                    e.target.value as 'DECIDED' | 'RUNNING' | 'PENDING',
                  );
                }}
                w={['full', '200px']}
                mb={[4, 0]}
              >
                <option value="DECIDED">Decided</option>
                <option value="RUNNING">Running</option>
                <option value="PENDING">Pending</option>
              </Select>
            )}
            <Button onClick={searchCriteria} w={['full', 'auto']}>
              Search
            </Button>
          </Flex>
          {displayType === 'tasks' ? (
            <StatGroup flexWrap="wrap" justifyContent="space-around">
              <Stat>
                <StatLabel>Completed Tasks</StatLabel>
                <StatNumber>{totalTasks}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Average Completion Time</StatLabel>
                <StatNumber>{meanCompletionTime.toFixed(2)} days</StatNumber>
              </Stat>
            </StatGroup>
          ) : (
            <StatGroup flexWrap="wrap" justifyContent="space-around">
              <Stat>
                <StatLabel>Decided Tasks</StatLabel>
                <StatNumber>{totalDecidedCases}</StatNumber>
              </Stat>
            </StatGroup>
          )}
          <Box bg={bgColor} shadow="md" borderRadius="lg" overflow="hidden">
            {displayType === 'tasks' ? RenderTasksTable() : RenderCasesTable()}
          </Box>
          {filteredItems.length === 0 && (
            <Text className="mt-4 text-center">
              No {displayType} found for the selected criteria.
            </Text>
          )}
          {displayType === 'tasks' ? (
            <HStack justify="center" flexWrap="wrap">
              <Pagination
                currentPage={tasksPage}
                totalPages={tasksTotalPages}
                onPageChange={(page) => {
                  setTasksPage(page);
                  handlePageChange(page);
                }}
                pagesWithContent={tasksPagesWithContent}
              />
            </HStack>
          ) : (
            <HStack justify="center" flexWrap="wrap">
              <Pagination
                currentPage={casesPage}
                totalPages={casesTotalPages}
                onPageChange={(page) => {
                  setCasesPage(page);
                  handlePageChange(page);
                }}
                pagesWithContent={casesPagesWithContent}
              />
            </HStack>
          )}
        </VStack>
        <Box mt={6} width="full" display="flex" justifyContent="center">
          <Button
            colorScheme="blue"
            leftIcon={<ArrowLeft />}
            onClick={() =>
              (window.location.href = `/dashboard/admin/workspace-admin#performance-report`)
            }
            width={['full', 'auto']}
          >
            Back
          </Button>
        </Box>
      </Container>
    </PageLayout>
  );
};

const allowedRoles = ['ADMIN', 'HR', 'SUPERADMIN'];
export default withAuth(UserPerformance, allowedRoles);
