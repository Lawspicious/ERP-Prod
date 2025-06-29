'use client';
import React, { useEffect, useState } from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Text,
  Heading,
  Button,
  Flex,
  Input,
  Select,
  TableCaption,
} from '@chakra-ui/react';
import PageLayout from '@/components/ui/page-layout';
import withAuth from '@/components/shared/hoc-middlware';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useLog } from '@/hooks/shared/useLog';
import { useTeam } from '@/hooks/useTeamHook';
import { useLoading } from '@/context/loading/loadingContext';
import LoaderComponent from '@/components/ui/loader';

const LogsPage = () => {
  const router = useRouter();
  const {
    getLogsByUserandDate,
    allLogs,
    currentPage,
    pageSize,
    prevPage,
    nextPage,
    selectedDate,
    selectedUser,
    setSelectedDate,
    setSelectedUser,
  } = useLog();
  const { allUser } = useTeam();
  const { loading } = useLoading();

  useEffect(() => {
    getLogsByUserandDate(selectedUser, selectedDate);
  }, [router, selectedDate, selectedUser, getLogsByUserandDate]);

  const getBadgeColor = (action: string) => {
    switch (action) {
      case 'CREATE':
        return 'green';
      case 'DELETE':
        return 'red';
      case 'UPDATE':
        return 'blue';
      default:
        return 'gray';
    }
  };

  return (
    <PageLayout screen="margined">
      {loading ? (
        <LoaderComponent />
      ) : (
        <Box className="min-h-screen">
          <Heading size="lg" mb={4} textAlign="center">
            Logs Table
          </Heading>
          {/* Filters */}
          <div className="flex w-full items-center justify-between gap-6">
            <Flex gap={4} align="end" mb={6} flexWrap="wrap">
              {/* User Selector */}
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Select User
                </Text>
                <Select
                  value={selectedUser}
                  onChange={(e) => setSelectedUser(e.target.value)}
                  placeholder="Select a user"
                >
                  {allUser.map((user, index) => (
                    <option key={index} value={user.id}>
                      {user.name} - {user.role}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box>
                <Text fontSize="sm" fontWeight="bold" mb={1}>
                  Select Date
                </Text>
                <Input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                />
              </Box>
              <Button
                colorScheme="red"
                onClick={() => {
                  setSelectedUser('');
                  setSelectedDate('');
                }}
              >
                <Trash2 />
              </Button>
            </Flex>
            <Button
              rightIcon={<ArrowLeft />}
              colorScheme="blue"
              onClick={() => router.back()}
            >
              Back
            </Button>
          </div>
          <Box className="overflow-x-auto rounded-lg bg-white p-4 shadow-md">
            <Table variant="striped" colorScheme="gray">
              <TableCaption>
                <div className="flex items-center justify-center gap-6">
                  <Button
                    colorScheme="purple"
                    onClick={() => prevPage(selectedUser, selectedDate)}
                    disabled={currentPage === 0}
                  >
                    Previous
                  </Button>
                  <Button
                    colorScheme="purple"
                    onClick={nextPage}
                    disabled={allLogs.length < pageSize}
                  >
                    Next
                  </Button>
                </div>
              </TableCaption>
              <Thead>
                <Tr>
                  <Th>Action</Th>
                  <Th>Event Details</Th>
                  <Th>Event Date</Th>
                  <Th>Event Time</Th>
                  <Th>User Info</Th>
                </Tr>
              </Thead>
              <Tbody>
                {allLogs.length === 0 ? (
                  <h1 className="heading-primary my-4 w-full text-center">
                    No Logs Found!
                  </h1>
                ) : (
                  allLogs.map((log, index) => (
                    <Tr key={index}>
                      <Td>
                        <Badge colorScheme={getBadgeColor(log.action)}>
                          {log.action}
                        </Badge>
                      </Td>
                      <Td>{log.eventDetails}</Td>
                      <Td>{log.date}</Td>
                      <Td>
                        {log.createdAt
                          ? new Date(log.createdAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                              hour12: true,
                            })
                          : ''}
                      </Td>
                      <Td>
                        <Text fontWeight="bold">{log.user.name}</Text>
                      </Td>
                    </Tr>
                  ))
                )}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </PageLayout>
  );
};

const allowedRoles = ['SUPERADMIN']; // Add roles that should have access

export default withAuth(LogsPage, allowedRoles);
