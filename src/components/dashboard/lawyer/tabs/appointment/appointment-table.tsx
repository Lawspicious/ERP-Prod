import React, { useState, useMemo, useEffect } from 'react';
import {
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
import { IAppointment } from '@/types/appointments';
import { useAppointment } from '@/hooks/useAppointmentHook';
import { MoreVertical } from 'lucide-react';
import { useLoading } from '@/context/loading/loadingContext';
import Pagination from '@/components/dashboard/shared/Pagination';
import EditAppointmentModalLawyer from './edit-appointment-modal';

const AppointmentTableLawyer = ({
  appointments,
}: {
  appointments: IAppointment[];
}) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

  const { loading } = useLoading();
  const { deleteAppointment } = useAppointment();

  // Filter data based on search term
  const filteredData = useMemo(() => {
    return appointments.filter((appointment) =>
      Object.values(appointment).some((value) =>
        String(value).toLowerCase().includes(searchTerm.toLowerCase()),
      ),
    );
  }, [appointments, searchTerm]);

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

  // Ensure valid currentPage when filtered data changes
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
    <Box overflowX="auto">
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead>
          <Tr>
            <Th>No</Th>
            <Th
              cursor="pointer"
              onClick={() => handleSort('clientDetails.name')}
            >
              Client
              {sortColumn === 'clientDetails.name' &&
                (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </Th>
            <Th
              cursor="pointer"
              onClick={() => handleSort('lawyerDetails.name')}
            >
              Lawyer
              {sortColumn === 'lawyerDetails.name' &&
                (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('time')}>
              Time
              {sortColumn === 'time' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </Th>
            <Th cursor="pointer" onClick={() => handleSort('date')}>
              Date
              {sortColumn === 'date' && (sortDirection === 'asc' ? ' ▲' : ' ▼')}
            </Th>
            <Th>Location</Th>
            <Th>Description</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {paginatedData.length > 0 ? (
            paginatedData.map((appointment, index) => (
              <Tr key={appointment.id}>
                <Td>{(currentPage - 1) * rowsPerPage + index + 1}</Td>
                <Td>
                  {appointment?.clientDetails?.name ||
                    appointment?.otherRelatedTo}
                </Td>
                <Td>{appointment.lawyerDetails?.name}</Td>
                <Td>{appointment.time}</Td>
                <Td>{appointment.date}</Td>
                <Td>{appointment.location}</Td>
                <Td>{appointment.description || 'N/A'}</Td>
                <Td>{appointment.status}</Td>
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
                        <EditAppointmentModalLawyer appointment={appointment} />
                      </MenuItem>
                      <MenuItem as={'div'}>
                        <Button
                          className="w-full"
                          colorScheme="purple"
                          onClick={() =>
                            window.open(
                              `/appointment/${appointment.id}`,
                              '_blank',
                            )
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
              <Td colSpan={9} textAlign="center">
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
          pagesWithContent={Array.from({ length: totalPages }, (_, i) => i + 1)}
        />
      )}
    </Box>
  );
};

export default AppointmentTableLawyer;
