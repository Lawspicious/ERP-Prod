import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  Text,
  Box,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

interface InvalidHearingDateModalProps {
  isOpen: boolean;
  onClose: () => void;
  caseNo: string;
  caseId: string;
  sendAnyway: () => void;
}

const InvalidHearingDateModal: React.FC<InvalidHearingDateModalProps> = ({
  isOpen,
  onClose,
  caseNo,
  caseId,
  sendAnyway,
}) => {
  const router = useRouter();

  const handleEditCase = () => {
    onClose();
    router.push(`/dashboard/admin/edit-case/${caseId}`);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invalid or Missing Hearing Date</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4}>
            <Text>
              Case <strong>{caseNo}</strong> does not have a valid next hearing
              date.
            </Text>
            <Text mt={2}>
              You can either update the case with a valid hearing date or send
              the notification anyway with a note that the hearing date is not
              scheduled.
            </Text>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button colorScheme="blue" mr={3} onClick={handleEditCase}>
            Edit Case Details
          </Button>
          <Button colorScheme="yellow" mr={3} onClick={sendAnyway}>
            Send Anyway
          </Button>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InvalidHearingDateModal;
