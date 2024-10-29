import { ITask } from '@/types/task';
import React from 'react';
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
import { ArrowLeft, Clipboard, Scale, User } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/context/user/userContext';

const IndividualTask = ({ task }: { task: ITask }) => {
  const { role } = useAuth();
  const getBadgeColor = (status: 'PENDING' | 'COMPLETED') => {
    switch (status) {
      case 'PENDING':
        return 'yellow';
      case 'COMPLETED':
        return 'green';
      default:
        return 'gray';
    }
  };

  const getPriorityColor = (priority: 'HIGH' | 'MEDIUM' | 'LOW') => {
    switch (priority) {
      case 'HIGH':
        return 'red';
      case 'MEDIUM':
        return 'orange';
      case 'LOW':
        return 'green';
      default:
        return 'gray';
    }
  };

  return (
    <div>
      <Flex
        direction="column"
        p={6}
        bg="gray.50"
        boxShadow="lg"
        borderRadius="lg"
      >
        {/* Task Header Section */}
        <VStack spacing={6} align="start">
          <Flex justify="space-between" width="100%" align="center">
            <h1 className="heading-primary">{task.taskName}</h1>
            <Badge
              colorScheme={getBadgeColor(task.taskStatus)}
              fontSize="lg"
              px={4}
              py={2}
              borderRadius="lg"
            >
              {task.taskStatus}
            </Badge>
          </Flex>
          <Divider />
          <SectionHeading icon={Clipboard} title="Task Information">
            <TextDisplay
              label="Priority:"
              value={
                <Badge colorScheme={getPriorityColor(task.priority)}>
                  {task.priority}
                </Badge>
              }
            />
            <TextDisplay label="Type:" value={task.taskType} />
            <TextDisplay label="Start Date:" value={task.startDate} />
            <TextDisplay label="End Date:" value={task.endDate} />
            <TextDisplay label="End Time:" value={task.timeLimit || 'NA'} />
            <TextDisplay label="Description:" value={task.taskDescription} />
            <TextDisplay
              label="Assigned By:"
              value={task?.createdBy?.name || 'NA'}
            />
          </SectionHeading>

          <Divider />
          <SectionHeading icon={Scale} title="Case Details">
            <Link href={`/case/${task.caseDetails.caseId}`} target="_blank">
              <TextDisplay
                label="Case ID:"
                link
                value={task.caseDetails.caseId}
              />
            </Link>
            <TextDisplay label="Case Type:" value={task.caseDetails.caseType} />
            <TextDisplay
              label="Court Name:"
              value={task.caseDetails.courtName}
            />
            <TextDisplay
              label="Petitioner:"
              value={task.caseDetails?.petition?.petitioner || 'NA'}
            />
            <TextDisplay
              label="Respondent:"
              value={task.caseDetails?.respondent?.respondentee}
            />
          </SectionHeading>
          <Divider />
          <SectionHeading icon={User} title="Lawyer Information">
            {task.lawyerDetails.map((lawyer) => (
              <div key={lawyer.id} className="mb-4">
                <TextDisplay label="Name:" value={lawyer.name} />
                <TextDisplay label="Email:" value={lawyer.email} />
                <TextDisplay label="Phone:" value={lawyer.phoneNumber} />
              </div>
            ))}
          </SectionHeading>
          {task.clientDetails && (
            <SectionHeading icon={User} title="Client Information">
              <div key={task.clientDetails.id} className="mb-4">
                <TextDisplay label="Name:" value={task.clientDetails.name} />
                <TextDisplay label="Email:" value={task.clientDetails.email} />
              </div>
            </SectionHeading>
          )}
        </VStack>
      </Flex>
      <div className="mt-6 flex w-full items-center justify-center">
        <Button
          colorScheme="blue"
          leftIcon={<ArrowLeft />}
          onClick={() =>
            (window.location.href = `/dashboard/${role === 'SUPERADMIN' ? 'admin' : role?.toLowerCase()}/workspace-${role === 'SUPERADMIN' ? 'admin' : role?.toLowerCase()}#task`)
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
      <Icon as={icon} boxSize={6} color="purple.600" />
      <h2 className="heading-secondary">{title}</h2>
    </HStack>
    <Stack spacing={2} pl={8}>
      {children}
    </Stack>
  </Box>
);

// TextDisplay component for field name and value with spacing
const TextDisplay = ({
  label,
  value,
  link,
}: {
  label: string;
  value: any;
  link?: boolean;
}) => (
  <Flex gap={2}>
    <Text fontWeight="bold">{label}</Text>
    <Text className={link ? 'text-blue-950 underline' : ''}>{value}</Text>
  </Flex>
);

export default IndividualTask;
