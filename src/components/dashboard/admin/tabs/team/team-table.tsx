import React, { useState, useMemo, useEffect } from 'react';
import {
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Box,
  Input,
  Checkbox,
  Flex,
} from '@chakra-ui/react';
import { MoreVertical } from 'lucide-react';
import { DialogButton } from '@/components/ui/alert-dialog';
import LoaderComponent from '@/components/ui/loader';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';
import { useUser } from '@/hooks/useUserHook';
import { IUser } from '@/types/user';
import Pagination from '@/components/dashboard/shared/Pagination';
import { useRouter } from 'next/navigation';

const TeamMemberTable = ({ allTeam }: { allTeam: IUser[] }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const rowsPerPage = 10;

  const { deleteUser, updateUser } = useUser();
  const { role } = useAuth();
  const { loading, setLoading } = useLoading();
  const router = useRouter();

  const roles = ['SUPERADMIN', 'ADMIN', 'HR', 'LAWYER'];

  const filteredData = useMemo(() => {
    const currentRole = roles[tabIndex];
    return allTeam
      .filter((member) => member.role === currentRole)
      .filter((member) =>
        Object.values(member).some((value) =>
          String(value).toLowerCase().includes(searchTerm.toLowerCase()),
        ),
      );
  }, [allTeam, tabIndex, searchTerm]);

  useEffect(() => {
    const totalFilteredPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage > totalFilteredPages) {
      setCurrentPage(totalFilteredPages > 0 ? totalFilteredPages : 1);
    }
  }, [filteredData, rowsPerPage]);

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [currentPage, filteredData]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  const toggleUserSelection = (id: string) => {
    setSelectedUsers((prev) => {
      const newSelection = new Set(prev);
      if (newSelection.has(id)) {
        newSelection.delete(id);
      } else {
        newSelection.add(id);
      }
      return newSelection;
    });
  };

  const toggleSelectAll = () => {
    if (selectedUsers.size === paginatedData.length) {
      setSelectedUsers(new Set());
    } else {
      setSelectedUsers(new Set(paginatedData.map((user) => user.id!)));
    }
  };

  const handleBulkDelete = async () => {
    for (const id of Array.from(selectedUsers)) {
      await deleteUser(id, allTeam.find((user) => user.id === id)?.name || '');
    }
    setSelectedUsers(new Set());
  };

  const handleBulkRoleChange = async (newRole: string) => {
    for (const id of Array.from(selectedUsers)) {
      const user = allTeam.find((user) => user.id === id);
      if (user) {
        await updateUser({
          ...user,
          role: newRole as IUser['role'],
        });
      }
    }
    setSelectedUsers(new Set());
  };

  return (
    <Tabs
      index={tabIndex}
      onChange={(index) => {
        setTabIndex(index);
        setCurrentPage(1);
      }}
      isFitted
      variant="enclosed"
      colorScheme="purple"
    >
      <TabList>
        {roles.map((role) => (
          <Tab key={role}>{role}</Tab>
        ))}
      </TabList>
      {loading ? (
        <LoaderComponent />
      ) : (
        <TabPanels>
          {roles.map((currentRole) => (
            <TabPanel key={currentRole}>
              <Box overflowX="auto">
                <Input
                  placeholder={`Search ${currentRole.toLowerCase()}s...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  mb={4}
                />
                {selectedUsers.size > 0 && (
                  <Flex mb={4} gap={2}>
                    <Button colorScheme="red" onClick={handleBulkDelete}>
                      Delete Selected
                    </Button>
                    {role === 'SUPERADMIN' && (
                      <>
                        <Button
                          colorScheme="blue"
                          onClick={() => handleBulkRoleChange('SUPERADMIN')}
                        >
                          Change to Super Admin
                        </Button>
                        <Button
                          colorScheme="blue"
                          onClick={() => handleBulkRoleChange('ADMIN')}
                        >
                          Change to Admin
                        </Button>
                        <Button
                          colorScheme="blue"
                          onClick={() => handleBulkRoleChange('HR')}
                        >
                          Change to HR
                        </Button>
                        <Button
                          colorScheme="yellow"
                          onClick={() => handleBulkRoleChange('LAWYER')}
                        >
                          Change to Lawyer
                        </Button>
                      </>
                    )}
                  </Flex>
                )}
                <Table variant="striped" colorScheme="blackAlpha">
                  <Thead>
                    <Tr>
                      <Th>
                        <Checkbox
                          className="cursor-pointer border-gray-600"
                          isChecked={
                            selectedUsers.size === paginatedData.length
                          }
                          onChange={toggleSelectAll}
                        />
                      </Th>
                      <Th>No</Th>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Contact No</Th>
                      <Th>Role</Th>
                      <Th>Action</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {paginatedData.length > 0 ? (
                      paginatedData.map((member, i) => (
                        <Tr key={member.id}>
                          <Td>
                            <Checkbox
                              className="cursor-pointer border-gray-600"
                              isChecked={selectedUsers.has(member.id!)}
                              onChange={() => toggleUserSelection(member.id!)}
                            />
                          </Td>
                          <Td>{(currentPage - 1) * rowsPerPage + i + 1}</Td>
                          <Td>{member.name}</Td>
                          <Td>{member.email}</Td>
                          <Td>{member.phoneNumber}</Td>
                          <Td>{member.role}</Td>
                          <Td>
                            <Menu>
                              <MenuButton
                                as={IconButton}
                                aria-label="Options"
                                icon={<MoreVertical />}
                                variant="outline"
                              />
                              <MenuList zIndex={50} maxWidth={100}>
                                <MenuItem as="div">
                                  <Button
                                    colorScheme="purple"
                                    className="w-full"
                                    onClick={() =>
                                      (window.location.href = `/user/${member.id}`)
                                    }
                                  >
                                    View
                                  </Button>
                                </MenuItem>
                                {role === 'SUPERADMIN' && (
                                  <>
                                    <MenuItem>
                                      {/* <Button
                                        colorScheme="purple"
                                        className="w-full"
                                        onClick={async () => {
                                          await updateUser({
                                            ...member,
                                            role:
                                              member.role === 'LAWYER'
                                                ? 'ADMIN'
                                                : 'LAWYER',
                                          });
                                          setLoading(false);
                                        }}
                                      >
                                        Change Role
                                      </Button> */}

                                      <Button
                                        className="w-full"
                                        colorScheme="purple"
                                        onClick={() =>
                                          router.push(
                                            `/dashboard/admin/edit-member/${member.id}`,
                                          )
                                        }
                                      >
                                        Edit Member
                                      </Button>
                                    </MenuItem>
                                    <MenuItem as="div">
                                      <DialogButton
                                        title="Delete"
                                        message="Do you want to delete the Member?"
                                        onConfirm={async () =>
                                          deleteUser(member.id!, member.name)
                                        }
                                        confirmButtonColorScheme="red"
                                      >
                                        Delete
                                      </DialogButton>
                                    </MenuItem>
                                  </>
                                )}
                              </MenuList>
                            </Menu>
                          </Td>
                        </Tr>
                      ))
                    ) : (
                      <Tr>
                        <Td colSpan={7} textAlign="center">
                          No Data to View!
                        </Td>
                      </Tr>
                    )}
                  </Tbody>
                </Table>
                {filteredData.length > 0 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    pagesWithContent={Array.from(
                      { length: totalPages },
                      (_, i) => i + 1,
                    )}
                  />
                )}
              </Box>
            </TabPanel>
          ))}
        </TabPanels>
      )}
    </Tabs>
  );
};

export default TeamMemberTable;
