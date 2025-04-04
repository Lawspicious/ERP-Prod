import caseData from '@/db/dummydb';
import {
  TableContainer,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  Table,
  Flex,
  Input,
  Button,
} from '@chakra-ui/react';
import React, { ReactElement, useEffect, useMemo, useState } from 'react';
import { CalendarCheck2, Scale } from 'lucide-react';
import { today } from '@/lib/utils/todayDate';
import { ICase } from '@/types/case';
import { useCases } from '@/hooks/useCasesHook';
import LoaderComponent from '@/components/ui/loader';
import { DialogButton } from '@/components/ui/alert-dialog';
import { useRouter } from 'next/navigation';
import DisplayTable from '@/components/ui/display-table';
import { CalendarMain } from '@/components/calendar/calendar-main';
import { useLoading } from '@/context/loading/loadingContext';

const CauseList = () => {
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const { allCasesDate, fetchCasesByDate, deleteCase } = useCases();
  const { loading, setLoading } = useLoading();
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    fetchCasesByDate(10, selectedDate);
    setLoading(false);
  }, [selectedDate]);

  const columns = [
    { key: 'No', label: 'No', sortable: false },
    { key: 'caseRegistration', label: 'Case Details', sortable: true },
    {
      key: 'petitionVsRespondent',
      label: 'Pet vs Resp',
      sortable: false,
    },
    { key: 'nextDate', label: 'Next Date', sortable: true },
    { key: 'allotedClient', label: 'Client', sortable: true },
    { key: 'allotedLaywer', label: 'Lawyer', sortable: true },
    // { key: 'status', label: 'Status', sortable: true },
  ];

  const transformedData = useMemo(() => {
    return allCasesDate.map((caseData, index) => {
      return {
        No: `${index + 1}`, // No as index
        id: caseData?.caseId,
        caseRegistration: `CaseNo:${caseData?.caseNo} \nType:${caseData?.caseType || 'NA'}`, // Case Details
        petitionVsRespondent: `${caseData?.petition?.petitioner || 'NA'}\nvs\n${caseData?.respondent?.respondentee || 'NA'}`, // Petitioner vs Respondent
        nextDate: caseData?.nextHearing || 'TBD', // Next Hearing Date
        allotedClient: caseData?.clientDetails?.name || 'NA',
        allotedLaywer: caseData?.lawyer?.name || 'NA',
        status: caseData?.caseStatus, // Status
      };
    });
  }, [allCasesDate]);

  const actionButtons = (id: string, deleteName: string): ReactElement[] => [
    <DialogButton
      title={'Delete'}
      message={'Do you want to delete the case?'}
      onConfirm={async () => deleteCase(id, deleteName)}
      children={'Delete'}
      confirmButtonColorScheme="red"
      confirmButtonText="Delete"
    />,
    <Button
      colorScheme="purple"
      className="w-full"
      onClick={() => window.open(`/dashboard/admin/edit-case/${id}`, '_blank')}
    >
      Edit
    </Button>,
    <Button
      colorScheme="purple"
      className="w-full"
      onClick={() => window.open(`/case/${id}`, '_blank')}
    >
      View
    </Button>,
  ];

  return (
    <div>
      <section className="flex items-center justify-between gap-6">
        <h1 className="heading-primary mb-4 w-full">Cause List</h1>
        <Input
          type="date"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-fit max-w-44"
        />
      </section>
      {loading ? (
        <LoaderComponent />
      ) : allCasesDate.length > 0 ? (
        <DisplayTable
          data={transformedData}
          columns={columns}
          tabField={'status'}
          actionButton={actionButtons}
        />
      ) : (
        <h1 className="heading-secondary mt-10 min-h-[25rem] text-center">
          No Cases Today!
        </h1>
      )}
      {/* <hr className="my-6" />
      <CalendarMain /> */}
    </div>
  );
};

export default CauseList;
