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
  Select,
  HStack,
} from '@chakra-ui/react';
import { MoreVertical, Star } from 'lucide-react';
import Pagination from '@/components/dashboard/shared/Pagination';
import LoaderComponent from '@/components/ui/loader';
import { DialogButton } from '@/components/ui/alert-dialog';
import EditClientModal from './edit-client-modal';
import { useClient } from '@/hooks/useClientHook';
import { useLoading } from '@/context/loading/loadingContext';
import { useTeam } from '@/hooks/useTeamHook';

const ProspectClientTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [selectedRM, setSelectedRM] = useState<string>('');
  const rowsPerPage = 10;

  const { prospectClient, deleteClient } = useClient();
  const { loading } = useLoading();
  const { allUser } = useTeam();

  // Get unique RMs from clients
  const assignedRMs = useMemo(() => {
    const rms = prospectClient
      .map((client) => client.relationshipManager)
      .filter((rm) => rm && rm !== 'yet to be assigned')
      .filter((rm, index, arr) => arr.indexOf(rm) === index);
    return rms;
  }, [prospectClient]);

  // Filter data based on search term and RM filter
  const filteredData = useMemo(() => {
    let filtered = prospectClient.filter((client) =>
      Object.values(client).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );

    if (selectedRM) {
      filtered = filtered.filter(
        (client) => client.relationshipManager === selectedRM,
      );
    }

    return filtered;
  }, [prospectClient, searchTerm, selectedRM]);

  // Sort data based on column and direction
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortColumn];
      const bValue = (b as any)[sortColumn];

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

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
    return sortedData.slice(startIndex, endIndex);
  }, [currentPage, sortedData]);

  const totalPages = Math.ceil(filteredData.length / rowsPerPage);

  // Handle column sorting
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const resetFilter = () => {
    setSelectedRM('');
    setSearchTerm('');
  };

  const getDisplayRM = (rm?: string) => {
    if (!rm || rm === 'yet to be assigned') return 'Yet to be assigned';
    const user = allUser.find((u) => u.id === rm);
    return user ? user.name : 'RM';
  };

  const columns = [
    { key: 'name', label: 'Name', sortable: false },
    { key: 'relationshipManager', label: 'RM', sortable: true },
    { key: 'mobile', label: 'Mobile', sortable: false },
    { key: 'location', label: 'Location', sortable: false },
    { key: 'followUp', label: 'Follow-up', sortable: true },
    { key: 'source', label: 'Source', sortable: false },
    { key: 'service', label: 'Service', sortable: true },
    { key: 'feedback', label: 'Feedback', sortable: false },
    { key: 'rating', label: 'Rating', sortable: true },
  ];

  return (
    <>
      {loading ? (
        <LoaderComponent />
      ) : (
        <Box overflowX={'auto'}>
          <HStack spacing={4} mb={4}>
            <Input
              placeholder="Search prospect clients..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              flex={1}
            />
            <Select
              placeholder="View By RM"
              value={selectedRM}
              onChange={(e) => setSelectedRM(e.target.value)}
              width="200px"
            >
              {assignedRMs.map((rm) => {
                const user = allUser.find((u) => u.id === rm);
                return (
                  <option key={rm} value={rm}>
                    {user?.name || 'Unknown RM'}
                  </option>
                );
              })}
            </Select>
            <Button onClick={resetFilter} colorScheme="gray" size="sm">
              Reset
            </Button>
          </HStack>
          <Table variant="striped" colorScheme="blackAlpha">
            <Thead>
              <Tr>
                <Th>SL No.</Th>
                {columns.map((col) => (
                  <Th
                    key={col.key}
                    cursor={col.sortable ? 'pointer' : 'default'}
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
              {paginatedData.length > 0 ? (
                paginatedData.map((client, index) => (
                  <Tr key={client.id}>
                    <Td>{(currentPage - 1) * rowsPerPage + index + 1}</Td>
                    <Td>{client.name}</Td>
                    <Td>{getDisplayRM(client.relationshipManager)}</Td>
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
                                window.open(`/client/${client.id}`, '_blank')
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
                                client.id
                                  ? deleteClient(client.id, client.name || '')
                                  : console.error('Client ID is missing!')
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
                ))
              ) : (
                <Tr>
                  <Td colSpan={columns.length + 2} textAlign="center">
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
      )}
    </>
  );
};

export default ProspectClientTable;
