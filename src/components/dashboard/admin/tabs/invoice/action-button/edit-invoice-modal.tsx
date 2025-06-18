import { useInvoice } from '@/hooks/useInvoiceHook';
import { IInvoice } from '@/types/invoice';
import {
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  useDisclosure,
  FormControl,
  FormHelperText,
  FormLabel,
  Input,
  Select,
  Textarea,
} from '@chakra-ui/react';
import React, { useState } from 'react';

const EditInvoiceModal = ({ invoiceData }: { invoiceData: IInvoice }) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [paymentStatus, setPaymentStatus] = useState<
    'paid' | 'unpaid' | 'rejected'
  >(invoiceData.paymentStatus);
  const [paymentDate, setPaymentDate] = useState(invoiceData.paymentDate || '');
  const [remark, setRemark] = useState('');
  const { updateInvoice } = useInvoice();

  const handleEdit = async () => {
    if (paymentStatus === 'rejected') {
      await updateInvoice(invoiceData.id as string, {
        paymentStatus,
        remark,
        rejectionDate: new Date().toISOString().split('T')[0],
      });
    } else {
      await updateInvoice(invoiceData.id as string, {
        paymentStatus,
        paymentDate,
      });
    }
    onClose();
  };
  return (
    <>
      <Button onClick={onOpen} className="w-full" colorScheme="purple">
        Edit Status
      </Button>
      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent mx={4}>
          <ModalHeader>Edit Invoice Status</ModalHeader>
          <ModalCloseButton />
          <ModalBody className="space-y-4">
            <FormControl>
              <FormLabel>Payment Status</FormLabel>
              <Select
                name="Payment Status"
                placeholder="Payment Status"
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(e.target.value as 'paid' | 'unpaid')
                }
              >
                <option value={'unpaid'}>Unpaid</option>
                <option value={'paid'}>Paid</option>
                <option value={'rejected'}>Rejected</option>
              </Select>
            </FormControl>
            {paymentStatus === 'paid' ? (
              <FormControl>
                <FormLabel>Payment Date</FormLabel>
                <Input
                  type="date"
                  name="paymentDate"
                  placeholder="Enter Payment Date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                />
                <FormHelperText>Add Date when Payment was done</FormHelperText>
              </FormControl>
            ) : (
              <div />
            )}

            {paymentStatus === 'rejected' && (
              <FormControl>
                <FormLabel>Remark</FormLabel>
                <Textarea
                  name="remark"
                  placeholder="Enter rejection remark"
                  value={remark}
                  onChange={(e) => setRemark(e.target.value)}
                />
              </FormControl>
            )}
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme={'purple'} onClick={handleEdit}>
              Edit
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default EditInvoiceModal;
