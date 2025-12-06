import { useMemo, useState } from 'react';
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
  useColorModeValue,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Menu,
  MenuButton,
  IconButton,
  MenuList,
  MenuItem,
  Button,
  HStack,
} from '@chakra-ui/react';
import { MoreVertical, Search } from 'lucide-react';
import withAuth from '@/components/shared/hoc-middlware';
import { useLeaveRequest, ILeaveRequest } from '@/hooks/useLeaveRequest';
import { useEarlyLeave } from '@/hooks/useEarlyLeave';
import { IEarlyLeave } from '@/types/attendance';
import { LeaveRequestModal } from './LeaveRequestModal';
import EarlyLeaveModal from './EarlyLeaveModal';
import { useAuth } from '@/context/user/userContext';
import { DialogButton } from '@/components/ui/alert-dialog';

type CombinedLeaveRequest = (ILeaveRequest | IEarlyLeave) & {
  type: 'regular' | 'early';
  fromDate: string;
  toDate: string;
  numberOfDays?: number;
  exitTime?: string;
};

function LeaveTab() {
  const { role, authUser } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');

  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const {
    myLeaveHistory,
    pendingLeaves,
    changeLeaveStatus,
    loading,
    leaveRequests,
    deleteLeaveRequest,
  } = useLeaveRequest();

  const {
    earlyLeaves,
    pendingEarlyLeaves,
    changeEarlyLeaveStatus,
    deleteEarlyLeave,
    loading: earlyLeaveLoading,
  } = useEarlyLeave();

  const [selectedTab, setSelectedTab] = useState<string>('ALL');

  const filteredUsers = useMemo((): CombinedLeaveRequest[] => {
    let data: CombinedLeaveRequest[];
    if (
      selectedTab === 'ALL' &&
      ['SUPERADMIN', 'HR', 'ADMIN'].includes(role as string)
    ) {
      // Combine regular leaves and early leaves
      const combinedData: CombinedLeaveRequest[] = [
        ...leaveRequests.map((leave) => ({
          ...leave,
          type: 'regular' as const,
        })),
        ...earlyLeaves.map((leave) => ({
          ...leave,
          type: 'early' as const,
          fromDate: leave.date,
          toDate: leave.date,
          numberOfDays: 1,
        })),
      ];
      data = combinedData;
    } else if (selectedTab === 'requested') {
      // Combine pending regular and early leaves
      const combinedPending: CombinedLeaveRequest[] = [
        ...pendingLeaves.map((leave) => ({
          ...leave,
          type: 'regular' as const,
        })),
        ...pendingEarlyLeaves.map((leave) => ({
          ...leave,
          type: 'early' as const,
          fromDate: leave.date,
          toDate: leave.date,
          numberOfDays: 1,
        })),
      ];
      data = combinedPending;
    } else {
      data = myLeaveHistory.map((leave) => ({
        ...leave,
        type: 'regular' as const,
      }));
    }
    if (!data) return [];
    const filtered = data.filter((leave) => {
      if (selectedTab === 'requested') {
        return leave.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      if (selectedTab === 'ALL') {
        return leave.name.toLowerCase().includes(searchTerm.toLowerCase());
      }
      return (
        leave.status === selectedTab.toLowerCase() &&
        leave.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });

    // Sort to show pending leaves at the top
    return filtered.sort((a, b) => {
      if (a.status === 'pending' && b.status !== 'pending') return -1;
      if (a.status !== 'pending' && b.status === 'pending') return 1;
      return 0;
    });
  }, [
    myLeaveHistory,
    pendingLeaves,
    pendingEarlyLeaves,
    leaveRequests,
    earlyLeaves,
    searchTerm,
    selectedTab,
    role,
  ]);

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Leave</Heading>
        <HStack spacing={3}>
          <LeaveRequestModal />
          <EarlyLeaveModal />
        </HStack>
      </Flex>

      <InputGroup mb={6}>
        <InputLeftElement pointerEvents="none">
          <Search size={18} />
        </InputLeftElement>
        <Input
          placeholder="Search by name or email"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </InputGroup>

      <Tabs
        onChange={(index) =>
          setSelectedTab(['ALL', 'approved', 'rejected', 'requested'][index])
        }
      >
        <TabList overflowX={'auto'} overflowY={'hidden'}>
          <Tab>ALL</Tab>
          <Tab>Approved</Tab>
          <Tab>Rejected</Tab>
          {(role === 'SUPERADMIN' || role === 'HR' || 'ADMIN') && (
            <Tab>Requested</Tab>
          )}
        </TabList>
        <TabPanels>
          {['ALL', 'approved', 'rejected', 'requested'].map((status, index) => (
            <TabPanel key={index}>
              {loading ? (
                <Flex
                  justifyContent="center"
                  alignItems="center"
                  height="300px"
                >
                  <Spinner
                    size="xl"
                    thickness="4px"
                    speed="0.65s"
                    color="blue.500"
                  />
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
                          <Th>Name</Th>
                          <Th>Type</Th>
                          <Th>Date(s)</Th>
                          <Th>Exit Time</Th>
                          <Th>Reason</Th>
                          <Th>Status</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredUsers.map((item) => (
                          <Tr key={`${item.type}-${item.id}`}>
                            <Td>
                              <Text fontWeight="medium">{item.name}</Text>
                            </Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  item.type === 'regular' ? 'blue' : 'orange'
                                }
                              >
                                {item.type === 'regular'
                                  ? 'Leave'
                                  : 'Early Leave'}
                              </Badge>
                            </Td>
                            <Td>
                              {item.type === 'regular'
                                ? `${item.fromDate} to ${item.toDate} (${item.numberOfDays} days)`
                                : item.fromDate}
                            </Td>
                            <Td>
                              {item.type === 'early'
                                ? item.exitTime || 'N/A'
                                : '-'}
                            </Td>
                            <Td>{item.reason}</Td>
                            <Td>
                              <Badge
                                colorScheme={
                                  item.status === 'approved'
                                    ? 'green'
                                    : item.status === 'rejected'
                                      ? 'red'
                                      : 'yellow'
                                }
                                borderRadius="full"
                                px={2}
                                py={1}
                              >
                                <span className="uppercase">{item.status}</span>
                              </Badge>
                            </Td>
                            <Td>
                              <Menu>
                                <MenuButton
                                  as={IconButton}
                                  aria-label="Options"
                                  icon={<MoreVertical />}
                                  variant="outline"
                                />
                                <MenuList>
                                  {item.status === 'pending' &&
                                    (role === 'SUPERADMIN' ||
                                      role === 'HR') && (
                                      <>
                                        <MenuItem>
                                          <Button
                                            colorScheme="green"
                                            size="sm"
                                            width="100%"
                                            onClick={() => {
                                              if (item.type === 'regular') {
                                                changeLeaveStatus(
                                                  item.id!,
                                                  'approved',
                                                  {
                                                    userId: item.userId,
                                                    userName: item.name,
                                                    fromDate: item.fromDate,
                                                    toDate: item.toDate,
                                                  },
                                                );
                                              } else {
                                                changeEarlyLeaveStatus(
                                                  item.id!,
                                                  'approved',
                                                  item as IEarlyLeave,
                                                );
                                              }
                                            }}
                                          >
                                            Approve
                                          </Button>
                                        </MenuItem>
                                        <MenuItem>
                                          <Button
                                            colorScheme="red"
                                            size="sm"
                                            width="100%"
                                            onClick={() => {
                                              if (item.type === 'regular') {
                                                changeLeaveStatus(
                                                  item.id!,
                                                  'rejected',
                                                );
                                              } else {
                                                changeEarlyLeaveStatus(
                                                  item.id!,
                                                  'rejected',
                                                );
                                              }
                                            }}
                                          >
                                            Reject
                                          </Button>
                                        </MenuItem>
                                      </>
                                    )}
                                  {item.type === 'early' && (
                                    <MenuItem>
                                      <DialogButton
                                        title="Delete"
                                        message="Do you want to delete this early leave request?"
                                        onConfirm={() =>
                                          deleteEarlyLeave(item.id!)
                                        }
                                        confirmButtonColorScheme="red"
                                      >
                                        Delete
                                      </DialogButton>
                                    </MenuItem>
                                  )}
                                </MenuList>
                              </Menu>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </Box>
                </>
              )}
            </TabPanel>
          ))}
        </TabPanels>
      </Tabs>
    </Box>
  );
}

const allowedRoles = ['SUPERADMIN', 'HR', 'ADMIN'];

export default withAuth(LeaveTab, allowedRoles);
