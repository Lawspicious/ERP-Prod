import {
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
  IconButton,
  Text,
} from '@chakra-ui/react';
import { ChevronDown } from 'lucide-react';
import { IEarlyLeave } from '@/types/attendance';

interface EarlyLeavesTableProps {
  earlyLeaves: IEarlyLeave[];
}

const EarlyLeavesTable = ({ earlyLeaves }: EarlyLeavesTableProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <>
      <IconButton
        aria-label="View early leaves"
        icon={<ChevronDown />}
        size="sm"
        onClick={onOpen}
        variant="ghost"
      />

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Early Leaves History</ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            {earlyLeaves.length > 0 ? (
              <Table variant="striped" colorScheme="orange">
                <Thead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Working Hours</Th>
                    <Th>Reason</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {earlyLeaves.map((leave) => (
                    <Tr key={leave.id}>
                      <Td>{leave.date}</Td>
                      <Td>{leave.workingHours}</Td>
                      <Td>{leave.reason}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            ) : (
              <Text>No early leaves found.</Text>
            )}
          </ModalBody>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EarlyLeavesTable;
