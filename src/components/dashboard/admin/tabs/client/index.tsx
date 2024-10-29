'use client';
import {
  Button,
  Flex,
  Grid,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from '@chakra-ui/react';
import ShowClientTable from './show-client-table';
import TabLayout from '../tab-layout';
import { useRouter } from 'next/navigation';

const ClientTab = () => {
  const router = useRouter();

  return (
    <TabLayout>
      <section className="mb-6 flex items-center justify-between">
        <h1 className="heading-primary mb-6">Client</h1>
        <Button
          colorScheme="purple"
          onClick={() => router.push('/dashboard/admin/add-client')}
        >
          Add Client
        </Button>
      </section>
      <ShowClientTable />
    </TabLayout>
  );
};

export default ClientTab;
