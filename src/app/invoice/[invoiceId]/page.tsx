'use client';
import LoaderComponent from '@/components/ui/loader';
import PageLayout from '@/components/ui/page-layout';
import { useLoading } from '@/context/loading/loadingContext';
import { useInvoice } from '@/hooks/useInvoiceHook';
import {
  Box,
  Text,
  Stack,
  Divider,
  VStack,
  Badge,
  HStack,
  Button,
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import React, { useEffect } from 'react';

const InvoiceViewPage = ({
  params,
}: {
  params: {
    invoiceId: string;
  };
}) => {
  const { invoice, getInvoiceById } = useInvoice();
  const { loading } = useLoading();

  useEffect(() => {
    getInvoiceById(params.invoiceId as string);
  }, []);

  console.log(invoice);
  return (
    <PageLayout screen="margined">
      <Box className="rounded-lg bg-white p-8 shadow-md">
        {loading ? (
          <LoaderComponent />
        ) : !invoice ? (
          <div className="heading-primary text-center">No Invoice Found!</div>
        ) : (
          <>
            {/* Header Section */}
            <HStack justify="space-between" align="center" mb={8}>
              <Text fontSize="3xl" fontWeight="bold" color="gray.700">
                Invoice Details
              </Text>
              <Badge
                colorScheme={invoice.paymentStatus === 'paid' ? 'green' : 'red'}
                fontSize="lg"
                p={2}
                rounded={'md'}
              >
                {invoice.paymentStatus.toUpperCase()}
              </Badge>
            </HStack>

            {/* Client/Organization Info */}
            <Box mb={10}>
              <HStack align="center" mb={4}>
                <Text fontSize="xl" fontWeight="bold" mr={2}>
                  Bill To:
                </Text>
                <Badge
                  fontSize={'base'}
                  px={3}
                  py={1.5}
                  rounded={'md'}
                  colorScheme={invoice.billTo === 'client' ? 'blue' : 'purple'}
                >
                  {invoice.billTo === 'client' ? 'Client' : 'Organization'}
                </Badge>
              </HStack>
              {invoice.clientDetails ? (
                <VStack align="start" spacing={2}>
                  <Text>
                    <Text as="span" fontWeight="bold">
                      Name:
                    </Text>{' '}
                    {invoice.clientDetails.name || 'Not provided'}
                  </Text>
                  <Text>
                    <Text as="span" fontWeight="bold">
                      Email:
                    </Text>{' '}
                    {invoice.clientDetails.email || 'Not provided'}
                  </Text>
                  <Text>
                    <Text as="span" fontWeight="bold">
                      Mobile:
                    </Text>{' '}
                    {invoice.clientDetails.mobile || 'Not provided'}
                  </Text>
                  <Text>
                    <Text as="span" fontWeight="bold">
                      Location:
                    </Text>{' '}
                    {invoice.clientDetails.location || 'Not provided'}
                  </Text>
                </VStack>
              ) : (
                <Text color="gray.500">
                  Client/Organization details not provided
                </Text>
              )}
            </Box>

            {/* Invoice Dates */}
            <Stack direction={['column', 'row']} spacing={8} mb={10}>
              <Box>
                <Text fontWeight="bold" color="gray.700">
                  Created At:
                </Text>
                <Text color="gray.500">
                  {invoice.createdAt || 'Not provided'}
                </Text>
              </Box>
              <Box>
                <Text fontWeight="bold" color="gray.700">
                  Due Date:
                </Text>
                <Text color="gray.500">
                  {invoice.dueDate || 'Not provided'}
                </Text>
              </Box>
              {invoice.paymentDate && (
                <Box>
                  <Text fontWeight="bold" color="gray.700">
                    Payment Date:
                  </Text>
                  <Text color="gray.500">
                    {invoice.paymentDate || 'Not provided'}
                  </Text>
                </Box>
              )}
            </Stack>

            <Divider mb={10} />

            {/* Services Section */}
            <Box mb={10}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.700" mb={4}>
                Services
              </Text>
              {invoice.services.length ? (
                invoice.services.map((service, index) => (
                  <Box
                    key={index}
                    className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <HStack justify="space-between">
                      <Text fontWeight="bold" fontSize="lg" color="gray.800">
                        {service.name}
                      </Text>
                      <Text fontWeight="bold" color="blue.600">
                        ₹{service.amount || 'Not provided'}
                      </Text>
                    </HStack>
                    <Text color="gray.500" mt={2}>
                      {service.description || 'No description available'}
                    </Text>
                  </Box>
                ))
              ) : (
                <Text color="gray.500">No services provided</Text>
              )}
            </Box>

            <Divider mb={10} />

            {/* RE Section */}
            <Box mb={10}>
              <Text fontSize="2xl" fontWeight="bold" color="gray.700" mb={4}>
                Related Entities (RE)
              </Text>
              {invoice.RE.length ? (
                invoice.RE.map((re, index) => (
                  <Text key={index} color="gray.600">
                    <Text as="span" fontWeight="bold">
                      Case ID:
                    </Text>{' '}
                    {re.caseId || 'Not provided'}
                  </Text>
                ))
              ) : (
                <Text color="gray.500">No related entities</Text>
              )}
            </Box>

            <Divider mb={10} />

            {/* Team Members Section */}
            {invoice.teamMember ? (
              <Box mb={10}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.700" mb={4}>
                  Team Member(s)
                </Text>
                {invoice.teamMember.map((member, index) => (
                  <Box
                    key={index}
                    className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <Text fontWeight="bold" color="gray.800">
                      {member.name || 'Not provided'}
                    </Text>
                    <Text color="gray.500">
                      Email: {member.email || 'Not provided'}
                    </Text>
                    <Text color="gray.500">
                      Phone: {member.phoneNumber || 'Not provided'}
                    </Text>
                  </Box>
                ))}
              </Box>
            ) : (
              <Text color="gray.500">No team members assigned</Text>
            )}
            {invoice.tasks ? (
              <Box mb={10}>
                <Text fontSize="2xl" fontWeight="bold" color="gray.700" mb={4}>
                  Tasks
                </Text>
                {invoice.tasks.map((task, index) => (
                  <Box
                    key={index}
                    className="mb-6 rounded-lg border border-gray-200 bg-gray-50 p-4"
                  >
                    <Text fontWeight="bold" color="gray.800">
                      {task.name || 'Not provided'}
                    </Text>
                  </Box>
                ))}
              </Box>
            ) : null}

            {/* Total Amount & Notes */}
            <Box>
              <Text fontSize="2xl" fontWeight="bold" color="gray.700" mb={4}>
                Total Amount
              </Text>
              <Text fontSize="lg" fontWeight="bold" color="blue.600">
                ₹{invoice.totalAmount || 'Not provided'}
              </Text>
              {invoice.gstNote && (
                <Text color="gray.500" mt={2}>
                  <Text as="span" fontWeight="bold">
                    GST Note:
                  </Text>{' '}
                  {invoice.gstNote || 'Not provided'}
                </Text>
              )}
              {invoice.panNo && (
                <Text color="gray.500">
                  <Text as="span" fontWeight="bold">
                    PAN No:
                  </Text>{' '}
                  {invoice.panNo || 'Not provided'}
                </Text>
              )}
            </Box>
          </>
        )}
      </Box>
      <div className="flex items-center justify-center py-4">
        <Button
          leftIcon={<ArrowLeft />}
          colorScheme="purple"
          onClick={() =>
            (window.location.href = `/dashboard/admin/workspace-admin#organization-invoices`)
          }
        >
          Back
        </Button>
      </div>
    </PageLayout>
  );
};

export default InvoiceViewPage;
