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
import { today } from '@/lib/utils/todayDate';
import { useCases } from '@/hooks/useCasesHook';
import LoaderComponent from '@/components/ui/loader';
import { useRouter } from 'next/navigation';
import DisplayTable from '@/components/ui/display-table';
import { useLoading } from '@/context/loading/loadingContext';
import { useAuth } from '@/context/user/userContext';

const LawyerCauseList = () => {
  const { authUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const { fetchCasesByLawyerIdAndDate, allCasesLawyer } = useCases();
  const { loading, setLoading } = useLoading();
  const router = useRouter();

  const handleFetchCase = async () => {
    await fetchCasesByLawyerIdAndDate(
      authUser?.uid as string,
      selectedDate as string,
    );
  };

  useEffect(() => {
    setLoading(true);
    handleFetchCase();
    setLoading(false);
  }, [selectedDate]);

  const columns = [
    { key: 'No', label: 'No', sortable: false },
    { key: 'caseRegistration', label: 'Case Registration', sortable: true },
    {
      key: 'petitionVsRespondent',
      label: 'Pet vs Resp',
      sortable: false,
    },
    { key: 'nextDate', label: 'Next Date', sortable: true },
    { key: 'allotedClient', label: 'Alloted Client', sortable: true },
    { key: 'status', label: 'Status', sortable: true },
  ];

  const transformedData = useMemo(() => {
    return allCasesLawyer?.map((caseData, index) => {
      return {
        No: `${index + 1}`, // No as index
        id: caseData.caseId,
        caseRegistration: `CaseNo:${caseData.caseNo} \nType:${caseData.caseType}`, // Case Details
        petitionVsRespondent: `${caseData.petition.petitioner}\nvs\n${caseData.respondent.respondentee}`, // Petitioner vs Respondent
        nextDate: caseData.nextHearing || 'TBD', // Next Hearing Date
        allotedClient: caseData.clientDetails.name,
        status: caseData.caseStatus, // Status
      };
    });
  }, [allCasesLawyer]);

  const actionButtons = (id: string): ReactElement[] => [
    // <DialogButton
    //   title={'Delete'}
    //   message={'Do you want to delete the case?'}
    //   onConfirm={async () => deleteCase(id)}
    //   children={'Delete'}
    //   confirmButtonColorScheme="red"
    //   confirmButtonText="Delete"
    // />,
    <Button
      colorScheme="purple"
      className="w-full"
      onClick={() => router.push(`/dashboard/admin/edit-case/${id}`)}
    >
      Edit
    </Button>,
    <Button
      colorScheme="purple"
      className="w-full"
      onClick={() => router.push(`/case/${id}`)}
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
      ) : allCasesLawyer?.length > 0 ? (
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

export default LawyerCauseList;
