import React, { useState, useEffect } from 'react';
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
  FormControl,
  FormLabel,
  Input,
  Select,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import {
  ArrowDownToLine,
  CalendarDays,
  GitPullRequestArrow,
  TrafficCone,
} from 'lucide-react';
import { ICase } from '@/types/case';
import { useTeam } from '@/hooks/useTeamHook';
import { useCases } from '@/hooks/useCasesHook';
import { useLoading } from '@/context/loading/loadingContext';

interface ITransferProps {
  caseDetails: ICase;
}

const TransferCaseButton = ({ caseDetails }: ITransferProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCase, setSelectedCase] = useState<ICase>(caseDetails);
  const { allTeam, getAllTeam } = useTeam(); // Fetches the list of lawyers
  const [selectedLawyerId, setSelectedLawyerId] = useState('');
  const [remark, setRemark] = useState('');
  const { updateCase } = useCases();
  const { loading, setLoading } = useLoading();

  useEffect(() => {
    // Fetch the list of lawyers when the modal is opened
    if (isOpen) {
      getAllTeam();
    }
  }, [isOpen, getAllTeam]);

  const handleTransfer = async () => {
    setLoading(true);
    const _lawyer = allTeam.find((lawyer) => lawyer.id == selectedLawyerId);
    // Update the case with the selected lawyer's ID
    if (_lawyer) {
      await updateCase(
        caseDetails.caseId as string,
        {
          lawyer: {
            name: _lawyer?.name,
            email: _lawyer?.email,
            phoneNumber: _lawyer?.phoneNumber,
            id: _lawyer?.id as string,
          },
        },
        caseDetails.caseNo,
      );
    }
    setLoading(false);
    onClose();
  };

  return (
    <Box>
      <Button
        colorScheme="purple"
        onClick={onOpen}
        className="w-full md:w-fit"
        leftIcon={<GitPullRequestArrow />}
      >
        Transfer Case
      </Button>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader>Transfer Case</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {/* Case Details */}
            <FormControl mb={4}>
              <FormLabel>Case ID</FormLabel>
              <Input value={selectedCase.caseId} isReadOnly />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Case Type</FormLabel>
              <Input value={selectedCase.caseType} isReadOnly />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Current Lawyer</FormLabel>
              <Input value={selectedCase.lawyer.name} isReadOnly />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>Next Hearing Date</FormLabel>
              <Input value={selectedCase.nextHearing} isReadOnly />
            </FormControl>

            {/* Transfer to Lawyer */}
            <FormControl mb={4}>
              <FormLabel>Select Lawyer</FormLabel>
              <Select
                placeholder="Select a lawyer"
                value={selectedLawyerId}
                onChange={(e) => setSelectedLawyerId(e.target.value)}
              >
                {allTeam.map((lawyer) => (
                  <option key={lawyer.id} value={lawyer.id}>
                    {lawyer.name} - {lawyer.email}
                  </option>
                ))}
              </Select>
            </FormControl>

            {/* Remarks */}
            <FormControl mb={4}>
              <FormLabel>Remark</FormLabel>
              <Textarea
                placeholder="Add remarks"
                value={remark}
                onChange={(e) => setRemark(e.target.value)}
              />
            </FormControl>
          </ModalBody>

          <ModalFooter>
            <Button
              colorScheme="purple"
              mr={3}
              onClick={handleTransfer}
              isDisabled={!selectedLawyerId}
              isLoading={loading}
            >
              Transfer
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

export default TransferCaseButton;
