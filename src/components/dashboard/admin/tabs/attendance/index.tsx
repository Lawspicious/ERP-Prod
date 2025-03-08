import { useState, useMemo } from 'react';
import { useLogs } from '@/hooks/useLogs';
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
  Button,
  useColorModeValue,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Card,
  CardHeader,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  HStack,
  IconButton,
  Tooltip,
} from '@chakra-ui/react';
import { Search, RefreshCw, Calendar, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import Pagination from '@/components/dashboard/shared/Pagination';

export default function AttendanceTab() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 5;

  const { logs, isLoading, error, refreshLogs } = useLogs(
    undefined,
    selectedDate,
  );

  const filteredLogs = useMemo(() => {
    return logs.filter(
      (log) =>
        log.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.userEmail.toLowerCase().includes(searchTerm.toLowerCase()),
    );
  }, [logs, searchTerm]);

  const totalPages = Math.max(1, Math.ceil(filteredLogs.length / rowsPerPage));

  // Reset to first page when search term changes
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedDate]);

  const paginatedLogs = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    return filteredLogs.slice(startIndex, startIndex + rowsPerPage);
  }, [filteredLogs, currentPage, rowsPerPage]);

  const loginCount = filteredLogs.filter(
    (log) => log.eventType === 'login',
  ).length;
  const logoutCount = filteredLogs.filter(
    (log) => log.eventType === 'logout',
  ).length;

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
              <StatLabel>Total Records</StatLabel>
              <StatNumber>{filteredLogs.length}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card flex={1} mr={4} variant="outline">
          <CardBody>
            <Stat>
              <StatLabel>Login Events</StatLabel>
              <StatNumber>{loginCount}</StatNumber>
            </Stat>
          </CardBody>
        </Card>
        <Card flex={1} variant="outline">
          <CardBody>
            <Stat>
              <StatLabel>Logout Events</StatLabel>
              <StatNumber>{logoutCount}</StatNumber>
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
      ) : filteredLogs.length === 0 ? (
        <Box textAlign="center" py={10} px={6}>
          <Text fontSize="lg">No attendance logs found.</Text>
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
                  <Th>Event</Th>
                  <Th>Date</Th>
                  <Th>Time</Th>
                </Tr>
              </Thead>
              <Tbody>
                {paginatedLogs.map((log) => (
                  <Tr key={log.id}>
                    <Td>
                      <Box>
                        <Text fontWeight="medium">{log.username}</Text>
                        <Text fontSize="sm" color="gray.500">
                          {log.userEmail}
                        </Text>
                      </Box>
                    </Td>
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
                    <Td>{format(log.timestamp, 'MMM dd, yyyy')}</Td>
                    <Td>{format(log.timestamp, 'hh:mm:ss a')}</Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>

          {/* Pagination */}
          {filteredLogs.length > rowsPerPage && (
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
