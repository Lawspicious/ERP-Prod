'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  Flex,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  SimpleGrid,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  Alert,
  AlertIcon,
  Button,
  useColorModeValue,
  IconButton,
  Tooltip,
  HStack,
} from '@chakra-ui/react';
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Edit,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  parseISO,
  addMonths,
  subMonths,
} from 'date-fns';
import { db } from '@/lib/config/firebase.config';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { AttendanceLog, AttendanceOverride } from '@/types/attendance';
import Pagination from '@/components/dashboard/shared/Pagination';

export default function AttendanceDetailPage() {
  const { attendanceId } = useParams();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userLogs, setUserLogs] = useState<AttendanceLog[]>([]);
  const [userData, setUserData] = useState<{
    userId: string;
    username: string;
    userEmail: string;
  } | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const rowsPerPage = 10;
  // Add a state to track client-side rendering to prevent hydration errors
  const [isClient, setIsClient] = useState(false);
  const [attendanceOverrides, setAttendanceOverrides] = useState<
    Record<string, 'present' | 'absent'>
  >({});

  const presentColor = useColorModeValue('green.100', 'green.800');
  const absentColor = useColorModeValue('yellow.100', 'yellow.800');
  const overrideIndicatorColor = useColorModeValue('blue.500', 'blue.300');

  // Set isClient to true when component mounts (client-side only)
  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);

      // Validate attendanceId
      if (!attendanceId || typeof attendanceId !== 'string') {
        setError('Invalid user ID provided');
        setIsLoading(false);
        return;
      }

      try {
        // Query attendance logs for this specific user
        const userLogsQuery = query(
          collection(db, 'attendance'),
          where('userId', '==', attendanceId),
          orderBy('timestamp', 'desc'),
        );

        const querySnapshot = await getDocs(userLogsQuery);

        if (querySnapshot.empty) {
          setError('No attendance records found for this user.');
          setIsLoading(false);
          return;
        }

        const logs: AttendanceLog[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            userEmail: data.userEmail,
            username: data.username || 'Unknown User',
            eventType: data.eventType,
            timestamp: data.timestamp?.toDate() || new Date(),
          };
        });

        // Set user data from the first log
        if (logs.length > 0) {
          setUserData({
            userId: logs[0].userId,
            username: logs[0].username,
            userEmail: logs[0].userEmail,
          });
        }

        // Also fetch any attendance overrides for this user
        const overridesQuery = query(
          collection(db, 'attendance_overrides'),
          where('userId', '==', attendanceId),
        );
        const overridesSnapshot = await getDocs(overridesQuery);
        const overridesData: Record<string, 'present' | 'absent'> = {};

        overridesSnapshot.forEach((doc) => {
          const data = doc.data();
          overridesData[data.date] = data.status;
        });

        setAttendanceOverrides(overridesData);
        setUserLogs(logs);
      } catch (err) {
        console.error('Error fetching user logs:', err);
        // Display more specific error message
        const errorMessage =
          err instanceof Error
            ? `Failed to fetch attendance data: ${err.message}`
            : 'Failed to fetch attendance data due to an unknown error';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (attendanceId && isClient) {
      fetchUserData();
    } else if (!attendanceId && isClient) {
      setError('User ID is required');
      setIsLoading(false);
    }
  }, [attendanceId, isClient]);

  // Calculate statistics
  const loginCount = userLogs.filter((log) => log.eventType === 'login').length;
  const logoutCount = userLogs.filter(
    (log) => log.eventType === 'logout',
  ).length;

  // Generate calendar days for the selected month (memoized to ensure stability)
  const calendarDays = useMemo(() => {
    if (!isClient) return []; // Return empty array if not on client yet

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);

    return eachDayOfInterval({ start: monthStart, end: monthEnd });
  }, [isClient, currentMonth]);

  // Function to determine if user was present on a specific day
  const wasUserPresent = (date: Date) => {
    // First check if there's an admin override for this date
    const dateString = format(date, 'yyyy-MM-dd');

    // If there's an override, use that status
    if (attendanceOverrides[dateString]) {
      return attendanceOverrides[dateString] === 'present';
    }

    // Otherwise check for login events on that day
    return userLogs.some(
      (log) => log.eventType === 'login' && isSameDay(log.timestamp, date),
    );
  };

  // Month navigation functions
  const goToPreviousMonth = () => {
    setCurrentMonth((prevMonth) => subMonths(prevMonth, 1));
  };

  const goToNextMonth = () => {
    setCurrentMonth((prevMonth) => addMonths(prevMonth, 1));
  };

  const goToCurrentMonth = () => {
    setCurrentMonth(new Date());
  };

  const handleRefresh = () => {
    if (!attendanceId || typeof attendanceId !== 'string') {
      setError('Invalid user ID provided');
      return;
    }

    setIsLoading(true);
    // Re-fetch user data
    const fetchUserData = async () => {
      try {
        const userLogsQuery = query(
          collection(db, 'attendance'),
          where('userId', '==', attendanceId),
          orderBy('timestamp', 'desc'),
        );

        const querySnapshot = await getDocs(userLogsQuery);

        const logs: AttendanceLog[] = querySnapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            userId: data.userId,
            userEmail: data.userEmail,
            username: data.username || 'Unknown User',
            eventType: data.eventType,
            timestamp: data.timestamp?.toDate() || new Date(),
          };
        });

        // Also refresh attendance overrides
        const overridesQuery = query(
          collection(db, 'attendance_overrides'),
          where('userId', '==', attendanceId),
        );
        const overridesSnapshot = await getDocs(overridesQuery);
        const overridesData: Record<string, 'present' | 'absent'> = {};

        overridesSnapshot.forEach((doc) => {
          const data = doc.data();
          overridesData[data.date] = data.status;
        });

        setAttendanceOverrides(overridesData);

        // If no logs found, set specific message but don't treat as error
        if (logs.length === 0) {
          setError('No attendance records found for this user.');
        } else {
          setUserLogs(logs);
          setError(null);
        }
      } catch (err) {
        console.error('Error refreshing user logs:', err);
        // Display more specific error message
        const errorMessage =
          err instanceof Error
            ? `Failed to refresh attendance data: ${err.message}`
            : 'Failed to refresh attendance data due to an unknown error';
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  };

  // Pagination
  const totalPages = Math.max(1, Math.ceil(userLogs.length / rowsPerPage));

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return userLogs.slice(startIndex, startIndex + rowsPerPage);
  }, [userLogs, currentPage, rowsPerPage]);

  // Generate array of page numbers that have content
  const pagesWithContent = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages]);

  // Format date string safely to prevent hydration errors
  const formatSafely = (date: Date, formatString: string) => {
    if (!isClient) return '';
    return format(date, formatString);
  };

  // Current month name for display
  const currentMonthDisplay = useMemo(() => {
    if (!isClient) return '';
    return format(currentMonth, 'MMMM yyyy');
  }, [isClient, currentMonth]);

  // Calculate present days for the selected month
  const presentDaysInCurrentMonth = useMemo(() => {
    if (!isClient) return 0;
    return calendarDays.filter((day) => wasUserPresent(day)).length;
  }, [isClient, calendarDays, userLogs]);

  // Function to navigate back to attendance list
  const navigateBack = () => {
    router.push('/dashboard/admin/workspace-admin#attendance');
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <Flex mb={6} alignItems="center" justifyContent="space-between">
        <Flex alignItems="center">
          <IconButton
            aria-label="Back to attendance"
            icon={<ArrowLeft size={18} />}
            mr={4}
            onClick={navigateBack}
          />
          <Heading size="lg">
            {isLoading
              ? 'Loading...'
              : userData?.username || 'Attendance Details'}
          </Heading>
        </Flex>
        <Tooltip label="Refresh data">
          <IconButton
            aria-label="Refresh data"
            icon={<RefreshCw size={18} />}
            onClick={handleRefresh}
            isLoading={isLoading}
          />
        </Tooltip>
      </Flex>

      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <Text>{error}</Text>
        </Alert>
      )}

      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" h="300px">
          <Spinner size="xl" />
          <Text ml={4}>Loading attendance data...</Text>
        </Flex>
      ) : userData && isClient ? (
        <>
          {/* User info and stats */}
          <Flex direction={{ base: 'column', md: 'row' }} gap={6} mb={8}>
            <Card flex={1} variant="outline">
              <CardBody>
                <Flex alignItems="center" mb={4}>
                  <Box
                    p={2}
                    bg="blue.100"
                    borderRadius="full"
                    color="blue.600"
                    mr={3}
                  >
                    <User size={24} />
                  </Box>
                  <Box>
                    <Heading size="md">{userData.username}</Heading>
                    <Text color="gray.500">{userData.userEmail}</Text>
                  </Box>
                </Flex>
              </CardBody>
            </Card>

            {/* Stats */}
            <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} flex={2}>
              <Card variant="outline">
                <CardBody>
                  <Stat>
                    <StatLabel>Total Records</StatLabel>
                    <StatNumber>{userLogs.length}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card variant="outline">
                <CardBody>
                  <Stat>
                    <StatLabel>Login Events</StatLabel>
                    <StatNumber>{loginCount}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card variant="outline">
                <CardBody>
                  <Stat>
                    <StatLabel>Logout Events</StatLabel>
                    <StatNumber>{logoutCount}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
              <Card variant="outline">
                <CardBody>
                  <Stat>
                    <StatLabel>
                      Present Days ({format(currentMonth, 'MMM yyyy')})
                    </StatLabel>
                    <StatNumber>{presentDaysInCurrentMonth}</StatNumber>
                  </Stat>
                </CardBody>
              </Card>
            </SimpleGrid>
          </Flex>

          {/* Main content: Calendar and logs */}
          <Flex direction={{ base: 'column', lg: 'row' }} gap={8}>
            {/* Calendar View */}
            <Box
              flex={1}
              p={6}
              borderWidth="1px"
              borderRadius="lg"
              borderColor={useColorModeValue('gray.200', 'gray.700')}
              bg={useColorModeValue('white', 'gray.800')}
            >
              <Flex alignItems="center" mb={4} justifyContent="space-between">
                <Flex alignItems="center">
                  <Calendar size={20} />
                  <Heading size="md" ml={2}>
                    Attendance Calendar
                  </Heading>
                </Flex>
                <Tooltip label="Go to current month">
                  <Button size="sm" onClick={goToCurrentMonth}>
                    Today
                  </Button>
                </Tooltip>
              </Flex>

              <Flex justifyContent="space-between" alignItems="center" mb={4}>
                <IconButton
                  aria-label="Previous month"
                  icon={<ChevronLeft size={18} />}
                  size="sm"
                  onClick={goToPreviousMonth}
                />
                <Text fontWeight="medium">{currentMonthDisplay}</Text>
                <IconButton
                  aria-label="Next month"
                  icon={<ChevronRight size={18} />}
                  size="sm"
                  onClick={goToNextMonth}
                />
              </Flex>

              <SimpleGrid columns={7} spacing={2} mb={2}>
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(
                  (day) => (
                    <Box
                      key={day}
                      textAlign="center"
                      fontWeight="bold"
                      fontSize="sm"
                    >
                      {day}
                    </Box>
                  ),
                )}
              </SimpleGrid>

              {isClient && (
                <SimpleGrid columns={7} spacing={2}>
                  {calendarDays.map((day, i) => {
                    const isPresent = wasUserPresent(day);
                    const isToday = isSameDay(day, new Date());

                    return (
                      <Box
                        key={i}
                        textAlign="center"
                        p={3}
                        bg={isPresent ? presentColor : absentColor}
                        borderRadius="md"
                        fontWeight={isToday ? 'bold' : 'normal'}
                      >
                        {formatSafely(day, 'd')}
                      </Box>
                    );
                  })}
                </SimpleGrid>
              )}

              <Flex mt={6} justifyContent="space-around">
                <Flex alignItems="center">
                  <Box
                    w={4}
                    h={4}
                    bg={presentColor}
                    borderRadius="md"
                    mr={2}
                  ></Box>
                  <Text fontSize="sm">Present</Text>
                </Flex>
                <Flex alignItems="center">
                  <Box
                    w={4}
                    h={4}
                    bg={absentColor}
                    borderRadius="md"
                    mr={2}
                  ></Box>
                  <Text fontSize="sm">Absent</Text>
                </Flex>
              </Flex>
            </Box>

            {/* Attendance Logs */}
            <Box flex={2}>
              <Flex alignItems="center" mb={6}>
                <Clock size={20} />
                <Heading size="md" ml={2}>
                  Attendance History
                </Heading>
              </Flex>

              {userLogs.length === 0 ? (
                <Text>No attendance logs found.</Text>
              ) : (
                <>
                  <Box
                    overflowX="auto"
                    borderWidth="1px"
                    borderRadius="lg"
                    borderColor={useColorModeValue('gray.200', 'gray.700')}
                    mb={4}
                  >
                    <Table variant="simple">
                      <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                        <Tr>
                          <Th>Event</Th>
                          <Th>Date</Th>
                          <Th>Time</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {paginatedLogs.map((log) => (
                          <Tr key={log.id}>
                            <Td>
                              <Badge
                                colorScheme={
                                  log.eventType === 'login' ? 'green' : 'red'
                                }
                                borderRadius="full"
                                px={2}
                                py={1}
                              >
                                {log.eventType === 'login' ? 'Login' : 'Logout'}
                              </Badge>
                            </Td>
                            <Td>
                              {formatSafely(log.timestamp, 'MMM dd, yyyy')}
                            </Td>
                            <Td>{formatSafely(log.timestamp, 'hh:mm:ss a')}</Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>

                  {/* Pagination */}
                  {userLogs.length > rowsPerPage && (
                    <Pagination
                      currentPage={currentPage}
                      totalPages={totalPages}
                      onPageChange={setCurrentPage}
                      pagesWithContent={pagesWithContent}
                    />
                  )}
                </>
              )}
            </Box>
          </Flex>
        </>
      ) : (
        <Text>No user data found.</Text>
      )}
    </Box>
  );
}
