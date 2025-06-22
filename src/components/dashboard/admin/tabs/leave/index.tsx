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
} from '@chakra-ui/react';
import { MoreVertical, Search } from 'lucide-react';
import withAuth from '@/components/shared/hoc-middlware';
import { useLeaveRequest } from '@/hooks/useLeaveRequest';
import { LeaveRequestModal } from './LeaveRequestModal';
import { useAuth } from '@/context/user/userContext';
import { DialogButton } from '@/components/ui/alert-dialog';

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

  const [selectedTab, setSelectedTab] = useState<string>('ALL');
  const filteredUsers = useMemo(() => {
    let data;
    if (
      selectedTab === 'ALL' &&
      ['SUPERADMIN', 'HR', 'ADMIN'].includes(role as string)
    ) {
      data = leaveRequests;
    } else if (selectedTab === 'requested') {
      data = pendingLeaves;
    } else {
      data = myLeaveHistory;
    }
    if (!data) return [];
    return data.filter((leave) => {
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
  }, [
    myLeaveHistory,
    pendingLeaves,
    leaveRequests,
    searchTerm,
    selectedTab,
    role,
  ]);

  return (
    <Box p={4}>
      <Flex justifyContent="space-between" alignItems="center" mb={6}>
        <Heading size="lg">Leave</Heading>
        <LeaveRequestModal />
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
                          <Th>From-TO</Th>
                          <Th>Reason</Th>
                          <Th>Remarks</Th>
                          <Th>Status</Th>
                          <Th>Action</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {filteredUsers.map((item) => (
                          <Tr key={item.id}>
                            <Td>
                              <Text fontWeight="medium">{item.name}</Text>
                            </Td>
                            <Td>
                              {`${item.fromDate} to ${item.toDate} (${item.numberOfDays}days)`}
                            </Td>
                            <Td>{item.reason}</Td>
                            <Td>{item.remark}</Td>

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

                                <MenuList zIndex={50} maxWidth={100}>
                                  {/* Approve/Reject: Only shown if status is pending AND user is HR/Admin/SuperAdmin */}
                                  {item.status === 'pending' &&
                                    (role === 'SUPERADMIN' ||
                                      role === 'HR') && (
                                      <>
                                        <MenuItem>
                                          <DialogButton
                                            title="Approve"
                                            message="Do you want to Approve?"
                                            onConfirm={async () => {
                                              changeLeaveStatus(
                                                item.id as string,
                                                'approved',
                                                {
                                                  userId: item.userId,
                                                  userName: item.name,
                                                  fromDate: item.fromDate,
                                                  toDate: item.toDate,
                                                },
                                              );
                                            }}
                                            confirmButtonColorScheme="green"
                                          >
                                            Approve
                                          </DialogButton>
                                        </MenuItem>
                                        <MenuItem as="div">
                                          <DialogButton
                                            title="Reject"
                                            message="Do you want to Reject?"
                                            onConfirm={async () => {
                                              changeLeaveStatus(
                                                item.id as string,
                                                'rejected',
                                              );
                                            }}
                                            confirmButtonColorScheme="red"
                                          >
                                            Reject
                                          </DialogButton>
                                        </MenuItem>
                                      </>
                                    )}

                                  {(item.status === 'pending' &&
                                    item.userId === authUser?.uid) ||
                                  (item.status === 'approved' &&
                                    (role === 'SUPERADMIN' ||
                                      role === 'HR')) ? (
                                    <MenuItem as="div">
                                      <LeaveRequestModal data={item} />
                                    </MenuItem>
                                  ) : null}

                                  {/* Delete: shown if HR/Admin/SuperAdmin OR creator when pending */}
                                  {(role === 'SUPERADMIN' ||
                                    role === 'HR' ||
                                    (item.userId === authUser?.uid &&
                                      item.status === 'pending')) && (
                                    <MenuItem as="div">
                                      <DialogButton
                                        title="Delete"
                                        message="Do you want to Delete?"
                                        onConfirm={async () => {
                                          deleteLeaveRequest(
                                            item.id as string,
                                            item.status,
                                            {
                                              userId: item.userId,
                                              fromDate: item.fromDate,
                                              toDate: item.toDate,
                                            },
                                          );
                                        }}
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

                  {/* Pagination */}
                  {/* {filteredUsers.length > rowsPerPage && (
                      <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        pagesWithContent={pagesWithContent}
                      />
                    )} */}
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
