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
  Button,
} from '@chakra-ui/react';
import { Search, RefreshCw, Calendar, ExternalLink, Bug } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';
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
  deleteDoc,
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
  const [hoveredUser, setHoveredUser] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<
    Array<{
      id: string;
      username: string;
      email: string;
    }>
  >([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [debugMode, setDebugMode] = useState(true);

  // TEMPORARY: Set a specific date for debugging the May 1st issue
  useEffect(() => {
    if (debugMode && !selectedDate) {
      const mayFirst = new Date('2023-05-01T00:00:00');
      console.log(
        'DEBUG: Setting date to May 1st for testing:',
        mayFirst.toISOString(),
      );
      //setSelectedDate(mayFirst);
    }
  }, [debugMode, selectedDate]);

  const {
    logs,
    isLoading: isLoadingLogs,
    error: logsError,
    refreshLogs,
  } = useLogs(undefined, selectedDate);

  // Debug function
  const debugLog = (message: string, data?: any) => {
    if (debugMode) {
      console.log(`[Attendance Debug] ${message}`, data || '');
    }
  };

  // Load users from database
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoadingUsers(true);
      try {
        const usersQuery = query(collection(db, 'users'));
        const snapshot = await getDocs(usersQuery);

        const usersData = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            username: data.name || data.displayName || 'Unknown User',
            email: data.email || 'No email',
          };
        });

        debugLog(`Fetched ${usersData.length} users`);
        setAllUsers(usersData);
      } catch (err) {
        console.error('Error loading users:', err);
        toast({
          title: 'Error',
          description: 'Failed to load users',
          status: 'error',
          duration: 5000,
        });
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchUsers();
  }, [toast, debugMode]);

  // Load existing overrides from database
  const loadAttendanceOverrides = useCallback(async () => {
    try {
      debugLog('Loading attendance overrides');
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

      debugLog('Loaded overrides data', overridesData);
      setOverrides(overridesData);
      return overridesData;
    } catch (err) {
      console.error('Error loading attendance overrides:', err);
      toast({
        title: 'Error',
        description: 'Failed to load attendance overrides',
        status: 'error',
        duration: 5000,
      });
      return {};
    }
  }, [toast, debugMode]);

  // Load overrides on component mount
  useEffect(() => {
    loadAttendanceOverrides();
  }, [loadAttendanceOverrides]);

  // Toggle debug mode
  const toggleDebugMode = () => {
    setDebugMode((prev) => !prev);
    if (!debugMode) {
      toast({
        title: 'Debug Mode Enabled',
        description: 'Check the console for detailed logs',
        status: 'info',
        duration: 3000,
      });
    }
  };

  // Helper function to properly convert any date to IST format YYYY-MM-DD
  const dateToISTString = (date: Date): string => {
    // Create a string representation in the IST timezone (UTC+5:30)
    const options: Intl.DateTimeFormatOptions = {
      timeZone: 'Asia/Kolkata', // IST timezone
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    };

    // Format the date in IST
    const formatter = new Intl.DateTimeFormat('en-CA', options); // en-CA uses YYYY-MM-DD format
    const formattedDate = formatter.format(date);

    // This will return the date as YYYY-MM-DD in IST timezone
    return formattedDate;
  };

  // Helper function to get today's ISO date string in IST
  const todayIsoString = () => {
    return dateToISTString(new Date());
  };

  // Get the ISO date string for today or the selected date in IST timezone
  const relevantDateIsoString = useMemo(() => {
    if (selectedDate) {
      // If we have a selected date, convert it to IST
      const dateStr = dateToISTString(selectedDate);
      debugLog(`Using selected date in IST: ${dateStr}`);
      return dateStr;
    }

    // For current date, get today in IST
    const dateStr = todayIsoString();
    debugLog(`Using current IST date: ${dateStr}`);
    return dateStr;
  }, [selectedDate, debugMode]);

  // Determine if we're looking at May 1st
  const isMayFirst = useMemo(() => {
    return relevantDateIsoString === '2023-05-01';
  }, [relevantDateIsoString]);

  // Combine users with logs data to create a complete attendance record
  const userAttendanceData = useMemo(() => {
    debugLog('Generating user attendance data');
    debugLog(
      `Using date: ${relevantDateIsoString} | Logs count: ${logs.length}`,
    );

    // For debugging, let's see what logs we have
    if (debugMode) {
      console.log('-------------------------');
      console.log(`LOGS FOR DATE: ${relevantDateIsoString}`);
      logs.forEach((log) => {
        const logDateIST = dateToISTString(log.timestamp);
        const isMayFirstLog = logDateIST === '2023-05-01';
        console.log(
          `Log: ${log.username}, ${log.eventType}, ${log.timestamp.toISOString()}, IST: ${logDateIST} ${isMayFirstLog ? '** MAY 1ST **' : ''}`,
        );
      });
      console.log('-------------------------');
    }

    // Create a map to efficiently lookup log data for each user
    const userLogsMap = new Map<
      string,
      {
        lastLogin: Date | null;
        hasLoggedInOnRelevantDate: boolean;
        hasAnyAttendanceRecord: boolean;
      }
    >();

    logs.forEach((log) => {
      const userId = log.userId;

      if (!userLogsMap.has(userId)) {
        userLogsMap.set(userId, {
          lastLogin: null,
          hasLoggedInOnRelevantDate: false,
          hasAnyAttendanceRecord: true, // If user appears in logs, they have records
        });
      }

      const userData = userLogsMap.get(userId)!;

      // Update last login time if this is a login event and more recent
      if (log.eventType === 'login') {
        if (!userData.lastLogin || log.timestamp > userData.lastLogin) {
          userData.lastLogin = log.timestamp;

          // Convert the log timestamp to IST date string for comparison
          const logDateISTString = dateToISTString(log.timestamp);

          debugLog(
            `Comparing log date ${logDateISTString} with relevant date ${relevantDateIsoString} for user ${userId}`,
          );

          // If date strings match in YYYY-MM-DD format, user logged in on that date
          if (logDateISTString === relevantDateIsoString) {
            debugLog(`✅ User ${userId} logged in on the relevant date`);
            userData.hasLoggedInOnRelevantDate = true;
          }
        }
      }
    });

    // Now create a combined dataset of all users with their attendance status
    const combinedUsers = allUsers.map((user) => {
      const logData = userLogsMap.get(user.id) || {
        lastLogin: null,
        hasLoggedInOnRelevantDate: false,
        hasAnyAttendanceRecord: false,
      };

      const userOverrides = overrides[user.id] || {};

      // If user has overrides, they have attendance records
      const hasOverrides = Object.keys(userOverrides).length > 0;
      const hasAttendanceRecord =
        logData.hasAnyAttendanceRecord || hasOverrides;

      // Determine status (overrides take precedence over login data)
      let status: 'present' | 'absent' = 'absent';
      let statusOverridden = false;

      if (userOverrides[relevantDateIsoString]) {
        debugLog(
          `User ${user.id} has override for date ${relevantDateIsoString}: ${userOverrides[relevantDateIsoString]}`,
        );
        status = userOverrides[relevantDateIsoString];
        statusOverridden = true;
      } else if (logData.hasLoggedInOnRelevantDate) {
        debugLog(
          `User ${user.id} is present based on login data for date ${relevantDateIsoString}`,
        );
        status = 'present';
      }

      return {
        userId: user.id,
        username: user.username,
        userEmail: user.email,
        lastLogin: logData.lastLogin,
        status,
        statusOverridden,
        hasAttendanceRecord,
        hasLoggedInOnDate: logData.hasLoggedInOnRelevantDate,
      } as UserAttendanceData & {
        hasAttendanceRecord: boolean;
        hasLoggedInOnDate: boolean;
      };
    });

    if (debugMode) {
      // Print all users with "present" status for the current date
      console.log(`Users present on ${relevantDateIsoString}:`);
      combinedUsers
        .filter((u) => u.status === 'present')
        .forEach((u) =>
          console.log(
            `- ${u.username} (override: ${u.statusOverridden}, logged in: ${u.hasLoggedInOnDate})`,
          ),
        );

      // Print all users with login records on May 1st
      if (isMayFirst) {
        console.log('Users with login on May 1st:');
        combinedUsers
          .filter((u) => u.hasLoggedInOnDate)
          .forEach((u) => console.log(`- ${u.username}`));
      }
    }

    // Sort: users with attendance records first, then alphabetically by name
    return combinedUsers.sort((a, b) => {
      // First sort by whether they have attendance records
      if (a.hasAttendanceRecord && !b.hasAttendanceRecord) return -1;
      if (!a.hasAttendanceRecord && b.hasAttendanceRecord) return 1;

      // If both have the same attendance record status, sort by name
      return a.username.localeCompare(b.username);
    });
  }, [allUsers, logs, overrides, relevantDateIsoString, debugMode, isMayFirst]);

  const filteredUsers = useMemo(() => {
    return userAttendanceData.filter(
      (user) =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.userEmail.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [userAttendanceData, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / rowsPerPage));

  // Reset to first page when search term changes
  useEffect(() => {
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
      const newDate = new Date(dateValue);
      debugLog(`Date selected: ${dateValue} -> ${newDate.toISOString()}`);
      console.log(
        `Selected date: ${dateValue}, Date object: ${newDate.toISOString()}, IST: ${dateToISTString(newDate)}`,
      );
      setSelectedDate(newDate);
    } else {
      debugLog('Date cleared, using today');
      setSelectedDate(undefined);
    }
    setCurrentPage(1); // Reset to first page when date changes
  };

  const handleRefresh = async () => {
    debugLog('Refreshing data');
    // Reload both logs and overrides
    await loadAttendanceOverrides();
    refreshLogs();
  };

  // Save attendance override to Firestore - this is the core function
  const saveAttendanceOverride = async (
    userId: string,
    status: 'present' | 'absent',
    dateToOverride: string,
  ) => {
    setIsUpdating(true);

    try {
      debugLog(
        `Saving override for user ${userId} on date ${dateToOverride} with status ${status}`,
      );

      // Create or update the override document
      const overrideRef = collection(db, 'attendance_overrides');

      // Check if an override already exists for this user and date
      const existingQuery = query(
        overrideRef,
        where('userId', '==', userId),
        where('date', '==', dateToOverride),
      );

      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        // Update existing override
        const docId = existingSnapshot.docs[0].id;
        debugLog(`Updating existing override with ID ${docId}`);

        await updateDoc(doc(db, 'attendance_overrides', docId), {
          status,
          timestamp: serverTimestamp(),
        });
      } else {
        // Create new override
        debugLog(`Creating new override document`);
        const newOverrideRef = await addDoc(overrideRef, {
          userId,
          date: dateToOverride,
          status,
          overriddenBy: 'Admin', // In a real app, use the current admin's ID/name
          timestamp: serverTimestamp(),
        });

        debugLog(`Created new override with ID ${newOverrideRef.id}`);
      }

      // Update local state
      setOverrides((prev) => {
        const newOverrides = {
          ...prev,
          [userId]: {
            ...(prev[userId] || {}),
            [dateToOverride]: status,
          },
        };
        debugLog('Updated local overrides state', newOverrides);
        return newOverrides;
      });

      // For date display in toast
      const dateObj =
        dateToOverride === todayIsoString()
          ? undefined
          : new Date(dateToOverride);

      // Show success message
      toast({
        title: 'Status updated',
        description: `User has been marked as ${status} for ${dateObj ? format(dateObj, 'MMM dd, yyyy') : 'today'} and saved to database.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });

      // Reload data to ensure UI is up to date
      await loadAttendanceOverrides();
      refreshLogs();
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
      // Always capture the current value of relevantDateIsoString
      const currentDateString = relevantDateIsoString;
      debugLog(
        `Status change requested for user ${userId} to ${status} for date ${currentDateString}`,
      );

      // Save to database using the captured date value
      saveAttendanceOverride(userId, status, currentDateString);
    },
    [relevantDateIsoString, debugMode],
  );

  // Toggle status with a switch
  const toggleStatus = useCallback(
    (userId: string, currentStatus: 'present' | 'absent') => {
      const newStatus = currentStatus === 'present' ? 'absent' : 'present';
      // Always capture the current value of relevantDateIsoString
      const currentDateString = relevantDateIsoString;

      debugLog(
        `Toggling status for user ${userId} from ${currentStatus} to ${newStatus} for date ${currentDateString}`,
      );

      // Just directly set the override - simpler approach
      handleStatusChange(userId, newStatus);
    },
    [handleStatusChange, relevantDateIsoString, debugMode],
  );

  // Function to remove an attendance override
  const removeAttendanceOverride = async (userId: string) => {
    setIsUpdating(true);

    try {
      // Always use the current value of relevantDateIsoString
      const dateToRemove = relevantDateIsoString;
      debugLog(`Removing override for user ${userId} on date ${dateToRemove}`);

      // Find existing override document
      const overrideRef = collection(db, 'attendance_overrides');
      const existingQuery = query(
        overrideRef,
        where('userId', '==', userId),
        where('date', '==', dateToRemove),
      );

      const existingSnapshot = await getDocs(existingQuery);

      if (!existingSnapshot.empty) {
        // Delete the override document
        const docId = existingSnapshot.docs[0].id;
        debugLog(`Found existing override with ID ${docId}, deleting it`);

        await deleteDoc(doc(db, 'attendance_overrides', docId));

        // Update local state
        setOverrides((prev) => {
          const newOverrides = { ...prev };
          if (newOverrides[userId]) {
            // Remove this specific date override
            const userOverrides = { ...newOverrides[userId] };
            delete userOverrides[dateToRemove];
            newOverrides[userId] = userOverrides;
          }
          debugLog('Updated local overrides state after removal', newOverrides);
          return newOverrides;
        });

        // For date display in toast
        const dateObj =
          dateToRemove === todayIsoString()
            ? undefined
            : new Date(dateToRemove);

        // Show success message
        toast({
          title: 'Override removed',
          description: `Attendance override for ${dateObj ? format(dateObj, 'MMM dd, yyyy') : 'today'} has been removed.`,
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        debugLog(`No override found to remove`);
        toast({
          title: 'Information',
          description: 'No override found to remove.',
          status: 'info',
          duration: 3000,
        });
      }

      // Reload data to ensure UI is up to date
      await loadAttendanceOverrides();
      refreshLogs();
    } catch (err) {
      console.error('Error removing attendance override:', err);
      toast({
        title: 'Error',
        description: 'Failed to remove attendance override',
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

  // Determine if the page is loading
  const isLoading = isLoadingLogs || isLoadingUsers;
  // Combine errors
  const error = logsError;

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Attendance Logs</Heading>
        <Flex gap={2}>
          {selectedDate && (
            <Text fontWeight="bold" alignSelf="center" color="blue.500">
              Viewing: {format(selectedDate, 'MMMM dd, yyyy')}
            </Text>
          )}
          <Tooltip label="Debug Mode">
            <IconButton
              aria-label="Debug mode"
              icon={<Bug size={18} />}
              onClick={toggleDebugMode}
              colorScheme={debugMode ? 'red' : 'gray'}
            />
          </Tooltip>
          <Tooltip label="Refresh data">
            <IconButton
              aria-label="Refresh logs"
              icon={<RefreshCw size={18} />}
              onClick={handleRefresh}
              isLoading={isLoading}
            />
          </Tooltip>
        </Flex>
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
              <StatLabel>
                Present{' '}
                {selectedDate ? format(selectedDate, 'MMM dd') : 'Today'}
              </StatLabel>
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
              <StatLabel>
                Absent {selectedDate ? format(selectedDate, 'MMM dd') : 'Today'}
              </StatLabel>
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
          <Input
            type="date"
            onChange={handleDateChange}
            defaultValue={
              selectedDate
                ? selectedDate.toISOString().split('T')[0]
                : undefined
            }
          />
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
                  <Th>
                    Status for{' '}
                    {selectedDate
                      ? format(selectedDate, 'MMM dd, yyyy')
                      : 'Today'}
                  </Th>
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
                      {user.statusOverridden && (
                        <Badge
                          ml={2}
                          colorScheme="blue"
                          variant="outline"
                          fontSize="xs"
                        >
                          Manual Override
                        </Badge>
                      )}
                    </Td>
                    <Td>
                      <Flex alignItems="center" justifyContent="space-between">
                        <Box position="relative">
                          <Box
                            onMouseEnter={() => setHoveredUser(user.userId)}
                            onMouseLeave={() => setHoveredUser(null)}
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
                            {hoveredUser === user.userId && (
                              <Box
                                position="absolute"
                                bottom="calc(100% + 8px)"
                                left="50%"
                                transform="translateX(-50%)"
                                bg={useColorModeValue('gray.800', 'gray.700')}
                                color="white"
                                px={2}
                                py={1}
                                borderRadius="md"
                                fontSize="xs"
                                fontWeight="medium"
                                whiteSpace="nowrap"
                                boxShadow="md"
                                zIndex={1000}
                                _after={{
                                  content: '""',
                                  position: 'absolute',
                                  top: '100%',
                                  left: '50%',
                                  transform: 'translateX(-50%)',
                                  border: 'solid transparent',
                                  borderTopColor: useColorModeValue(
                                    'gray.800',
                                    'gray.700',
                                  ),
                                  borderWidth: '5px',
                                  marginLeft: '-0px',
                                }}
                              >
                                Mark as{' '}
                                {user.status === 'present'
                                  ? 'absent'
                                  : 'present'}
                              </Box>
                            )}
                          </Box>
                        </Box>
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
                        {user.statusOverridden && (
                          <Tooltip
                            label={`Remove override for ${selectedDate ? format(selectedDate, 'MMM dd') : 'today'}`}
                          >
                            <IconButton
                              aria-label="Remove override"
                              icon={<RefreshCw size={14} />}
                              size="sm"
                              ml={2}
                              onClick={() =>
                                removeAttendanceOverride(user.userId)
                              }
                              isDisabled={isUpdating}
                            />
                          </Tooltip>
                        )}
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

      {/* Debug info at the bottom */}
      {/* {debugMode && (
        <Box mt={6} p={4} borderWidth="1px" borderRadius="md">
          <Heading size="sm" mb={2}>Debug Info</Heading>
          <Text>Current date: {relevantDateIsoString}</Text>
          <Text>Selected date: {selectedDate ? selectedDate.toISOString() : 'None'}</Text>
          <Text>Today in IST: {todayIsoString()}</Text>
          <Text>Logs count: {logs.length}</Text>
          <Text>Users count: {allUsers.length}</Text>
          <Flex mt={2}>
            <Button size="sm" onClick={() => {
              const mayFirst = new Date('2023-05-01T00:00:00');
              setSelectedDate(mayFirst);
            }}>
              Set to May 1st
            </Button>
            <Button size="sm" ml={2} onClick={() => setSelectedDate(undefined)}>
              Clear Date
            </Button>
          </Flex>
        </Box>
      )} */}
    </Box>
  );
}
