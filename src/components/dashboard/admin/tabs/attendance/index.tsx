import { useState, useMemo, useCallback, useEffect } from 'react';
import { useLogs } from '@/hooks/useLogs';
import { useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Flex,
  Spinner,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Stack,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  IconButton,
  Tooltip,
  Switch,
  useToast,
} from '@chakra-ui/react';
import { Search, RefreshCw, Calendar, ExternalLink } from 'lucide-react';
import { format, isToday } from 'date-fns';
import Pagination from '@/components/dashboard/shared/Pagination';
import { db } from '@/lib/config/firebase.config';
import {
  collection,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { UserAttendanceData, AttendanceOverride } from '@/types/attendance';

export default function AttendanceTab() {
  const router = useRouter();
  const toast = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;
  const [isUpdating, setIsUpdating] = useState(false);
  const [overrides, setOverrides] = useState<
    Record<string, Record<string, 'present' | 'absent'>>
  >({});

  const { logs, isLoading, error, refreshLogs } = useLogs(
    undefined,
    selectedDate,
  );

  // Load existing overrides from database
  useEffect(() => {
    const loadOverrides = async () => {
      try {
        const overridesQuery = query(collection(db, 'attendance_overrides'));
        const snapshot = await getDocs(overridesQuery);

        const overridesData: Record<
          string,
          Record<string, 'present' | 'absent'>
        > = {};

        snapshot.forEach((doc) => {
          const data = doc.data() as AttendanceOverride;
          if (!overridesData[data.userId]) {
            overridesData[data.userId] = {};
          }

          overridesData[data.userId][data.date] = data.status;
        });

        setOverrides(overridesData);
      } catch (err) {
        console.error('Error loading attendance overrides:', err);
        toast({
          title: 'Error',
          description: 'Failed to load attendance overrides',
          status: 'error',
          duration: 5000,
        });
      }
    };

    loadOverrides();
  }, [toast]);

  // Get the ISO date string for today
  const todayIsoDate = useMemo(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  }, []);

  // Generate user attendance data with override status
  const userAttendanceData = useMemo(() => {
    const usersMap = new Map<string, UserAttendanceData>();

    // First pass: Create user entries and set login info
    logs.forEach((log) => {
      if (!usersMap.has(log.userId)) {
        usersMap.set(log.userId, {
          userId: log.userId,
          username: log.username,
          userEmail: log.userEmail,
          lastLogin: null,
          status: 'absent',
          statusOverridden: false,
        });
      }

      const userData = usersMap.get(log.userId)!;

      // Always update the last login time if this is a login event and more recent
      if (log.eventType === 'login') {
        if (!userData.lastLogin || log.timestamp > userData.lastLogin) {
          userData.lastLogin = log.timestamp;

          // Mark as present if logged in today (unless overridden)
          if (isToday(log.timestamp) && !userData.statusOverridden) {
            userData.status = 'present';
          }
        }
      }
    });

    // Second pass: Apply overrides
    for (const user of usersMap.values()) {
      const userOverrides = overrides[user.userId] || {};
      if (userOverrides[todayIsoDate]) {
        user.status = userOverrides[todayIsoDate];
        user.statusOverridden = true;
      }
    }

    return Array.from(usersMap.values());
  }, [logs, overrides, todayIsoDate]);

  const filteredUsers = useMemo(() => {
    return userAttendanceData.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [userAttendanceData, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));

  // Reset to first page when search term changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredUsers, currentPage, rowsPerPage]);

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = e.target.value;
    if (dateValue) {
      setSelectedDate(new Date(dateValue));
    } else {
      setSelectedDate(undefined);
    }
    setCurrentPage(1); // Reset to first page when date changes
  };

  const handleRefresh = () => {
    refreshLogs();
  };

  // Save attendance override to Firestore
  const saveAttendanceOverride = async (
    userId: string,
    status: 'present' | 'absent',
  ) => {
    setIsUpdating(true);

    try {
      // Get today's date in ISO format for the record
      const date = new Date().toISOString().split('T')[0];

      // Create or update the override document
      const overrideRef = collection(db, 'attendance_overrides');

      // Check if an override already exists for this user and date
      const existingQuery = query(
        overrideRef,
        where('userId', '==', userId),
        where('date', '==', date),
      );

      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        // Update existing override
        const docId = existingSnapshot.docs[0].id;
        await updateDoc(doc(db, 'attendance_overrides', docId), {
          status,
          timestamp: serverTimestamp(),
        });
      } else {
        // Create new override
        await addDoc(overrideRef, {
          userId,
          date,
          status,
          overriddenBy: 'Admin', // In a real app, use the current admin's ID/name
          timestamp: serverTimestamp(),
        });
      }

      // Update local state
      setOverrides((prev) => ({
        ...prev,
        [userId]: {
          ...(prev[userId] || {}),
          [date]: status,
        },
      }));

      // Show success message
      toast({
        title: 'Status updated',
        description: `User has been marked as ${status} and saved to database.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (err) {
      console.error('Error saving attendance override:', err);
      toast({
        title: 'Error',
        description: 'Failed to save attendance status',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = useCallback(
    (userId: string, status: 'present' | 'absent') => {
      // Save to database
      saveAttendanceOverride(userId, status);
    },
    [],
  );

  // Toggle status with a switch
  const toggleStatus = useCallback(
    (userId: string, currentStatus: 'present' | 'absent') => {
      const newStatus = currentStatus === 'present' ? 'absent' : 'present';

      // If toggling from absent to present, we should restore the data based on actual logins
      if (newStatus === 'present') {
        // Find the user's last login today (if any)
        const userLogs = logs.filter(
          (log) => log.userId === userId && log.eventType === 'login',
        );
        const todaysLogins = userLogs.filter((log) => isToday(log.timestamp));

        // If they have logged in today, we'll just remove the override
        if (todaysLogins.length > 0) {
          // Remove the override by deleting it from the database
          removeAttendanceOverride(userId);
          return;
        }
      }

      // Otherwise proceed with normal override
      handleStatusChange(userId, newStatus);
    },
    [handleStatusChange, logs],
  );

  // Function to remove an attendance override
  const removeAttendanceOverride = async (userId: string) => {
    setIsUpdating(true);

    try {
      // Get today's date in ISO format
      const date = new Date().toISOString().split('T')[0];

      // Find existing override document
      const overrideRef = collection(db, 'attendance_overrides');
      const existingQuery = query(
        overrideRef,
        where('userId', '==', userId),
        where('date', '==', date),
      );

      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        // Delete existing override
        const docId = existingSnapshot.docs[0].id;
        await updateDoc(doc(db, 'attendance_overrides', docId), {
          status: 'present', // Set to present to reflect actual login status
          timestamp: serverTimestamp(),
        });

        // Update local state
        setOverrides((prev) => {
          const newOverrides = { ...prev };
          if (newOverrides[userId]) {
            // Remove this specific date override
            const userOverrides = { ...newOverrides[userId] };
            delete userOverrides[date];
            newOverrides[userId] = userOverrides;
          }
          return newOverrides;
        });

        // Show success message
        toast({
          title: 'Status updated',
          description:
            'User has been marked as present based on their login activity.',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }

      // Refresh the logs to update the UI
      refreshLogs();
    } catch (err) {
      console.error('Error removing attendance override:', err);
      toast({
        title: 'Error',
        description: 'Failed to update attendance status',
        status: 'error',
        duration: 5000,
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to navigate to a user's detailed attendance page
  const navigateToUserDetail = (userId: string) => {
    router.push(`/attendance/${userId}`);
  };

  // Generate array of page numbers that have content
  const pagesWithContent = useMemo(() => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }, [totalPages]);

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Attendance Logs</Heading>
        <Tooltip label="Refresh logs">
          <IconButton
            aria-label="Refresh logs"
            icon={<RefreshCw size={18} />}
            onClick={handleRefresh}
            isLoading={isLoading}
          />
        </Tooltip>
      </Flex>

      {/* Stats Cards */}
      <StatGroup mb={6}>
        <Card flex={1} mr={4} variant="outline">
          <CardBody>
            <Stat>
              <StatLabel>Total Users</StatLabel>
              <StatNumber>{filteredUsers.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card flex={1} mr={4} variant="outline">
          <CardBody>
            <Stat>
              <StatLabel>Present Today</StatLabel>
              <StatNumber>
                {
                  filteredUsers.filter((user) => user.status === 'present')
                    .length
                }
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card flex={1} variant="outline">
          <CardBody>
            <Stat>
              <StatLabel>Absent Today</StatLabel>
              <StatNumber>
                {
                  filteredUsers.filter((user) => user.status === 'absent')
                    .length
                }
              </StatNumber>
            </Stat>
          </CardBody>
        </Card>
      </StatGroup>

      {/* Filters */}
      <Stack direction={{ base: 'column', md: 'row' }} spacing={4} mb={6}>
        <InputGroup>
          <InputLeftElement pointerEvents="none">
            <Search size={18} />
          </InputLeftElement>
          <Input
            placeholder="Search by name or email"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>

        <InputGroup maxW={{ base: 'full', md: '250px' }}>
          <InputLeftElement pointerEvents="none">
            <Calendar size={18} />
          </InputLeftElement>
          <Input type="date" onChange={handleDateChange} />
        </InputGroup>
      </Stack>

      {error && (
        <Alert status="error" mb={6} borderRadius="md">
          <AlertIcon />
          <AlertTitle mr={2}>Error!</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {isLoading ? (
        <Flex justifyContent="center" alignItems="center" height="300px">
          <Spinner size="xl" thickness="4px" speed="0.65s" color="blue.500" />
          <Text ml={4} fontSize="lg">
            Loading attendance logs...
          </Text>
        </Flex>
      ) : filteredUsers.length === 0 ? (
        <Box textAlign="center" py={10} px={6}>
          <Text fontSize="lg">No attendance records found.</Text>
        </Box>
      ) : (
        <>
          <Box
            overflowX="auto"
            borderWidth="1px"
            borderRadius="lg"
            borderColor={borderColor}
          >
            <Table variant="simple">
              <Thead bg={useColorModeValue('gray.50', 'gray.700')}>
                <Tr>
                  <Th>User</Th>
                  <Th>Latest Login</Th>
                  <Th>Status</Th>
                  <Th>Action</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedUsers.map((user) => (
                  <Tr key={user.userId}>
                    <Td>
                      <Box>
                        <Flex alignItems="center">
                          <Text
                            fontWeight="medium"
                            _hover={{
                              color: 'blue.500',
                              textDecoration: 'underline',
                              cursor: 'pointer',
                            }}
                            display="flex"
                            alignItems="center"
                            onClick={() => navigateToUserDetail(user.userId)}
                          >
                            {user.username}
                            <ExternalLink
                              size={14}
                              style={{ marginLeft: '5px' }}
                            />
                          </Text>
                        </Flex>
                        <Text fontSize="sm" color="gray.500">
                          {user.userEmail}
                        </Text>
                      </Box>
                    </Td>
                    <Td>
                      {user.lastLogin
                        ? format(user.lastLogin, 'MMM dd, yyyy hh:mm a')
                        : 'No login recorded'}
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={
                          user.status === 'present' ? 'green' : 'yellow'
                        }
                        borderRadius="full"
                        px={2}
                        py={1}
                      >
                        {user.status === 'present' ? 'Present' : 'Absent'}
                      </Badge>
                    </Td>
                    <Td>
                      <Flex alignItems="center" justifyContent="space-between">
                        <Tooltip
                          label={`Mark as ${user.status === 'present' ? 'absent' : 'present'}`}
                        >
                          <Switch
                            colorScheme="green"
                            isChecked={user.status === 'present'}
                            onChange={() =>
                              toggleStatus(user.userId, user.status)
                            }
                            mr={2}
                            isDisabled={isUpdating}
                          />
                        </Tooltip>
                        <Select
                          value={user.status}
                          size="sm"
                          width="110px"
                          onChange={(e) =>
                            handleStatusChange(
                              user.userId,
                              e.target.value as 'present' | 'absent',
                            )
                          }
                          isDisabled={isUpdating}
                        >
                          <option value="present">Present</option>
                          <option value="absent">Absent</option>
                        </Select>
                      </Flex>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Pagination */}
          {filteredUsers.length > rowsPerPage && (
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
  );
}
