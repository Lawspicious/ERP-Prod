import React, { useState, useMemo, useEffect } from 'react';
import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Button,
  IconButton,
  Box,
} from '@chakra-ui/react';
import { useClient } from '@/hooks/useClientHook';

import LoaderComponent from '@/components/ui/loader';
import { DialogButton } from '@/components/ui/alert-dialog';
import { MoreVertical, Star } from 'lucide-react';
import { useLoading } from '@/context/loading/loadingContext';

const NormalClientTable: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const { normalClient, getClientByType, deleteClient } = useClient();
  const { loading } = useLoading();

  const filteredData = useMemo(() => {
    return normalClient.filter((client) =>
      Object.values(client).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [normalClient, searchTerm]);

  // Sort data based on column and direction
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return filteredData.sort((a, b) => {
      const aValue = (a as any)[sortColumn];
      const bValue = (b as any)[sortColumn];

      // Special handling for rating column, since it should be a number
      if (sortColumn === 'rating') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      // Default sorting for other columns
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

  useEffect(() => {
    getClientByType('normal');
  }, []);

  return (
    <>
      {loading ? (
        <LoaderComponent />
      ) : (
        <Box overflowX={'auto'}>
          <Input
            placeholder="Search normal clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            mb={4}
          />
          <Table variant="striped" colorScheme="blackAlpha">
            <Thead>
              <Tr>
                <Th cursor="pointer" onClick={() => handleSort('name')}>
                  Name
                  {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                </Th>
                <Th cursor="pointer">Email</Th>
                {/* <Th cursor="pointer" onClick={() => handleSort('gender')}>
                  Gender
                  {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                </Th> */}
                <Th cursor="pointer" onClick={() => handleSort('mobile')}>
                  Mobile
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('city')}>
                  City
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('rating')}>
                  Rating
                  {sortDirection === 'asc' ? ' ▲' : ' ▼'}
                </Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {sortedData.map((client, index) => (
                <Tr key={index}>
                  <Td>{client.name}</Td>
                  <Td>{client.email}</Td>
                  {/* <Td>{client.gender}</Td> */}
                  <Td>{client.mobile}</Td>
                  <Td>{client.city}</Td>
                  <Td>
                    <div className="flex">
                      {Array.from({ length: client.rating }, (_, i) => (
                        <Star key={i} fill="yellow" />
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

export default NormalClientTable;
