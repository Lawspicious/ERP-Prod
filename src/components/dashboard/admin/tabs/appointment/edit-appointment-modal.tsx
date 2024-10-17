import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure,
  Spinner,
} from '@chakra-ui/react';
import { IAppointment } from '@/types/appointments';
import { useAppointment } from '@/hooks/useAppointmentHook';
import { useLoading } from '@/context/loading/loadingContext';

interface EditAppointmentModalProps {
  appointment: IAppointment;
}

const EditAppointmentModal: React.FC<EditAppointmentModalProps> = ({
  appointment,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [formData, setFormData] = useState<IAppointment>(appointment);
  const { loading, setLoading } = useLoading();
  const { updateAppointment } = useAppointment();

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    setLoading(true);
    await updateAppointment(appointment.id as string, formData);
    setLoading(false);
    onClose();
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="purple" className="w-full">
        Edit
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent minW={400} minH={400} mx={4}>
          <ModalHeader>Edit Appointment</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {loading ? (
              <div className="flex h-full w-full items-center justify-center">
                <Spinner />
              </div>
            ) : (
              <>
                {' '}
                {/* Time field */}
                <FormControl isRequired>
                  <FormLabel>Time</FormLabel>
                  <Input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleInputChange}
                  />
                </FormControl>
                {/* Date field */}
                <FormControl mt={4} isRequired>
                  <FormLabel>Date</FormLabel>
                  <Input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </FormControl>
                {/* Location field */}
                <FormControl mt={4} isRequired>
                  <FormLabel>Location</FormLabel>
                  <Input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </FormControl>
                {/* Status field */}
                <FormControl mt={4} isRequired>
                  <FormLabel>Status</FormLabel>
                  <Select
                    name="status"
                    value={formData.status}
                    onChange={handleInputChange}
                  >
                    <option value="PENDING">Pending</option>
                    <option value="COMPLETED">Completed</option>
                  </Select>
                </FormControl>
              </>
            )}
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={handleSubmit}>
              Save
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditAppointmentModal;
