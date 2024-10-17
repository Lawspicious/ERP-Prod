import { useAuth } from '@/context/user/userContext';
import { IAppointment } from '@/types/appointments';
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
import { ArrowLeft, CalendarCheck, Scale, User } from 'lucide-react';

export const IndividualAppointment = ({
  appointment,
}: {
  appointment: IAppointment;
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
        <VStack spacing={6} align="start">
          <Flex justify="space-between" width="100%" align="center">
            <h1 className="heading-primary">Appointment Details</h1>
            <Badge
              colorScheme={getStatusColor(appointment.status)}
              fontSize="lg"
              px={4}
              py={2}
              borderRadius="lg"
            >
              {appointment.status}
            </Badge>
          </Flex>
          <Divider />

          {/* Appointment Information Section */}
          <SectionHeading icon={CalendarCheck} title="Appointment Information">
            <TextDisplay label="Date:" value={appointment.date} />
            <TextDisplay label="Time:" value={appointment.time} />
            <TextDisplay label="Location:" value={appointment.location} />
          </SectionHeading>

          <Divider />

          {/* Client Details Section */}
          <SectionHeading icon={User} title="Client Details">
            <TextDisplay label="Name:" value={appointment.clientDetails.name} />
            <TextDisplay
              label="Email:"
              value={appointment.clientDetails.email}
            />
            <TextDisplay
              label="Mobile:"
              value={appointment.clientDetails.mobile}
            />
          </SectionHeading>

          <Divider />

          {/* Lawyer Details Section */}
          <SectionHeading icon={Scale} title="Lawyer Details">
            <TextDisplay label="Name:" value={appointment.lawyerDetails.name} />
            <TextDisplay
              label="Phone:"
              value={appointment.lawyerDetails.phoneNumber}
            />
            <TextDisplay
              label="Email:"
              value={appointment.lawyerDetails.email}
            />
          </SectionHeading>
        </VStack>
      </Flex>
      <div className="mt-6 flex w-full items-center justify-center">
        <Button
          colorScheme="blue"
          leftIcon={<ArrowLeft />}
          onClick={() =>
            (window.location.href = `/dashboard/${role?.toLowerCase()}/workspace-${role?.toLowerCase()}#appointment`)
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

// Helper function for status badge color scheme
const getStatusColor = (status: 'PENDING' | 'COMPLETED') => {
  switch (status) {
    case 'PENDING':
      return 'yellow';
    case 'COMPLETED':
      return 'green';
    default:
      return 'gray';
  }
};
