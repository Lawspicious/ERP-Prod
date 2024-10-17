'use client';
import React from 'react';
import {
  Box,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableCaption,
  TableContainer,
} from '@chakra-ui/react';
import { ICase, IDate } from '@/types/case';

interface CaseHistoryProps {
  caseDetails: ICase;
}

const CaseHistoryTable: React.FC<CaseHistoryProps> = ({ caseDetails }) => {
  const { hearings } = caseDetails;

  if (!hearings || hearings.length === 0) {
    return <Box>No hearing data available.</Box>;
  }

  return (
    <Box>
      <TableContainer>
        <Table variant="striped" colorScheme="blackAlpha">
          <TableCaption>Case Hearings History</TableCaption>
          <Thead>
            <Tr>
              <Th>Hearing No.</Th>
              <Th>Date</Th>
              <Th>Remarks</Th>
            </Tr>
          </Thead>
          <Tbody>
            {hearings
              .sort(
                (a, b) =>
                  new Date(a.date).getTime() - new Date(b.date).getTime(),
              ) // Sort by date ascending
              .map((hearing: IDate, index: number) => (
                <Tr key={index}>
                  <Td>{index + 1}</Td> {/* Hearing No. */}
                  <Td>{hearing.date}</Td> {/* Hearing Date */}
                  <Td>{hearing.remarks}</Td> {/* Remarks */}
                </Tr>
              ))}
          </Tbody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default CaseHistoryTable;
