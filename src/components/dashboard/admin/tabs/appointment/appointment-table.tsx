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
import { DialogButton } from '@/components/ui/alert-dialog';
import { useAppointment } from '@/hooks/useAppointmentHook';
import { MoreVertical } from 'lucide-react';
import EditAppointmentModal from './edit-appointment-modal';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';
import Pagination from '@/components/dashboard/shared/Pagination';

const AppointmentTable = ({
  appointments,
}: {
  appointments: IAppointment[];
}) => {
  const { loading, setLoading } = useLoading();
  const { deleteAppointment } = useAppointment();
  const { role } = useAuth();

  const [searchTerm, setSearchTerm] = useState<string>('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const rowsPerPage = 10;

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

  // Ensure valid currentPage when filteredData changes
  useEffect(() => {
    const totalFilteredPages = Math.ceil(filteredData.length / rowsPerPage);
    if (currentPage > totalFilteredPages) {
      setCurrentPage(totalFilteredPages > 0 ? totalFilteredPages : 1);
    }
  }, [filteredData, rowsPerPage]);

  // Paginate data
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

  const handleDeleteAppointment = async (id: string) => {
    await deleteAppointment(id);
    setLoading(false);
  };

  const columns = [
    { key: 'clientDetails', label: 'Client/Other', sortable: false },
    { key: 'lawyerDetails', label: 'Lawyer', sortable: false },
    { key: 'time', label: 'Time', sortable: true },
    { key: 'date', label: 'Date', sortable: true },
    { key: 'location', label: 'Location', sortable: false },
    { key: 'description', label: 'Description', sortable: false },
    { key: 'status', label: 'Status', sortable: true },
  ];

  return (
    <Box overflowX={'auto'}>
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead>
          <Tr>
            <Th>No</Th>
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
            paginatedData.map((appointment, index) => (
              <Tr key={appointment.id}>
                <Td>{(currentPage - 1) * rowsPerPage + index + 1}</Td>
                <Td>
                  {appointment.clientDetails
                    ? appointment.clientDetails?.name
                    : appointment?.otherRelatedTo}
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
                        <DialogButton
                          title={'Delete'}
                          message={'Do you want to delete the appointment?'}
                          onConfirm={async () =>
                            appointment.id
                              ? handleDeleteAppointment(appointment.id)
                              : console.error('Appointment ID is missing!')
                          }
                          children={'Delete'}
                          confirmButtonColorScheme="red"
                          confirmButtonText="Delete"
                        />
                      </MenuItem>
                      <MenuItem as={'div'}>
                        <EditAppointmentModal appointment={appointment} />
                      </MenuItem>
                      <MenuItem as={'div'}>
                        <Button
                          className="w-full"
                          colorScheme="purple"
                          onClick={() =>
                            (window.location.href = `/appointment/${appointment.id}`)
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
          pagesWithContent={Array.from({ length: totalPages }, (_, i) => i + 1)}
        />
      )}
    </Box>
  );
};

export default AppointmentTable;
