import { ICase } from '@/types/case';
import { IUser } from '@/types/user';
import { IEarlyLeave } from '@/types/attendance';
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
  Card,
  CardBody,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
} from '@chakra-ui/react';
import { Map, Scale, User, Calendar, Clock } from 'lucide-react';
import Link from 'next/link';
import EarlyLeavesTable from './EarlyLeavesTable';

export const IndividualUser = ({
  user,
  cases,
  absentDays = 0,
  earlyLeaves = [],
}: {
  user: IUser;
  cases: ICase[];
  absentDays?: number;
  earlyLeaves?: IEarlyLeave[];
}) => {
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
        {/* User Header */}
        <VStack spacing={6} align="start">
          <Flex justify="space-between" width="100%" align="center">
            <h1 className="heading-primary">User Profile</h1>
            <Badge
              colorScheme={getRoleColor(user.role)}
              fontSize="lg"
              px={4}
              py={2}
              borderRadius="lg"
            >
              {user.role}
            </Badge>
          </Flex>
          <Divider />

          <SectionHeading icon={User} title="User Information">
            <TextDisplay label="Name:" value={user.name} />
            <TextDisplay label="Email:" value={user.email} />
            <TextDisplay label="Phone:" value={user.phoneNumber} />
            {user.typeOfLawyer && (
              <TextDisplay label="Type of Lawyer:" value={user.typeOfLawyer} />
            )}
          </SectionHeading>

          <Divider />

          <SectionHeading icon={Map} title="Address Details">
            <TextDisplay label="Address:" value={user.address} />
            <TextDisplay label="City:" value={user.city} />
            <TextDisplay label="State:" value={user.state} />
            <TextDisplay label="Country:" value={user.country} />
            <TextDisplay label="Zipcode:" value={user.zipcode} />
          </SectionHeading>
          {user.role === 'LAWYER' && (
            <SectionHeading icon={Scale} title="Cases">
              {cases && cases.length > 0 ? (
                cases.map((caseItem: ICase) => (
                  <div key={caseItem.caseId} className="mb-4 space-y-2">
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
                    <Text>{`${caseItem.petition.petitioner} vs ${caseItem.respondent.respondentee}`}</Text>
                  </div>
                ))
              ) : (
                <Text>No cases available.</Text>
              )}
            </SectionHeading>
          )}

          <Divider />

          {/* Attendance Stats */}
          <StatGroup>
            <Card flex={1} mr={4} variant="outline">
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={Calendar} color="red.500" />
                      <Text>Absent Days</Text>
                    </HStack>
                  </StatLabel>
                  <StatNumber color="red.500">{absentDays}</StatNumber>
                </Stat>
              </CardBody>
            </Card>
            <Card flex={1} variant="outline">
              <CardBody>
                <Stat>
                  <StatLabel>
                    <HStack>
                      <Icon as={Clock} color="orange.500" />
                      <Text>Early Leaves</Text>
                      <EarlyLeavesTable earlyLeaves={earlyLeaves} />
                    </HStack>
                  </StatLabel>
                  <StatNumber color="orange.500">
                    {earlyLeaves.length}
                  </StatNumber>
                </Stat>
              </CardBody>
            </Card>
          </StatGroup>
        </VStack>
      </Flex>
      <div className="mt-6 flex w-full items-center justify-center">
        <Button
          colorScheme="purple"
          onClick={() =>
            (window.location.href = '/dashboard/admin/workspace-admin#team')
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

// Helper function for role badge color scheme
const getRoleColor = (role: 'ADMIN' | 'LAWYER' | 'SUPERADMIN' | 'HR') => {
  switch (role) {
    case 'ADMIN':
      return 'blue';
    case 'LAWYER':
      return 'green';
    default:
      return 'gray';
  }
};
