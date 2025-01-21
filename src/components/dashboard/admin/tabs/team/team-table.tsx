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
} from '@chakra-ui/react';
import { MoreVertical } from 'lucide-react';
import { DialogButton } from '@/components/ui/alert-dialog';
import LoaderComponent from '@/components/ui/loader';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';
import { useUser } from '@/hooks/useUserHook';
import { IUser } from '@/types/user';
import Pagination from '@/components/dashboard/shared/Pagination';

const TeamMemberTable = ({ allTeam }: { allTeam: IUser[] }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

  const { deleteUser, updateUser } = useUser();
  const { role } = useAuth();
  const { loading, setLoading } = useLoading();

  // Roles mapped to tab indices
  const roles = ['SUPERADMIN', 'ADMIN', 'LAWYER'];

  // Filter data based on role and search term
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

  // Ensure valid currentPage when filteredData changes
  useEffect(() => {
    const totalFilteredPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage > totalFilteredPages) {
      setCurrentPage(totalFilteredPages > 0 ? totalFilteredPages : 1);
    }
  }, [filteredData, rowsPerPage]);

  // Paginated data
  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredData.slice(startIndex, endIndex);
  }, [currentPage, filteredData]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  return (
    <Tabs
      index={tabIndex}
      onChange={(index) => {
        setTabIndex(index);
        setCurrentPage(1); // Reset to page 1 when tab changes
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
              <Box overflowX={'auto'}>
                <Input
                  placeholder={`Search ${currentRole.toLowerCase()}s...`}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  mb={4}
                />
                <Table variant="striped" colorScheme="blackAlpha">
                  <Thead>
                    <Tr>
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
                                <MenuItem as={'div'}>
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
                                      <Button
                                        colorScheme="purple"
                                        className="w-full"
                                        onClick={async () => {
                                          await updateUser({
                                            id: member.id!,
                                            role:
                                              member.role === 'LAWYER'
                                                ? 'ADMIN'
                                                : 'LAWYER',
                                            email: member.email,
                                            phoneNumber: member.phoneNumber,
                                            name: member.name,
                                            address: member.address || '',
                                            zipcode: member.zipcode || '',
                                            country: member.country || '',
                                            state: member.state || '',
                                            city: member.city || '',
                                          });
                                          setLoading(false);
                                        }}
                                      >
                                        Change Role
                                      </Button>
                                    </MenuItem>
                                    <MenuItem as={'div'}>
                                      <DialogButton
                                        title={'Delete'}
                                        message={
                                          'Do you want to Delete the Member?'
                                        }
                                        onConfirm={async () =>
                                          member.id
                                            ? deleteUser(member.id, member.name)
                                            : console.error(
                                                'User ID is missing!',
                                              )
                                        }
                                        children={'Delete'}
                                        confirmButtonColorScheme="red"
                                      />
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
                        <Td colSpan={6} textAlign="center">
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
