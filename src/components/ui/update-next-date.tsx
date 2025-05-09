import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Textarea,
  useDisclosure,
  FormControl,
  FormLabel,
  Input,
} from '@chakra-ui/react';
import { CalendarDays } from 'lucide-react';
import { useCases } from '@/hooks/useCasesHook';
import { ICase } from '@/types/case';
import caseData from '@/db/dummydb';

interface ITransferProps {
  caseDetails: ICase;
}

const UpdateNextDateButton = ({ caseDetails }: ITransferProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedDate, setSelectedDate] = useState<string>(
    caseDetails.nextHearing,
  );

  useEffect(() => {
    if (caseDetails?.nextHearing) {
      setSelectedDate(caseDetails.nextHearing);
    }
  }, [caseDetails?.nextHearing]);

  const [remark, setRemark] = useState('');
  const { updateCase } = useCases();

  const handleUpdate = async () => {
    const updatedHearings = [
      ...(caseDetails.hearings || []),
      {
        date: selectedDate,
        remarks: remark,
      },
    ];

    await updateCase(
      caseDetails.caseId as string,
      {
        nextHearing: selectedDate as 'YYYY-MM-DD',
        hearings: updatedHearings,
      },
      caseDetails.caseNo,
    );
    onClose();
  };

  return (
    <Box>
      <Button
        className="w-full md:w-fit"
        colorScheme="purple"
        onClick={onOpen}
        leftIcon={<CalendarDays />}
      >
        Update Next Date
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader>Update Next Date</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>Select Next Date</FormLabel>
              <Input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Remark</FormLabel>
              <Textarea
                placeholder="Add your remark"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button colorScheme="purple" mr={3} onClick={handleUpdate}>
              Update
            </Button>
            <Button variant="ghost" onClick={onClose}>
              Cancel
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default UpdateNextDateButton;
