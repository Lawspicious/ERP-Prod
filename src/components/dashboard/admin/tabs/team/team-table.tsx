import { DialogButton } from '@/components/ui/alert-dialog';
import LoaderComponent from '@/components/ui/loader';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';
import { useAdminUser } from '@/hooks/useAdminUserHook';
import { useUser } from '@/hooks/useUserHook';
import { IUser } from '@/types/user';
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
} from '@chakra-ui/react';
import { MoreVertical } from 'lucide-react';
import { useState } from 'react';

const TeamMemberTable = ({ allTeam }: { allTeam: IUser[] }) => {
  const [tabIndex, setTabIndex] = useState(0);
  const { deleteUser } = useUser();
  const { role } = useAuth();
  // const { updateAdminUser } = useAdminUser();
  const { updateUser } = useUser();
  const { loading, setLoading } = useLoading();

  const getFilteredMembers = (role: string[]) => {
    return allTeam.filter((member) => role.includes(member.role));
  };

  return (
    <Tabs
      index={tabIndex}
      onChange={(index) => setTabIndex(index)}
      isFitted
      variant="enclosed"
      colorScheme="purple"
    >
      <TabList>
        <Tab>ADMIN</Tab>
        <Tab>LAWYER</Tab>
      </TabList>
      {loading ? (
        <LoaderComponent />
      ) : (
        <TabPanels>
          {/* ADMIN Tab */}
          <TabPanel>
            <Box overflowX={'auto'}>
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
                  {getFilteredMembers(['ADMIN']).map((member, i) => (
                    <Tr key={i}>
                      <Td>{i + 1}</Td>
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
                                        id: member.id as string,
                                        role: 'LAWYER',
                                        email: member.email,
                                        phoneNumber: member.phoneNumber,
                                        name: member.name,
                                      } as IUser);
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
                                      deleteUser(
                                        member.id as string,
                                        member.name,
                                      )
                                    }
                                    children={'Delete'}
                                    confirmButtonColorScheme="red"
                                    // disabled={role === 'ADMIN'}
                                  />
                                </MenuItem>
                              </>
                            )}
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>

          {/* LAWYER Tab */}
          <TabPanel>
            <Box overflowX={'auto'}>
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
                  {getFilteredMembers(['LAWYER']).map((member, i) => (
                    <Tr key={i}>
                      <Td>{i + 1}</Td>
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
                              <MenuItem>
                                <Button
                                  colorScheme="purple"
                                  className="w-full"
                                  onClick={async () => {
                                    await updateUser({
                                      id: member.id as string,
                                      role: 'ADMIN',
                                      email: member.email,
                                      phoneNumber: member.phoneNumber,
                                      name: member.name,
                                    } as IUser);
                                    setLoading(false);
                                  }}
                                >
                                  Change Role
                                </Button>
                              </MenuItem>
                            )}
                            <MenuItem as={'div'}>
                              <DialogButton
                                title={'Delete'}
                                message={'Do you want to Delete the Member?'}
                                onConfirm={async () =>
                                  deleteUser(member.id as string, member.name)
                                }
                                children={'Delete'}
                                confirmButtonColorScheme="red"
                              />
                            </MenuItem>
                          </MenuList>
                        </Menu>
                      </Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>
          </TabPanel>
        </TabPanels>
      )}
    </Tabs>
  );
};

export default TeamMemberTable;
