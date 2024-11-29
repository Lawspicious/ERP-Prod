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
} from '@chakra-ui/react';
import { IAppointment } from '@/types/appointments';
import { DialogButton } from '@/components/ui/alert-dialog';
import { useAppointment } from '@/hooks/useAppointmentHook';
import { MoreVertical } from 'lucide-react';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';
import EditAppointmentModalLawyer from './edit-appointment-modal';

const AppointmentTableLawyer = ({
  appointments,
}: {
  appointments: IAppointment[];
}) => {
  const { loading, setLoading } = useLoading();
  const { deleteAppointment } = useAppointment();
  const { role } = useAuth();

  const handleDeleteAppointment = async (id: string) => {
    await deleteAppointment(id);
    setLoading(false);
  };
  return (
    <Box overflowX={'scroll'}>
      <Table variant="striped" colorScheme="blackAlpha">
        <Thead>
          <Tr>
            <Th>No</Th>
            <Th>Client</Th>
            <Th>Lawyer</Th>
            <Th>Time</Th>
            <Th>Date</Th>
            <Th>Location</Th>
            <Th>Description</Th>
            <Th>Status</Th>
            <Th>Action</Th>
          </Tr>
        </Thead>
        <Tbody>
          {appointments.map((appointment, index) => (
            <Tr key={appointment.id}>
              <Td>{index + 1}</Td>
              <Td>
                {appointment?.clientDetails?.name ||
                  appointment?.otherRelatedTo}
              </Td>
              <Td>{appointment.lawyerDetails.name}</Td>
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
          ))}
        </Tbody>
      </Table>
    </Box>
  );
};

export default AppointmentTableLawyer;
