import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  IconButton,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
  Button,
  Box,
  Flex,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Grid,
  useDisclosure,
} from '@chakra-ui/react';
import { useClient } from '@/hooks/useClientHook';
import LoaderComponent from '@/components/ui/loader';
import { DialogButton } from '@/components/ui/alert-dialog';
import { MoreVertical, Star } from 'lucide-react';
import { useLoading } from '@/context/loading/loadingContext';
import EditClientModal from './edit-client-modal';
import { setIndexConfiguration } from 'firebase/firestore';

const ProspectClientTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { prospectClient, deleteClient } = useClient();
  const { loading } = useLoading();

  // Filter data based on search term
  const filteredData = useMemo(() => {
    return prospectClient.filter((client) =>
      Object.values(client).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [prospectClient, searchTerm]);

  // Sort data based on column and direction
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return filteredData.sort((a, b) => {
      const aValue = (a as any)[sortColumn];
      const bValue = (b as any)[sortColumn];
      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  // useEffect(() => {
  //   getClientByType('prospect');
  // }, []);

  const columns = [
    { key: 'slno', label: 'Sl No', sortable: true },
    { key: 'name', label: 'Name', sortable: false },
    { key: 'mobile', label: 'Mobile', sortable: false },
    { key: 'location', label: 'Location', sortable: false },
    { key: 'followUp', label: 'Follow-up', sortable: true },
    { key: 'source', label: 'Source', sortable: false },
    { key: 'service', label: 'Service', sortable: true },
    { key: 'feedback', label: 'Feedback', sortable: false },
    { key: 'rating', label: 'Rating', sortable: true }, // Added rating column
  ];

  return (
    <>
      {loading ? (
        <LoaderComponent />
      ) : (
        <Box overflowX={'auto'}>
          <Input
            placeholder="Search prospect clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            mb={4}
          />
          <Table variant="striped" colorScheme="blackAlpha">
            <Thead>
              <Tr>
                {columns.map((col) => (
                  <Th
                    key={col.key}
                    cursor={'pointer'}
                    onClick={() => col.sortable && handleSort(col.key)}
                  >
                    {col.label}
                    {sortColumn === col.key &&
                      (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                  </Th>
                ))}
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedData.map((client, index) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td>
                  <Td>{client.name}</Td>
                  <Td>{client.mobile}</Td>
                  <Td>{client.location}</Td>
                  <Td>
                    {client.followUp ? (
                      <>
                        YES
                        <br />
                        Next Follow-up Date: <b>{client?.nextFollowUpDate}</b>
                      </>
                    ) : (
                      'NO'
                    )}
                  </Td>
                  <Td>{client.source}</Td>
                  <Td>{client.service}</Td>
                  <Td>{client.client_feedback}</Td>
                  <Td>
                    <div className="mt-2 flex">
                      {Array.from({ length: client.rating }, (_, idx) => (
                        <Star key={idx} fill="yellow" />
                      ))}
                    </div>
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
                        <MenuItem as={'div'}>
                          <Button
                            colorScheme="purple"
                            className="w-full"
                            onClick={() =>
                              (window.location.href = `/client/${client.id}`)
                            }
                          >
                            View
                          </Button>
                        </MenuItem>
                        <MenuItem as={'div'}>
                          <EditClientModal client={client} />
                        </MenuItem>
                        <MenuItem as={'div'}>
                          <DialogButton
                            title={'Delete'}
                            message={'Do you want to delete the client?'}
                            onConfirm={async () =>
                              deleteClient(client.id as string)
                            }
                            children={'Delete'}
                            confirmButtonColorScheme="red"
                            confirmButtonText="Delete"
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
      )}
    </>
  );
};

export default ProspectClientTable;
