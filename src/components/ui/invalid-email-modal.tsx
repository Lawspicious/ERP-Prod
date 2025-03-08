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
  useDisclosure,
} from '@chakra-ui/react';
import { useRouter } from 'next/navigation';

interface InvalidEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  clientName: string;
  caseId: string;
}

const InvalidEmailModal: React.FC<InvalidEmailModalProps> = ({
  isOpen,
  onClose,
  clientName,
  caseId,
}) => {
  const router = useRouter();

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invalid Email Address</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Box mb={4}>
            <Text>
              The client <strong>{clientName}</strong> does not have a valid
              email address.
            </Text>
            <Text mt={2}>
              Please update the client details with a valid email address before
              sending the notification.
            </Text>
          </Box>
        </ModalBody>

        <ModalFooter>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default InvalidEmailModal;
