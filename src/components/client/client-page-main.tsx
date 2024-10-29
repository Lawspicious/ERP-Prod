import { useAuth } from '@/context/user/userContext';
import { useInvoice } from '@/hooks/useInvoiceHook';
import { ICase } from '@/types/case';
import { IClient, IClientProspect } from '@/types/client';
import { IInvoice } from '@/types/invoice';
import { ITask } from '@/types/task';
import {
  Box,
  Text,
  VStack,
  HStack,
  Divider,
  Badge,
  Flex,
  Icon,
  Stack,
  Button,
} from '@chakra-ui/react';
import {
  User,
  Map,
  Star,
  ArrowLeft,
  Scale,
  CheckCheck,
  ReceiptIndianRupee,
} from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';

export const ClientPageMain = ({
  client,
  allCases,
  clientTasks,
}: {
  client: IClient | IClientProspect;
  allCases: ICase[];
  clientTasks: ITask[];
}) => {
  const { role } = useAuth();
  const { allPendingInvoice } = useInvoice();

  return (
    <div>
      <Flex
        direction="column"
        p={6}
        mx="auto"
        bg="gray.50"
        boxShadow="lg"
        borderRadius="lg"
      >
        {/* Client Header */}
        <VStack spacing={6} align="start">
          <Flex justify="space-between" width="100%" align="center">
            <h1 className="heading-primary">Client Profile</h1>
            <Badge
              colorScheme={getClientTypeColor(client.clientType)}
              fontSize="lg"
              px={4}
              py={2}
              borderRadius="lg"
            >
              {client.clientType === 'normal' ? 'Client' : 'Prospect'}
            </Badge>
          </Flex>
          <Divider />

          <SectionHeading icon={User} title="Client Information">
            <TextDisplay label="Name:" value={client.name} />
            <TextDisplay label="Email:" value={client.email} />
            <TextDisplay label="Mobile:" value={client.mobile} />

            <TextDisplay label="Gender:" value={client.gender} />
            {client.clientType === 'prospect' && (
              <>
                <TextDisplay label="Source:" value={client.source} />
                <TextDisplay label="Service:" value={client.service} />
                <TextDisplay label="Feedback:" value={client.client_feedback} />
                <TextDisplay
                  label="Status:"
                  value={client.status === 'IN ACTIVE' ? 'CLOSED' : 'ACTIVE'}
                />
                <TextDisplay
                  label="Follow-up:"
                  value={client.followUp ? 'Yes' : 'No'}
                />
                {client.followUp && (
                  <TextDisplay
                    label="Next Follow-up Date:"
                    value={client.nextFollowUpDate}
                  />
                )}
              </>
            )}
            <Flex gap={2}>
              <Text fontWeight="bold">Rating</Text>
              <div className="flex">
                {Array.from({ length: client.rating }, (index: number) => (
                  <Star fill="yellow" key={index} />
                ))}
              </div>
            </Flex>
            <TextDisplay label="Remark:" value={client.remark} />
          </SectionHeading>

          <Divider />

          <SectionHeading icon={Map} title="Address Details">
            {client.clientType === 'normal' ? (
              <>
                <TextDisplay label="Address:" value={client.address} />
                <TextDisplay label="City:" value={client.city} />
                <TextDisplay label="State:" value={client.state} />
                <TextDisplay label="Country:" value={client.country} />
              </>
            ) : (
              <>
                {' '}
                <TextDisplay label="City:" value={client.location} />
              </>
            )}
          </SectionHeading>
          <SectionHeading icon={Scale} title="Cases">
            {allCases && allCases.length > 0 ? (
              allCases.map((caseItem: ICase) => (
                <div
                  key={caseItem.caseId}
                  className="mb-4 w-auto space-y-2 rounded-xl bg-gray-200 p-4"
                >
                  <Flex gap={2}>
                    <Text fontWeight="bold">Case Id: </Text>
                    <Link
                      href={`/case/${caseItem.caseId}`}
                      target="_blank"
                      color="purple.900"
                      className="underline"
                    >
                      {caseItem.caseId}
                    </Link>
                  </Flex>
                  <Flex gap={2}>
                    <Text fontWeight="bold">Case No: </Text>
                    <span color="purple.900 ">{caseItem.caseNo}</span>
                  </Flex>
                  <Text className="font-bold">{`${caseItem.petition.petitioner} vs ${caseItem.respondent.respondentee}`}</Text>
                </div>
              ))
            ) : (
              <Text>No cases available.</Text>
            )}
          </SectionHeading>
          <SectionHeading icon={ReceiptIndianRupee} title="Pending Invoice">
            {allPendingInvoice && allPendingInvoice.length > 0 ? (
              allPendingInvoice.map((invoice: IInvoice) => (
                <div
                  key={invoice.id}
                  className="mb-4 w-auto space-y-2 rounded-xl bg-gray-200 p-4"
                >
                  <Flex gap={2}>
                    <Text fontWeight="bold">Invoice No: </Text>
                    <Link
                      href={`/invoice/${invoice.id}`}
                      target="_blank"
                      color="purple.900"
                      className="underline"
                    >
                      {invoice.id}
                    </Link>
                  </Flex>
                  <Flex gap={2}>
                    <Text fontWeight="bold">Amount: </Text>
                    <span color="purple.900 ">{invoice.totalAmount}</span>
                  </Flex>
                </div>
              ))
            ) : (
              <Text>No Pending Invoice available.</Text>
            )}
          </SectionHeading>
          <SectionHeading icon={CheckCheck} title="Tasks">
            {clientTasks && clientTasks.length > 0 ? (
              clientTasks.map((task: ITask) => (
                <div
                  key={task.id}
                  className="mb-4 w-auto space-y-2 rounded-xl bg-gray-200 p-4"
                >
                  <Flex gap={2}>
                    <Text fontWeight="bold">Task Name: </Text>
                    <Link
                      href={`/task/${task.id}`}
                      target="_blank"
                      color="purple.900"
                      className="underline"
                    >
                      {task.taskName}
                    </Link>
                  </Flex>
                  <Flex gap={2}>
                    <Text fontWeight="bold">priority: </Text>
                    <span color="purple.900 ">{task.priority}</span>
                  </Flex>
                </div>
              ))
            ) : (
              <Text>No Task</Text>
            )}
          </SectionHeading>
        </VStack>
      </Flex>

      <div className="mt-6 flex w-full items-center justify-center">
        <Button
          colorScheme="blue"
          leftIcon={<ArrowLeft />}
          onClick={() =>
            (window.location.href = `/dashboard/${role === 'SUPERADMIN' ? 'admin' : role?.toLowerCase()}/workspace-${role === 'SUPERADMIN' ? 'admin' : role?.toLowerCase()}#client`)
          }
        >
          Back
        </Button>
      </div>
    </div>
  );
};

// Section Heading Component with Icon
const SectionHeading = ({
  icon,
  title,
  children,
}: {
  icon: any;
  title: string;
  children: any;
}) => (
  <Box>
    <HStack align="center" mb={4}>
      <Icon as={icon} boxSize={6} color="teal.500" />
      <h2 className="heading-secondary">{title}</h2>
    </HStack>
    <Stack spacing={2} pl={8}>
      {children}
    </Stack>
  </Box>
);

// TextDisplay component for field name and value with spacing
const TextDisplay = ({ label, value }: { label: string; value: any }) => (
  <Flex gap={2}>
    <Text fontWeight="bold">{label}</Text>
    <Text>{value}</Text>
  </Flex>
);

// Helper function for clientType badge color scheme
const getClientTypeColor = (clientType: 'normal' | 'prospect') => {
  switch (clientType) {
    case 'normal':
      return 'blue';
    case 'prospect':
      return 'orange';
    default:
      return 'gray';
  }
};
