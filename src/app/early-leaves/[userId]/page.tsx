'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Heading,
  Text,
  Flex,
  Spinner,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  useColorModeValue,
} from '@chakra-ui/react';
import { ArrowLeft } from 'lucide-react';
import { useEarlyLeave } from '@/hooks/useEarlyLeave';
import { IEarlyLeave } from '@/types/attendance';

export default function EarlyLeavesHistoryPage() {
  const { userId } = useParams();
  const router = useRouter();
  const { earlyLeaves, loading } = useEarlyLeave();
  const [userEarlyLeaves, setUserEarlyLeaves] = useState<IEarlyLeave[]>([]);
  const [userName, setUserName] = useState<string>('');

  useEffect(() => {
    if (userId && earlyLeaves.length > 0) {
      const userLeaves = earlyLeaves.filter(
        (leave) => leave.userId === userId && leave.status === 'approved',
      );
      setUserEarlyLeaves(userLeaves);
      if (userLeaves.length > 0) {
        setUserName(userLeaves[0].name);
      }
    }
  }, [earlyLeaves, userId]);

  const navigateBack = () => {
    router.back();
  };

  return (
    <Box p={6} maxW="1200px" mx="auto">
      <Flex mb={6} alignItems="center">
        <IconButton
          aria-label="Back"
          icon={<ArrowLeft size={18} />}
          mr={4}
          onClick={navigateBack}
        />
        <Heading size="lg">
          Early Leaves History - {userName || 'Loading...'}
        </Heading>
      </Flex>

      {loading ? (
        <Flex justifyContent="center" alignItems="center" h="300px">
          <Spinner size="xl" />
          <Text ml={4}>Loading early leaves...</Text>
        </Flex>
      ) : userEarlyLeaves.length > 0 ? (
        <Box
          overflowX="auto"
          borderWidth="1px"
          borderRadius="lg"
          borderColor={useColorModeValue('gray.200', 'gray.700')}
        >
          <Table variant="striped" colorScheme="orange">
            <Thead bg={useColorModeValue('orange.50', 'orange.900')}>
              <Tr>
                <Th>Date</Th>
                <Th>Working Hours</Th>
                <Th>Reason</Th>
              </Tr>
            </Thead>
            <Tbody>
              {userEarlyLeaves.map((leave) => (
                <Tr key={leave.id}>
                  <Td>{leave.date}</Td>
                  <Td>{leave.workingHours}</Td>
                  <Td>{leave.reason}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      ) : (
        <Text textAlign="center" py={10}>
          No early leaves found for this user.
        </Text>
      )}
    </Box>
  );
}
