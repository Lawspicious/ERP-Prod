import React, { useState } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  Button,
  useDisclosure,
} from '@chakra-ui/react';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import useCalendarEvents from '@/hooks/useCalendarHook';

// Assuming the hook is stored in this path

const AddEventModal = () => {
  const { createNewEvent } = useCalendarEvents();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);

  // State to hold the new event data
  const [newEvent, setNewEvent] = useState({
    title: '',
    start: '',
  });

  // Handle adding the event
  const handleAddEvent = async () => {
    // Make sure all required fields are filled
    setLoading(true);
    if (!newEvent.title || !newEvent.start) {
      alert('Please fill in all required fields.');
      return;
    }

    // Call the createNewEvent hook to add the event to Firestore
    await createNewEvent({
      title: newEvent.title,
      start: newEvent.start as string, // Convert to Date object
    });

    // Reset the modal form and close the modal
    setNewEvent({
      title: '',
      start: '',
    });
    setLoading(false);
    onClose();
  };

  return (
    <>
      <Button
        colorScheme="purple"
        leftIcon={<PlusCircle />}
        onClick={onOpen}
        width={{ base: 'full', md: 'auto' }}
      >
        Add Event
      </Button>
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add New Event</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
              <FormLabel>Title</FormLabel>
              <Input
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                placeholder="Event Title"
              />
            </FormControl>
            <FormControl mt={4}>
              <FormLabel>Start Date</FormLabel>
              <Input
                type="date"
                value={newEvent.start}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, start: e.target.value })
                }
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="blue"
              mr={3}
              onClick={handleAddEvent} // Disable button and show loading spinner when creating event
              isLoading={loading}
            >
              Add Event
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

export default AddEventModal;
