// components/DialogButton.tsx
import React, { ReactNode } from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  useDisclosure,
} from '@chakra-ui/react';

interface DialogButtonProps {
  title: string;
  message: string;
  confirmButtonColorScheme?: string;
  onConfirm: () => Promise<void>;
  confirmButtonText?: string;
  children: ReactNode; // Accept children for button text
  disabled?: boolean;
}

export const DialogButton: React.FC<DialogButtonProps> = ({
  title,
  message,
  confirmButtonColorScheme = 'purple',
  onConfirm,
  confirmButtonText = 'Confirm', // Default confirm button text
  children,
  disabled,
}) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  const handleConfirm = async () => {
    await onConfirm(); // Call the onConfirm function
    onClose(); // Close the modal
  };

  return (
    <>
      <Button
        onClick={onOpen}
        className="mb-2 w-full"
        colorScheme={confirmButtonColorScheme}
        disabled={disabled}
      >
        {children}
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader>{title}</ModalHeader>
          <ModalCloseButton />
          <ModalBody>{message}</ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme={confirmButtonColorScheme}
              onClick={handleConfirm}
            >
              {confirmButtonText}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
