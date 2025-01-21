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
import { MoreVertical, Star } from 'lucide-react';
import { useLoading } from '@/context/loading/loadingContext';
import Pagination from '@/components/dashboard/shared/Pagination';

const NormalClientTableLawyer: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

  const { normalClient, getClientByType } = useClient();
  const { loading } = useLoading();

  // Fetch clients on component mount
  useEffect(() => {
    getClientByType('normal');
  }, []);

  // Filter clients based on search term
  const filteredData = useMemo(() => {
    return normalClient.filter((client) =>
      Object.values(client).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [normalClient, searchTerm]);

  // Sort clients based on column and direction
  const sortedData = useMemo(() => {
    if (!sortColumn) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aValue = (a as any)[sortColumn];
      const bValue = (b as any)[sortColumn];

      if (sortColumn === 'rating') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }

      if (sortDirection === 'asc') {
        return aValue > bValue ? 1 : -1;
      } else {
        return aValue < bValue ? 1 : -1;
      }
    });
  }, [filteredData, sortColumn, sortDirection]);

  // Ensure currentPage is valid when filtered data changes
  useEffect(() => {
    const totalFilteredPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage > totalFilteredPages) {
      setCurrentPage(totalFilteredPages > 0 ? totalFilteredPages : 1);
    }
  }, [filteredData, rowsPerPage]);

  // Paginate sorted data
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

  return (
    <>
      {loading ? (
        <LoaderComponent />
      ) : (
        <Box overflowX="auto">
          <Input
            placeholder="Search normal clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            mb={4}
          />
          <Table variant="striped" colorScheme="blackAlpha">
            <Thead>
              <Tr>
                <Th>No</Th>
                <Th cursor="pointer" onClick={() => handleSort('name')}>
                  Name
                  {sortColumn === 'name' &&
                    (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </Th>
                <Th>Email</Th>
                <Th cursor="pointer" onClick={() => handleSort('gender')}>
                  Gender
                  {sortColumn === 'gender' &&
                    (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('mobile')}>
                  Mobile
                  {sortColumn === 'mobile' &&
                    (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('city')}>
                  City
                  {sortColumn === 'city' &&
                    (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </Th>
                <Th cursor="pointer" onClick={() => handleSort('rating')}>
                  Rating
                  {sortColumn === 'rating' &&
                    (sortDirection === 'asc' ? ' ▲' : ' ▼')}
                </Th>
                <Th>Action</Th>
              </Tr>
            </Thead>
            <Tbody>
              {paginatedData.length > 0 ? (
                paginatedData.map((client, index) => (
                  <Tr key={client.id}>
                    <Td>{(currentPage - 1) * rowsPerPage + index + 1}</Td>
                    <Td>{client.name}</Td>
                    <Td>{client.email}</Td>
                    <Td>{client.gender}</Td>
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
                          <MenuItem as="div">
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
                        </MenuList>
                      </Menu>
                    </Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan={8} textAlign="center">
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

export default NormalClientTableLawyer;
