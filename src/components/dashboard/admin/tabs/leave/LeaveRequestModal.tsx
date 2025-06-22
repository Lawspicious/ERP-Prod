import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  FormControl,
  FormLabel,
  Input,
  Textarea,
  useDisclosure,
} from '@chakra-ui/react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/context/user/userContext';
import { ILeaveRequest, useLeaveRequest } from '@/hooks/useLeaveRequest'; // adjust path accordingly

export const LeaveRequestModal = ({ data }: { data?: ILeaveRequest }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { authUser } = useAuth();
  const { raiseLeaveRequest, updateLeaveRequest } = useLeaveRequest();

  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [reason, setReason] = useState('');
  const [remark, setRemark] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (data) {
      setFromDate(data.fromDate);
      setToDate(data.toDate);
      setReason(data.reason);
      setRemark(data.remark || '');
    }
  }, [data]);

  const handleSubmit = async () => {
    if (!authUser || !fromDate || !toDate || (!reason && !remark)) return;

    setLoading(true);
    if (data) {
      await updateLeaveRequest(data.id as string, {
        fromDate,
        toDate,
        reason,
        remark,
        status: data.status,
      });
    } else {
      await raiseLeaveRequest({
        userId: authUser.uid,
        name: authUser.displayName || 'Unknown',
        fromDate,
        toDate,
        reason,
      });
    }

    setLoading(false);
    onClose(); // close modal
    setFromDate('');
    setToDate('');
    setReason('');
    setRemark('');
  };

  return (
    <>
      <Button onClick={onOpen} colorScheme="blue" w={data && '100%'}>
        {data ? 'Edit' : 'Request Leave'}
      </Button>

      <Modal isOpen={isOpen} onClose={onClose} isCentered size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Leave Request</ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <FormControl mb={4}>
              <FormLabel>From Date</FormLabel>
              <Input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
              />
            </FormControl>

            <FormControl mb={4}>
              <FormLabel>To Date</FormLabel>
              <Input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
              />
            </FormControl>

            {data?.status === 'approved' ? (
              <FormControl>
                <FormLabel>Remark</FormLabel>
                <Textarea
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </FormControl>
            ) : (
              <FormControl>
                <FormLabel>Reason</FormLabel>
                <Textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                />
              </FormControl>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button
              colorScheme="green"
              onClick={handleSubmit}
              isLoading={loading}
            >
              {data ? 'Update' : 'Submit'}
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};
