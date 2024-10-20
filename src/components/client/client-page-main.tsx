import { useAuth } from '@/context/user/userContext';
import { ICase } from '@/types/case';
import { IClient, IClientProspect } from '@/types/client';
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
import { User, Map, Star, ArrowLeft, Scale } from 'lucide-react';
import Link from 'next/link';

export const ClientPageMain = ({
  client,
  allCases,
}: {
  client: IClient | IClientProspect;
  allCases: ICase[];
}) => {
  const { role } = useAuth();
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
                {Array.from({ length: client.rating }, () => (
                  <Star fill="yellow" />
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
