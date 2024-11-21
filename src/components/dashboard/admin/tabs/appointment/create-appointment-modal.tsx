import React, { useEffect, useState } from 'react';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  Spinner,
  Textarea,
} from '@chakra-ui/react';
import { useTeam } from '@/hooks/useTeamHook';
import { useClient } from '@/hooks/useClientHook';
import { useAppointment } from '@/hooks/useAppointmentHook';
import { IAppointment } from '@/types/appointments';
import { useLoading } from '@/context/loading/loadingContext';
import { IUser } from '@/types/user';

const initialData = {
  time: '',
  date: '',
  location: '',
  clientId: '',
  lawyerId: '',
  status: 'PENDING',
  description: '',
};

const CreateAppointmentModal = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [appointment, setAppointment] = useState({ ...initialData });
  const { allTeam, getAllTeam } = useTeam();
  const { allClients, getAllClients } = useClient();
  const { createAppointment } = useAppointment();
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    const handleFetchData = async () => {
      setLoading(true);
      await getAllClients();
      await getAllTeam();
      setLoading(false);
    };
    handleFetchData();
  }, []);

  const handleInputChange = (e: any) => {
    const { name, value } = e.target;
    setAppointment({
      ...appointment,
      [name]: value,
    });
  };

  const handleCreateAppointment = async () => {
    setLoading(true);
    const selectedClient = allClients.find(
      (client) => client.id === appointment.clientId,
    );
    const selectedLawyer = allTeam.find(
      (team) => team.id === appointment.lawyerId,
    );

    if (selectedClient && selectedLawyer) {
      const appointmentData: IAppointment = {
        time: appointment.time,
        date: appointment.date,
        location: appointment.location,
        description: appointment.description,
        clientDetails: {
          id: selectedClient?.id as string,
          name: selectedClient?.name,
          mobile: selectedClient?.mobile,
          email: selectedClient?.email,
        },
        lawyerDetails: {
          id: selectedLawyer?.id as string,
          name: selectedLawyer?.name,
          phoneNumber: selectedLawyer?.phoneNumber,
          email: selectedLawyer?.email,
        },
        status: appointment.status as 'PENDING' | 'COMPLETED',
      };
      await createAppointment(appointmentData);
      setAppointment(initialData);
    }
    setLoading(false);
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="purple">
        Create Appointment
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minH={400} minW={400} mx={4}>
          {loading ? (
            <ModalBody>
              <Spinner />
            </ModalBody>
          ) : (
            <>
              <ModalHeader>Create Appointment</ModalHeader>
              <ModalCloseButton />
              <ModalBody>
                <FormControl>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    name="date"
                    value={appointment.date}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Time</FormLabel>
                  <Input
                    type="time"
                    name="time"
                    value={appointment.time}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Location</FormLabel>
                  <Input
                    name="location"
                    value={appointment.location}
                    onChange={handleInputChange}
                  />
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Client</FormLabel>
                  <Select
                    name="clientId"
                    placeholder="Select Client"
                    value={appointment.clientId}
                    onChange={handleInputChange}
                  >
                    {allClients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.name}
                      </option>
                    ))}
                  </Select>
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Team Members</FormLabel>
                  <Select
                    name="lawyerId"
                    placeholder="Select Team Member"
                    value={appointment.lawyerId}
                    onChange={handleInputChange}
                  >
                    {/* Group for Lawyers */}
                    <optgroup label="Lawyers">
                      {allTeam
                        .filter((team: IUser) => team.role === 'LAWYER')
                        .map((lawyer: IUser) => (
                          <option key={lawyer.id} value={lawyer.id}>
                            {lawyer.name}
                          </option>
                        ))}
                    </optgroup>

                    {/* Group for Admins */}
                    <optgroup label="Admins">
                      {allTeam
                        .filter((team: IUser) => team.role === 'ADMIN')
                        .map((admin: IUser) => (
                          <option key={admin.id} value={admin.id}>
                            {admin.name}
                          </option>
                        ))}
                    </optgroup>
                  </Select>
                </FormControl>
                <FormControl mt={4}>
                  <FormLabel>Description</FormLabel>
                  <Textarea
                    name="description"
                    rows={3}
                    placeholder="Enter description..."
                    value={appointment.description}
                    onChange={handleInputChange}
                  />
                </FormControl>
              </ModalBody>
              <ModalFooter>
                <Button
                  colorScheme="purple"
                  mr={3}
                  onClick={handleCreateAppointment}
                >
                  Create
                </Button>
                <Button variant="ghost" onClick={onClose}>
                  Cancel
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
};

export default CreateAppointmentModal;
